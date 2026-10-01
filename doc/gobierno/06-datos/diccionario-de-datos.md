# Diccionario de datos

> Referencia campo por campo de las 12 tablas: tipo, restricción, valor típico y propósito.

## Cómo leer este documento

Cada campo se documenta con su tipo de Java, su tipo SQL equivalente, si admite `NULL`, su
valor típico y su propósito. Cuando un campo tiene un comportamiento no obvio (valor por
defecto, sincronización, valor derivado), se indica con ⚠️.

**Leyenda de tipos Java → SQL:**

| Java | SQL (PostgreSQL) | Notas |
|------|------------------|-------|
| `Long` | `bigint` | 8 bytes con signo |
| `Integer` | `integer` | 4 bytes con signo |
| `String` | `varchar(n)` o `text` | Sin `n` explícito, Hibernate usa `varchar(255)` |
| `BigDecimal` | `numeric(p, s)` | Precisión y escala declaradas |
| `Double` | `double precision` | 8 bytes, precisión flotante |
| `LocalDate` | `date` | Solo fecha |
| `LocalDateTime` | `timestamp` | Sin zona horaria |
| `OffsetDateTime` | `timestamptz` | Con zona horaria |
| `Boolean` | `boolean` | verdadero/falso |
| `byte[]` | `bytea` | Binario |
| Enum (`STRING`) | `varchar` | Se guarda el nombre del valor |

---

## 1. `"user"` — GYMETR-login

### `user_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| PK | ✅ `PRIMARY KEY`, `IDENTITY` |
| Nulo | ❌ No |
| Único | ✅ (implícito por ser PK) |
| Ejemplo | `1` |
| Propósito | Identificador interno del usuario. Es la clave que usan `qr_access`, `user_role` y el claim `cognito:username` de Cognito |

> ⚠️ **Tipo inconsistente:** aquí es `bigint`, pero `user_membership.user_id` es `integer`.
> Ver hallazgo H-01.

### `first_name` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `"María"` |
| Propósito | Nombre del usuario. Se muestra en la interfaz |

### `last_name` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `"García"` |
| Propósito | Apellido del usuario |

### `email` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Único | ✅ `unique = true` |
| Ejemplo | `"maria.garcia@correo.com"` |
| Propósito | Correo electrónico. Es el identificador de login en Cognito y la vía de notificación |

> La restricción `unique` es la que aplica la regla de negocio R-ID-1 (email único).

### `cognito_sub` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí (nullable en la entidad; **la columna no existe en el script**, la añade Hibernate) |
| Único | ✅ `unique = true` |
| Ejemplo | `"a1b2c3d4-5678-90ef-ghij-klmnopqrstuv"` |
| Propósito | Subject de Cognito. Es lo que permite emparejar el usuario local con el del User Pool |

> ⚠️ **Fuente de la doble identidad:** el token JWT de Cognito trae un `sub` (el subject).
> `CognitoUserSyncService` lo busca en esta columna para localizar al usuario. Si un
> usuario se crea en la BD local sin haber pasado por Cognito, este campo queda `NULL` y
> el emparejamiento falla.

### `password_hash` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | 🟠 En el script es `NOT NULL`; en la entidad es nullable. Como el código nunca la rellena, un INSERT sobre la base del script violaría la restricción |
| Ejemplo | `NULL` — **siempre**. Ningún camino de escritura la rellena |
| Propósito | 🔴 **Vestigial.** La contraseña la custodia Cognito; GYMETRA nunca la recibe |

> 🔴 **Columna muerta.** `password_hash` está declarada en la entidad `User`, pero una búsqueda
> de `setPasswordHash`, `PasswordEncoder` y `BCrypt` en todo el backend no devuelve ninguna
> coincidencia. El valor es siempre `NULL` y el ejemplo de un hash BCrypt (`$2a$10$...`) nunca
> aparece en la base de datos. No hay un solo punto de escritura.
>
> El único riesgo real es de confusión: quien lea el esquema asumirá que las contraseñas se
> validan en local, cuando la única fuente de verdad es Cognito. La corrección es eliminar la
> columna. Ver R-25.

