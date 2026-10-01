# Modelo de datos — GYMETRA-Qr

> Motor: **PostgreSQL 15** · Esquema: `public` · Base: `gymdb` (compartida con los otros dos servicios)
>
> Este servicio es dueño de cinco tablas: `qr_access`, `access_log`, `branch`, `exercises` y
> `recipes`. Las tres primeras las crea `data/Database-Setup/database_ Initial.sql`; las dos
> últimas solo las crea Hibernate con `ddl-auto: update`. **Además, en las tres primeras el
> script y la entidad JPA no esperan las mismas columnas**: la divergencia está documentada al
> final de esta página y es la causa de que el conteo de columnas varíe entre despliegues.

---

## Tabla: `qr_access`

Definida por la entidad `com.GYMETRA.GYMETRA.qr.entity.QrAccess`.

| Columna | Tipo | Restricciones | Notas |
|---------|------|---------------|-------|
| `qr_id` | bigint | PK, IDENTITY | `Long qrId` en la entidad |
| `user_id` | bigint | | Socio dueño del QR. **Sin `@ManyToOne`**: la FK solo existe si la base la creó el script (ver divergencia) |
| `qr_code` | varchar(1024) | | Token del QR; el frontend lo convierte en imagen con `qrcode.vue` |
| `generated_at` | timestamp | | Cuándo se generó |
| `status` | varchar | | `active`, `inactive`, `expired` (String libre, no enum) |

**Reglas:**

- Un QR se considera **expirado** si `generated_at` tiene más de **12 horas**.
- `QrBusinessService.updateQrStatusByMembership()` cambia `status` a `inactive` cuando la
  membresía del socio deja de estar `ACTIVE`.
- La entidad **no declara** `expires_at` ni `active` booleano: la expiración se calcula
  comparando `generated_at`.

### Divergencia con el script SQL

El script crea esta tabla con otras columnas:

| Script `database_ Initial.sql` | Entidad JPA |
|--------------------------------|-------------|
| `id BIGSERIAL PK` | `qr_id BIGSERIAL PK` |
| `qr_code TEXT NOT NULL` | `qr_code varchar(1024)` |
| `expires_at TIMESTAMP` | no existe — la expiración se calcula |
| `status VARCHAR(20) DEFAULT 'active'` | `status` sin default |
| `user_id BIGINT NOT NULL` + FK a `user` `ON DELETE CASCADE` | `user_id` nullable, sin FK |

Con el script aplicado, Hibernate **añade** `qr_id` con `update` y la tabla queda con las dos
claves; el `id` del script queda sin usar por JPA. El `ON DELETE CASCADE` del script es el que
hace que borrar un socio borre sus QR (R-22).

---

## Tabla: `access_log`

Definida por la entidad `AccessLog`. **Es la tabla que más crece.** Ver H-05 y R-05.

| Columna | Tipo | Restricciones | Notas |
|---------|------|---------------|-------|
| `log_id` | bigint | PK, IDENTITY | |
| `user_id` | bigint | | Socio. Sin FK en la entidad |
| `qr_id` | bigint | | QR usado. Sin FK en la entidad |
| `branch_id` | bigint | | Sede. Sin FK en la entidad |
| `event_ts` | timestamp | | Momento del evento |
| `entry_time` | timestamp | | Hora de entrada |
| `exit_time` | timestamp | | Hora de salida (se rellena en el mismo registro) |
| `result` | varchar | | `granted` o `denied` |
| `notes` | varchar | | Observaciones |

**Modelo de turnos:** una entrada abre un registro con `entry_time`; la salida correspondiente
rellena `exit_time` en el mismo registro (no crea uno nuevo). `getDurationInHours()` es un
getter `@Transient` que calcula la permanencia.

> 🔴 **H-08 / R-14: los intentos denegados no se registran.** El flujo de validación devuelve
> `403` **antes** de insertar en `access_log`, así que en la práctica solo se guardan accesos
> `granted`.

### Divergencia con el script SQL

