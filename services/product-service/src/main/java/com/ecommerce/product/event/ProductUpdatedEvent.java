package com.ecommerce.product.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdatedEvent implements Serializable {
    private UUID productId;
    private String sku;
    private String name;
    private BigDecimal price;
}
