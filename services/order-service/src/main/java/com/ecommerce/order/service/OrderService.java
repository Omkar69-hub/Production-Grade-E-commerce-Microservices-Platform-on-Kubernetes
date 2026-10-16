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
import com.ecommerce.order.dto.OrderStatusHistoryDto;
import com.ecommerce.order.dto.OrderTrackingResponse;
import com.ecommerce.order.dto.SimulateStatusRequest;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import com.ecommerce.order.entity.OrderStatus;
import com.ecommerce.order.entity.OrderStatusHistory;
import com.ecommerce.order.entity.ShippingAddress;
import com.ecommerce.order.event.OrderCreatedEvent;
import com.ecommerce.order.event.OrderEventPublisher;
import com.ecommerce.order.event.OrderStatusEvent;
import com.ecommerce.order.mapper.OrderMapper;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.repository.OrderStatusHistoryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final CartServiceClient cartServiceClient;
    private final ProductServiceClient productServiceClient;
    private final OrderMapper orderMapper;
    private final OrderEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

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
    public PageResponse<OrderResponse> getAllOrders(PaginationDto pagination) {
        Sort sort = Sort.by(Sort.Direction.fromString(pagination.getSort() == null ? "desc" : "asc"), "createdAt");
        Pageable pageable = PageRequest.of(pagination.getPage(), pagination.getSize(), sort);

        Page<Order> orderPage = orderRepository.findAll(pageable);

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
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BusinessException("Cannot create order from an empty cart");
        }

        // 2. Authoritative product eligibility validation & authoritative price recalculation
        // Fail-closed: Must validate ALL items before reserving inventory or persisting an order
        Map<UUID, ProductServiceClient.ProductDto> authoritativeProducts = new HashMap<>();
        BigDecimal authoritativeTotal = BigDecimal.ZERO;

        for (CartServiceClient.CartItemDto cartItem : cart.getItems()) {
            if (cartItem == null || cartItem.getProductId() == null) {
                throw new BusinessException("Cart item is malformed: missing product identifier");
            }
            if (cartItem.getQuantity() <= 0) {
                throw new BusinessException("Cart item quantity must be positive: " + cartItem.getProductId());
            }

            ProductServiceClient.ProductDto product = fetchAuthoritativeProduct(cartItem.getProductId());
            validateProductEligibilityForOrder(product);
            authoritativeProducts.put(cartItem.getProductId(), product);

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            authoritativeTotal = authoritativeTotal.add(lineTotal);
        }

        // 3. Reserve Inventory (Only executed if all products pass authoritative eligibility checks)
        reserveInventory(token, cart);

        // 4. Create Order using authoritative prices and recalculations
        Order order = Order.builder()
                .userId(userId)
                .orderNumber(generateOrderNumber())
                .status(OrderStatus.PENDING)
                .totalAmount(authoritativeTotal)
                .shippingAddress(ShippingAddress.builder()
                        .fullName(request.getShippingAddress().getFullName())
                        .street(request.getShippingAddress().getStreet())
                        .city(request.getShippingAddress().getCity())
                        .state(request.getShippingAddress().getState())
                        .zipCode(request.getShippingAddress().getZipCode())
                        .country(request.getShippingAddress().getCountry())
                        .phoneNumber(request.getShippingAddress().getPhoneNumber())
                        .build())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CREDIT_CARD")
                .notes(request.getNotes())
                .build();

        for (CartServiceClient.CartItemDto cartItem : cart.getItems()) {
            ProductServiceClient.ProductDto product = authoritativeProducts.get(cartItem.getProductId());
            BigDecimal unitPrice = product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .productId(cartItem.getProductId())
                    .sku(product.getSku() != null ? product.getSku() : cartItem.getSku())
                    .name(product.getName() != null ? product.getName() : cartItem.getName())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(lineTotal)
                    .build();
            order.addItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .status(OrderStatus.PENDING)
                .comment("Order placed and secured in LUMIÈRE vault")
                .isSimulated(false)
                .createdAt(savedOrder.getCreatedAt() != null ? savedOrder.getCreatedAt() : Instant.now())
                .build();
        statusHistoryRepository.save(history);

        // 5. Clear Cart
        clearCart(token);

        // 6. Publish Event
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

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.CONFIRMED)
                .comment("Payment verified. Order confirmed and dispatched to atelier.")
                .isSimulated(false)
                .createdAt(Instant.now())
                .build();
        statusHistoryRepository.save(history);

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
        
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.PAYMENT_FAILED)
                .comment("Payment authentication failed. Acquisition cancelled.")
                .isSimulated(false)
                .createdAt(Instant.now())
                .build();
        statusHistoryRepository.save(history);

        eventPublisher.publishOrderCancelled(OrderStatusEvent.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .build());
                
        // In a full saga, we would emit an event here to trigger an inventory rollback.
    }

    @Transactional(readOnly = true)
    public OrderTrackingResponse getOrderTracking(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or unauthorized: " + orderId));

        List<OrderStatusHistory> histories = statusHistoryRepository.findAllByOrderIdOrderByCreatedAtAsc(orderId);
        
        List<OrderStatusHistoryDto> dtos;
        if (histories.isEmpty()) {
            dtos = List.of(OrderStatusHistoryDto.builder()
                    .id(UUID.randomUUID())
                    .status(order.getStatus())
                    .comment("Initial order registered in LUMIÈRE vault")
                    .isSimulated(false)
                    .createdAt(order.getCreatedAt() != null ? order.getCreatedAt() : Instant.now())
                    .build());
        } else {
            dtos = histories.stream().map(h -> OrderStatusHistoryDto.builder()
                    .id(h.getId())
                    .status(h.getStatus())
                    .comment(h.getComment())
                    .isSimulated(h.isSimulated())
                    .createdAt(h.getCreatedAt())
                    .build()).collect(Collectors.toList());
        }

        return OrderTrackingResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .currentStatus(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .timeline(dtos)
                .build();
    }

    @Transactional
    public OrderTrackingResponse simulateStatusTransition(UUID userId, UUID orderId, SimulateStatusRequest request) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or unauthorized: " + orderId));

        OrderStatus newStatus = request.getStatus();
        if (order.getStatus() == newStatus) {
            log.info("Order {} is already in status {}", orderId, newStatus);
            return getOrderTracking(userId, orderId);
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);

        String comment = request.getComment();
        if (comment == null || comment.isBlank()) {
            comment = switch (newStatus) {
                case CONFIRMED -> "Payment verified. Atelier notified for bespoke preparation.";
                case PROCESSING -> "Atelier craftsmanship in progress. Quality inspection initiated.";
                case SHIPPED -> "Dispatched with secured white-glove courier service.";
                case DELIVERED -> "Successfully presented to client.";
                case CANCELLED -> "Order allocation cancelled by client request.";
                case REFUNDED -> "Settlement reversed to original payment method.";
                default -> "Order status transitioned to " + newStatus;
            };
        }

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(newStatus)
                .comment(comment)
                .isSimulated(true) // Development demo simulator visibly flagged
                .createdAt(Instant.now())
                .build();
        statusHistoryRepository.save(history);
        log.info("Order {} status updated to {} (Simulated demo mode)", orderId, newStatus);

        OrderStatusEvent event = OrderStatusEvent.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(newStatus.name())
                .build();

        if (newStatus == OrderStatus.CONFIRMED) {
            eventPublisher.publishOrderConfirmed(event);
        } else if (newStatus == OrderStatus.CANCELLED) {
            eventPublisher.publishOrderCancelled(event);
        } else if (newStatus == OrderStatus.DELIVERED) {
            eventPublisher.publishOrderCompleted(event);
        }

        return getOrderTracking(userId, orderId);
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
                if (invResponse == null || invResponse.getData() == null) {
                    throw new BusinessException("Unable to verify inventory for product: " + item.getName());
                }
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

    private ProductServiceClient.ProductDto fetchAuthoritativeProduct(UUID productId) {
        try {
            SuccessResponse<ProductServiceClient.ProductDto> response = productServiceClient.getProduct(productId);
            if (response == null || response.getData() == null) {
                throw new BusinessException("Unable to verify authoritative product details for product: " + productId);
            }
            return response.getData();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error communicating with Product Service for product {}", productId, e);
            throw new BusinessException("Unable to verify authoritative product details for product: " + productId);
        }
    }

    private void validateProductEligibilityForOrder(ProductServiceClient.ProductDto product) {
        if (product == null) {
            throw new BusinessException("Product details could not be retrieved");
        }

        if (!"ACTIVE".equals(product.getStatus())) {
            throw new BusinessException("Product is not available for purchase: " + (product.getSku() != null ? product.getSku() : product.getId()));
        }

        // Reject null, zero, or negative item prices
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Items with zero, negative, or unverified pricing cannot be ordered: " + (product.getSku() != null ? product.getSku() : product.getId()));
        }

        // Validate parsed attributes for referral markers
        String attributes = product.getAttributes();
        if (attributes != null && !attributes.isBlank()) {
            try {
                JsonNode root = objectMapper.readTree(attributes);
                if (!root.isObject()) {
                    throw new BusinessException("Product metadata is invalid for product: " + (product.getSku() != null ? product.getSku() : product.getId()));
                }

                // 1. Destination URL indicates external referral item
                if (root.has("destinationUrl") && !root.get("destinationUrl").isNull()) {
                    String destinationUrl = root.get("destinationUrl").asText().trim();
                    if (!destinationUrl.isBlank()) {
                        throw new BusinessException("External atelier referral creations cannot be ordered internally: " + (product.getSku() != null ? product.getSku() : product.getId()));
                    }
                }

                // 2. Price upon inquiry requires external atelier contact
                if (root.has("priceVerificationStatus") && !root.get("priceVerificationStatus").isNull()) {
                    String pvs = root.get("priceVerificationStatus").asText().trim();
                    if ("PRICE_UPON_INQUIRY".equalsIgnoreCase(pvs)) {
                        throw new BusinessException("Creations priced upon atelier inquiry cannot be ordered internally: " + (product.getSku() != null ? product.getSku() : product.getId()));
                    }
                }

                // 3. Destination type indicates external brand portal navigation
                if (root.has("destinationType") && !root.get("destinationType").isNull()) {
                    String dt = root.get("destinationType").asText().trim();
                    if (!dt.isBlank()) {
                        throw new BusinessException("External atelier referral creations cannot be ordered internally: " + (product.getSku() != null ? product.getSku() : product.getId()));
                    }
                }

                // 4. Fulfillment type indicator: must be INTERNAL for order creation. Unknown or REFERRAL_LINK types are rejected.
                if (root.has("fulfillmentType") && !root.get("fulfillmentType").isNull()) {
                    String ft = root.get("fulfillmentType").asText().trim();
                    if (!"INTERNAL".equalsIgnoreCase(ft)) {
                        if ("REFERRAL_LINK".equalsIgnoreCase(ft)) {
                            throw new BusinessException("External atelier referral creations cannot be ordered internally: " + (product.getSku() != null ? product.getSku() : product.getId()));
                        }
                        throw new BusinessException("Unknown or unsupported fulfillment type: " + ft);
                    }
                }

                // 5. Explicit isReferral marker
                if (root.has("isReferral") && !root.get("isReferral").isNull() && root.get("isReferral").asBoolean()) {
                    throw new BusinessException("External atelier referral creations cannot be ordered internally: " + (product.getSku() != null ? product.getSku() : product.getId()));
                }
            } catch (BusinessException e) {
                throw e;
            } catch (Exception e) {
                log.warn("Malformed attributes on product SKU {}: {}", product.getSku(), e.getMessage());
                throw new BusinessException("Product metadata is invalid or corrupted for product: " + (product.getSku() != null ? product.getSku() : product.getId()));
            }
        }
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
