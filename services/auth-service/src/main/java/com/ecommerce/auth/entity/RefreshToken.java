package com.ecommerce.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("refresh_tokens")
public class RefreshToken {
    @Id
    private String token;
    private UUID userId;
    
    @TimeToLive
    private Long expirationTimeSeconds;
}
