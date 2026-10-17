package com.ecommerce.auth.dto;

import com.ecommerce.auth.entity.RefreshToken;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenRefreshResponse {
    private String accessToken;
    private long expiresIn;
    private RefreshToken refreshToken;
}
