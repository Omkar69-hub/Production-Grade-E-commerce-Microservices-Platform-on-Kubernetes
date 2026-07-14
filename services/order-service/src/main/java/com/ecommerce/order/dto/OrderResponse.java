package com.ecommerce.order.dto;

import com.ecommerce.common.dto.AuditDto;
import com.ecommerce.order.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse extends AuditDto {
    private UUID userId;
    private String orderNumber;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private UUID shippingAddressId;
    private UUID billingAddressId;
    private String paymentMethod;
    private String notes;
    private List<OrderItemResponse> items;
}
