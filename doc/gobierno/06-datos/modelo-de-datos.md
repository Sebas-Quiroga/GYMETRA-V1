# Modelo de datos

> Detalle de las 12 tablas de `gymdb`: estructura, claves, relaciones y comportamiento.
> **Los tipos de esta página son los de las entidades JPA.** El script SQL
> `database_ Initial.sql` usa `BIGSERIAL` (bigint) en varias claves y difiere en alguna
> columna; esas divergencias se señalan en cada sección y en el resumen final.

## Convenciones

| Aspecto | Convención en GYMETRA |
|---------|----------------------|
| Nombres de tabla | snake_case; en singular para las tablas del script (`membership`), en plural para las que crea Hibernate (`exercises`, `recipes`) |
| PRIMARY KEY | `id` o `<entidad>_id` (inconsistente entre servicios) |
| Claves foráneas | **El script SQL declara 9, todas con `ON DELETE CASCADE` (incluidas las cruzadas entre servicios); las entidades JPA solo mapean 5 de las 9: `user_role.user_id`, `user_role.role_id`, `password_reset_token.user_id`, `user_membership.membership_id` y `payment.user_membership_id`.** Ver el resumen al final |
| Timestamps | `created_at`, `updated_at` (no siempre presentes) |
| Nulos | Many (`nullable = false` solo en campos críticos) |
| Valores por defecto | ⚠️ Ninguno declarado en las entidades |

> ⚠️ **Sobre la última fila:** ninguna entidad declara `columnDefinition` con `DEFAULT`, salvo
> los `TEXT` explícitos para campos largos. Los valores iniciales los pone el código Java
> en el constructor o en `@PrePersist`, no la base. Si un INSERT se hace por SQL manual o
> por una herramienta externa, las columnas sin valor por defecto quedan en `NULL` o con
> el valor implícito del tipo.

---

## 1. `"user"` — GYMETR-login

Tabla principal de identidad. El nombre va entre comillas dobles porque `user` es palabra
reservada en SQL.

```java
@Entity
@Table(name = "\"user\"")
public class User {
    @Id @GeneratedValue(strategy = IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "cognito_sub", unique = true)
    private String cognitoSub;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column
    private String phone;

    @Column
    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "last_login")
    private OffsetDateTime lastLogin;

    @Column(unique = true, nullable = false)
    private Long identification;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;
}
```

**Claves y restricciones:**

| Restricción | Campo(s) |
|-------------|----------|
| PRIMARY KEY | `user_id` (IDENTITY, bigserial) |
| UNIQUE | `email` |
| UNIQUE | `cognito_sub` |
| UNIQUE | `identification` |
| NOT NULL | `first_name`, `last_name`, `email`, `identification` |

**Notas:**

- `identification` es el documento de identidad del socio, numérico. Es `NOT NULL` y único.
  Un usuario creado sin identificación falla el INSERT; el código debe generarlo o
  rechazarlo antes.
- `status` es un `String` libre, no un enum. Los valores esperados son `active` y `suspended`
  (los valida `updateUserStatus`), pero nada impide otros valores a nivel de base.
- `password_hash` está declarada pero 🔴 **nunca se escribe**. No hay `setPasswordHash` ni BCrypt
  en el backend; el valor es siempre `NULL`. La contraseña la custodia Cognito. Ver R-25.

> ⚠️ **Divergencia con el script:** `database_ Initial.sql` no tiene la columna
> `cognito_sub` (la añade `ddl-auto: update`) y declara `password_hash VARCHAR(255) NOT NULL`.
> Sobre una base creada por el script, un INSERT de JPA que omita `password_hash` — que es
> lo que hace siempre el código — violaría esa restricción; sobre una base creada por
> Hibernate la columna es nullable y el `NULL` persiste sin quejarse.

**Entidad espejo en QR:** `UserMin` mapea esta misma tabla con solo tres campos
(`user_id`, `cognito_sub`, `email`). Ver hallazgo H-03 en el README de esta sección.

---

## 2. `role` — GYMETR-login

Catálogo de roles. Poblado automáticamente por `DataInitializer` al arrancar.

