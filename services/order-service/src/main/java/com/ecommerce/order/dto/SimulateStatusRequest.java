package com.ecommerce.order.dto;

import com.ecommerce.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulateStatusRequest {
    @NotNull(message = "Target order status is required")
    private OrderStatus status;

    private String comment;
}