### `phone` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"+57 300 1234567"` |
| Propósito | Teléfono de contacto |

### `status` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Valores válidos | `active`, `suspended` |
| Ejemplo | `"active"` |
| Propósito | Estado de la cuenta |

> ⚠️ **No es un enum.** Es un `String` libre. `updateUserStatus` valida que sea `active` o
> `suspended` a nivel de método, pero la base de datos no impone esa restricción. Un UPDATE
> manual podría dejar estados como `"banido"` o `"activo"`.

### `created_at` — `OffsetDateTime` / `timestamptz`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `2026-09-15 14:30:00-05` |
| Propósito | Marca de creación de la cuenta. Con zona horaria, a diferencia de otras tablas |

> ⚠️ **Inconsistencia de tipos de fecha:** `user` usa `OffsetDateTime` (con zona), mientras
> `user_membership` y `payment` usan `LocalDateTime` (sin zona). Convivir ambos tipos en el
> mismo esquema complicate las consultas que cruzan las dos.

### `last_login` — `OffsetDateTime` / `timestamptz`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí (nunca ha iniciado sesión) |
| Ejemplo | `2026-09-20 08:15:00-05` |
| Propósito | Última vez que el usuario inició sesión |

### `identification` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Único | ✅ `unique = true` |
| Ejemplo | `100200300` |
| Propósito | Documento de identidad del socio |

> Es un campo obligatorio y único. Si se omite al crear un usuario, el INSERT falla.

### `photo_url` — `String` / `text`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"https://cdn.ejemplo.com/foto.jpg"` |
| Propósito | URL de la foto de perfil. Usa `text` porque una URL larga no cabe cómodo en `varchar(255)` |

---

## 2. `role` — GYMETR-login

### `role_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| PK | ✅ `PRIMARY KEY`, `IDENTITY` |
| Ejemplo | `1` |
| Propósito | Identificador del rol |

### `role_name` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Único | ✅ `unique = true` |
| Ejemplo | `"Admin"` |
| Propósito | Nombre del rol. Es el valor que se compara con el claim `cognito:groups` |

### `description` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"Administrador del sistema"` |
| Propósito | Descripción legible del rol |

### `priority` — `Integer` / `integer`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `1` |
| Propósito | Orden de precedencia entre roles |

> ⚠️ No se ha encontrado código que use `priority` para ordenar las autorizaciones. Es un
> campo preparado pero sin usar.

---

## 3. `user_role` — GYMETR-login

### `user_role_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| PK | ✅ `PRIMARY KEY`, `IDENTITY` |
| Propósito | Clave de la tabla puente |

### `user_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| FK | ✅ → `user.user_id` |
| Propósito | Usuario que tiene el rol |

### `role_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| FK | ✅ → `role.role_id` |
| Propósito | Rol asignado |

> **Restricción compuesta:** la entidad declara `uniqueConstraints` sobre `(user_id,
> role_id)`, así que un usuario no puede tener el mismo rol duplicado.

---

## 4. `password_reset_token` — GYMETR-login

### `id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| PK | ✅ `PRIMARY KEY`, `IDENTITY` |
| Propósito | Identificador del token |

### `token` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Único | 🟠 En el script (`UNIQUE`); la entidad no lo declara |
| Ejemplo | `"a3f9c2e1b8d7..."` |
| Propósito | El token único que viaja en el enlace de recuperación |

### `user_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| FK | ✅ → `user.user_id` |
| Propósito | Usuario que solicitó la recuperación |

### `expiry_date` — `LocalDateTime` / `timestamp`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `NOT NULL` en el script; nullable en la entidad |
| Ejemplo | `2026-09-15 15:00:00` |
| Propósito | Momento en que el token deja de ser válido. El código lo fija a 15 minutos en el futuro |

> ⚠️ Si la base la creó Hibernate y se inserta sin `expiry_date`, la validación de expiración
> queda sin referencia (el script lo impediría con `NOT NULL`).

