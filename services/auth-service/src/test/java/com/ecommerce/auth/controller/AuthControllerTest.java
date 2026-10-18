package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.LoginRequest;
import com.ecommerce.auth.dto.LoginResponse;
import com.ecommerce.auth.dto.RefreshTokenRequest;
import com.ecommerce.auth.dto.RegisterRequest;
import com.ecommerce.auth.dto.TokenRefreshResponse;
import com.ecommerce.auth.entity.RefreshToken;
import com.ecommerce.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@Import({com.ecommerce.common.handler.GlobalExceptionHandler.class, com.ecommerce.auth.security.CsrfProtectionFilter.class})
@DisplayName("Stage 9H: AuthController Browser Cookie & Mobile Refresh Separation with CSRF & Origin Defense")
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
    @DisplayName("Registration: returns 201 Created on valid input")
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
    @DisplayName("Registration: returns 400 Bad Request on invalid input")
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
    @DisplayName("Login: sets HTTP-only refresh_token cookie and readable XSRF-TOKEN cookie")
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
        RefreshToken mockRefreshToken = new RefreshToken();
        mockRefreshToken.setToken("mock-refresh-token");
        mockRefreshToken.setExpirationTimeSeconds(86400L);
        when(authService.generateRefreshToken(any(String.class))).thenReturn(mockRefreshToken);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.accessToken").value("mock.jwt.token"))
                .andExpect(cookie().value("refresh_token", "mock-refresh-token"))
                .andExpect(cookie().path("refresh_token", "/api/v1/auth"))
                .andExpect(cookie().path("XSRF-TOKEN", "/api/v1/auth"));
    }

    @Test
    @DisplayName("Login: returns 401 Unauthorized on invalid credentials")
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
    @DisplayName("Browser Refresh: succeeds with valid cookie and matching CSRF header")
    void givenValidRefreshTokenInCookieAndValidCsrf_whenRefreshing_thenRotatesTokenAndReturns200() throws Exception {
        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setToken("rotated-refresh-token-xyz");
        newRefreshToken.setExpirationTimeSeconds(604800L);

        TokenRefreshResponse refreshResponse = TokenRefreshResponse.builder()
                .accessToken("new.rotated.jwt.token")
                .expiresIn(900000L)
                .refreshToken(newRefreshToken)
                .build();

        when(authService.refreshToken("old-valid-refresh-token")).thenReturn(refreshResponse);

        mockMvc.perform(post("/api/v1/auth/refresh")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "old-valid-refresh-token"))
                .cookie(new jakarta.servlet.http.Cookie("XSRF-TOKEN", "valid-csrf-token"))
                .header("X-XSRF-TOKEN", "valid-csrf-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Token refreshed successfully"))
                .andExpect(jsonPath("$.data.accessToken").value("new.rotated.jwt.token"))
                .andExpect(cookie().value("refresh_token", "rotated-refresh-token-xyz"))
                .andExpect(cookie().httpOnly("refresh_token", true))
                .andExpect(cookie().path("refresh_token", "/api/v1/auth"))
                .andExpect(cookie().path("XSRF-TOKEN", "/api/v1/auth"));
    }

    @Test
    @DisplayName("Browser Refresh: rejects with 403 Forbidden when CSRF header is missing")
    void givenCookieAuthWithoutCsrfHeader_whenRefreshing_thenReturns403Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "valid-token"))
                .cookie(new jakarta.servlet.http.Cookie("XSRF-TOKEN", "valid-csrf-token")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("CSRF token missing or invalid"));
    }

    @Test
    @DisplayName("Browser Refresh: rejects with 403 Forbidden when CSRF token is forged")
    void givenCookieAuthWithForgedCsrfHeader_whenRefreshing_thenReturns403Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "valid-token"))
                .cookie(new jakarta.servlet.http.Cookie("XSRF-TOKEN", "valid-csrf-token"))
                .header("X-XSRF-TOKEN", "forged-csrf-token"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("CSRF token missing or invalid"));
    }

    @Test
    @DisplayName("Browser Refresh: rejects with 403 Forbidden when Origin is cross-origin")
    void givenCrossOriginOriginHeader_whenRefreshing_thenReturns403Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "valid-token"))
                .cookie(new jakarta.servlet.http.Cookie("XSRF-TOKEN", "valid-csrf-token"))
                .header("X-XSRF-TOKEN", "valid-csrf-token")
                .header("Origin", "https://malicious-attacker.com"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Cross-origin request forbidden"));
    }

    @Test
    @DisplayName("Browser Refresh: rejects with 401 Unauthorized when refresh_token cookie is missing")
    void givenMissingRefreshTokenCookieWithCsrf_whenRefreshing_thenReturns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                .cookie(new jakarta.servlet.http.Cookie("XSRF-TOKEN", "valid-csrf-token"))
                .header("X-XSRF-TOKEN", "valid-csrf-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.detail").value("Refresh token is missing"));
    }

    @Test
    @DisplayName("Browser Refresh: rejects attempt to provide JSON body to bypass cookie requirement")
    void givenJsonBodyAttemptOnBrowserRefresh_whenMissingCookie_thenRejectsWith401() throws Exception {
        RefreshTokenRequest body = RefreshTokenRequest.builder().refreshToken("some-raw-token").build();

        mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body))
                .cookie(new jakarta.servlet.http.Cookie("XSRF-TOKEN", "valid-csrf-token"))
                .header("X-XSRF-TOKEN", "valid-csrf-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.detail").value("Refresh token is missing"));
    }

    @Test
    @DisplayName("Mobile Refresh: succeeds on separate path /api/v1/auth/mobile/refresh without cookies or CSRF")
    void givenValidJsonBody_whenMobileRefreshing_thenReturns200WithNewRefreshTokenInBody() throws Exception {
        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setToken("mobile-rotated-token-999");
        newRefreshToken.setExpirationTimeSeconds(604800L);

        TokenRefreshResponse refreshResponse = TokenRefreshResponse.builder()
                .accessToken("mobile.jwt.access.token")
                .expiresIn(900000L)
                .refreshToken(newRefreshToken)
                .build();

        when(authService.refreshToken("mobile-valid-refresh-token")).thenReturn(refreshResponse);

        RefreshTokenRequest request = RefreshTokenRequest.builder()
                .refreshToken("mobile-valid-refresh-token")
                .build();

        mockMvc.perform(post("/api/v1/auth/mobile/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Mobile token refreshed successfully"))
                .andExpect(jsonPath("$.data.accessToken").value("mobile.jwt.access.token"))
                .andExpect(jsonPath("$.data.refreshToken").value("mobile-rotated-token-999"))
                .andExpect(cookie().doesNotExist("refresh_token"))
                .andExpect(cookie().doesNotExist("XSRF-TOKEN"));
    }

    @Test
    @DisplayName("Mobile Refresh: returns 400 Bad Request when request body is blank")
    void givenBlankBody_whenMobileRefreshing_thenReturns400() throws Exception {
        RefreshTokenRequest request = RefreshTokenRequest.builder().refreshToken("").build();

        mockMvc.perform(post("/api/v1/auth/mobile/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("Logout: rejects with 403 Forbidden when CSRF is missing")
    void givenCookieAuthWithoutCsrf_whenLoggingOut_thenReturns403Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "token-to-invalidate")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("CSRF token missing or invalid"));
    }

    @Test
    @DisplayName("Logout: rejects with 403 Forbidden on cross-origin request")
    void givenCrossOrigin_whenLoggingOut_thenReturns403Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "token-to-invalidate"))
                .cookie(new jakarta.servlet.http.Cookie("XSRF-TOKEN", "csrf-valid"))
                .header("X-XSRF-TOKEN", "csrf-valid")
                .header("Origin", "https://cross-origin-attacker.org"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Cross-origin request forbidden"));
    }

    @Test
    @DisplayName("Logout: clears cookies and invalidates session with valid CSRF")
    void givenRefreshTokenAndValidCsrf_whenLoggingOut_thenClearsCookieAndInvalidatesToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                .cookie(new jakarta.servlet.http.Cookie("refresh_token", "token-to-invalidate"))
                .cookie(new jakarta.servlet.http.Cookie("XSRF-TOKEN", "csrf-valid"))
                .header("X-XSRF-TOKEN", "csrf-valid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"))
                .andExpect(cookie().maxAge("refresh_token", 0))
                .andExpect(cookie().path("refresh_token", "/api/v1/auth"))
                .andExpect(cookie().maxAge("XSRF-TOKEN", 0))
                .andExpect(cookie().path("XSRF-TOKEN", "/api/v1/auth"));
    }

    @Test
    @DisplayName("CSRF Endpoint: returns CSRF token and sets readable cookie")
    void givenCsrfEndpoint_whenCalled_thenReturnsCsrfTokenAndSetsCookie() throws Exception {
        mockMvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("CSRF token generated successfully"))
                .andExpect(jsonPath("$.data.csrfToken").isNotEmpty())
                .andExpect(cookie().exists("XSRF-TOKEN"))
                .andExpect(cookie().path("XSRF-TOKEN", "/api/v1/auth"))
                .andExpect(cookie().httpOnly("XSRF-TOKEN", false));
    }
}