| Campo | Tipo | Restricción | Valores |
|-------|------|-------------|---------|
| `role_id` | bigint | PK, IDENTITY | `BIGSERIAL` en el script; `Long` en la entidad |
| `role_name` | varchar | NOT NULL, UNIQUE | `Admin`, `Client` |
| `description` | varchar | nullable | Texto libre |
| `priority` | integer | nullable | Orden de autorización |

`DataInitializer` siembra dos roles si no existen: `Admin` ("Administrador del sistema") y
`Client` ("Cliente del gimnasio").

---

## 3. `user_role` — GYMETR-login

Tabla puente entre `user` y `role`. Permite que un usuario tenga varios roles.

| Campo | Tipo | Restricción | Referencia |
|-------|------|-------------|------------|
| `user_role_id` | bigint | PK, IDENTITY | `BIGSERIAL` en el script; `Long` en la entidad |
| `user_id` | bigint | NOT NULL, FK | `user.user_id`, `ON DELETE CASCADE` (script) |
| `role_id` | bigint | NOT NULL, FK | `role.role_id`, `ON DELETE CASCADE` (script) |

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "role_id", nullable = false)
private Role role;
```

**Restricción compuesta:** la entidad declara `uniqueConstraints` sobre la combinación
`user_id` + `role_id`, de modo que un usuario no puede tener el mismo rol dos veces.

**Fetch LAZY:** ambas relaciones son perezosas. Si un controlador serializa un `User` con
sus roles sin abrir la sesión, Hibernate lanza `LazyInitializationException`. Esto obliga a
los servicios a cargar las relaciones explícitamente antes de devolverlas.

---

## 4. `password_reset_token` — GYMETR-login

Tokens de recuperación de contraseña. **Datos sensibles:** son equivalentes a una contraseña
temporal.

> 🔴 **Tabla y entidad muertas.** `PasswordResetToken` y `PasswordResetTokenRepository` existen,
> pero **ningún servicio ni controlador los usa**: no hay endpoint que genere un token, que lo
> envíe por correo ni que lo canjee. El flujo de recuperación de contraseña **no está
> implementado**. La tabla queda siempre vacía.

| Campo | Tipo | Restricción |
|-------|------|-------------|
| `id` | bigint | PK, IDENTITY |
| `token` | varchar | NOT NULL; **UNIQUE en el script**, no declarado en la entidad |
| `user_id` | bigint | NOT NULL, FK a `user` |
| `expiry_date` | timestamp | **NOT NULL en el script**, nullable en la entidad (`@Column(name="expiry_date")` sin `nullable=false`) |

**Comportamiento previsto (no implementado):**

- Al solicitar un reset, se generaría un token y se fijaría `expiry_date` a 15 minutos en el
  futuro.
- El correo llevaría el enlace con el token.
- Al canjearlo se validaría que no hubiera expirado y se eliminaría el token.

> 🔴 Nada de esto ocurre. No existe endpoint de solicitud, de canje ni de envío de correo, así
> que la contraseña de un socio solo puede cambiarse desde la consola de Cognito. Además, aunque
> se implementara, un reset local no serviría de nada: Cognito es quien valida la contraseña.
> El reseteo debe hacerse con la API de Cognito (`AdminSetUserPassword`). Ver R-26.

> ⚠️ **`expiry_date` diverge entre el script y la entidad:** el script la declara `NOT NULL`,
> la entidad la marca nullable. Con la base creada por el script, un token sin fecha no se
> puede insertar desde JPA sin valor; con una base creada por Hibernate, la validación de
> expiración no tiene contra qué comparar si el código no la fija.

> ⚠️ La entidad no declara índice sobre `token` (el script sí, con `UNIQUE`) ni hay tarea
> que purgue los tokens caducados. Ver hallazgo H-06.

---

## 5. `membership` — GYMETR-Membership

Catálogo de planes disponibles para contratar.

| Campo | Tipo | Restricción | Notas |
|-------|------|-------------|-------|
| `membership_id` | integer | PK, IDENTITY | — |
| `plan_name` | varchar | NOT NULL | El script siembra `Plan Básico`, `Plan Premium`, `Plan Anual`; `DataInitializer` crea `Membresía mensual básica`, `Membresía trimestral premium`, `Membresía anual completa` |
| `duration_days` | integer | NOT NULL | Duración de la membresía en días |
| `price` | numeric | NOT NULL | Importe del plan |
| `status` | varchar | NOT NULL | `available` / `unavailable` (fuente de verdad del código); ⚠️ el script siembra `active` |
| `description` | text | nullable | Descripción del plan |
| `training` | boolean | default false | Permiso de entrenamiento |
| `nutrition` | boolean | default false | Permiso de nutrición |

**Relación:** un `Membership` (plan) tiene muchas `UserMembership` (suscriptores).

> ⚠️ **Divergencia con el script:** `database_ Initial.sql` crea `membership_id` como
> `BIGSERIAL` (bigint) y añade una columna `features TEXT` que la entidad **no** usa; a la
> inversa, `training` y `nutrition` no existen en el script y las añade `ddl-auto: update`.
> Con la base creada por Hibernate, `membership_id` queda como `integer`.

**Restricción de negocio:** solo los planes con `status = 'available'` pueden contratarse
(regla R-MB-1). El endpoint `GET /api/memberships/available` filtra por este estado.

> ⚠️ **Divergencia de valores:** el script siembra los tres planes con `status = 'active'`,
> no `available`. `MembershipService` acepta `ACTIVE` **o** `available` (comparación sin
> distinguir mayúsculas), así que los planes del script sí aparecen en el catálogo; la fuente
> de verdad para el código sigue siendo `available` / `unavailable` (comentario del campo
> `Membership.status`). `DataInitializer`, en cambio, siembra `available`.

---

## 6. `user_membership` — GYMETR-Membership

La suscripción de un socio a un plan. Es el corazón del negocio de membresías.

| Campo | Tipo | Restricción | Notas |
|-------|------|-------------|-------|
| `id` | integer | PK, IDENTITY | — |
| `user_id` | integer | NOT NULL, FK **en el script**, sin `@ManyToOne` en la entidad | Ver hallazgo H-01 |
| `membership_id` | integer | NOT NULL, FK | `@ManyToOne` a `Membership` |
| `start_date` | date | NOT NULL | Inicio de la vigencia |
| `end_date` | date | NOT NULL | Fin de la vigencia |
| `status` | varchar | NOT NULL | Enum `UserMembershipStatus` |
| `created_at` | timestamp | NOT NULL | Auditoría de creación |

**El enum `UserMembershipStatus`** (seis valores, guardados como `STRING`):

| Valor | Significado |
|-------|-------------|
| `PENDING` | Creada, aún no activada |
| `ACTIVE` | Vigente: el socio tiene acceso |
| `SUSPENDED` | Suspendida (impago o por decisión del admin) |
| `CANCELED` | Terminada por el socio o el admin (terminal) |
| `EXPIRED` | Superó la `end_date` (terminal) |
| `DELETED` | Borrado lógico de la suscripción (terminal) |

**Notas:**

- `user_id` es `Integer` mientras `user.user_id` es `Long`. El script le da
  `ON DELETE CASCADE` hacia `user`, pero la entidad no tiene `@ManyToOne`: JPA no valida la
  referencia y nada impide insertar un `user_id` inexistente desde el código.
- `status` se almacena como texto (`EnumType.STRING`), no como entero. Es legible en
  consultas SQL, a costa de usar más espacio que un `smallint`.
- La entidad lleva `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` para
  evitar errores de serialización con la relación perezosa a `Membership`.

---

## 7. `payment` — GYMETR-Membership

Registro de los pagos de cada membresía. Incluye columnas duplicadas por compatibilidad con
una base previa (hallazgo H-02).

| Campo | Tipo | Restricción | Notas |
|-------|------|-------------|-------|
| `id` | bigint | PK, IDENTITY | — |
| `user_membership_id` | bigint | NOT NULL, FK | `@ManyToOne` a `UserMembership` |
| `payment_date` | timestamp | NOT NULL | Fecha canónica del pago |
| `amount` | numeric(10,2) | NOT NULL, `@Positive` | Importe canónico |
| `monto` | numeric(10,2) | NOT NULL | Importe legacy (duplicado) |
| `payment_method` | varchar | NOT NULL | Enum `PaymentMethod` |
| `metodo_pago` | varchar(20) | NOT NULL | Método legacy (duplicado) |
| `transaction_reference` | varchar(255) | nullable | ID del PaymentIntent en Stripe |
| `payment_status` | varchar | NOT NULL | Enum `PaymentStatus` |
| `fecha_pago` | timestamp | NOT NULL | Fecha legacy (duplicado) |
| `created_at` | timestamp | NOT NULL, `updatable = false` | Auditoría |
| `updated_at` | timestamp | NOT NULL | Auditoría |

**Los enums:**

| Enum | Valores | Guarda |
|------|---------|--------|
| `PaymentMethod` | `CASH`, `CARD`, `GATEWAY` | Tipo de pago |
| `PaymentStatus` | `PENDING`, `CONFIRMED`, `FAILED` | Estado del pago |

**Los getters "virtuales":** la entidad expone `getUserId()` y `getMembershipId()` como
`@Transient` con `@JsonProperty`, para que el JSON incluya esos identificadores sin
obligar a cargar la relación `UserMembership` completa. Es una solución pragmática al
problema de la serialización de entidades perezosas.

**`@PrePersist` y `@PreUpdate`:** hooks que rellenan `created_at`, `updated_at` y
`payment_date` si faltan, y sincronizan las columnas legacy. Ver H-02 para la limitación:
`@PreUpdate` solo actualiza `updated_at`, no re-sincroniza los duplicados.

---

## 8. `qr_access` — GYMETRA-Qr

Códigos QR de acceso, uno por socio. El QR **no es una imagen**: es un token
alfanumérico que el frontend convierte en imagen con `qrcode.vue`.

| Campo | Tipo | Restricción | Notas |
|-------|------|-------------|-------|
| `qr_id` | bigint | PK, IDENTITY | — |
| `user_id` | bigint | nullable en la entidad, **NOT NULL + FK `ON DELETE CASCADE` en el script** | Socio dueño del QR |
| `qr_code` | varchar(1024) | nullable | Token del QR |
| `generated_at` | timestamp | nullable | Cuándo se generó |
| `status` | varchar | nullable | `active`, `inactive`, `expired` |

> ⚠️ **Divergencia con el script:** el script llama `id` a la PK (BIGSERIAL) en vez de
> `qr_id`, declara `qr_code TEXT NOT NULL` y añade `expires_at` que la entidad no usa. Si la
> base la creó Hibernate, no hay FK hacia `user` ni `NOT NULL` en `user_id`.

**Reglas:**

- Un QR se considera **expirado** si `generated_at` tiene más de **12 horas**.
- `QrBusinessService.updateQrStatusByMembership()` actualiza el `status` del QR según el
  estado de la membresía del socio: si la membresía deja de estar `ACTIVE`, el QR pasa a
  `inactive`.
- `status` es `String` libre, no enum, igual que `user.status`.

---

## 9. `access_log` — GYMETRA-Qr

Registro de entradas y salidas. **Es la tabla que más crece** y la que más impacta en
rendimiento. Ver hallazgo H-05 (la entidad no declara índices; el script sí crea
`idx_access_log_user_time`).

| Campo | Tipo | Restricción | Notas |
|-------|------|-------------|-------|
| `log_id` | bigint | PK, IDENTITY | — |
| `user_id` | bigint | nullable en la entidad, **NOT NULL + FK `ON DELETE CASCADE` en el script** | Socio |
| `qr_id` | bigint | nullable, sin FK; **la columna no existe en el script** | QR usado |
| `branch_id` | bigint | nullable en la entidad, **NOT NULL + FK `ON DELETE CASCADE` en el script** | Sede |
| `event_ts` | timestamp | nullable | Momento del evento |
| `entry_time` | timestamp | nullable | Hora de entrada |
| `exit_time` | timestamp | nullable | Hora de salida |
| `result` | varchar | nullable | `granted` o `denied` |
| `notes` | varchar | nullable | Observaciones |

> ⚠️ **Divergencia con el script:** `database_ Initial.sql` define `access_log` con las
> columnas `id`, `user_id`, `branch_id`, `access_type`, `access_time` y `qr_code` — no tiene
> `qr_id`, `event_ts`, `entry_time`, `exit_time`, `result` ni `notes`. Con
> `ddl-auto: update`, Hibernate añade las columnas que faltan y las del script
> (`access_type`, `access_time`, `qr_code`) quedan sin usar por el código.

**Modelo de turnos:** una entrada abre un registro con `entry_time`; la salida correspondiente
rellena `exit_time` en el mismo registro (no crea uno nuevo). Esto permite calcular
permanencia en el gimnasio.

> 🔴 **H-08: los intentos denegados no se registran.** Aunque la columna `result` acepta
> `denied`, el flujo de validación devuelve `403` **antes** de insertar en `access_log`. Es
> decir: la columna existe, pero en la práctica solo se guardan accesos concedidos. No hay
> forma de detectar el abuso de un QR robado ni de auditar por qué un socio no pudo entrar.
> Este es el hallazgo R-14.

---

## 10. `branch` — GYMETRA-Qr

Sedes del gimnasio.

| Campo | Tipo | Restricción | Notas |
|-------|------|-------------|-------|
| `branch_id` | bigint | PK, IDENTITY | — |
| `name` | varchar | nullable | Nombre de la sede |
| `address` | varchar | nullable | Dirección |
| `city` | varchar | nullable | Ciudad |
| `capacity` | integer | nullable | Aforo máximo |

> ⚠️ `capacity` no se usa en ninguna regla de negocio. No se valida el aforo contra el
> número de accesos concurrentes. Ver R-11.

---

## 11. `exercises` — GYMETRA-Qr

Catálogo de ejercicios, sincronizado de ExerciseDB (vía RapidAPI). La tabla se puebla
automáticamente al arrancar si tiene menos de 1.300 filas.

| Campo | Tipo | Restricción | Notas |
|-------|------|-------------|-------|
| `id` | varchar | PK | ID externo de ExerciseDB, ej. `"0001"` |
| `name` | varchar | NOT NULL | Nombre, traducido al español |
| `gif_url` | text | nullable | URL de la animación. Campo Java `gifUrl` → columna `gif_url` (naming strategy de Boot 3) |
| `gif_data` | bytea | nullable | Binario de la animación |
| `target` | varchar | nullable | Músculo objetivo |
| `equipment` | varchar | nullable | Equipamiento necesario |
| `body_part` | varchar | nullable | Parte del cuerpo, columna `body_part` |

**Particularidades:**

- La PK es `String` (el ID de la API), no autogenerada. `id` viene de ExerciseDB.
- `gif_data` es `bytea` (binario). Para que PostgreSQL lo trate como `bytea` y no como
  `oid`, el campo lleva `@JdbcTypeCode(SqlTypes.BINARY)`. Guarda el binario real de la
  animación (~1.300 archivos).
- `gifUrl` persiste en la columna `gif_url`: sin `@Column(name=...)`, el naming strategy de
  Boot 3 (`CamelCaseToUnderscoresNamingStrategy`) aplica la convención. El JSON de la API sí
  expone `gifUrl`. Verificado en `RecipeRepository` (SQL nativo con `diet_type`). Hallazgo H-04.
- Los campos de texto (`target`, `equipment`, `body_part`) se guardan **traducidos al
  español** por `TranslationService`. Si la traducción falla (cuota agotada), se conserva
  el término en inglés.

---

## 12. `recipes` — GYMETRA-Qr

Recetas de Spoonacular, usadas por el generador de planes nutricionales. Sincronizadas
automáticamente al arrancar si la tabla está vacía.

| Campo | Tipo | Restricción | Notas |
|-------|------|-------------|-------|
| `id` | integer | PK | ID de Spoonacular, ej. 654321 |
| `title` | varchar(500) | NOT NULL | Título traducido |
| `summary` | text | nullable | Descripción breve |
| `instructions` | text | nullable | Preparación |
| `image_url` | varchar | nullable | Campo Java `imageUrl` → columna `image_url` |
| `image_data` | bytea | nullable | Binario de la imagen |
| `ready_in_minutes` | integer | nullable | Campo Java `readyInMinutes` → columna `ready_in_minutes`; tiempo de preparación |
| `servings` | integer | nullable | Porciones |
| `calories` | double | nullable | Calorías |
| `protein` | double | nullable | Proteínas (g) |
| `fat` | double | nullable | Grasas (g) |
| `carbs` | double | nullable | Carbohidratos (g) |
| `diet_type` | varchar | nullable | Campo Java `dietType` → columna `diet_type`: `ketogenic`, `vegetarian`, `vegan`, `paleo`… |
| `dish_type` | varchar | nullable | `breakfast`, `main course`, `side dish`… |

**Particularidades:**

- La PK es el ID de Spoonacular, no autogenerada.
- Los campos de clasificación quedan en snake_case en la base (`diet_type`, `dish_type`) y en
  camelCase en el JSON (`dietType`, `dishType`). Hallazgo H-04.
- Los valores de `diet_type` y `dish_type` se filtran **en inglés** dentro del generador, y
  se traducen al español al final (`TranslationService`).
- `image_data` es `bytea` con la imagen binaria (~500 archivos). Mismo problema de tamaño
  que `gif_data`. Hallazgo H-07.

---

## Resumen de claves foráneas

Dos fuentes distintas y **no equivalentes**: el script SQL (`database_ Initial.sql`) y el
mapeo JPA de las entidades.

| Desde | Hacia | En el script SQL | En la entidad JPA |
|-------|-------|------------------|-------------------|
| `user_role.user_id` | `user` | ✅ `ON DELETE CASCADE` | ✅ `@ManyToOne` |
| `user_role.role_id` | `role` | ✅ `ON DELETE CASCADE` | ✅ `@ManyToOne` |
| `password_reset_token.user_id` | `user` | ✅ `ON DELETE CASCADE` | ✅ `@ManyToOne` (`nullable = false`) |
| `user_membership.membership_id` | `membership` | ✅ `ON DELETE CASCADE` | ✅ `@ManyToOne` |
| `payment.user_membership_id` | `user_membership` | ✅ `ON DELETE CASCADE` | ✅ `@ManyToOne` |
| `user_membership.user_id` | `user` | ✅ `ON DELETE CASCADE` (**entre servicios**) | ❌ Sin `@ManyToOne` |
| `qr_access.user_id` | `user` | ✅ `ON DELETE CASCADE` (**entre servicios**) | ❌ Sin `@ManyToOne` |
| `access_log.user_id` | `user` | ✅ `ON DELETE CASCADE` (**entre servicios**) | ❌ Sin `@ManyToOne` |
| `access_log.branch_id` | `branch` | ✅ `ON DELETE CASCADE` | ❌ Sin `@ManyToOne` |
| `access_log.qr_id` | `qr_access` | ❌ El script no crea esa columna | ❌ Sin `@ManyToOne` |

**Total: 9 claves en el script, 5 relaciones mapeadas en JPA.**

> **Qué significa en la práctica** (depende de quién creó la base — ver R-12 y R-22):
>
> - **Base creada por el script:** existen las 9 FK, incluidas tres cruzadas entre servicios
>   (`user_membership`, `qr_access`, `access_log` → `user`). Borrar un usuario **borra en
>   cascada** sus membresías, pagos, QR e historial de accesos.
> - **Base creada por `ddl-auto: update` sobre vacío:** Hibernate **no crea ninguna FK**. El
>   borrado de un usuario deja filas huérfanas en todas las tablas dependientes.
>
> Los dos escenarios son incorrectos y están registrados en
> [ADR-002](../05-arquitectura/decisiones/registros/ADR-002-base-datos-compartida.md), R-12 y R-22.

---

## Documentos relacionados

- [`diccionario-de-datos.md`](./diccionario-de-datos.md) — campo por campo con ejemplos
- [`README.md`](./README.md) — hallazgos del modelo (H-01 a H-09)
- [`../02-dominio/entidades-y-reglas.md`](../02-dominio/entidades-y-reglas.md) — reglas de negocio
- [`../08-uml/diagramas/diagrama-entidad-relacion.png`](../08-uml/diagramas/exportados/02-diagrama-entidad-relacion.png) — diagrama ER
