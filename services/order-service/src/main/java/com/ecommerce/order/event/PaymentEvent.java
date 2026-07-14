package com.ecommerce.order.event;

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
public class PaymentEvent implements Serializable {
    private UUID paymentId;
    private UUID orderId;
    private String status; // COMPLETED, FAILED
    private String transactionId;
}
