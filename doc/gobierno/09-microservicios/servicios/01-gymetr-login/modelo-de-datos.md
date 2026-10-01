# Modelo de datos — GYMETR-login

> Motor: **PostgreSQL 15** · Esquema: `public` · Base: `gymdb` (compartida con los otros dos servicios)
>
> Las tablas se crean por dos caminos distintos y **no producen el mismo resultado**:
> `data/Database-Setup/database_ Initial.sql` o el `ddl-auto: update` de Hibernate. La diferencia
> importa y está documentada al final de esta página.

---

## Tabla: `user`

Almacena el perfil del socio. **La contraseña no está aquí**: Cognito la custodia.

| Columna | Tipo | Restricciones | Notas |
|---------|------|---------------|-------|
| `user_id` | BIGSERIAL | PK | `Long` en la entidad |
| `first_name` | VARCHAR(100) | NOT NULL | |
| `last_name` | VARCHAR(100) | NOT NULL | |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | Es la clave con la que se busca al sincronizar |
| `password_hash` | VARCHAR(255) | **NOT NULL en el script** | **Nunca se escribe**: 0 llamadas a `setPasswordHash` en todo el backend (R-25) |
| `phone` | VARCHAR(30) | | |
| `status` | VARCHAR(20) | default `'active'` | `active`, `suspended`, `deleted` |
| `identification` | BIGINT | NOT NULL, UNIQUE | Cédula |
| `photo_url` | TEXT | | |
| `created_at` | TIMESTAMPTZ | default `NOW()` | |
| `last_login` | TIMESTAMPTZ | | No hay código que lo actualice |

### Inconsistencias verificadas

| Problema | Detalle | Riesgo |
|----------|---------|--------|
| `password_hash` es NOT NULL pero nunca se asigna | El alta desde Cognito + `sync` debe dejar un valor o el `INSERT` falla | R-25 |
| `last_login` nunca se escribe | No hay dato de última sesión | — |
| El borrado es físico | `deleteById` dispara las cascadas del script | R-22 |

---

## Tabla: `role`

| Columna | Tipo | Restricciones | Notas |
|---------|------|---------------|-------|
| `role_id` | BIGSERIAL | PK | |
| `role_name` | VARCHAR(50) | NOT NULL, UNIQUE | |
| `description` | TEXT | | |

### Roles que crea el sistema

| Rol | Quién lo crea | Dónde |
|-----|---------------|-------|
| `Admin` | `DataInitializer` (servicio de membresías) | `INSERT INTO role` del script SQL |
| `Client` | `DataInitializer` (servicio de membresías) | `INSERT INTO role` del script SQL |
| `User` | `CognitoUserSyncService.DEFAULT_ROLE` | Al primer sync del socio |

> **Tres nombres de rol conviven** y nada decide cuál manda. `RoleController` además permite crear
> roles nuevos por API, así que la lista puede crecer sin control. Ver R-16 y R-21.

---

## Tabla: `user_role`

Relación N-N entre `user` y `role`.

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `user_role_id` | BIGSERIAL | PK |
| `user_id` | BIGINT | NOT NULL, FK → `user` ON DELETE CASCADE |
| `role_id` | BIGINT | NOT NULL, FK → `role` ON DELETE CASCADE |

Restricción adicional: `UNIQUE(user_id, role_id)`.

---

## Tabla: `password_reset_token`

| Columna | Tipo | Restricciones | Notas |
|---------|------|---------------|-------|
| `id` | BIGSERIAL | PK | |
| `user_id` | BIGINT | NOT NULL, FK → `user` ON DELETE CASCADE | La entidad lo mapea con `@ManyToOne` |
| `token` | VARCHAR(255) | **NOT NULL UNIQUE en el script**; la entidad no lo declara (`@Column(nullable=false)` sin `unique`) | R-10. Si la base la creó Hibernate, no hay índice sobre `token` y la búsqueda es seq scan |
| `expiry_date` | TIMESTAMP | **NOT NULL en el script**, nullable en la entidad; **sin índice** | R-10 |

