-- Update the seeded System Admin password hash to the correct value
UPDATE users
SET password_hash = '$2a$10$TOGhCPgYwxwFWpeuxFNQxOWJ5aTDDnvFMKS6RglKgUiXUOxshSd2K',
    updated_at = CURRENT_TIMESTAMP
WHERE id = '00000000-0000-0000-0000-000000000000'
  AND email = 'admin@ecommerce.com';
