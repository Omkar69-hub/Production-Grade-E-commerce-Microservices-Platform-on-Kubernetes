package com.ecommerce.auth.bootstrap;

import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.common.enums.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Service to bootstrap the initial platform administrator based on environment variables.
 * Implements Stage 9C: Fix 1B.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrapService implements ApplicationRunner {

    public static final String SEEDED_DEFAULT_ADMIN_EMAIL = "admin@ecommerce.com";
    public static final UUID SEEDED_DEFAULT_ADMIN_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:${app.bootstrap.admin.email:}}")
    private String configuredAdminEmail;

    @Value("${ADMIN_PASSWORD:${app.bootstrap.admin.password:}}")
    private String configuredAdminPassword;

    @Override
    public void run(ApplicationArguments args) {
        bootstrapAdmin(this.configuredAdminEmail, this.configuredAdminPassword);
    }

    /**
     * Executes the bootstrap logic idempotently.
     *
     * @param email    the admin email from environment configuration
     * @param password the admin password from environment configuration
     * @return true if an admin exists or was created; false if skipped or rejected
     */
    @Transactional
    public boolean bootstrapAdmin(String email, String password) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            log.info("No initial administrator credentials supplied via ADMIN_EMAIL/ADMIN_PASSWORD. Skipping admin bootstrap.");
            return false;
        }

        String normalizedEmail = email.trim().toLowerCase();

        // Safety Rule: Never reactivate or reuse the known seeded default admin account
        if (SEEDED_DEFAULT_ADMIN_EMAIL.equalsIgnoreCase(normalizedEmail)) {
            log.error("Bootstrap rejected: Configured admin email cannot match the neutralized seeded default administrator ({})", SEEDED_DEFAULT_ADMIN_EMAIL);
            return false;
        }

        // Validate email format
        if (!EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            log.error("Bootstrap rejected: Configured ADMIN_EMAIL format is invalid.");
            return false;
        }

        // Validate password policy (between 8 and 50 characters, never logged)
        if (password.length() < 8 || password.length() > 50) {
            log.error("Bootstrap rejected: Configured ADMIN_PASSWORD must be between 8 and 50 characters in length.");
            return false;
        }

        // Check if an account already exists with this email
        Optional<User> existingUserOpt = userRepository.findByEmail(normalizedEmail);

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();

            // Guard against the decommissioned UUID
            if (SEEDED_DEFAULT_ADMIN_ID.equals(existingUser.getId())) {
                log.error("Bootstrap rejected: Target account corresponds to decommissioned seeded default admin ID.");
                return false;
            }

            // Check roles: must not overwrite an existing admin or escalate an ordinary user
            if (existingUser.getRoles() != null && existingUser.getRoles().contains(Role.ADMIN.name())) {
                log.info("Administrator account already exists for configured email. Skipping bootstrap to preserve existing credentials and roles.");
                return true;
            } else {
                log.error("Bootstrap conflict: Account already exists for email with non-administrator role(s). Refusing to escalate privileges or overwrite account.");
                return false;
            }
        }

        // Create new initial administrator with hashed password
        User newAdmin = User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(password))
                .firstName("System")
                .lastName("Administrator")
                .roles(new HashSet<>(Set.of(Role.ADMIN.name())))
                .isActive(true)
                .isDeleted(false)
                .build();

        userRepository.save(newAdmin);
        log.info("Successfully bootstrapped initial administrator account for configured email.");
        return true;
    }
}
