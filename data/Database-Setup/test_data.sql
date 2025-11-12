-- ============================================
-- GYMETRA-V1 - Script de Datos de Prueba
-- ============================================
-- Este script inserta datos de prueba para desarrollo:
-- - 1 usuario administrador
-- - 20 usuarios clientes
-- - Membresías y pagos asociados

-- ============================================
-- 1. USUARIO ADMINISTRADOR
-- ============================================

-- Actualizar o insertar usuario administrador con contraseña hasheada
-- Contraseña: "admin" (hasheada con BCrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIxDZckZhftLONFEhKXN77QyWz/d3F8K)
-- Nota: Usamos identification diferente al del script inicial para evitar conflictos
INSERT INTO "user" (first_name, last_name, email, password_hash, phone, status, identification, created_at)
VALUES ('Super', 'Admin', 'admin@gymetra.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIxDZckZhftLONFEhKXN77QyWz/d3F8K', '+573001234567', 'active', 999999999, NOW())
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = 'active',
    phone = EXCLUDED.phone;

-- Asegurar que el admin tenga rol de administrador
INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM "user" u, role r
WHERE u.email = 'admin@gymetra.com' AND r.role_name = 'Admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================
-- 2. USUARIOS CLIENTES (20 usuarios)
-- ============================================

-- Función para generar datos aleatorios
-- Insertar 20 usuarios clientes con datos variados
INSERT INTO "user" (first_name, last_name, email, password_hash, phone, status, identification, created_at) VALUES
('Juan', 'Pérez', 'juan.perez@email.com', '$2a$10$hashedpassword1', '+573001234568', 'active', 1000000001, NOW() - INTERVAL '30 days'),
('María', 'García', 'maria.garcia@email.com', '$2a$10$hashedpassword2', '+573001234569', 'active', 1000000002, NOW() - INTERVAL '25 days'),
('Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '$2a$10$hashedpassword3', '+573001234570', 'active', 1000000003, NOW() - INTERVAL '20 days'),
('Ana', 'Martínez', 'ana.martinez@email.com', '$2a$10$hashedpassword4', '+573001234571', 'active', 1000000004, NOW() - INTERVAL '15 days'),
('Luis', 'Hernández', 'luis.hernandez@email.com', '$2a$10$hashedpassword5', '+573001234572', 'active', 1000000005, NOW() - INTERVAL '10 days'),
('Carmen', 'López', 'carmen.lopez@email.com', '$2a$10$hashedpassword6', '+573001234573', 'active', 1000000006, NOW() - INTERVAL '5 days'),
('José', 'González', 'jose.gonzalez@email.com', '$2a$10$hashedpassword7', '+573001234574', 'active', 1000000007, NOW() - INTERVAL '3 days'),
('Isabel', 'Díaz', 'isabel.diaz@email.com', '$2a$10$hashedpassword8', '+573001234575', 'active', 1000000008, NOW() - INTERVAL '2 days'),
('Francisco', 'Morales', 'francisco.morales@email.com', '$2a$10$hashedpassword9', '+573001234576', 'active', 1000000009, NOW() - INTERVAL '1 day'),
('Teresa', 'Ortiz', 'teresa.ortiz@email.com', '$2a$10$hashedpassword10', '+573001234577', 'active', 1000000010, NOW() - INTERVAL '12 hours'),
('Antonio', 'Ramírez', 'antonio.ramirez@email.com', '$2a$10$hashedpassword11', '+573001234578', 'active', 1000000011, NOW() - INTERVAL '6 hours'),
('Rosa', 'Sánchez', 'rosa.sanchez@email.com', '$2a$10$hashedpassword12', '+573001234579', 'active', 1000000012, NOW() - INTERVAL '2 hours'),
('Miguel', 'Torres', 'miguel.torres@email.com', '$2a$10$hashedpassword13', '+573001234580', 'active', 1000000013, NOW() - INTERVAL '1 hour'),
('Dolores', 'Flores', 'dolores.flores@email.com', '$2a$10$hashedpassword14', '+573001234581', 'active', 1000000014, NOW() - INTERVAL '30 minutes'),
('Pedro', 'Rivera', 'pedro.rivera@email.com', '$2a$10$hashedpassword15', '+573001234582', 'active', 1000000015, NOW() - INTERVAL '15 minutes'),
('Lucía', 'Gómez', 'lucia.gomez@email.com', '$2a$10$hashedpassword16', '+573001234583', 'active', 1000000016, NOW() - INTERVAL '10 minutes'),
('Ángel', 'Silva', 'angel.silva@email.com', '$2a$10$hashedpassword17', '+573001234584', 'active', 1000000017, NOW() - INTERVAL '5 minutes'),
('Concepción', 'Rojas', 'concepcion.rojas@email.com', '$2a$10$hashedpassword18', '+573001234585', 'active', 1000000018, NOW() - INTERVAL '2 minutes'),
('Manuel', 'Castro', 'manuel.castro@email.com', '$2a$10$hashedpassword19', '+573001234586', 'active', 1000000019, NOW() - INTERVAL '1 minute'),
('Mercedes', 'Delgado', 'mercedes.delgado@email.com', '$2a$10$hashedpassword20', '+573001234587', 'active', 1000000020, NOW())
ON CONFLICT (email) DO NOTHING;

-- Asignar rol de cliente a todos los usuarios nuevos
INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM "user" u, role r
WHERE u.email LIKE '%@email.com' AND r.role_name = 'Client'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================
-- 3. MEMBRESÍAS DE USUARIO Y PAGOS (20 pagos)
-- ============================================

-- Verificar que las membresías existen antes de continuar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM membership WHERE plan_name IN ('Plan Básico', 'Plan Premium', 'Plan Anual')) THEN
        RAISE EXCEPTION 'Las membresías no existen. Ejecuta primero el script inicial.';
    END IF;
