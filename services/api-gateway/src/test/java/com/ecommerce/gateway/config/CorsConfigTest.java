package com.ecommerce.gateway.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.config.GlobalCorsProperties;
import org.springframework.core.env.Environment;
import org.springframework.web.cors.CorsConfiguration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CorsConfigTest {

    @Mock
    private Environment environment;

    private GlobalCorsProperties globalCorsProperties;
    private CorsConfig corsConfig;

    @BeforeEach
    void setUp() {
        globalCorsProperties = new GlobalCorsProperties();
        corsConfig = new CorsConfig(globalCorsProperties, environment);
    }

    @Test
    @DisplayName("Fix 2.1: Configured allowed origins via CORS_ALLOWED_ORIGINS are accepted")
    void givenConfiguredOrigins_whenChecked_thenAllowedOriginsAccepted() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"prod"});

        String allowedOrigins = "https://lumiere.com, https://admin.lumiere.com";
        corsConfig.applyCorsConfiguration(allowedOrigins, "");

        CorsConfiguration config = globalCorsProperties.getCorsConfigurations().get("/**");
        assertThat(config).isNotNull();
        assertThat(config.getAllowedOrigins()).containsExactlyInAnyOrder("https://lumiere.com", "https://admin.lumiere.com");

        // Verified origin acceptance
        assertThat(config.checkOrigin("https://lumiere.com")).isEqualTo("https://lumiere.com");
        assertThat(config.checkOrigin("https://admin.lumiere.com")).isEqualTo("https://admin.lumiere.com");
    }

    @Test
    @DisplayName("Fix 2.1: Unlisted origins are denied")
    void givenConfiguredOrigins_whenUnlistedOriginChecked_thenOriginDenied() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"prod"});

        String allowedOrigins = "https://lumiere.com";
        corsConfig.applyCorsConfiguration(allowedOrigins, "");

        CorsConfiguration config = globalCorsProperties.getCorsConfigurations().get("/**");
        assertThat(config).isNotNull();

        // Unlisted origin returns null (denied)
        assertThat(config.checkOrigin("https://malicious-site.com")).isNull();
        assertThat(config.checkOrigin("http://localhost:3000")).isNull();
    }

    @Test
    @DisplayName("Fix 2.1: Backward compatibility with CORS_ALLOWED_ORIGIN_PATTERNS is retained")
    void givenOriginPatterns_whenChecked_thenPatternMatchingSucceeds() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"prod"});

        String patterns = "https://*.lumiere.com, https://*.lumiere-atelier.store";
        corsConfig.applyCorsConfiguration("", patterns);

        CorsConfiguration config = globalCorsProperties.getCorsConfigurations().get("/**");
        assertThat(config).isNotNull();
        assertThat(config.getAllowedOriginPatterns()).containsExactlyInAnyOrder("https://*.lumiere.com", "https://*.lumiere-atelier.store");

        assertThat(config.checkOrigin("https://staging.lumiere.com")).isEqualTo("https://staging.lumiere.com");
        assertThat(config.checkOrigin("https://app.lumiere-atelier.store")).isEqualTo("https://app.lumiere-atelier.store");
        assertThat(config.checkOrigin("https://attacker.com")).isNull();
    }

    @Test
    @DisplayName("Fix 2.2: Development mode defaults to localhost origins when no env vars supplied")
    void givenDevProfileWithoutEnvVars_whenConfigured_thenLocalhostOriginsApplied() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"dev"});

        corsConfig.applyCorsConfiguration("", "");

        CorsConfiguration config = globalCorsProperties.getCorsConfigurations().get("/**");
        assertThat(config).isNotNull();
        assertThat(config.getAllowedOrigins()).contains("http://localhost:3000", "http://localhost:5173", "http://localhost");
        assertThat(config.checkOrigin("http://localhost:3000")).isEqualTo("http://localhost:3000");
        assertThat(config.checkOrigin("http://localhost:5173")).isEqualTo("http://localhost:5173");
    }

    @Test
    @DisplayName("Fix 2.2: Production mode rejects missing CORS configuration and does not fall back to localhost")
    void givenProdProfileWithoutEnvVars_whenConfigured_thenThrowsIllegalStateException() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"prod"});

        assertThatThrownBy(() -> corsConfig.applyCorsConfiguration("", ""))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Production CORS configuration missing");
    }

    @Test
    @DisplayName("Fix 2.2: Production mode with explicit origins does not include localhost")
    void givenProdProfileWithExplicitOrigins_whenConfigured_thenNoLocalhostFallback() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"prod"});

        corsConfig.applyCorsConfiguration("https://lumiere.store", "");

        CorsConfiguration config = globalCorsProperties.getCorsConfigurations().get("/**");
        assertThat(config).isNotNull();
        assertThat(config.getAllowedOrigins()).containsExactly("https://lumiere.store");
        assertThat(config.checkOrigin("http://localhost:3000")).isNull();
        assertThat(config.checkOrigin("http://127.0.0.1:8080")).isNull();
    }
}
