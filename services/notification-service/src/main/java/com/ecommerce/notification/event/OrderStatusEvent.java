package com.ecommerce.notification.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusEvent implements Serializable {
    private UUID orderId;
    private String orderNumber;
    private String status;
    private UUID userId; // Needed to know who to notify
}