> No existe la columna `used`: la entidad no la tiene y el script tampoco.

> **Tabla muerta.** La entidad y su repositorio existen, pero ningún servicio la usa: no hay
> endpoint de solicitud ni de canje. La consulta de limpieza
> (`delete from PasswordResetToken t where t.expiryDate <= :now`) recorre la tabla entera.
> Mientras siga así, el riesgo real es la confusión sobre cuál es la fuente de la contraseña
> (R-20, R-25, R-26).

---

## Índices

| Índice | Definido en | Nota |
|--------|-------------|------|
| PK de cada tabla | Script SQL | `BIGSERIAL` |
| `UNIQUE(email)` | Script SQL | Búsqueda por email al sincronizar |
| `UNIQUE(identification)` | Script SQL | |
| `UNIQUE(role_name)` | Script SQL | |
| `UNIQUE(user_id, role_id)` | Script SQL | Evita roles duplicados |
| `UNIQUE(token)` | Script SQL | La entidad no lo declara; si la base la creó Hibernate, falta este índice |
| Índice en `status` | ❌ Ninguno | La búsqueda de socios activos es secuencial |
| Índice en `expiry_date` | ❌ Ninguno | R-10 |

> Hibernate no crea índices que no estén declarados con `@Table(indexes = ...)`, y ninguna entidad
> los declara. Todos los índices provienen del script SQL.

---

## Decisiones de modelado

| Decisión | Alternativa descartada | Motivo |
|----------|------------------------|--------|
| La contraseña vive en Cognito | Hash local con BCrypt | Un solo lugar de autenticación, sin dependencia de `gymdb` |
| `user_id` es `BIGSERIAL` | UUID | Compatibilidad con el script SQL y con `user_membership.user_id` |
| `status` es un `VARCHAR` libre | Enum de Java | Permite Suspension sin migración, a costa de no validar valores |
| Rol en tabla `user_role` | Solo `cognito:groups` | La base guarda el rol aunque Cognito no responda |
| Sin `deleted_at` | Baja lógica con fecha | La baja lógica no se implementó (R-22) |

---

## Migración de esquema

**No hay migraciones.** Ni Flyway, ni Liquibase, ni scripts versionados de migración: el esquema
depende de `ddl-auto`.

| Entorno | `ddl-auto` | Consecuencia |
|---------|-----------|---------------|
| Desarrollo (`application.yml`) | `update` | Hibernate altera las tablas al arrancar |
| Producción (`application-prod.properties`) | `validate` | Solo comprueba; no crea nada |

### La divergencia que produce

| Aspecto | Con el script SQL | Con `ddl-auto: update` sobre base vacía |
|---------|-------------------|-----------------------------------------|
| Claves foráneas | 9, todas con `ON DELETE CASCADE` | **Ninguna**: Hibernate no las crea |
| Efecto de borrar un usuario | Destruye pagos y accesos | Deja filas huérfanas |
| `user.password_hash` | NOT NULL | NOT NULL, sin valor posible |
| `user.last_login` | TIMESTAMPTZ | Hibernate lo espera nullable |

Ambas ramas son incorrectas y por motivos distintos. Ver R-12 y R-22.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`06-datos/diccionario-de-datos.md`](../../../06-datos/diccionario-de-datos.md) | Detalle columnar de las 12 tablas |
| [`06-datos/modelo-de-datos.md`](../../../06-datos/modelo-de-datos.md) | Diagrama entidad-relación |
| [`R-12`](../../../15-control-proyecto/riesgos.md) | Base compartida entre los tres servicios |
| [`R-22`](../../../15-control-proyecto/riesgos.md) | Borrado en cascada del historial |
| [`ADR-003`](../../../05-arquitectura/decisiones/registros/ADR-003-autenticacion-cognito.md) | Por qué Cognito y no hash local |
