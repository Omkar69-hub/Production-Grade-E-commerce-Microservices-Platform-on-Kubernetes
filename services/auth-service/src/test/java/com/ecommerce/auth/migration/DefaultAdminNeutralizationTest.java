package com.ecommerce.auth.migration;

import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.auth.security.CustomUserDetailsService;
import com.ecommerce.common.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Migration-level and authentication-level tests for Fix 1A and Fix 1C.
 * Uses isolated test state and schema analysis without connecting to any live or external database.
 */
@ExtendWith(MockitoExtension.class)
class DefaultAdminNeutralizationTest {

    private static final String DEFAULT_ADMIN_EMAIL = "admin@ecommerce.com";
    private static final UUID DEFAULT_ADMIN_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");
    private static final String NEUTRALIZED_HASH = "$2a$10$DISABLED_NEUTRALIZED_ACCOUNT_LUMIERE_NO_LOGIN_ALLOWED";

    @Mock
    private UserRepository userRepository;

    private CustomUserDetailsService userDetailsService;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userDetailsService = new CustomUserDetailsService(userRepository);
        passwordEncoder = new BCryptPasswordEncoder(10);
    }

    @Test
    @DisplayName("Fix 1C.1: Validate V4 Flyway migration file content and target boundaries")
    void givenV4MigrationFile_whenInspected_thenTargetsOnlyDefaultAdminWithSafeDeactivation() throws IOException {
        ClassPathResource resource = new ClassPathResource("db/migration/V4__neutralize_default_admin.sql");
        assertThat(resource.exists()).isTrue();

        String sql = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

        // Asserts migration updates the users table safely
        assertThat(sql).contains("UPDATE users");
        assertThat(sql).contains("is_active = FALSE");
        assertThat(sql).contains("is_deleted = TRUE");
        assertThat(sql).contains("password_hash = ");

        // Asserts WHERE clause restricts specifically to known seeded admin identifiers
        assertThat(sql).contains("WHERE id = '00000000-0000-0000-0000-000000000000'");
        assertThat(sql).contains("OR email = 'admin@ecommerce.com'");

        // Asserts no destructive DROP or unrestricted DELETE is used
        assertThat(sql.toUpperCase()).doesNotContain("DROP TABLE");
        assertThat(sql.toUpperCase()).doesNotContain("DELETE FROM users");
    }

    @Test
    @DisplayName("Fix 1C.2: Known default credentials rejected when queried by email after migration state")
    void givenNeutralizedDefaultAdmin_whenLoadingByEmail_thenThrowsUsernameNotFoundException() {
        // Post-migration state: is_deleted = true, is_active = false
        when(userRepository.findByEmailAndIsDeletedFalse(DEFAULT_ADMIN_EMAIL))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername(DEFAULT_ADMIN_EMAIL))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found with email: " + DEFAULT_ADMIN_EMAIL);
    }

    @Test
    @DisplayName("Fix 1C.2: Known default credentials rejected when queried by UUID after migration state")
    void givenNeutralizedDefaultAdmin_whenLoadingByUUID_thenThrowsUsernameNotFoundException() {
        // findById with is_deleted=true is filtered out
        when(userRepository.findById(DEFAULT_ADMIN_ID))
                .thenReturn(Optional.of(User.builder()
                        .id(DEFAULT_ADMIN_ID)
                        .email(DEFAULT_ADMIN_EMAIL)
                        .password(NEUTRALIZED_HASH)
                        .isActive(false)
                        .isDeleted(true)
                        .roles(Set.of(Role.ADMIN.name()))
                        .build()));
        when(userRepository.findByEmailAndIsDeletedFalse(DEFAULT_ADMIN_ID.toString()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername(DEFAULT_ADMIN_ID.toString()))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    @DisplayName("Fix 1C.2: Neutralized password hash rejects all known passwords")
    void givenNeutralizedPasswordHash_whenComparedToKnownPasswords_thenAllFail() {
        // Test against known passwords from prior migrations/demos
        assertThat(passwordEncoder.matches("Admin@123", NEUTRALIZED_HASH)).isFalse();
        assertThat(passwordEncoder.matches("admin123", NEUTRALIZED_HASH)).isFalse();
        assertThat(passwordEncoder.matches("admin", NEUTRALIZED_HASH)).isFalse();
        assertThat(passwordEncoder.matches("password", NEUTRALIZED_HASH)).isFalse();
    }

    @Test
    @DisplayName("Fix 1C.7: No unrelated administrator is disabled")
    void givenUnrelatedAdministrator_whenLoading_thenSucceedsWithActiveAdminRoles() {
        String unrelatedAdminEmail = "legitimate.admin@lumiere-atelier.com";
        UUID unrelatedAdminId = UUID.randomUUID();
        String validHashedPassword = passwordEncoder.encode("SecureAdminPassword123!");

        User unrelatedAdmin = User.builder()
                .id(unrelatedAdminId)
                .email(unrelatedAdminEmail)
                .password(validHashedPassword)
                .firstName("Production")
                .lastName("Admin")
                .isActive(true)
                .isDeleted(false)
                .roles(new HashSet<>(Set.of(Role.ADMIN.name())))
                .build();

        when(userRepository.findByEmailAndIsDeletedFalse(unrelatedAdminEmail))
                .thenReturn(Optional.of(unrelatedAdmin));

        UserDetails userDetails = userDetailsService.loadUserByUsername(unrelatedAdminEmail);

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(unrelatedAdminId.toString());
        assertThat(userDetails.isEnabled()).isTrue();
        assertThat(userDetails.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_ADMIN");

        // Verify authentication against valid password succeeds for unrelated admin
        assertThat(passwordEncoder.matches("SecureAdminPassword123!", userDetails.getPassword())).isTrue();
    }
}
