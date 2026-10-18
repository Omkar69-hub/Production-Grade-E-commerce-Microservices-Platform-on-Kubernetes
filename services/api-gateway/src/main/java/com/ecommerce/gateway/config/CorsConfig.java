package com.ecommerce.gateway.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.config.GlobalCorsProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Stage 9D: Fix 2 — Configurable CORS for API Gateway
 *
 * Supports comma-separated CORS_ALLOWED_ORIGINS, retains backwards compatibility with
 * CORS_ALLOWED_ORIGIN_PATTERNS, provides localhost defaults for development, and
 * strictly requires explicit origin configuration in production ('prod' profile).
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class CorsConfig {

    public static final List<String> DEFAULT_DEV_ALLOWED_ORIGINS = List.of(
            "http://localhost:80",
            "http://localhost:443",
            "http://localhost",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:80",
            "http://127.0.0.1:443",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1"
    );

    public static final List<String> DEFAULT_DEV_ORIGIN_PATTERNS = List.of(
            "http://localhost:*",
            "http://127.0.0.1:*"
    );

    private final GlobalCorsProperties globalCorsProperties;
    private final Environment environment;

    @Value("${CORS_ALLOWED_ORIGINS:}")
    private String corsAllowedOrigins;

    @Value("${CORS_ALLOWED_ORIGIN_PATTERNS:}")
    private String corsAllowedOriginPatterns;

    @PostConstruct
    public void configureCors() {
        applyCorsConfiguration(this.corsAllowedOrigins, this.corsAllowedOriginPatterns);
    }

    /**
     * Configures the global CORS properties based on supplied origin parameters and active profile.
     * Package-private to allow isolated unit testing.
     */
    void applyCorsConfiguration(String allowedOriginsStr, String allowedOriginPatternsStr) {
        CorsConfiguration config = globalCorsProperties.getCorsConfigurations()
                .computeIfAbsent("/**", k -> new CorsConfiguration());

        boolean isProd = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));

        List<String> origins = parseCommaSeparated(allowedOriginsStr);
        List<String> patterns = parseCommaSeparated(allowedOriginPatternsStr);

        if (origins.isEmpty() && patterns.isEmpty()) {
            if (isProd) {
                log.error("CORS Misconfiguration: In production profile ('prod'), explicit CORS_ALLOWED_ORIGINS must be configured. Localhost fallback is disabled.");
                throw new IllegalStateException("Production CORS configuration missing: CORS_ALLOWED_ORIGINS must be set with explicit allowed origins in production.");
            } else {
                log.info("Development profile active: Applying default localhost CORS origins.");
                config.setAllowedOrigins(new ArrayList<>(DEFAULT_DEV_ALLOWED_ORIGINS));
                config.setAllowedOriginPatterns(new ArrayList<>(DEFAULT_DEV_ORIGIN_PATTERNS));
            }
        } else {
            if (!origins.isEmpty()) {
                log.info("Applying configured CORS_ALLOWED_ORIGINS: {}", origins);
                config.setAllowedOrigins(origins);
            } else {
                config.setAllowedOrigins(null);
            }

            if (!patterns.isEmpty()) {
                log.info("Applying configured CORS_ALLOWED_ORIGIN_PATTERNS: {}", patterns);
                config.setAllowedOriginPatterns(patterns);
            } else {
                config.setAllowedOriginPatterns(null);
            }
        }

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
    }

    private List<String> parseCommaSeparated(String value) {
        if (!StringUtils.hasText(value)) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(Collectors.toList());
    }
}
