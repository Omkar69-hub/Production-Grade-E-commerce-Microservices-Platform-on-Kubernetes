package com.ecommerce.auth.bootstrap;

import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.common.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AdminBootstrapService adminBootstrapService;

    @BeforeEach
    void setUp() {
        adminBootstrapService = new AdminBootstrapService(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Fix 1C.3: Bootstrap creates admin only when both environment variables are supplied")
    void givenBothEnvVariablesSupplied_whenBootstrapping_thenAdminCreated() {
        String email = "first.admin@lumiere-atelier.com";
        String rawPassword = "SuperSecretSecurePassword123!";
        String encodedHash = "$2a$10$hashedAdminPasswordValueExampleOnly";

        when(userRepository.findByEmail(email.toLowerCase())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedHash);

        boolean result = adminBootstrapService.bootstrapAdmin(email, rawPassword);

        assertThat(result).isTrue();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getEmail()).isEqualTo(email.toLowerCase());
        assertThat(savedUser.getRoles()).contains(Role.ADMIN.name());
        assertThat(savedUser.isActive()).isTrue();
        assertThat(savedUser.isDeleted()).isFalse();
    }

    @Test
    @DisplayName("Fix 1C.4: Configured admin password must be stored as a hash, not plaintext")
    void givenValidAdminCredentials_whenBootstrapped_thenPasswordIsHashedAndNotPlaintext() {
        String email = "security.admin@lumiere.com";
        String rawPassword = "PlaintextAdminPassword99!";
        String encodedHash = "$2a$10$BCryptSecureHashValue1234567890abcdef";

        when(userRepository.findByEmail(email.toLowerCase())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedHash);

        adminBootstrapService.bootstrapAdmin(email, rawPassword);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getPassword()).isEqualTo(encodedHash);
        assertThat(savedUser.getPassword()).isNotEqualTo(rawPassword);
        assertThat(savedUser.getPassword()).startsWith("$2a$10$");
    }

    @Test
    @DisplayName("Fix 1C.6: Missing or blank configuration creates no admin")
    void givenMissingOrBlankVariables_whenBootstrapping_thenNoAdminCreated() {
        // Null email
        boolean res1 = adminBootstrapService.bootstrapAdmin(null, "ValidPassword123");
        assertThat(res1).isFalse();

        // Empty email
        boolean res2 = adminBootstrapService.bootstrapAdmin("", "ValidPassword123");
        assertThat(res2).isFalse();

        // Blank email
        boolean res3 = adminBootstrapService.bootstrapAdmin("   ", "ValidPassword123");
        assertThat(res3).isFalse();

        // Null password
        boolean res4 = adminBootstrapService.bootstrapAdmin("admin@domain.com", null);
        assertThat(res4).isFalse();

        // Empty password
        boolean res5 = adminBootstrapService.bootstrapAdmin("admin@domain.com", "");
        assertThat(res5).isFalse();

        // Blank password
        boolean res6 = adminBootstrapService.bootstrapAdmin("admin@domain.com", "   ");
        assertThat(res6).isFalse();

        verifyNoInteractions(userRepository);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("Fix 1B: Never reactivate known seeded default admin email")
    void givenSeededDefaultAdminEmail_whenBootstrapping_thenRejectedWithoutModifying() {
        boolean result = adminBootstrapService.bootstrapAdmin("admin@ecommerce.com", "NewPassword1234");

        assertThat(result).isFalse();
        verifyNoInteractions(userRepository);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("Fix 1B: Reject invalid email format")
    void givenInvalidEmailFormat_whenBootstrapping_thenRejected() {
        boolean result = adminBootstrapService.bootstrapAdmin("not-a-valid-email", "ValidPassword123");

        assertThat(result).isFalse();
        verifyNoInteractions(userRepository);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("Fix 1B: Reject password violating length policy (< 8 or > 50)")
    void givenPasswordViolatingPolicy_whenBootstrapping_thenRejected() {
        // Too short (< 8)
        boolean resShort = adminBootstrapService.bootstrapAdmin("admin@example.com", "short");
        assertThat(resShort).isFalse();

        // Too long (> 50)
        String tooLong = "A".repeat(51);
        boolean resLong = adminBootstrapService.bootstrapAdmin("admin@example.com", tooLong);
        assertThat(resLong).isFalse();

        verifyNoInteractions(userRepository);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("Fix 1C.5: Restart/repeated bootstrap does not change existing admin password or roles")
    void givenExistingAdministrator_whenBootstrapRunsAgain_thenSkippedWithoutModification() {
        String email = "existing.admin@atelier.com";
        String existingHash = "$2a$10$ExistingPashHash123456";

        User existingAdmin = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .password(existingHash)
                .firstName("Existing")
                .lastName("Admin")
                .roles(new HashSet<>(Set.of(Role.ADMIN.name())))
                .isActive(true)
                .isDeleted(false)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingAdmin));

        boolean result = adminBootstrapService.bootstrapAdmin(email, "DifferentPassword12345");

        assertThat(result).isTrue();
        // Crucial: Must NOT overwrite password or call save
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
        assertThat(existingAdmin.getPassword()).isEqualTo(existingHash);
        assertThat(existingAdmin.getRoles()).containsExactly(Role.ADMIN.name());
    }

    @Test
    @DisplayName("Fix 1B: If configured account already exists with non-admin role, fail safely and report conflict")
    void givenExistingNonAdminUser_whenBootstrapRuns_thenRefusesPrivilegeEscalation() {
        String email = "customer@domain.com";

        User customerUser = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .password("$2a$10$CustomerHash")
                .roles(new HashSet<>(Set.of(Role.CUSTOMER.name())))
                .isActive(true)
                .isDeleted(false)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(customerUser));

        boolean result = adminBootstrapService.bootstrapAdmin(email, "NewAdminPassword1234");

        assertThat(result).isFalse();
        // Crucial: Must NOT grant admin role, must NOT update password
        verify(userRepository, never()).save(any());
        assertThat(customerUser.getRoles()).doesNotContain(Role.ADMIN.name());
        assertThat(customerUser.getRoles()).containsExactly(Role.CUSTOMER.name());
    }
}
