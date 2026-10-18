package com.ecommerce.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.security.SecureRandom;
import java.util.*;

/**
 * Stage 9H: CSRF Protection Filter for Browser Cookie-Authenticated Refresh and Logout
 *
 * Implements a strict Double-Submit Cookie CSRF defense with Origin/Referer header verification.
 * Any state-changing POST to browser endpoints (/api/v1/auth/refresh or /api/v1/auth/logout):
 * 1. Validates that the Origin/Referer header (if present) matches expected allowed origins.
 * 2. Mandates valid CSRF token proof in the X-XSRF-TOKEN or X-CSRF-TOKEN header matching the XSRF-TOKEN cookie.
 *
 * Requests cannot bypass CSRF enforcement by omitting cookies or altering request payload shape.
 * Mobile refresh requests operate on an explicitly separated endpoint (/api/v1/auth/mobile/refresh)
 * and do not use ambient browser cookies.
 */
@Slf4j
@Component
public class CsrfProtectionFilter extends OncePerRequestFilter {

    public static final String CSRF_COOKIE_NAME = "XSRF-TOKEN";
    public static final String CSRF_HEADER_NAME = "X-XSRF-TOKEN";
    public static final String ALT_CSRF_HEADER_NAME = "X-CSRF-TOKEN";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${app.security.csrf.allowed-origins:}")
    private String configuredAllowedOrigins;

    public static String generateCsrfToken() {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();

        // Enforce CSRF defense strictly on browser endpoints
        if ("POST".equalsIgnoreCase(method) &&
                (uri.endsWith("/api/v1/auth/refresh") || uri.endsWith("/api/v1/auth/logout"))) {

            // 1. Defense-in-depth: Validate Origin / Referer if present
            String origin = request.getHeader("Origin");
            if (origin == null || origin.isBlank()) {
                origin = request.getHeader("Referer");
            }

            if (origin != null && !origin.isBlank()) {
                if (!isAllowedOrigin(request, origin)) {
                    log.warn("CSRF validation failed: cross-origin request rejected from Origin/Referer: {} to URI: {}", origin, uri);
                    reject(response, HttpServletResponse.SC_FORBIDDEN, "Cross-origin request forbidden");
                    return;
                }
            }

            // 2. Extract CSRF cookie
            String xsrfCookieValue = null;
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if (CSRF_COOKIE_NAME.equals(cookie.getName())) {
                        xsrfCookieValue = cookie.getValue();
                        break;
                    }
                }
            }

            // 3. Extract CSRF header proof
            String csrfHeader = request.getHeader(CSRF_HEADER_NAME);
            if (csrfHeader == null || csrfHeader.isBlank()) {
                csrfHeader = request.getHeader(ALT_CSRF_HEADER_NAME);
            }

            // 4. Validate double-submit proof: both must exist and match
            boolean valid = (csrfHeader != null && !csrfHeader.isBlank() &&
                    xsrfCookieValue != null && !xsrfCookieValue.isBlank() &&
                    csrfHeader.equals(xsrfCookieValue));

            if (!valid) {
                log.warn("CSRF validation failed: missing or invalid CSRF token for request to {}", uri);
                reject(response, HttpServletResponse.SC_FORBIDDEN, "CSRF token missing or invalid");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowedOrigin(HttpServletRequest request, String originHeader) {
        try {
            URI originUri = URI.create(originHeader);
            String originHost = originUri.getHost();
            if (originHost == null) {
                return false;
            }

            String serverName = request.getServerName();
            if (originHost.equalsIgnoreCase(serverName) ||
                    originHost.equalsIgnoreCase("localhost") ||
                    originHost.equalsIgnoreCase("127.0.0.1")) {
                return true;
            }

            if (configuredAllowedOrigins != null && !configuredAllowedOrigins.isBlank()) {
                String[] origins = configuredAllowedOrigins.split(",");
                for (String allowed : origins) {
                    String trimmed = allowed.trim();
                    if (!trimmed.isEmpty()) {
                        if (originHeader.equalsIgnoreCase(trimmed) || originHost.equalsIgnoreCase(trimmed)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    private void reject(HttpServletResponse response, int statusCode, String message) throws IOException {
        response.setStatus(statusCode);
        response.setContentType("application/json");
        response.getWriter().write(String.format("{\"status\":%d,\"error\":\"Forbidden\",\"message\":\"%s\"}", statusCode, message));
    }
}
