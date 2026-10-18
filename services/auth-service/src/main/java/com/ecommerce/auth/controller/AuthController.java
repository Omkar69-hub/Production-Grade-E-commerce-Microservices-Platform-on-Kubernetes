package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.LoginRequest;
import com.ecommerce.auth.dto.LoginResponse;
import com.ecommerce.auth.dto.RefreshTokenRequest;
import com.ecommerce.auth.dto.RegisterRequest;
import com.ecommerce.auth.dto.TokenRefreshResponse;
import com.ecommerce.auth.entity.RefreshToken;
import com.ecommerce.auth.security.CsrfProtectionFilter;
import com.ecommerce.auth.service.AuthService;
import com.ecommerce.auth.service.TokenService;
import com.ecommerce.common.exception.UnauthorizedException;
import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.common.util.SecurityUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;

    @Value("${app.security.cookie.secure:false}")
    private boolean secureCookie;

    @Value("${app.security.cookie.same-site:Strict}")
    private String sameSite;

    @Value("${app.security.cookie.domain:}")
    private String cookieDomain;

    @Value("${app.security.cookie.path:/api/v1/auth}")
    private String cookiePath;

    private ResponseCookie.ResponseCookieBuilder configureCookie(String name, String value, long maxAge, boolean httpOnly) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .secure(secureCookie)
                .path(cookiePath)
                .maxAge(maxAge)
                .sameSite(sameSite);
        if (cookieDomain != null && !cookieDomain.isBlank()) {
            builder.domain(cookieDomain);
        }
        return builder;
    }

    @GetMapping("/csrf")
    public ResponseEntity<SuccessResponse<Map<String, String>>> getCsrfToken(HttpServletResponse response) {
        String csrfToken = CsrfProtectionFilter.generateCsrfToken();
        ResponseCookie xsrfCookie = configureCookie("XSRF-TOKEN", csrfToken, 86400L, false).build();
        response.addHeader(HttpHeaders.SET_COOKIE, xsrfCookie.toString());

        return ResponseEntity.ok(SuccessResponse.<Map<String, String>>builder()
                .data(Map.of("csrfToken", csrfToken))
                .message("CSRF token generated successfully")
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<SuccessResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.<Void>builder().message("User registered successfully").build());
    }

    @PostMapping("/login")
    public ResponseEntity<SuccessResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authService.authenticate(request);
        
        RefreshToken refreshToken = authService.generateRefreshToken(request.getEmail());
        
        ResponseCookie refreshCookie = configureCookie("refresh_token", refreshToken.getToken(), refreshToken.getExpirationTimeSeconds(), true).build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        String csrfToken = CsrfProtectionFilter.generateCsrfToken();
        ResponseCookie xsrfCookie = configureCookie("XSRF-TOKEN", csrfToken, refreshToken.getExpirationTimeSeconds(), false).build();
        response.addHeader(HttpHeaders.SET_COOKIE, xsrfCookie.toString());

        return ResponseEntity.ok(SuccessResponse.<LoginResponse>builder()
                .data(loginResponse)
                .message("Login successful")
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<SuccessResponse<LoginResponse>> refresh(
            @CookieValue(name = "refresh_token", required = false) String cookieToken,
            HttpServletResponse response) {
        
        if (cookieToken == null || cookieToken.isBlank()) {
            throw new UnauthorizedException("Refresh token is missing");
        }

        TokenRefreshResponse refreshResult = authService.refreshToken(cookieToken);
        RefreshToken newRefreshToken = refreshResult.getRefreshToken();

        ResponseCookie refreshCookie = configureCookie("refresh_token", newRefreshToken.getToken(), newRefreshToken.getExpirationTimeSeconds(), true).build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        String csrfToken = CsrfProtectionFilter.generateCsrfToken();
        ResponseCookie xsrfCookie = configureCookie("XSRF-TOKEN", csrfToken, newRefreshToken.getExpirationTimeSeconds(), false).build();
        response.addHeader(HttpHeaders.SET_COOKIE, xsrfCookie.toString());

        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(refreshResult.getAccessToken())
                .expiresIn(refreshResult.getExpiresIn())
                .build();

        return ResponseEntity.ok(SuccessResponse.<LoginResponse>builder()
                .data(loginResponse)
                .message("Token refreshed successfully")
                .build());
    }

    /**
     * Explicitly separated refresh endpoint for mobile/native clients.
     * Authenticated via JSON request body; does not accept or set ambient browser cookies.
     */
    @PostMapping("/mobile/refresh")
    public ResponseEntity<SuccessResponse<LoginResponse>> mobileRefresh(
            @Valid @RequestBody RefreshTokenRequest request) {

        TokenRefreshResponse refreshResult = authService.refreshToken(request.getRefreshToken());
        RefreshToken newRefreshToken = refreshResult.getRefreshToken();

        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(refreshResult.getAccessToken())
                .expiresIn(refreshResult.getExpiresIn())
                .refreshToken(newRefreshToken.getToken())
                .build();

        return ResponseEntity.ok(SuccessResponse.<LoginResponse>builder()
                .data(loginResponse)
                .message("Mobile token refreshed successfully")
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<SuccessResponse<Void>> logout(
            @CookieValue(name = "refresh_token", required = false) String cookieToken,
            HttpServletResponse response) {
        
        if (cookieToken != null && !cookieToken.isBlank()) {
            tokenService.deleteByToken(cookieToken);
        }

        SecurityUtil.getCurrentUserId().ifPresent(userId -> {
            try {
                tokenService.deleteByUserId(UUID.fromString(userId));
            } catch (Exception ignored) {
            }
        });

        ResponseCookie refreshCookie = configureCookie("refresh_token", "", 0, true).build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        ResponseCookie xsrfCookie = configureCookie("XSRF-TOKEN", "", 0, false).build();
        response.addHeader(HttpHeaders.SET_COOKIE, xsrfCookie.toString());

        return ResponseEntity.ok(SuccessResponse.<Void>builder().message("Logged out successfully").build());
    }
}