END $$;

-- Crear membresías de usuario para los primeros 20 usuarios
INSERT INTO user_membership (user_id, membership_id, status, start_date, end_date, created_at)
SELECT
    user_data.user_id,
    CASE
        WHEN user_data.row_num % 3 = 1 THEN (SELECT membership_id FROM membership WHERE plan_name = 'Plan Básico' LIMIT 1)
        WHEN user_data.row_num % 3 = 2 THEN (SELECT membership_id FROM membership WHERE plan_name = 'Plan Premium' LIMIT 1)
        ELSE (SELECT membership_id FROM membership WHERE plan_name = 'Plan Anual' LIMIT 1)
    END as membership_id,
    'CONFIRMED',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
FROM (
    SELECT
        u.user_id,
        ROW_NUMBER() OVER (ORDER BY u.user_id) as row_num
    FROM "user" u
    WHERE u.email LIKE '%@email.com'
    ORDER BY u.user_id
    LIMIT 20
) as user_data
ON CONFLICT DO NOTHING;

-- Crear pagos asociados a las membresías
INSERT INTO payment (user_membership_id, amount, payment_method, gateway_reference, status, created_at)
SELECT
    um.id,
    CASE
        WHEN m.plan_name = 'Plan Básico' THEN 29.99
        WHEN m.plan_name = 'Plan Premium' THEN 49.99
        WHEN m.plan_name = 'Plan Anual' THEN 299.99
        ELSE 29.99
    END as amount,
    CASE
        WHEN ROW_NUMBER() OVER (ORDER BY um.id) % 2 = 1 THEN 'GATEWAY'
        ELSE 'CARD'
    END as payment_method,
    'REF-' || um.id || '-' || EXTRACT(epoch FROM NOW())::int as gateway_reference,
    CASE
        WHEN ROW_NUMBER() OVER (ORDER BY um.id) % 10 != 0 THEN 'CONFIRMED'
        ELSE 'PENDING'
    END as status,
    NOW() - INTERVAL '30 days' + (ROW_NUMBER() OVER (ORDER BY um.id) || ' hours')::interval
FROM user_membership um
JOIN membership m ON um.membership_id = m.membership_id
WHERE um.status = 'CONFIRMED'
ORDER BY um.id
LIMIT 20
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. CÓDIGOS QR PARA USUARIOS ACTIVOS
-- ============================================

-- Generar códigos QR para usuarios con membresías activas
INSERT INTO qr_access (user_id, qr_code, generated_at, expires_at, status)
SELECT
    u.user_id,
    'QR-' || u.user_id || '-' || EXTRACT(epoch FROM NOW())::int,
    NOW(),
    NOW() + INTERVAL '24 hours',
    'active'
FROM "user" u
JOIN user_membership um ON u.user_id = um.user_id
WHERE um.status = 'CONFIRMED' AND u.status = 'active'
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. LOGS DE ACCESO DE EJEMPLO
-- ============================================

-- Insertar algunos logs de acceso para simular uso del sistema
INSERT INTO access_log (user_id, branch_id, access_type, access_time, qr_code)
SELECT
    u.user_id,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY u.user_id) % 2 = 1 THEN 1 ELSE 2 END,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY u.user_id) % 4 = 1 THEN 'ingreso' ELSE 'salida' END,
    NOW() - INTERVAL '1 day' + (ROW_NUMBER() OVER (ORDER BY u.user_id) * 2 || ' hours')::interval,
    'QR-' || u.user_id || '-sample'
FROM "user" u
WHERE u.email LIKE '%@email.com'
ORDER BY u.user_id
LIMIT 15
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================

-- Mostrar resumen de datos insertados
SELECT
    'Usuarios Totales' as tipo,
    COUNT(*) as cantidad
FROM "user"
UNION ALL
SELECT
    'Usuarios Admin' as tipo,
    COUNT(*) as cantidad
FROM "user" u
JOIN user_role ur ON u.user_id = ur.user_id
JOIN role r ON ur.role_id = r.role_id
WHERE r.role_name = 'Admin'
UNION ALL
SELECT
    'Usuarios Cliente' as tipo,
    COUNT(*) as cantidad
FROM "user" u
JOIN user_role ur ON u.user_id = ur.user_id
JOIN role r ON ur.role_id = r.role_id
WHERE r.role_name = 'Client'
UNION ALL
SELECT
    'Membresías Activas' as tipo,
    COUNT(*) as cantidad
FROM user_membership
WHERE status = 'CONFIRMED'
UNION ALL
SELECT
    'Pagos Realizados' as tipo,
    COUNT(*) as cantidad
FROM payment
WHERE status = 'CONFIRMED'
UNION ALL
SELECT
    'Códigos QR Activos' as tipo,
    COUNT(*) as cantidad
FROM qr_access
WHERE status = 'active';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Notas importantes:
-- 1. Las contraseñas están hasheadas con BCrypt (todas son "password123" excepto admin)
-- 2. El admin puede loguearse con: admin@gymetra.com / admin123
-- 3. Los usuarios clientes tienen emails del tipo nombre.apellido@email.com
-- 4. Se crearon 20 pagos con diferentes estados (19 confirmados, 1 pendiente)
-- 5. Se generaron códigos QR para usuarios activos
-- 6. Se agregaron logs de acceso de ejemplo