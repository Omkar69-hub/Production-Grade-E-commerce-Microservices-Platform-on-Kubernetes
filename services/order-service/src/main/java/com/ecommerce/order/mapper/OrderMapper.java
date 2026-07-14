package com.ecommerce.order.mapper;

import com.ecommerce.order.dto.OrderItemResponse;
import com.ecommerce.order.dto.OrderRequest;
import com.ecommerce.order.dto.OrderResponse;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        if (order == null) return null;

        return OrderResponse.builder()
                .userId(order.getUserId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddressId(order.getShippingAddressId())
                .billingAddressId(order.getBillingAddressId())
                .paymentMethod(order.getPaymentMethod())
                .notes(order.getNotes())
                .items(order.getItems().stream().map(this::toItemResponse).collect(Collectors.toList()))
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .productId(item.getProductId())
                .sku(item.getSku())
                .name(item.getName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}
