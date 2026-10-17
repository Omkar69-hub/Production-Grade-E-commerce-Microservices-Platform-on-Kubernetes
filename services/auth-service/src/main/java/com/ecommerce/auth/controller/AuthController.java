package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.LoginRequest;
import com.ecommerce.auth.dto.LoginResponse;
import com.ecommerce.auth.dto.RefreshTokenRequest;
import com.ecommerce.auth.dto.RegisterRequest;
import com.ecommerce.auth.dto.TokenRefreshResponse;
import com.ecommerce.auth.entity.RefreshToken;
import com.ecommerce.auth.service.AuthService;
import com.ecommerce.auth.service.TokenService;
import com.ecommerce.common.exception.UnauthorizedException;
import com.ecommerce.common.response.SuccessResponse;
import com.ecommerce.common.util.SecurityUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;

    @Value("${app.security.cookie.secure:false}")
    private boolean secureCookie;

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
        
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken.getToken())
                .httpOnly(true)
                .secure(secureCookie)
                .path("/api/v1/auth/refresh")
                .maxAge(refreshToken.getExpirationTimeSeconds())
                .sameSite("Strict")
                .build();
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(SuccessResponse.<LoginResponse>builder()
                .data(loginResponse)
                .message("Login successful")
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<SuccessResponse<LoginResponse>> refresh(
            @CookieValue(name = "refresh_token", required = false) String cookieToken,
            @RequestBody(required = false) RefreshTokenRequest bodyRequest,
            HttpServletResponse response) {
        
        String token = (cookieToken != null && !cookieToken.isBlank())
                ? cookieToken
                : (bodyRequest != null ? bodyRequest.getRefreshToken() : null);

        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Refresh token is missing");
        }

        TokenRefreshResponse refreshResult = authService.refreshToken(token);
        RefreshToken newRefreshToken = refreshResult.getRefreshToken();

        ResponseCookie cookie = ResponseCookie.from("refresh_token", newRefreshToken.getToken())
                .httpOnly(true)
                .secure(secureCookie)
                .path("/api/v1/auth/refresh")
                .maxAge(newRefreshToken.getExpirationTimeSeconds())
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(refreshResult.getAccessToken())
                .expiresIn(refreshResult.getExpiresIn())
                .build();

        return ResponseEntity.ok(SuccessResponse.<LoginResponse>builder()
                .data(loginResponse)
                .message("Token refreshed successfully")
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

        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(secureCookie)
                .path("/api/v1/auth/refresh")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(SuccessResponse.<Void>builder().message("Logged out successfully").build());
    }
}
