package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.LoginRequest;
import com.ecommerce.auth.dto.LoginResponse;
import com.ecommerce.auth.dto.RegisterRequest;
import com.ecommerce.auth.entity.RefreshToken;
import com.ecommerce.auth.service.AuthService;
import com.ecommerce.auth.service.TokenService;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;

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
                .secure(true) // Should be true in production
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
    public ResponseEntity<SuccessResponse<LoginResponse>> refresh(@CookieValue(name = "refresh_token", required = true) String refreshToken) {
        // Implementation delegates to AuthService which verifies the token in Redis
        LoginResponse loginResponse = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(SuccessResponse.<LoginResponse>builder()
                .data(loginResponse)
                .message("Token refreshed successfully")
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<SuccessResponse<Void>> logout(HttpServletResponse response) {
        SecurityUtil.getCurrentUserId().ifPresent(userId -> tokenService.deleteByUserId(UUID.fromString(userId)));

        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/api/v1/auth/refresh")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(SuccessResponse.<Void>builder().message("Logged out successfully").build());
    }
}
