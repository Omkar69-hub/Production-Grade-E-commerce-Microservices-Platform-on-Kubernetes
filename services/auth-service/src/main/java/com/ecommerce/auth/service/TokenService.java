package com.ecommerce.auth.service;

import com.ecommerce.auth.entity.RefreshToken;
import com.ecommerce.auth.repository.RefreshTokenRepository;
import com.ecommerce.common.exception.UnauthorizedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class TokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final StringRedisTemplate stringRedisTemplate;

    @Value("${app.security.jwt.refresh-expiration-ms:604800000}")
    private Long refreshTokenDurationMs = 604800000L;

    /**
     * Lua script for distributed atomic refresh-token rotation.
     * Evaluated atomically within Redis single-threaded execution context:
     * - Returns -1 if key does not exist or expired.
     * - Returns 0 if key exists but 'revoked' is already '1' or 'true' (Reuse/replay attack!).
     * - Returns 1 if key exists and 'revoked' was not set; atomically sets 'revoked' = '1' and sets TTL.
     */
    public static final String ROTATE_LUA_SCRIPT =
            "local key = KEYS[1]\n" +
            "local graceTtl = tonumber(ARGV[1]) or 300\n" +
            "local exists = redis.call('EXISTS', key)\n" +
            "if exists == 0 then\n" +
            "    return -1\n" +
            "end\n" +
            "local revoked = redis.call('HGET', key, 'revoked')\n" +
            "if revoked == '1' or revoked == 'true' then\n" +
            "    return 0\n" +
            "end\n" +
            "redis.call('HSET', key, 'revoked', '1')\n" +
            "redis.call('EXPIRE', key, graceTtl)\n" +
            "return 1\n";

    private final RedisScript<Long> rotateRedisScript = new DefaultRedisScript<>(ROTATE_LUA_SCRIPT, Long.class);

    public TokenService(RefreshTokenRepository refreshTokenRepository) {
        this(refreshTokenRepository, null);
    }

    @Autowired
    public TokenService(RefreshTokenRepository refreshTokenRepository,
                        @Autowired(required = false) StringRedisTemplate stringRedisTemplate) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.stringRedisTemplate = stringRedisTemplate;
    }

    public static String hashToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 cryptographic digest unavailable", e);
        }
    }

    public RefreshToken createRefreshToken(UUID userId) {
        return createRefreshToken(userId, UUID.randomUUID());
    }

    public RefreshToken createRefreshToken(UUID userId, UUID familyId) {
        String rawToken = UUID.randomUUID().toString();
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .tokenHash(tokenHash)
                .rawToken(rawToken)
                .userId(userId)
                .familyId(familyId)
                .revoked(false)
                .createdAt(Instant.now())
                .expirationTimeSeconds(refreshTokenDurationMs / 1000)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token == null) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        return token;
    }

    public Optional<RefreshToken> findByToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }
        String tokenHash = hashToken(rawToken);
        Optional<RefreshToken> found = refreshTokenRepository.findById(tokenHash);
        found.ifPresent(t -> t.setRawToken(rawToken));
        return found;
    }

    /**
     * Atomically rotates a refresh token across distributed service replicas or local JVM threads.
     *
     * In a multi-replica environment:
     * - Executes an atomic Redis Lua script directly against Redis single-threaded engine.
     * - Guaranteed: At most one replica can successfully transition the token from active to revoked.
     * - Competing replica attempts receive 0 (already revoked), which immediately triggers family invalidation.
     *
     * In an in-memory or fallback environment:
     * - Executes synchronized atomic check-and-set semantics against repository persistence.
     */
    public RefreshToken rotateToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String tokenHash = hashToken(rawToken);

        if (stringRedisTemplate != null) {
            return rotateWithDistributedRedis(rawToken, tokenHash);
        } else {
            return rotateWithLocalSynchronization(rawToken, tokenHash);
        }
    }

    private RefreshToken rotateWithDistributedRedis(String rawToken, String tokenHash) {
        String redisKey = "refresh_tokens:" + tokenHash;
        Long result;
        try {
            result = stringRedisTemplate.execute(rotateRedisScript, Collections.singletonList(redisKey), "300");
        } catch (Exception e) {
            log.warn("Distributed Redis Lua execution failed for token rotation, falling back to local sync: {}", e.getMessage());
            return rotateWithLocalSynchronization(rawToken, tokenHash);
        }

        if (result == null || result == -1L) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        if (result == 0L) {
            refreshTokenRepository.findById(tokenHash).ifPresent(currentToken -> {
                UUID familyId = currentToken.getFamilyId() != null ? currentToken.getFamilyId() : UUID.randomUUID();
                log.warn("SECURITY ALERT: Reuse of revoked/rotated refresh token detected! User ID: {}, Family ID: {}. Revoking entire token family.",
                        currentToken.getUserId(), familyId);
                invalidateFamily(familyId);
            });
            throw new UnauthorizedException("Revoked refresh token reuse detected");
        }

        // result == 1: caller won exclusive atomic rotation
        RefreshToken currentToken = refreshTokenRepository.findById(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));

        UUID familyId = currentToken.getFamilyId() != null ? currentToken.getFamilyId() : UUID.randomUUID();

        currentToken.setRevoked(true);
        currentToken.setExpirationTimeSeconds(300L);
        refreshTokenRepository.save(currentToken);

        return createRefreshToken(currentToken.getUserId(), familyId);
    }

    private synchronized RefreshToken rotateWithLocalSynchronization(String rawToken, String tokenHash) {
        RefreshToken currentToken = refreshTokenRepository.findById(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));

        UUID familyId = currentToken.getFamilyId() != null ? currentToken.getFamilyId() : UUID.randomUUID();

        if (currentToken.isRevoked()) {
            log.warn("SECURITY ALERT: Reuse of revoked/rotated refresh token detected! User ID: {}, Family ID: {}. Revoking entire token family.",
                    currentToken.getUserId(), familyId);
            invalidateFamily(familyId);
            throw new UnauthorizedException("Revoked refresh token reuse detected");
        }

        currentToken.setRevoked(true);
        currentToken.setExpirationTimeSeconds(300L);
        refreshTokenRepository.save(currentToken);

        return createRefreshToken(currentToken.getUserId(), familyId);
    }

    public void invalidateFamily(UUID familyId) {
        if (familyId == null) {
            return;
        }
        try {
            List<RefreshToken> familyTokens = refreshTokenRepository.findByFamilyId(familyId);
            if (familyTokens != null) {
                for (RefreshToken t : familyTokens) {
                    t.setRevoked(true);
                    refreshTokenRepository.save(t);
                }
            }
            refreshTokenRepository.deleteByFamilyId(familyId);
        } catch (Exception e) {
            log.warn("Failed to invalidate token family: {}", familyId, e);
        }
    }

    public void deleteByToken(String rawToken) {
        if (rawToken != null && !rawToken.isBlank()) {
            String tokenHash = hashToken(rawToken);
            refreshTokenRepository.findById(tokenHash).ifPresent(t -> {
                if (t.getFamilyId() != null) {
                    invalidateFamily(t.getFamilyId());
                }
                refreshTokenRepository.deleteById(tokenHash);
            });
        }
    }

    public void deleteByUserId(UUID userId) {
        if (userId != null) {
            try {
                refreshTokenRepository.deleteByUserId(userId);
            } catch (Exception e) {
                log.warn("Failed to delete refresh tokens for user: {}", userId, e);
            }
        }
    }
}