---

## 5. `membership` — GYMETR-Membership

> ⚠️ **Divergencia con el script:** `database_ Initial.sql` crea `membership_id` como
> `BIGSERIAL` (bigint) y añade una columna `features TEXT` que la entidad no usa; `training`
> y `nutrition` no están en el script y las añade `ddl-auto: update`.

### `membership_id` — `Integer` / `integer`

| Aspecto | Valor |
|---------|-------|
| PK | ✅ `PRIMARY KEY`, `IDENTITY` |
| Ejemplo | `1` |
| Propósito | Identificador del plan |

### `plan_name` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `"Mensual"` |
| Propósito | Nombre del plan |

### `duration_days` — `Integer` / `integer`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `30` (mensual), `90` (trimestral), `365` (anual) |
| Propósito | Duración de la membresía en días. Se usa para calcular `end_date` |

### `price` — `BigDecimal` / `numeric`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `50000.00` |
| Propósito | Precio del plan. Se transfiere a `payment.amount` al contratar |

### `status` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Valores | `available`, `unavailable` |
| Ejemplo | `"available"` |
| Propósito | Si el plan se puede contratar. Solo los `available` se ofrecen (R-MB-1) |

### `description` — `String` / `text`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Propósito | Descripción del plan para mostrar en la interfaz |

### `training` — `Boolean` / `boolean`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí, pero con `default = false` en el código |
| Ejemplo | `true` |
| Propósito | Si el plan incluye acceso a rutinas de entrenamiento |

### `nutrition` — `Boolean` / `boolean`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí, con `default = false` en el código |
| Ejemplo | `true` |
| Propósito | Si el plan incluye acceso a planes de nutrición |

---

## 6. `user_membership` — GYMETR-Membership

> ⚠️ **Divergencia con el script:** la PK es `BIGSERIAL` (bigint) en el script, `integer`
> aquí, y el script deja `start_date`/`end_date` sin `NOT NULL` (la entidad sí lo exige).

### `id` — `Integer` / `integer`

| Aspecto | Valor |
|---------|-------|
| PK | ✅ `PRIMARY KEY`, `IDENTITY` |
| Propósito | Identificador de la suscripción |

### `user_id` — `Integer` / `integer`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| FK | 🟠 En el script sí (`ON DELETE CASCADE`); sin `@ManyToOne` en la entidad |
| Ejemplo | `1` |
| Propósito | Socio suscrito |

> 🔴 **Hallazgo H-01:** no hay `@ManyToOne` a `User`, así que JPA no valida la referencia. La
> FK existe **solo si la base la creó el script**; con `ddl-auto: update` no la hay (R-12,
> R-22). Y el tipo (`integer`) no coincide con `user.user_id` (`bigint`).

### `membership_id` — `Integer` / `integer`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| FK | ✅ → `membership.membership_id` |
| Propósito | Plan contratado. Se declara como `@ManyToOne` con `optional = false` |

### `start_date` — `LocalDate` / `date`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `2026-09-20` |
| Propósito | Inicio de la vigencia |

### `end_date` — `LocalDate` / `date`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `2026-10-20` |
| Propósito | Fin de la vigencia. Se calcula como `start_date + duration_days` del plan |

### `status` — `UserMembershipStatus` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Almacenamiento | `EnumType.STRING` (el nombre, no un número) |
| Valores | `PENDING`, `ACTIVE`, `SUSPENDED`, `CANCELED`, `EXPIRED`, `DELETED` |
| Ejemplo | `"ACTIVE"` |
| Propósito | Estado de la suscripción. Determina si el socio tiene acceso |

### `created_at` — `LocalDateTime` / `timestamp`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `2026-09-20 10:00:00` |
| Propósito | Auditoría de creación |

---

## 7. `payment` — GYMETR-Membership

### `id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| PK | ✅ `PRIMARY KEY`, `IDENTITY` |
| Propósito | Identificador del pago |

