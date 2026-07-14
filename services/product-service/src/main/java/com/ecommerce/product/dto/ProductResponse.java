package com.ecommerce.product.dto;

import com.ecommerce.common.dto.AuditDto;
import com.ecommerce.product.entity.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse extends AuditDto {
    private UUID categoryId;
    private String categoryName;
    private String name;
    private String sku;
    private String description;
    private BigDecimal price;
    private ProductStatus status;
    private String imageUrl;
}
