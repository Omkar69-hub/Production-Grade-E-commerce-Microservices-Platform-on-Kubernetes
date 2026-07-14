package com.ecommerce.product.dto;

import com.ecommerce.common.dto.AuditDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse extends AuditDto {
    private String name;
    private String description;
    private UUID parentCategoryId;
}
