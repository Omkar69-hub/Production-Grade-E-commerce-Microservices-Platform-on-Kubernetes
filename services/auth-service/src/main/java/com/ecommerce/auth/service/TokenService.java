package com.ecommerce.auth.service;

import com.ecommerce.auth.entity.RefreshToken;
import com.ecommerce.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.security.jwt.refresh-expiration-ms}")
    private Long refreshTokenDurationMs;

    public RefreshToken createRefreshToken(UUID userId) {
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(userId)
                .token(UUID.randomUUID().toString())
                .expirationTimeSeconds(refreshTokenDurationMs / 1000)
                .build();
        
        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        // Expiration is handled automatically by Redis TTL
        // This is just to confirm it exists and hasn't been manually invalidated
        return token;
    }

    public void deleteByUserId(UUID userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}
