package com.ecommerce.cart.service;

import com.ecommerce.cart.client.ProductServiceClient;
import com.ecommerce.cart.dto.CartItemRequest;
import com.ecommerce.cart.dto.CartResponse;
import com.ecommerce.cart.dto.CartSummaryResponse;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.cart.event.CartEventPublisher;
import com.ecommerce.cart.mapper.CartMapper;
import com.ecommerce.cart.repository.CartRepository;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.common.response.SuccessResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductServiceClient productServiceClient;
    private final CartMapper cartMapper;
    private final CartEventPublisher eventPublisher;

    @Value("${app.cart.ttl-days:30}")
    private Long cartTtlDays;

    public CartResponse getCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        return cartMapper.toResponse(cart);
    }

    public CartSummaryResponse getCartSummary(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        return cartMapper.toSummaryResponse(cart);
    }

    public CartResponse addItemToCart(UUID userId, CartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst();

        int requestedTotalQuantity = request.getQuantity();
        if (existingItem.isPresent()) {
            requestedTotalQuantity += existingItem.get().getQuantity();
        }

        // Validate product exists, is active, and has enough inventory
        validateProductAvailability(request.getProductId(), requestedTotalQuantity);
        
        // Fetch product details for cart snapshot
        ProductServiceClient.ProductDto product = fetchProductDetails(request.getProductId());

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(requestedTotalQuantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .productId(request.getProductId())
                    .sku(product.getSku())
                    .name(product.getName())
                    .price(product.getPrice())
                    .quantity(request.getQuantity())
                    .imageUrl(product.getImageUrl())
                    .build();
            cart.getItems().add(newItem);
        }

        saveCart(cart);
        eventPublisher.publishCartUpdated(userId, calculateTotalItems(cart));

        return cartMapper.toResponse(cart);
    }

    public CartResponse updateItemQuantity(UUID userId, UUID productId, CartItemRequest request) {
        Cart cart = getCartOrThrow(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        validateProductAvailability(productId, request.getQuantity());

        item.setQuantity(request.getQuantity());
        saveCart(cart);

        eventPublisher.publishCartUpdated(userId, calculateTotalItems(cart));
        return cartMapper.toResponse(cart);
    }

    public CartResponse removeItem(UUID userId, UUID productId) {
        Cart cart = getCartOrThrow(userId);
        
        boolean removed = cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        if (!removed) {
            throw new ResourceNotFoundException("Item not found in cart");
        }

        saveCart(cart);
        eventPublisher.publishCartUpdated(userId, calculateTotalItems(cart));
        return cartMapper.toResponse(cart);
    }

    public void clearCart(UUID userId) {
        cartRepository.deleteById(userId);
        eventPublisher.publishCartCleared(userId);
    }

    private Cart getOrCreateCart(UUID userId) {
        return cartRepository.findById(userId).orElseGet(() -> {
            Cart newCart = Cart.builder()
                    .userId(userId)
                    .ttl(cartTtlDays)
                    .build();
            eventPublisher.publishCartCreated(userId);
            return newCart;
        });
    }

    private Cart getCartOrThrow(UUID userId) {
        return cartRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));
    }

    private void saveCart(Cart cart) {
        cart.setUpdatedAt(Instant.now());
        cart.setTtl(cartTtlDays);
        cartRepository.save(cart);
    }

    private int calculateTotalItems(Cart cart) {
        return cart.getItems().stream().mapToInt(CartItem::getQuantity).sum();
    }

    private void validateProductAvailability(UUID productId, int requestedQuantity) {
        try {
            SuccessResponse<ProductServiceClient.InventoryDto> response = productServiceClient.getInventory(productId);
            int available = response.getData().getQuantityAvailable();
            
            if (available < requestedQuantity) {
                throw new BusinessException("Requested quantity exceeds available stock. Available: " + available);
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error communicating with Product Service for inventory", e);
            throw new BusinessException("Unable to verify product inventory at this time");
        }
    }

    private ProductServiceClient.ProductDto fetchProductDetails(UUID productId) {
        try {
            SuccessResponse<ProductServiceClient.ProductDto> response = productServiceClient.getProduct(productId);
            
            if (!"ACTIVE".equals(response.getData().getStatus())) {
                throw new BusinessException("Product is not available for purchase");
            }
            
            return response.getData();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error communicating with Product Service", e);
            throw new BusinessException("Unable to fetch product details at this time");
        }
    }
}
