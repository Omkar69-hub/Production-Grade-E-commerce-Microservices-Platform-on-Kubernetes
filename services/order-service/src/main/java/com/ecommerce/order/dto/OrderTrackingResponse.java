package com.ecommerce.order.dto;

import com.ecommerce.order.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingResponse {
    private UUID orderId;
    private String orderNumber;
    private OrderStatus currentStatus;
    private Instant createdAt;
    private Instant updatedAt;
    private List<OrderStatusHistoryDto> timeline;
}