| Script `database_ Initial.sql` | Entidad JPA |
|--------------------------------|-------------|
| `id BIGSERIAL PK` | `log_id BIGSERIAL PK` |
| `access_type VARCHAR(20) NOT NULL` (`ingreso`/`salida`) | no existe |
| `access_time TIMESTAMP DEFAULT NOW()` | no existe |
| `qr_code TEXT` | no existe |
| `user_id BIGINT NOT NULL` + FK `ON DELETE CASCADE` | `user_id` nullable |
| `branch_id BIGINT NOT NULL` + FK `ON DELETE CASCADE` | `branch_id` nullable |
| — | `qr_id`, `event_ts`, `entry_time`, `exit_time`, `result`, `notes` (los añade Hibernate) |

> ⚠️ **Riesgo práctico de esta divergencia:** si la tabla la creó el script, la columna
> `access_type` es `NOT NULL` **sin valor por defecto**, y los `INSERT` de JPA no la incluyen.
> Registrar una entrada o salida fallaría en esa rama de provisioning. Con una base creada
> solo por Hibernate el registro funciona. Ver R-12.

---

## Tabla: `branch`

Definida por la entidad `Branch`.

| Columna | Tipo | Restricciones | Notas |
|---------|------|---------------|-------|
| `branch_id` | bigint | PK, IDENTITY | |
| `name` | varchar | | Nombre de la sede |
| `address` | varchar | | Dirección |
| `city` | varchar | | Ciudad |
| `capacity` | integer | | Aforo máximo. **No se valida en ninguna regla de negocio** (R-11) |

### Divergencia con el script SQL

El script crea `phone VARCHAR(30)` y `status VARCHAR(20) DEFAULT 'active'`, que la entidad no
tiene, y **no crea `capacity`**, que la entidad sí espera. Además siembra dos sedes de ejemplo
(`Sucursal Centro`, `Sucursal Norte`).

---

## Tabla: `exercises`

Definida por la entidad `Exercise`. **No está en el script SQL**: solo existe si `ddl-auto`
es `update`.

| Columna | Tipo | Restricciones | Notas |
|---------|------|---------------|-------|
| `id` | varchar | PK | ID externo de ExerciseDB, ej. `"0001"` — no autogenerado |
| `name` | varchar | NOT NULL | Traducido al español por `TranslationService` |
| `gif_url` | text | | URL de referencia. La entidad es `gifUrl` sin `@Column(name=...)` y el naming strategy de Boot 3 la convierte a `snake_case` |
| `gif_data` | bytea | | Binario del GIF (~1.300 archivos). `@JdbcTypeCode(SqlTypes.BINARY)` evita que PostgreSQL lo trate como `oid` |
| `target` | varchar | | Músculo objetivo (traducido) |
| `equipment` | varchar | | Equipamiento (traducido) |
| `body_part` | varchar | | Parte del cuerpo (`@Column(name="body_part")`) |

> **Notación de columnas:** el JSON de la API expone `gifUrl` (camelCase, nombre del campo Java);
> **la columna en la base es `gif_url`**. Sin `@Column(name=...)` y sin configurar
> `hibernate.naming`, Boot 3 aplica `CamelCaseToUnderscoresNamingStrategy`. La prueba en el
> código: `RecipeRepository` usa SQL nativo con `diet_type`, no `dietType`.

---

## Tabla: `recipes`

Definida por la entidad `Recipe`. **Tampoco está en el script SQL.**

| Columna | Tipo | Restricciones | Notas |
|---------|------|---------------|-------|
| `id` | integer | PK | ID de Spoonacular, ej. 654321 — no autogenerado |
| `title` | varchar(500) | NOT NULL | Título traducido |
| `summary` | text | | Descripción breve |
| `instructions` | text | | Preparación |
| `image_url` | varchar | | Campo Java `imageUrl` → columna `image_url` |
| `image_data` | bytea | | Binario de la imagen (~500 archivos). Ver H-07 |
| `ready_in_minutes` | integer | | Campo Java `readyInMinutes` → columna `ready_in_minutes` |
| `servings` | integer | | Porciones |
| `calories` | double | | |
| `protein` | double | | gramos |
| `fat` | double | | gramos |
| `carbs` | double | | gramos |
| `diet_type` | varchar | | Campo Java `dietType` → columna `diet_type`. Valores en inglés: `ketogenic`, `vegetarian`, `vegan`, `paleo`… |
| `dish_type` | varchar | | `@Column(name="dish_type")`: `breakfast`, `main course`, `side dish`… |

> El generador de planes filtra `diet_type` y `dish_type` **en inglés** con SQL nativo
> (`ILIKE`) y traduce los resultados al final (`TranslationService`).

