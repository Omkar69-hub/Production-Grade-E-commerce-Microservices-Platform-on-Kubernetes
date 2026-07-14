package com.ecommerce.common.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuccessResponse<T> {
    private T data;
    @Builder.Default
    private String timestamp = Instant.now().toString();
    private String message;
}