### `user_membership_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| FK | ✅ → `user_membership.id` |
| Propósito | Suscripción a la que corresponde el pago. Se declara como `@ManyToOne` con `@JsonIgnore` |

### `payment_date` — `LocalDateTime` / `timestamp`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `2026-09-20 10:05:00` |
| Propósito | Fecha canónica del pago. `@PrePersist` la rellena con `now()` si falta |

### `amount` — `BigDecimal` / `numeric(10,2)`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Validación | `@Positive` ("El monto debe ser positivo") |
| Ejemplo | `50000.00` |
| Propósito | Importe canónico del pago |

### `monto` — `BigDecimal` / `numeric(10,2)`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `50000.00` |
| Propósito | ⚠️ **Duplicado legacy de `amount`.** `@PrePersist` copia `amount` → `monto` |

### `payment_method` — `PaymentMethod` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Valores | `CASH`, `CARD`, `GATEWAY` |
| Ejemplo | `"CARD"` |
| Propósito | Tipo de pago (canónico) |

### `metodo_pago` — `String` / `varchar(20)`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `"CARD"` |
| Propósito | ⚠️ **Duplicado legacy de `payment_method`.** Se llena con `paymentMethod.name()` en `@PrePersist` |

### `transaction_reference` — `String` / `varchar(255)`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"pi_3AbC...xyz"` |
| Propósito | ID del PaymentIntent en Stripe. Permite reconciliar con el panel de Stripe |

### `payment_status` — `PaymentStatus` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Valores | `PENDING`, `CONFIRMED`, `FAILED` |
| Ejemplo | `"CONFIRMED"` |
| Propósito | Estado del pago. Solo `CONFIRMED` activa la membresía |

> ⚠️ Ojo: el valor es `CONFIRMED`, **no** `COMPLETED`. Es un error fácil de cometer al
> integrar con la API de Stripe, donde el estado sí se llama `succeeded`.

### `fecha_pago` — `LocalDateTime` / `timestamp`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Propósito | ⚠️ **Duplicado legacy de `payment_date`.** `@PrePersist` copia `payment_date` → `fecha_pago` |

### `created_at` — `LocalDateTime` / `timestamp`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Actualizable | No (`updatable = false`) |
| Propósito | Auditoría. `@PrePersist` lo fija a `now()` si falta |

### `updated_at` — `LocalDateTime` / `timestamp`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Propósito | Auditoría. `@PreUpdate` lo actualiza a `now()` |

---

## 8. `qr_access` — GYMETRA-Qr

> ⚠️ **Divergencia con el script:** el script crea `id BIGSERIAL` (no `qr_id`),
> `qr_code TEXT NOT NULL` y una columna `expires_at` que la entidad no usa; `user_id` es
> `NOT NULL` con FK `ON DELETE CASCADE` en el script. El detalle está en
> [`../09-microservicios/servicios/03-gymetra-qr/modelo-de-datos.md`](../09-microservicios/servicios/03-gymetra-qr/modelo-de-datos.md).

### `qr_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| PK | ✅ `PRIMARY KEY`, `IDENTITY` |
| Propósito | Identificador del registro de QR |

### `user_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| FK | 🔴 No declarada |
| Propósito | Socio propietario del QR |

### `qr_code` — `String` / `varchar(1024)`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` |
| Propósito | El contenido del QR (un token, no una imagen). El frontend lo convierte en imagen con `qrcode.vue` |

### `generated_at` — `LocalDateTime` / `timestamp`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `2026-09-20 08:00:00` |
| Propósito | Cuándo se generó. La regla de los 12 horas compara contra este campo |

### `status` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Valores | `active`, `inactive`, `expired` |
| Ejemplo | `"active"` |
| Propósito | Estado del QR. Se actualiza según la membresía del socio |

---

## 9. `access_log` — GYMETRA-Qr