---

## Índices

| Índice | Definido en | Nota |
|--------|-------------|------|
| PK de las tres tablas del script | Script SQL | `BIGSERIAL` |
| `idx_qr_access_user` → `qr_access(user_id, status)` | Script SQL | Búsqueda del QR del socio |
| `idx_access_log_user_time` → `access_log(user_id, access_time)` | Script SQL | Sobre la columna `access_time` del script, que la entidad no usa |
| Índice en `exercises.muscle_group` | ❌ Ninguno | El campo real es `target`, y está sin índice |
| Índice en `access_log.event_ts` / `entry_time` | ❌ Ninguno | Reportes de entradas por fecha: secuencial (H-05) |
| Índice en `qr_access.qr_code` | ❌ Ninguno | Cada validación de QR hace un escaneo secuencial |

> Ninguna entidad declara índices con `@Table(indexes = ...)`: en una base creada solo por
> Hibernate solo existen los PK.

---

## Relaciones

| Relación | En la entidad JPA | En el script SQL |
|----------|-------------------|------------------|
| `qr_access.user_id` → `user` | Sin `@ManyToOne`, sin FK | FK con `ON DELETE CASCADE` |
| `access_log.user_id` → `user` | Sin `@ManyToOne`, sin FK | FK con `ON DELETE CASCADE` |
| `access_log.branch_id` → `branch` | Sin `@ManyToOne`, sin FK | FK con `ON DELETE CASCADE` |
| `access_log.qr_id` → `qr_access` | Sin `@ManyToOne`, sin FK | Sin FK (el script no tiene esa columna) |

> La integridad referencial **solo existe si la creó el script**. Con `ddl-auto: update` sobre
> una base vacía, ninguna de estas FK existe y el borrado de un socio deja QR e historiales
> huérfanos. Con el script, el borrado destruye el historial. Los dos escenarios son malos y
> están registrados en R-12 y R-22.

---

## Migración de esquema

**No hay migraciones.** Ni Flyway, ni Liquibase.

| Entorno | `ddl-auto` | Consecuencia |
|---------|-----------|---------------|
| Desarrollo (`application.properties`) | `update` | Crea `exercises` y `recipes`; añade a las tablas del script las columnas que faltan |
| Producción (Login: `application-prod.properties`) | `validate` | Solo comprueba; si el script no creó `exercises`/`recipes`, el arranque falla (R-12) |

**Conteo de tablas:** 10 definidas en el script + 2 creadas por Hibernate = 12 en desarrollo.

---

## Decisiones de modelado

| Decisión | Alternativa descartada | Motivo |
|----------|------------------------|--------|
| `access_log` referencia a `user` directamente | Referenciar `user_membership` | Debe registrar accesos aunque el socio no tenga membresía vigente |
| `result` como `VARCHAR` | Enum | Flexible, a costa de no validar valores |
| Expiración calculada desde `generated_at` | Columna `expires_at` | Un solo punto de verdad; el script la mantiene sin uso (divergencia) |
| `exercises` y `recipes` como tablas locales | Solo consumir las APIs externas | Evita agotar la cuota de RapidAPI y Spoonacular (R-27) |
| `gif_data`/`image_data` como `bytea` | Servir las URLs externas | Funciona sin conexión a terceros, a costa de ~1.800 binarios en la base (H-07) |

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`06-datos/modelo-de-datos.md`](../../../06-datos/modelo-de-datos.md) | Las 12 tablas del sistema con sus reglas |
| [`06-datos/diccionario-de-datos.md`](../../../06-datos/diccionario-de-datos.md) | Detalle campo a campo |
| [`R-05`](../../../15-control-proyecto/riesgos.md) | El historial se carga entero en memoria |
| [`R-11`](../../../15-control-proyecto/riesgos.md) | `capacity` no se valida |
| [`R-12`](../../../15-control-proyecto/riesgos.md) | Base compartida entre los tres servicios |
| [`R-14`](../../../15-control-proyecto/riesgos.md) | Los accesos denegados no se registran |
| [`R-22`](../../../15-control-proyecto/riesgos.md) | Borrado en cascada del historial |
| [`R-27`](../../../15-control-proyecto/riesgos.md) | Dependencia de APIs externas con cuota |
