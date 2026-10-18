-- Flyway migration V4: Safely neutralize known default seeded administrator
-- LUMIÈRE Stage 9C: Fix 1A
-- Deactivates and soft-deletes the seeded default admin account while preserving referential integrity.
-- Overwrites the password hash with an invalid hash format to guarantee credentials cannot be used.

UPDATE users
SET is_active = FALSE,
    is_deleted = TRUE,
    password_hash = '$2a$10$DISABLED_NEUTRALIZED_ACCOUNT_LUMIERE_NO_LOGIN_ALLOWED',
    updated_at = CURRENT_TIMESTAMP
WHERE id = '00000000-0000-0000-0000-000000000000'
   OR email = 'admin@ecommerce.com';