> ⚠️ **Divergencia con el script:** el script solo crea `id`, `user_id`, `branch_id`,
> `access_type`, `access_time` y `qr_code` (PK `id`, `NOT NULL` + FK en `user_id` y
> `branch_id`); las columnas `qr_id`, `event_ts`, `entry_time`, `exit_time`, `result` y
> `notes` de este diccionario las añade Hibernate. Detalle en
> [`../09-microservicios/servicios/03-gymetra-qr/modelo-de-datos.md`](../09-microservicios/servicios/03-gymetra-qr/modelo-de-datos.md).

### `log_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| PK | ✅ `PRIMARY KEY`, `IDENTITY` |
| Propósito | Identificador del registro |

### `user_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| FK | 🔴 No declarada |
| Propósito | Socio que accedió |

### `qr_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| FK | 🔴 No declarada |
| Propósito | QR utilizado en el acceso |

### `branch_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| FK | 🔴 No declarada |
| Propósito | Sede donde ocurrió el acceso |

### `event_ts` — `LocalDateTime` / `timestamp`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Propósito | Momento del evento de acceso |

### `entry_time` — `LocalDateTime` / `timestamp`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí (se llena si el evento es entrada) |
| Propósito | Hora de entrada al gimnasio |

### `exit_time` — `LocalDateTime` / `timestamp`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí (se llena si el evento es salida) |
| Propósito | Hora de salida. Permite calcular la permanencia |

### `result` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Valores | `granted`, `denied` |
| Ejemplo | `"granted"` |
| Propósito | Resultado del acceso |

> 🔴 En la práctica solo se registran accesos `granted`. Los `denied` no llegan a
> insertarse. Ver hallazgo H-08 / riesgo R-14.

### `notes` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"Ingreso con turno mañana"` |
| Propósito | Observaciones libres sobre el acceso |

---

## 10. `branch` — GYMETRA-Qr

### `branch_id` — `Long` / `bigint`

| Aspecto | Valor |
|---------|-------|
| PK | ✅ `PRIMARY KEY`, `IDENTITY` |
| Propósito | Identificador de la sede |

### `name` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"GYMETRA Centro"` |
| Propósito | Nombre de la sede |

### `address` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"Calle 100 #20-30"` |
| Propósito | Dirección de la sede |

### `city` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"Bogotá"` |
| Propósito | Ciudad de la sede |

### `capacity` — `Integer` / `integer`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `150` |
| Propósito | Aforo máximo de la sede |

> ⚠️ No hay ninguna regla que valide `capacity` contra los accesos concurrentes. El campo
> se muestra en la interfaz pero no restringe nada. Ver R-11.

---

## 11. `exercises` — GYMETRA-Qr

### `id` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| PK | ✅ `PRIMARY KEY` (sin `IDENTITY`: viene de la API) |
| Ejemplo | `"0001"` |
| Propósito | ID del ejercicio en ExerciseDB |

### `name` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `"Sentadilla"` |
| Propósito | Nombre del ejercicio, traducido al español |

### `gifUrl` — `String` / `text`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"https://cdn.exercisedb.io/0001.gif"` |
| Propósito | URL de la animación del ejercicio |

> Nota: la columna en la base es `gif_url` (snake_case): el campo no declara
> `@Column(name=...)` y Spring Boot 3 aplica `CamelCaseToUnderscoresNamingStrategy`.
> El nombre camelCase `gifUrl` es el del campo Java y el de la propiedad JSON.
> Ver hallazgo H-04.

### `gif_data` — `byte[]` / `bytea`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `[47, 71, 73, 70, 56, 57, 97, ...]` (bytes de un GIF) |
| Propósito | El archivo GIF binario de la animación |

> `@JdbcTypeCode(SqlTypes.BINARY)` fuerza el tipo `bytea` de PostgreSQL (en lugar de
> `oid`). Almacena ~1.300 binarios en la base. Ver hallazgo H-07.

### `target` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"piernas"` |
| Propósito | Grupo muscular objetivo del ejercicio |

### `equipment` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"barra"` |
| Propósito | Equipamiento necesario |

### `body_part` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `"pierna"` |
| Propósito | Parte del cuerpo que trabaja |

