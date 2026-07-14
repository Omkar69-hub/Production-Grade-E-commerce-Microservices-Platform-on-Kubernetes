package com.ecommerce.order.service;

import com.ecommerce.common.constants.ApplicationConstants;
import com.ecommerce.common.dto.PageResponse;
import com.ecommerce.common.dto.PaginationDto;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.order.client.CartServiceClient;
import com.ecommerce.order.client.ProductServiceClient;
import com.ecommerce.order.dto.OrderRequest;
import com.ecommerce.order.dto.OrderResponse;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import com.ecommerce.order.entity.OrderStatus;
import com.ecommerce.order.event.OrderCreatedEvent;
import com.ecommerce.order.event.OrderEventPublisher;
import com.ecommerce.order.event.OrderStatusEvent;
import com.ecommerce.order.mapper.OrderMapper;
import com.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartServiceClient cartServiceClient;
    private final ProductServiceClient productServiceClient;
    private final OrderMapper orderMapper;
    private final OrderEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getUserOrders(UUID userId, PaginationDto pagination) {
        Sort sort = Sort.by(Sort.Direction.fromString(pagination.getSort() == null ? "desc" : "asc"), "createdAt");
        Pageable pageable = PageRequest.of(pagination.getPage(), pagination.getSize(), sort);

        Page<Order> orderPage = orderRepository.findAllByUserId(userId, pageable);

        return PageResponse.<OrderResponse>builder()
                .content(orderPage.getContent().stream().map(orderMapper::toResponse).collect(Collectors.toList()))
                .pageNumber(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return orderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse createOrder(UUID userId, String token, OrderRequest request) {
        // 1. Fetch Cart
        CartServiceClient.CartDto cart = fetchCart(token);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BusinessException("Cannot create order from an empty cart");
        }

        // 2. Reserve Inventory
        reserveInventory(token, cart);

        // 3. Create Order
        Order order = Order.builder()
                .userId(userId)
                .orderNumber(generateOrderNumber())
                .status(OrderStatus.PENDING)
                .totalAmount(cart.getSubtotal())
                .shippingAddressId(request.getShippingAddressId())
                .billingAddressId(request.getBillingAddressId())
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .build();

        for (CartServiceClient.CartItemDto cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .productId(cartItem.getProductId())
                    .sku(cartItem.getSku())
                    .name(cartItem.getName())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getPrice())
                    .totalPrice(cartItem.getTotalLinePrice())
                    .build();
            order.addItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        // 4. Clear Cart
        clearCart(token);

        // 5. Publish Event
        eventPublisher.publishOrderCreated(OrderCreatedEvent.builder()
                .orderId(savedOrder.getId())
                .userId(savedOrder.getUserId())
                .orderNumber(savedOrder.getOrderNumber())
                .totalAmount(savedOrder.getTotalAmount())
                .build());

        return orderMapper.toResponse(savedOrder);
    }

    @Transactional
    public void confirmOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        if (order.getStatus() != OrderStatus.PENDING) {
            log.warn("Order {} is not in PENDING state. Current state: {}", orderId, order.getStatus());
            return;
        }

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        eventPublisher.publishOrderConfirmed(OrderStatusEvent.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .build());
    }

    @Transactional
    public void failOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(OrderStatus.PAYMENT_FAILED);
        orderRepository.save(order);
        
        eventPublisher.publishOrderCancelled(OrderStatusEvent.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .build());
                
        // In a full saga, we would emit an event here to trigger an inventory rollback.
    }

    private CartServiceClient.CartDto fetchCart(String token) {
        try {
            SuccessResponse<CartServiceClient.CartDto> response = cartServiceClient.getCart(ApplicationConstants.BEARER_PREFIX + token);
            return response.getData();
        } catch (Exception e) {
            log.error("Failed to fetch cart", e);
            throw new BusinessException("Unable to process order: failed to retrieve cart");
        }
    }

    private void clearCart(String token) {
        try {
            cartServiceClient.clearCart(ApplicationConstants.BEARER_PREFIX + token);
        } catch (Exception e) {
            log.error("Failed to clear cart after order creation", e);
            // Non-critical, cart has a TTL and will eventually expire, but good to log
        }
    }

    private void reserveInventory(String token, CartServiceClient.CartDto cart) {
        for (CartServiceClient.CartItemDto item : cart.getItems()) {
            try {
                // Fetch current inventory
                SuccessResponse<ProductServiceClient.InventoryDto> invResponse = productServiceClient.getInventory(item.getProductId());
                int available = invResponse.getData().getQuantityAvailable();
                
                if (available < item.getQuantity()) {
                    throw new BusinessException("Insufficient inventory for product: " + item.getName());
                }

                // Update inventory (Reduce available)
                // Note: In a production Saga, we'd explicitly "reserve" it. For this scope, we just deduct available.
                ProductServiceClient.InventoryUpdateRequest updateReq = ProductServiceClient.InventoryUpdateRequest.builder()
                        .quantityAvailable(available - item.getQuantity())
                        .build();
                
                productServiceClient.updateInventory(ApplicationConstants.BEARER_PREFIX + token, item.getProductId(), updateReq);

            } catch (BusinessException e) {
                throw e; // Rethrow business exceptions (like insufficient stock)
            } catch (Exception e) {
                log.error("Failed to reserve inventory for product {}", item.getProductId(), e);
                // In a true distributed transaction/Saga, if this fails halfway through the loop, 
                // we would need to rollback the previously reserved items.
                throw new BusinessException("Failed to reserve inventory for order processing");
            }
        }
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
