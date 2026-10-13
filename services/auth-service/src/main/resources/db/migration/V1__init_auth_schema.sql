-- Flyway migration for Auth Schema

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 0
);

CREATE UNIQUE INDEX uq_user_email ON users(email) WHERE is_deleted = false;

CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed an admin user for initial testing (Password: Admin@123)
-- In production, this would be generated differently.
INSERT INTO users (id, email, password_hash, first_name, last_name)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@ecommerce.com', '$2a$10$C82a46B2X1u3Y0Hk7h8z3eKz0iA9YvL5s8F9r2G4v6a8B0d2F4', 'System', 'Admin');

INSERT INTO user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'ADMIN');
