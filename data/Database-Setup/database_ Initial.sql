INSERT INTO role (role_name, description) VALUES 
('Admin', 'Administrador del sistema'),
('Client', 'Cliente del gimnasio');

INSERT INTO "user" (first_name, last_name, email, password_hash, phone, status)
VALUES ('Super', 'Admin', 'admin@gym.com', 'bcrypt_hash_aqui', '123456789', 'active');

INSERT INTO user_role (user_id, role_id) VALUES (1, 1);
