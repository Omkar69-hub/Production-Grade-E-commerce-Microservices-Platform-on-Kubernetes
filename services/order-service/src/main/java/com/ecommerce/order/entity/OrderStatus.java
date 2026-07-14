package com.ecommerce.order.entity;

public enum OrderStatus {
    PENDING,
    PAYMENT_FAILED,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    REFUNDED
}
