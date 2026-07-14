package com.ecommerce.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private UUID productId;
    private String sku;
    private String name;
    private int quantity;
    private BigDecimal price;
    private String imageUrl;
    private BigDecimal totalLinePrice;
}
