package com.ecommerce.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginationDto {
    @Min(0)
    @Builder.Default
    private int page = 0;

    @Min(1)
    @Max(100)
    @Builder.Default
    private int size = 20;

    private String sort;
}
