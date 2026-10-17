package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.LoginRequest;
import com.ecommerce.auth.dto.LoginResponse;
import com.ecommerce.auth.dto.RegisterRequest;
import com.ecommerce.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;

@WebMvcTest(controllers = AuthController.class)
@Import(com.ecommerce.common.handler.GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;
    
    @MockBean
    private com.ecommerce.auth.service.TokenService tokenService;
    
    @MockBean
    private com.ecommerce.auth.repository.RefreshTokenRepository refreshTokenRepository;
    
    @MockBean
    private com.ecommerce.auth.repository.UserRepository userRepository;
    
    @MockBean
    private com.ecommerce.common.security.JwtUtil jwtUtil;

    @MockBean
    private com.ecommerce.auth.service.AddressService addressService;

    @Test
    void givenValidRegistration_whenRegisteringUser_thenReturns201() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("test@example.com")
                .password("Password123")
                .firstName("Test")
                .lastName("User")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("User registered successfully"));
    }

    @Test
    void givenInvalidRegistration_whenRegisteringUser_thenReturns400() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("invalid-email")
                .password("short")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void givenValidCredentials_whenLoggingIn_thenReturns200() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("Password123")
                .build();
        
        LoginResponse response = LoginResponse.builder()
                .accessToken("mock.jwt.token")
                .expiresIn(900000L)
                .build();
                
        when(authService.authenticate(any(LoginRequest.class))).thenReturn(response);
        com.ecommerce.auth.entity.RefreshToken mockRefreshToken = new com.ecommerce.auth.entity.RefreshToken();
        mockRefreshToken.setToken("mock-refresh-token");
        mockRefreshToken.setExpirationTimeSeconds(86400L);
        when(authService.generateRefreshToken(any(String.class))).thenReturn(mockRefreshToken);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.accessToken").value("mock.jwt.token"));
    }

    @Test
    void givenInvalidCredentials_whenLoggingIn_thenReturns401() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("WrongPassword")
                .build();
                
        when(authService.authenticate(any(LoginRequest.class))).thenThrow(new org.springframework.security.authentication.BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.detail").value("Invalid credentials"));
    }

    @Test
    void givenValidRefreshTokenInCookie_whenRefreshing_thenRotatesTokenAndReturns200() throws Exception {
        com.ecommerce.auth.entity.RefreshToken newRefreshToken = new com.ecommerce.auth.entity.RefreshToken();
        newRefreshToken.setToken("rotated-refresh-token-xyz");
        newRefreshToken.setExpirationTimeSeconds(604800L);

        com.ecommerce.auth.dto.TokenRefreshResponse refreshResponse = com.ecommerce.auth.dto.TokenRefreshResponse.builder()
                .accessToken("new.rotated.jwt.token")
                .expiresIn(900000L)
                .refreshToken(newRefreshToken)
                .build();

        when(authService.refreshToken("old-valid-refresh-token")).thenReturn(refreshResponse);

        mockMvc.perform(post("/api/v1/auth/refresh")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "old-valid-refresh-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Token refreshed successfully"))
                .andExpect(jsonPath("$.data.accessToken").value("new.rotated.jwt.token"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie().value("refresh_token", "rotated-refresh-token-xyz"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie().httpOnly("refresh_token", true))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie().path("refresh_token", "/api/v1/auth/refresh"));
    }

    @Test
    void givenMissingRefreshToken_whenRefreshing_thenReturns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void givenInvalidOrExpiredRefreshToken_whenRefreshing_thenReturns401() throws Exception {
        when(authService.refreshToken("expired-token"))
                .thenThrow(new com.ecommerce.common.exception.UnauthorizedException("Invalid or expired refresh token"));

        mockMvc.perform(post("/api/v1/auth/refresh")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "expired-token")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void givenRefreshToken_whenLoggingOut_thenClearsCookieAndInvalidatesToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "token-to-invalidate")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie().maxAge("refresh_token", 0));
    }
}
