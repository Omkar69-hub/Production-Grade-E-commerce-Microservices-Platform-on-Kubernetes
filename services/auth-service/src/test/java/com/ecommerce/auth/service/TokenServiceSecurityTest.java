package com.ecommerce.auth.service;

import com.ecommerce.auth.entity.RefreshToken;
import com.ecommerce.auth.repository.RefreshTokenRepository;
import com.ecommerce.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Stage 9H: TokenService Distributed Atomic Rotation & Concurrency Tests")
class TokenServiceSecurityTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    private TokenService tokenServiceInMemory;
    private TokenService tokenServiceWithRedis;

    private final Map<String, RefreshToken> inMemoryStore = new ConcurrentHashMap<>();

    @BeforeEach
    void setUp() {
        inMemoryStore.clear();

        // 1. In-memory standalone instance (simulates JVM synchronization fallback)
        tokenServiceInMemory = new TokenService(refreshTokenRepository);
        ReflectionTestUtils.setField(tokenServiceInMemory, "refreshTokenDurationMs", 604800000L); // 7 days

        // 2. Distributed instance with Redis template wired
        tokenServiceWithRedis = new TokenService(refreshTokenRepository, stringRedisTemplate);
        ReflectionTestUtils.setField(tokenServiceWithRedis, "refreshTokenDurationMs", 604800000L);

        // Configure repository mock to simulate persistence accurately
        lenient().when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> {
            RefreshToken t = invocation.getArgument(0);
            inMemoryStore.put(t.getTokenHash(), t);
            return t;
        });

        lenient().when(refreshTokenRepository.findById(any(String.class))).thenAnswer(invocation -> {
            String hash = invocation.getArgument(0);
            return Optional.ofNullable(inMemoryStore.get(hash));
        });

        lenient().when(refreshTokenRepository.findByFamilyId(any(UUID.class))).thenAnswer(invocation -> {
            UUID famId = invocation.getArgument(0);
            List<RefreshToken> list = new ArrayList<>();
            for (RefreshToken t : inMemoryStore.values()) {
                if (famId.equals(t.getFamilyId())) {
                    list.add(t);
                }
            }
            return list;
        });

        lenient().doAnswer(invocation -> {
            String hash = invocation.getArgument(0);
            inMemoryStore.remove(hash);
            return null;
        }).when(refreshTokenRepository).deleteById(any(String.class));

        lenient().doAnswer(invocation -> {
            UUID famId = invocation.getArgument(0);
            inMemoryStore.values().removeIf(t -> famId.equals(t.getFamilyId()));
            return null;
        }).when(refreshTokenRepository).deleteByFamilyId(any(UUID.class));

        lenient().doAnswer(invocation -> {
            UUID uId = invocation.getArgument(0);
            inMemoryStore.values().removeIf(t -> uId.equals(t.getUserId()));
            return null;
        }).when(refreshTokenRepository).deleteByUserId(any(UUID.class));
    }

    @Test
    @DisplayName("1. Storage Security: Refresh tokens are keyed by SHA-256 cryptographic hash, never raw token")
    void testTokenIsStoredAsCryptographicHash() {
        UUID userId = UUID.randomUUID();
        RefreshToken created = tokenServiceInMemory.createRefreshToken(userId);

        assertNotNull(created.getToken(), "Raw token must be returned for transport to client");
        assertNotNull(created.getTokenHash(), "Cryptographic hash must be computed");
        assertNotEquals(created.getToken(), created.getTokenHash(), "Raw token must not equal its hash");

        String expectedHash = TokenService.hashToken(created.getToken());
        assertEquals(expectedHash, created.getTokenHash(), "Hash must match SHA-256 computation");

        assertTrue(inMemoryStore.containsKey(expectedHash), "Storage must key by tokenHash");
        assertFalse(inMemoryStore.containsKey(created.getToken()), "Storage must NEVER key by raw token");
    }

    @Test
    @DisplayName("2. Legitimate Rotation: Rotates token, marks old token revoked, and preserves family ID")
    void testLegitimateTokenRotation() {
        UUID userId = UUID.randomUUID();
        RefreshToken original = tokenServiceInMemory.createRefreshToken(userId);
        String rawOriginal = original.getToken();
        UUID familyId = original.getFamilyId();

        RefreshToken rotated = tokenServiceInMemory.rotateToken(rawOriginal);

        assertNotNull(rotated);
        assertNotEquals(rawOriginal, rotated.getToken(), "Rotated token must have a new raw token string");
        assertEquals(familyId, rotated.getFamilyId(), "Family ID must be preserved across rotations");
        assertFalse(rotated.isRevoked(), "New token must not be revoked");

        RefreshToken storedOld = inMemoryStore.get(TokenService.hashToken(rawOriginal));
        assertNotNull(storedOld);
        assertTrue(storedOld.isRevoked(), "Old token must be marked as revoked for replay detection");
    }

    @Test
    @DisplayName("3. Replay Detection: Reusing a rotated/revoked token triggers family revocation")
    void testReuseOfRotatedTokenTriggersFamilyRevocation() {
        UUID userId = UUID.randomUUID();
        RefreshToken original = tokenServiceInMemory.createRefreshToken(userId);
        String rawOriginal = original.getToken();

        // 1st rotation: Legitimate
        RefreshToken rotated1 = tokenServiceInMemory.rotateToken(rawOriginal);
        assertNotNull(rotated1);

        // 2nd rotation attempt with rawOriginal: Replay attack
        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> {
            tokenServiceInMemory.rotateToken(rawOriginal);
        });
        assertTrue(ex.getMessage().contains("Revoked refresh token reuse detected"));

        // Descendant token in this family must be revoked/deleted
        RefreshToken storedRotated1 = inMemoryStore.get(TokenService.hashToken(rotated1.getToken()));
        assertTrue(storedRotated1 == null || storedRotated1.isRevoked(),
                "Family tokens must be invalidated upon reuse detection");
    }

    @Test
    @DisplayName("4. In-Memory Concurrency: Exactly ONE competing thread succeeds; all others rejected")
    void testInMemoryCompetingRefreshAttemptsSucceedAtMostOnce() throws Exception {
        UUID userId = UUID.randomUUID();
        RefreshToken original = tokenServiceInMemory.createRefreshToken(userId);
        String rawOriginal = original.getToken();

        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CyclicBarrier barrier = new CyclicBarrier(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectionCount = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                try {
                    barrier.await();
                    tokenServiceInMemory.rotateToken(rawOriginal);
                    successCount.incrementAndGet();
                } catch (UnauthorizedException ex) {
                    rejectionCount.incrementAndGet();
                } catch (Exception e) {
                    fail("Unexpected exception: " + e.getMessage());
                }
            }));
        }

        for (Future<?> f : futures) {
            f.get(5, TimeUnit.SECONDS);
        }
        executor.shutdown();

        assertEquals(1, successCount.get(), "Exactly one concurrent refresh attempt must succeed");
        assertEquals(threadCount - 1, rejectionCount.get(), "All competing refresh attempts must be rejected");
    }

    @Test
    @DisplayName("5. Distributed Redis Atomic: Lua script return 1 grants exclusive rotation")
    @SuppressWarnings("unchecked")
    void testDistributedRedisLuaScript_WhenReturn1_RotatesSuccessfully() {
        UUID userId = UUID.randomUUID();
        RefreshToken original = tokenServiceWithRedis.createRefreshToken(userId);
        String rawOriginal = original.getToken();

        // Simulate Redis Lua script returning 1 (unrevoked token atomically marked revoked)
        when(stringRedisTemplate.execute(any(RedisScript.class), anyList(), any(String.class))).thenReturn(1L);

        RefreshToken rotated = tokenServiceWithRedis.rotateToken(rawOriginal);

        assertNotNull(rotated);
        assertNotEquals(rawOriginal, rotated.getToken());
        assertEquals(original.getFamilyId(), rotated.getFamilyId());
        verify(stringRedisTemplate, times(1)).execute(any(RedisScript.class), anyList(), any(String.class));
    }

    @Test
    @DisplayName("6. Distributed Redis Atomic: Lua script return 0 detects reuse and invalidates family")
    @SuppressWarnings("unchecked")
    void testDistributedRedisLuaScript_WhenReturn0_TriggersFamilyRevocation() {
        UUID userId = UUID.randomUUID();
        RefreshToken original = tokenServiceWithRedis.createRefreshToken(userId);
        String rawOriginal = original.getToken();

        // Simulate Redis Lua script returning 0 (already revoked in Redis by another replica)
        when(stringRedisTemplate.execute(any(RedisScript.class), anyList(), any(String.class))).thenReturn(0L);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> {
            tokenServiceWithRedis.rotateToken(rawOriginal);
        });

        assertTrue(ex.getMessage().contains("Revoked refresh token reuse detected"));
        verify(refreshTokenRepository, atLeastOnce()).deleteByFamilyId(original.getFamilyId());
    }

    @Test
    @DisplayName("7. Distributed Redis Atomic: Lua script return -1 rejects non-existent/expired token")
    @SuppressWarnings("unchecked")
    void testDistributedRedisLuaScript_WhenReturnMinus1_ThrowsUnauthorized() {
        when(stringRedisTemplate.execute(any(RedisScript.class), anyList(), any(String.class))).thenReturn(-1L);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> {
            tokenServiceWithRedis.rotateToken("non-existent-token");
        });

        assertTrue(ex.getMessage().contains("Invalid or expired refresh token"));
    }

    @Test
    @DisplayName("8. Distributed Replica Concurrency: First replica receives 1; competing replicas receive 0")
    @SuppressWarnings("unchecked")
    void testDistributedReplicaCompetition_OnlyFirstWins_OthersTriggerRevocation() throws Exception {
        UUID userId = UUID.randomUUID();
        RefreshToken original = tokenServiceWithRedis.createRefreshToken(userId);
        String rawOriginal = original.getToken();

        // Simulate Redis atomic behavior: only first execution returns 1L, subsequent return 0L
        AtomicInteger invocationCounter = new AtomicInteger(0);
        when(stringRedisTemplate.execute(any(RedisScript.class), anyList(), any(String.class)))
                .thenAnswer(inv -> invocationCounter.getAndIncrement() == 0 ? 1L : 0L);

        int replicaThreadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(replicaThreadCount);
        CyclicBarrier barrier = new CyclicBarrier(replicaThreadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger reuseRejections = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < replicaThreadCount; i++) {
            futures.add(executor.submit(() -> {
                try {
                    barrier.await();
                    tokenServiceWithRedis.rotateToken(rawOriginal);
                    successCount.incrementAndGet();
                } catch (UnauthorizedException ex) {
                    if (ex.getMessage().contains("Revoked refresh token reuse detected")) {
                        reuseRejections.incrementAndGet();
                    }
                } catch (Exception e) {
                    fail("Unexpected error: " + e.getMessage());
                }
            }));
        }

        for (Future<?> f : futures) {
            f.get(5, TimeUnit.SECONDS);
        }
        executor.shutdown();

        assertEquals(1, successCount.get(), "Only the replica receiving 1L from Redis can succeed");
        assertEquals(replicaThreadCount - 1, reuseRejections.get(), "All competing replicas receive 0L and reject with reuse alert");
    }

    @Test
    @DisplayName("9. Logout: expunges tokens and invalidates session family")
    void testLogoutSessionInvalidation() {
        UUID userId = UUID.randomUUID();
        RefreshToken token = tokenServiceInMemory.createRefreshToken(userId);
        String rawToken = token.getToken();
        String hash = TokenService.hashToken(rawToken);

        assertTrue(inMemoryStore.containsKey(hash));

        tokenServiceInMemory.deleteByToken(rawToken);

        assertFalse(inMemoryStore.containsKey(hash), "Token must be removed from Redis on logout");
    }
}
