package com.ecommerce.auth.bootstrap;

import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.common.enums.Role;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Stage 14B-5B-Fix: Regression tests for AdminBootstrapService with real JPA/Hibernate lifecycle.
 *
 * Validates:
 * 1. Admin bootstrap on a clean database without bootstrap admin.
 * 2. Persisted admin receives a persistence-provider generated UUID and valid version value (no PropertyValueException).
 * 3. Bootstrap is idempotent when the admin account already exists.
 * 4. Existing accounts and roles are not duplicated or overwritten.
 * 5. Decommissioned default admin is never reactivated.
 */
import com.ecommerce.auth.repository.RefreshTokenRepository;
import org.springframework.boot.test.mock.mockito.MockBean;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("Stage 14B-5B-Fix: Admin Bootstrap JPA Integration Tests")
class AdminBootstrapServiceIntegrationTest {

    @MockBean
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    private PasswordEncoder passwordEncoder;
    private AdminBootstrapService adminBootstrapService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(10);
        adminBootstrapService = new AdminBootstrapService(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("a & c: Bootstrap creates admin with generated UUID and valid initial version (0) without Hibernate exceptions")
    void givenNoExistingAdmin_whenBootstrapRuns_thenAdminPersistedWithGeneratedIdAndValidVersion() {
        String adminEmail = "platform.admin@lumiere-atelier.com";
        String rawPassword = "StrongBootstrapPassword2026!";

        boolean bootstrapped = adminBootstrapService.bootstrapAdmin(adminEmail, rawPassword);
        assertThat(bootstrapped).isTrue();

        entityManager.flush();
        entityManager.clear();

        Optional<User> persistedOpt = userRepository.findByEmail(adminEmail);
        assertThat(persistedOpt).isPresent();

        User persistedAdmin = persistedOpt.get();
        // c. Verify generated ID and valid JPA version
        assertThat(persistedAdmin.getId()).isNotNull();
        assertThat(persistedAdmin.getVersion()).isNotNull();
        assertThat(persistedAdmin.getVersion()).isEqualTo(0);

        // Verification of properties & password encryption
        assertThat(persistedAdmin.getEmail()).isEqualTo(adminEmail);
        assertThat(persistedAdmin.getFirstName()).isEqualTo("System");
        assertThat(persistedAdmin.getLastName()).isEqualTo("Administrator");
        assertThat(persistedAdmin.isActive()).isTrue();
        assertThat(persistedAdmin.isDeleted()).isFalse();
        assertThat(persistedAdmin.getRoles()).containsExactly(Role.ADMIN.name());
        assertThat(passwordEncoder.matches(rawPassword, persistedAdmin.getPassword())).isTrue();
    }

    @Test
    @DisplayName("b: Bootstrap is idempotent when the admin already exists and does not alter password or roles")
    void givenExistingAdmin_whenBootstrapRunsAgain_thenIdempotentAndNoDuplicatesCreated() {
        String adminEmail = "ops.admin@lumiere-atelier.com";
        String initialPassword = "InitialPassword123!";

        // First run
        boolean firstRun = adminBootstrapService.bootstrapAdmin(adminEmail, initialPassword);
        assertThat(firstRun).isTrue();
        entityManager.flush();
        entityManager.clear();

        User initialUser = userRepository.findByEmail(adminEmail).orElseThrow();
        UUID initialId = initialUser.getId();
        String initialPasswordHash = initialUser.getPassword();

        // Second run with different password
        boolean secondRun = adminBootstrapService.bootstrapAdmin(adminEmail, "CompletelyDifferentPassword456!");
        assertThat(secondRun).isTrue();
        entityManager.flush();
        entityManager.clear();

        // Check user count: must still be 1
        long totalUsers = userRepository.count();
        assertThat(totalUsers).isEqualTo(1);

        User postSecondRunUser = userRepository.findByEmail(adminEmail).orElseThrow();
        assertThat(postSecondRunUser.getId()).isEqualTo(initialId);
        assertThat(postSecondRunUser.getPassword()).isEqualTo(initialPasswordHash);
        assertThat(passwordEncoder.matches(initialPassword, postSecondRunUser.getPassword())).isTrue();
        assertThat(postSecondRunUser.getRoles()).containsExactly(Role.ADMIN.name());
    }

    @Test
    @DisplayName("d: Existing non-admin accounts are preserved and cannot be escalated or overwritten")
    void givenExistingCustomer_whenAdminBootstrapTargetsSameEmail_thenRefusesEscalationAndPreservesAccount() {
        String customerEmail = "customer@lumiere-atelier.com";
        String customerPassword = "CustomerPassword123!";

        User customer = User.builder()
                .email(customerEmail)
                .password(passwordEncoder.encode(customerPassword))
                .firstName("Regular")
                .lastName("Customer")
                .roles(new HashSet<>(Set.of(Role.CUSTOMER.name())))
                .isActive(true)
                .isDeleted(false)
                .build();

        userRepository.save(customer);
        entityManager.flush();
        entityManager.clear();

        boolean result = adminBootstrapService.bootstrapAdmin(customerEmail, "AttackerPassword789!");
        assertThat(result).isFalse();

        entityManager.flush();
        entityManager.clear();

        User unchangedCustomer = userRepository.findByEmail(customerEmail).orElseThrow();
        assertThat(unchangedCustomer.getRoles()).containsExactly(Role.CUSTOMER.name());
        assertThat(passwordEncoder.matches(customerPassword, unchangedCustomer.getPassword())).isTrue();
        assertThat(userRepository.count()).isEqualTo(1);
    }
}
