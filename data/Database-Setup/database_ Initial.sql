-- ============================================
-- GYMETRA-V1 - Script de Inicialización de Base de Datos
-- ============================================

-- Crear tabla role
CREATE TABLE IF NOT EXISTS role (
    role_id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Crear tabla user
CREATE TABLE IF NOT EXISTS "user" (
    user_id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    identification BIGINT UNIQUE NOT NULL,
    photo_url TEXT
);

-- Crear tabla user_role (relación N-N)
CREATE TABLE IF NOT EXISTS user_role (
    user_role_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    UNIQUE(user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE
);

-- Crear tabla password_reset_token
CREATE TABLE IF NOT EXISTS password_reset_token (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

-- Crear tabla membership (para el módulo de membresías)
CREATE TABLE IF NOT EXISTS membership (
    membership_id BIGSERIAL PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    features TEXT
);

-- Crear tabla user_membership
CREATE TABLE IF NOT EXISTS user_membership (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    membership_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (membership_id) REFERENCES membership(membership_id) ON DELETE CASCADE
);

-- Crear tabla payment
CREATE TABLE IF NOT EXISTS payment (
    id BIGSERIAL PRIMARY KEY,
    user_membership_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    gateway_reference VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_membership_id) REFERENCES user_membership(id) ON DELETE CASCADE
);

-- Crear tabla branch (sucursales para QR)
CREATE TABLE IF NOT EXISTS branch (
    branch_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'active'
);

-- Crear tabla qr_access
CREATE TABLE IF NOT EXISTS qr_access (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    qr_code TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

-- Crear tabla access_log
CREATE TABLE IF NOT EXISTS access_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    access_type VARCHAR(20) NOT NULL, -- 'ingreso' o 'salida'
    access_time TIMESTAMP DEFAULT NOW(),
    qr_code TEXT,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branch(branch_id) ON DELETE CASCADE
);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar roles básicos
INSERT INTO role (role_name, description) VALUES
('Admin', 'Administrador del sistema'),
('Client', 'Cliente del gimnasio')
ON CONFLICT (role_name) DO NOTHING;

-- Insertar usuario administrador
-- NOTA: La contraseña debe ser hasheada con BCrypt
-- Para desarrollo, puedes usar una contraseña hasheada o cambiar temporalmente a texto plano
INSERT INTO "user" (first_name, last_name, email, password_hash, phone, status, identification)
VALUES ('Super', 'Admin', 'admin@gym.com', '$2a$10$example.hash.for.admin', '123456789', 'active', 123456789)
ON CONFLICT (email) DO NOTHING;

-- Asignar rol de administrador al usuario
INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM "user" u, role r
WHERE u.email = 'admin@gym.com' AND r.role_name = 'Admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Insertar membresías de ejemplo
INSERT INTO membership (plan_name, price, duration_days, description, status) VALUES
('Plan Básico', 29.99, 30, 'Acceso básico al gimnasio', 'active'),
('Plan Premium', 49.99, 30, 'Acceso completo con clases', 'active'),
('Plan Anual', 299.99, 365, 'Acceso ilimitado por un año', 'active')
ON CONFLICT DO NOTHING;

-- Insertar sucursales de ejemplo
INSERT INTO branch (name, address, city, phone, status) VALUES
('Sucursal Centro', 'Calle Principal 123', 'Bogotá', '3001234567', 'active'),
('Sucursal Norte', 'Avenida Norte 456', 'Bogotá', '3007654321', 'active')
ON CONFLICT DO NOTHING;

-- ============================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_email_status ON "user"(email, status);
CREATE INDEX IF NOT EXISTS idx_user_membership_user_id ON user_membership(user_id);
CREATE INDEX IF NOT EXISTS idx_user_membership_status ON user_membership(status);
CREATE INDEX IF NOT EXISTS idx_payment_user_membership ON payment(user_membership_id);
CREATE INDEX IF NOT EXISTS idx_access_log_user_time ON access_log(user_id, access_time);
CREATE INDEX IF NOT EXISTS idx_qr_access_user ON qr_access(user_id, status);
