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
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
    private final ObjectMapper objectMapper;

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

        // Fetch product details and validate cart eligibility (active, positive price, non-referral)
        ProductServiceClient.ProductDto product = fetchProductDetails(request.getProductId());
        validateProductEligibilityForCart(product);

        // Validate product availability and inventory for requested quantity
        validateProductAvailability(request.getProductId(), requestedTotalQuantity);

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(requestedTotalQuantity);
            existingItem.get().setPrice(product.getPrice());
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
        if (request.getProductId() != null && !productId.equals(request.getProductId())) {
            throw new BusinessException("Product ID in path must match request body");
        }

        Cart cart = getCartOrThrow(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        // Fetch product details and validate cart eligibility (active, positive price, non-referral)
        ProductServiceClient.ProductDto product = fetchProductDetails(productId);
        validateProductEligibilityForCart(product);

        // Validate inventory for requested quantity
        validateProductAvailability(productId, request.getQuantity());

        item.setQuantity(request.getQuantity());
        item.setPrice(product.getPrice());
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
            if (response == null || response.getData() == null) {
                throw new BusinessException("Unable to verify product inventory at this time");
            }
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
            if (response == null || response.getData() == null) {
                throw new BusinessException("Unable to fetch product details at this time");
            }
            return response.getData();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error communicating with Product Service", e);
            throw new BusinessException("Unable to fetch product details at this time");
        }
    }

    private void validateProductEligibilityForCart(ProductServiceClient.ProductDto product) {
        if (product == null) {
            throw new BusinessException("Product details could not be retrieved");
        }

        if (!"ACTIVE".equals(product.getStatus())) {
            throw new BusinessException("Product is not available for purchase");
        }

        // Authoritative numeric price: reject unpriced, zero, or negative prices
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Items with zero, negative, or unverified pricing cannot be added to the bag");
        }

        // Validate parsed attributes for referral markers
        String attributes = product.getAttributes();
        if (attributes != null && !attributes.isBlank()) {
            try {
                JsonNode root = objectMapper.readTree(attributes);
                if (!root.isObject()) {
                    throw new BusinessException("Product metadata is invalid");
                }

                // 1. Destination URL indicates external referral item
                if (root.has("destinationUrl") && !root.get("destinationUrl").isNull()) {
                    String destinationUrl = root.get("destinationUrl").asText().trim();
                    if (!destinationUrl.isBlank()) {
                        throw new BusinessException("External atelier referral creations must be acquired via the brand's official portal");
                    }
                }

                // 2. Price upon inquiry requires external atelier contact
                if (root.has("priceVerificationStatus") && !root.get("priceVerificationStatus").isNull()) {
                    String pvs = root.get("priceVerificationStatus").asText().trim();
                    if ("PRICE_UPON_INQUIRY".equalsIgnoreCase(pvs)) {
                        throw new BusinessException("Creations priced upon atelier inquiry cannot be added to the internal bag");
                    }
                }

                // 3. Destination type indicates external brand portal navigation
                if (root.has("destinationType") && !root.get("destinationType").isNull()) {
                    String dt = root.get("destinationType").asText().trim();
                    if (!dt.isBlank()) {
                        throw new BusinessException("External atelier referral creations must be acquired via the brand's official portal");
                    }
                }

                // 4. Fulfillment type indicator: must be INTERNAL for bag addition. Unknown or REFERRAL_LINK types are rejected.
                if (root.has("fulfillmentType") && !root.get("fulfillmentType").isNull()) {
                    String ft = root.get("fulfillmentType").asText().trim();
                    if (!"INTERNAL".equalsIgnoreCase(ft)) {
                        if ("REFERRAL_LINK".equalsIgnoreCase(ft)) {
                            throw new BusinessException("External atelier referral creations cannot be added to the internal bag");
                        }
                        throw new BusinessException("Unknown or unsupported fulfillment type: " + ft);
                    }
                }

                // 5. Explicit isReferral marker
                if (root.has("isReferral") && !root.get("isReferral").isNull() && root.get("isReferral").asBoolean()) {
                    throw new BusinessException("External atelier referral creations cannot be added to the internal bag");
                }

                // 6. Explicit isEditorialConcept marker
                if (root.has("isEditorialConcept") && !root.get("isEditorialConcept").isNull() && root.get("isEditorialConcept").asBoolean()) {
                    throw new BusinessException("Editorial concepts cannot be added to the internal bag");
                }
            } catch (BusinessException e) {
                throw e;
            } catch (Exception e) {
                log.warn("Malformed attributes on product SKU {}: {}", product.getSku(), e.getMessage());
                throw new BusinessException("Product metadata is invalid or corrupted");
            }
        }
    }
}
