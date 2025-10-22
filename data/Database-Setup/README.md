# HU-2.1 – Creación e instalación de la base de datos (PostgreSQL)

## Descripción
Se instaló PostgreSQL y se creó el esquema inicial `gymdb` con las tablas base necesarias para la aplicación:
- `role`: almacena los roles del sistema (Admin, Client).  
- `"user"`: almacena la información de los usuarios.  
- `user_role`: tabla intermedia que establece la relación N-N entre usuarios y roles.  

La conexión al backend se documentó en `application.yml`.  
La base de datos principal se encuentra en un dispositivo local, accesible de forma remota mediante **VPN Hamachi**.

> ⚠️ Nota: Para acceder desde otro dispositivo a través de Hamachi, se debe usar la IP asignada por Hamachi y el puerto configurado en PostgreSQL.

---

## Esquema de la base de datos

### Tabla `role`
| Campo      | Tipo       | Detalle                     |
|------------|------------|-----------------------------|
| role_id    | BIGSERIAL  | Primary key                 |
| role_name  | VARCHAR(50)| Único, ej: 'Admin', 'Client'|
| description| TEXT       | Descripción del rol         |

### Tabla `"user"`
| Campo        | Tipo          | Detalle                                               |
|--------------|---------------|------------------------------------------------------|
| user_id      | BIGSERIAL     | Primary key                                         |
| first_name   | VARCHAR(100)  | Nombre del usuario                                  |
| last_name    | VARCHAR(100)  | Apellido del usuario                                |
| email        | VARCHAR(150)  | Único                                               |
| password_hash| VARCHAR(255)  | Contraseña hasheada con bcrypt                     |
| phone        | VARCHAR(30)   | Teléfono                                           |
| status       | VARCHAR(20)   | Estado: active/inactive/suspended, default 'active'|
| created_at   | TIMESTAMPTZ   | Fecha de creación, default NOW()                    |
| last_login   | TIMESTAMPTZ   | Último inicio de sesión                              |

### Tabla `user_role`
| Campo        | Tipo       | Detalle                                   |
|--------------|-----------|------------------------------------------|
| user_role_id | BIGSERIAL | Primary key                               |
| user_id      | BIGINT    | FK hacia `"user"`                          |
| role_id      | BIGINT    | FK hacia `role`                            |
| UNIQUE       | -         | Combinación (user_id, role_id) evita duplicados |

---

## Índices recomendados
```sql
CREATE INDEX idx_user_email_status ON "user"(email, status);
```

---

## Conexión remota mediante VPN Hamachi

### Configuración general de PostgreSQL

1. Instalar y configurar **Hamachi** en ambos dispositivos.
2. Obtener la IP del dispositivo que tiene PostgreSQL desde Hamachi (ej. `25.24.100.205`).
3. Configurar PostgreSQL para aceptar conexiones remotas:
   * Editar `postgresql.conf` y cambiar:
   ```
   listen_addresses = '*'
   ```
   * Editar `pg_hba.conf` para permitir la IP de Hamachi:
   ```
   host    all             all             25.24.100.0/24         md5
   ```
4. Reiniciar PostgreSQL.

### Conexión desde PgAdmin

1. Abrir PgAdmin y crear un nuevo servidor.
2. En la pestaña **General**:
   * **Name:** GymDB Remota (o cualquier nombre que prefieras)
3. En la pestaña **Connection**:
   * **Host name/address:** 25.24.100.205 (IP de Hamachi)
   * **Port:** 5000 (puerto configurado en postgresql.conf)
   * **Maintenance database:** gymdb
   * **Username:** postgres
   * **Password:** 123456
   * **Save password?** → marcar si quieres que PgAdmin recuerde la contraseña
4. Guardar y probar la conexión.