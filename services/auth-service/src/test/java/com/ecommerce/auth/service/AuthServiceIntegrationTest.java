package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.LoginRequest;
import com.ecommerce.auth.dto.LoginResponse;
import com.ecommerce.auth.dto.RegisterRequest;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.repository.RefreshTokenRepository;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.auth.security.CustomUserDetailsService;
import com.ecommerce.common.exception.ConflictException;
import com.ecommerce.common.exception.UnauthorizedException;
import com.ecommerce.common.security.JwtUtil;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Stage 13A: Local Real Authentication Integration Tests
 *
 * Validates real registration, database persistence, BCrypt password hashing,
 * duplicate prevention, email normalization, and authentication verification.
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("Stage 13A: Real Authentication Local Integration Tests")
class AuthServiceIntegrationTest {

    private static final String TEST_SECRET = "dummySecretForTestingThatIsAtLeast32BytesLong";
    private static final int EXPIRATION_MS = 900000;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    @MockBean
    private RefreshTokenRepository refreshTokenRepository;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(10);
        CustomUserDetailsService userDetailsService = new CustomUserDetailsService(userRepository);

        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);

        AuthenticationManager authenticationManager = new ProviderManager(authProvider);
        TokenService tokenService = new TokenService(refreshTokenRepository, null);

        authService = new AuthService(userRepository, passwordEncoder, authenticationManager, tokenService);
        ReflectionTestUtils.setField(authService, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(authService, "jwtExpirationMs", EXPIRATION_MS);

        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", TEST_SECRET);
    }

    @Test
    @DisplayName("1. Registration: creates persistent user record with adaptive BCrypt hash and default CUSTOMER role")
    void givenValidRegistration_whenRegisterUser_thenUserPersistedWithSecureBCryptHashAndRoles() {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("Jane.Doe@AtelierLumiere.com")
                .password("HauteCouture2026!")
                .firstName("  Jane  ")
                .lastName("  Doe  ")
                .build();

        authService.registerUser(registerRequest);
        entityManager.flush();
        entityManager.clear();

        // Verify normalized record in database
        Optional<User> savedUserOpt = userRepository.findByEmailAndIsDeletedFalse("jane.doe@atelierlumiere.com");
        assertThat(savedUserOpt).isPresent();

        User savedUser = savedUserOpt.get();
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getEmail()).isEqualTo("jane.doe@atelierlumiere.com");
        assertThat(savedUser.getFirstName()).isEqualTo("Jane");
        assertThat(savedUser.getLastName()).isEqualTo("Doe");
        assertThat(savedUser.isActive()).isTrue();
        assertThat(savedUser.isDeleted()).isFalse();
        assertThat(savedUser.getRoles()).contains("CUSTOMER");

        // Security check: Plaintext password is NEVER stored; matches BCrypt hash
        assertThat(savedUser.getPassword()).isNotEqualTo("HauteCouture2026!");
        assertThat(savedUser.getPassword()).startsWith("$2a$10$");
        assertThat(passwordEncoder.matches("HauteCouture2026!", savedUser.getPassword())).isTrue();
    }

    @Test
    @DisplayName("2. Authentication: successfully verifies credentials against persisted record and returns valid JWT")
    void givenRegisteredUser_whenAuthenticateWithMatchingPassword_thenGeneratesValidJwtForUser() {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("client.member@lumiere.com")
                .password("SilkOrganza2026#")
                .firstName("Client")
                .lastName("Member")
                .build();

        authService.registerUser(registerRequest);
        entityManager.flush();
        entityManager.clear();

        // Login with matching credentials
        LoginRequest loginRequest = LoginRequest.builder()
                .email("client.member@lumiere.com")
                .password("SilkOrganza2026#")
                .build();

        LoginResponse loginResponse = authService.authenticate(loginRequest);

        assertThat(loginResponse).isNotNull();
        assertThat(loginResponse.getAccessToken()).isNotBlank();
        assertThat(loginResponse.getExpiresIn()).isEqualTo(EXPIRATION_MS);

        // Verify JWT token payload and subject match persisted user
        User user = userRepository.findByEmailAndIsDeletedFalse("client.member@lumiere.com").orElseThrow();
        assertThat(jwtUtil.validateToken(loginResponse.getAccessToken())).isTrue();
        assertThat(jwtUtil.extractUserId(loginResponse.getAccessToken())).isEqualTo(user.getId().toString());
        assertThat(jwtUtil.extractRoles(loginResponse.getAccessToken())).contains("CUSTOMER");
    }

    @Test
    @DisplayName("3. Authentication: rejects incorrect password without compromising user record")
    void givenRegisteredUser_whenAuthenticateWithWrongPassword_thenThrowsBadCredentialsException() {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("secure.client@lumiere.com")
                .password("CorrectPassphrase123#")
                .firstName("Secure")
                .lastName("Client")
                .build();

        authService.registerUser(registerRequest);
        entityManager.flush();
        entityManager.clear();

        LoginRequest wrongPasswordRequest = LoginRequest.builder()
                .email("secure.client@lumiere.com")
                .password("WrongPassword999!")
                .build();

        assertThatThrownBy(() -> authService.authenticate(wrongPasswordRequest))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("4. Registration: prevents duplicate registration with unique email enforcement")
    void givenRegisteredEmail_whenAttemptDuplicateRegistration_thenThrowsConflictException() {
        RegisterRequest first = RegisterRequest.builder()
                .email("exclusive@lumiere.com")
                .password("FirstRegistration123!")
                .firstName("First")
                .lastName("User")
                .build();

        authService.registerUser(first);
        entityManager.flush();

        RegisterRequest duplicate = RegisterRequest.builder()
                .email("EXCLUSIVE@LUMIERE.COM") // Different case, same identity
                .password("SecondRegistration123!")
                .firstName("Second")
                .lastName("User")
                .build();

        assertThatThrownBy(() -> authService.registerUser(duplicate))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Email is already in use");
    }

    @Test
    @DisplayName("5. Authentication: email normalization handles whitespace and case differences")
    void givenRegisteredUser_whenLoggingInWithMixedCaseAndWhitespace_thenAuthenticatesSuccessfully() {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("couture.buyer@lumiere.com")
                .password("CoutureBuyerPassword88!")
                .firstName("Buyer")
                .lastName("One")
                .build();

        authService.registerUser(registerRequest);
        entityManager.flush();
        entityManager.clear();

        LoginRequest loginRequest = LoginRequest.builder()
                .email("  COUTURE.BUYER@LUMIERE.COM  ")
                .password("CoutureBuyerPassword88!")
                .build();

        LoginResponse response = authService.authenticate(loginRequest);
        assertThat(response.getAccessToken()).isNotBlank();
    }

    @Test
    @DisplayName("6. Authentication: deactivated accounts cannot authenticate (fail closed)")
    void givenDeactivatedUser_whenAttemptingLogin_thenFailsClosed() {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("deactivated@lumiere.com")
                .password("ActiveWhenRegistered123!")
                .firstName("Former")
                .lastName("Member")
                .build();

        authService.registerUser(registerRequest);
        entityManager.flush();

        User user = userRepository.findByEmailAndIsDeletedFalse("deactivated@lumiere.com").orElseThrow();
        user.setActive(false);
        userRepository.save(user);
        entityManager.flush();
        entityManager.clear();

        LoginRequest loginRequest = LoginRequest.builder()
                .email("deactivated@lumiere.com")
                .password("ActiveWhenRegistered123!")
                .build();

        assertThatThrownBy(() -> authService.authenticate(loginRequest))
                .isInstanceOfAny(BadCredentialsException.class, DisabledException.class, UsernameNotFoundException.class, UnauthorizedException.class);
    }

    @Test
    @DisplayName("7. Persistence Verification: user record persists across transaction and session resets")
    void givenSavedUser_whenDatabaseReconnected_thenRecordPersistsIntact() {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("persistent.client@lumiere.com")
                .password("PersistentPassphrase77#")
                .firstName("Persistent")
                .lastName("Client")
                .build();

        authService.registerUser(registerRequest);
        entityManager.flush();
        entityManager.clear(); // Simulates closing persistence context / restart

        // Re-query from scratch
        User reloaded = userRepository.findByEmailAndIsDeletedFalse("persistent.client@lumiere.com")
                .orElseThrow();

        assertThat(reloaded.getEmail()).isEqualTo("persistent.client@lumiere.com");
        assertThat(passwordEncoder.matches("PersistentPassphrase77#", reloaded.getPassword())).isTrue();

        // Successful authentication against reloaded state
        LoginResponse response = authService.authenticate(LoginRequest.builder()
                .email("persistent.client@lumiere.com")
                .password("PersistentPassphrase77#")
                .build());

        assertThat(response.getAccessToken()).isNotBlank();
    }
}