> `target`, `equipment` y `body_part` se traducen al español durante la sincronización. Si
> la traducción falla, conservan el término en inglés.

---

## 12. `recipes` — GYMETRA-Qr

### `id` — `Integer` / `integer`

| Aspecto | Valor |
|---------|-------|
| PK | ✅ `PRIMARY KEY` (sin `IDENTITY`: viene de Spoonacular) |
| Ejemplo | `654321` |
| Propósito | ID de la receta en Spoonacular |

### `title` — `String` / `varchar(500)`

| Aspecto | Valor |
|---------|-------|
| Nulo | ❌ `nullable = false` |
| Ejemplo | `"Ensalada de pollo"` |
| Propósito | Nombre de la receta, traducido |

### `summary` — `String` / `text`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Propósito | Descripción breve de la receta |

### `instructions` — `String` / `text`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Propósito | Pasos de preparación |

### `imageUrl` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Propósito | URL de la imagen. Columna en la base: `image_url` (campo Java `imageUrl`) |

### `image_data` — `byte[]` / `bytea`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Propósito | El binario de la imagen. Almacena ~500 binarios. Ver H-07 |

### `readyInMinutes` — `Integer` / `integer`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `25` |
| Propósito | Tiempo de preparación. Columna en la base: `ready_in_minutes` (campo Java `readyInMinutes`) |

### `servings` — `Integer` / `integer`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `4` |
| Propósito | Número de porciones |

### `calories` / `protein` / `fat` / `carbs` — `Double` / `double`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Ejemplo | `450.0` (cal), `35.0` (protein), `12.0` (fat), `40.0` (carbs) |
| Propósito | Macronutrientes por receta. Los usa el generador de planes |

### `dietType` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Valores | `ketogenic`, `vegetarian`, `vegan`, `paleo`… |
| Ejemplo | `"vegetarian"` |
| Propósito | Clasificación dietética. Se filtra por este campo. Columna en la base: `diet_type` (campo Java `dietType`) |

### `dish_type` — `String` / `varchar`

| Aspecto | Valor |
|---------|-------|
| Nulo | ⚠️ Sí |
| Valores | `breakfast`, `main course`, `side dish`… |
| Ejemplo | `"main course"` |
| Propósito | Tipo de plato. Se usa para armar un plan (desayuno, almuerzo, cena). Guardado en inglés, traducido al generar el plan |

---

## Resumen de campos problemáticos

| Tabla | Campo | Problema |
|-------|-------|----------|
| `user_membership` | `user_id` | Sin `@ManyToOne` (la FK existe solo en el script); tipo `integer` vs `bigint` en `user` |
| `payment` | `monto`, `metodo_pago`, `fecha_pago` | Columnas duplicadas que solo se sincronizan en `@PrePersist` |
| `user` | `status` | `String` libre, no enum; la base no valida los valores |
| `qr_access` | `status` | `String` libre, no enum |
| `exercises` | `gifUrl` | Campo Java/JSON camelCase; columna `gif_url` (snake_case por naming strategy) |
| `recipes` | `imageUrl`, `readyInMinutes`, `dietType` | Idem; columnas `image_url`, `ready_in_minutes`, `diet_type` |
| `password_reset_token` | `expiry_date` | `NOT NULL` en el script, nullable en la entidad; sin índice ni purga |
| `access_log` | — | Sin índices en la entidad (el script solo crea `idx_access_log_user_time`, y solo si la creó él); es la tabla que más crece |
| `role` | `priority` | Campo sin uso en el código |
| `branch` | `capacity` | Aforo sin regla que lo aplique |

---

## Documentos relacionados

- [`modelo-de-datos.md`](./modelo-de-datos.md) — detalle por tabla
- [`README.md`](./README.md) — hallazgos del modelo (H-01 a H-09)
- [`../02-dominio/entidades-y-reglas.md`](../02-dominio/entidades-y-reglas.md) — reglas de negocio
- [`../07-api/README.md`](../07-api/README.md) — contratos de API
