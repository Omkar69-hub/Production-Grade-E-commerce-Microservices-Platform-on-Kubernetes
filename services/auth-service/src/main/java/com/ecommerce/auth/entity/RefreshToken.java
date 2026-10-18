package com.ecommerce.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;
import org.springframework.data.redis.core.index.Indexed;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("refresh_tokens")
public class RefreshToken {

    /**
     * SHA-256 cryptographic hash of the raw bearer token.
     * Stored as the primary Redis key to avoid persisting raw bearer credentials.
     */
    @Id
    private String tokenHash;

    @Indexed
    private UUID userId;

    /**
     * Token family identifier grouping all rotated descendants of an original login session.
     */
    @Indexed
    private UUID familyId;

    /**
     * True if this token has already been rotated or revoked.
     * Reuse of a revoked token triggers revocation of the entire family.
     */
    private boolean revoked;

    private Instant createdAt;

    @TimeToLive
    private Long expirationTimeSeconds;

    /**
     * In-memory raw token populated only when generating a new token for client transmission.
     * Never persisted to Redis.
     */
    @Transient
    private String rawToken;

    public String getToken() {
        return rawToken != null ? rawToken : tokenHash;
    }

    public void setToken(String token) {
        this.rawToken = token;
        if (this.tokenHash == null) {
            this.tokenHash = token;
        }
    }
}

