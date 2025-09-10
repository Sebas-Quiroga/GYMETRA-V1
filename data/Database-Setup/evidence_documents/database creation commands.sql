CREATE DATABASE gymdb;
CREATE TABLE role (
    role_id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL, -- Ej: 'Admin', 'Client'
    description TEXT
);

-- ==========================
-- Tabla User
-- ==========================
CREATE TABLE "user" (
    user_id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Guardado con bcrypt
    phone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- ==========================
-- Tabla UserRole (relación N-N entre User y Role)
-- ==========================
CREATE TABLE user_role (
    user_role_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES role(role_id) ON DELETE CASCADE,
    UNIQUE (user_id, role_id) -- evitar duplicados
);

-- ==========================
-- Índices recomendados
-- ==========================
CREATE INDEX idx_user_email_status ON "user"(email, status);

-- ==============================================
-- DATOS INICIALES (Opcional)
-- ==============================================
INSERT INTO role (role_name, description) VALUES 
('Admin', 'Administrador del sistema'),
('Client', 'Cliente del gimnasio');

-- Usuario admin inicial (contraseña debería guardarse con bcrypt en tu app)
INSERT INTO "user" (first_name, last_name, email, password_hash, phone, status)
VALUES ('Super', 'Admin', 'admin@gym.com', 'bcrypt_hash_aqui', '123456789', 'active');

-- Relación entre el usuario y el rol Admin
INSERT INTO user_role (user_id, role_id) VALUES (1, 1);




