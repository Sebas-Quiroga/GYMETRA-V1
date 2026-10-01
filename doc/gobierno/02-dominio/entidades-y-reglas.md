# Entidades y reglas de negocio

> Las entidades de GYMETRA, sus invariantes y las reglas que las gobiernan.
> Este documento describe **lo que el código realmente hace**, verificado contra las
> clases Java del proyecto.

---

## 1. Inventario de entidades

| # | Entidad | Tabla | Servicio | Contexto | Propósito |
|---|---------|-------|----------|----------|-----------|
| 1 | `User` | `user` | GYMETR-login | Identidad | Persona registrada en el sistema |
| 2 | `Role` | `role` | GYMETR-login | Identidad | Conjunto de permisos |
| 3 | `UserRole` | `user_role` | GYMETR-login | Identidad | Asignación de rol a usuario |
| 4 | `PasswordResetToken` | `password_reset_token` | GYMETR-login | Identidad | Token temporal de recuperación |
| 5 | `Membership` | `membership` | GYMETR-Membership | Membresía | Catálogo de planes |
| 6 | `UserMembership` | `user_membership` | GYMETR-Membership | Membresía | Contrato socio–plan |
| 7 | `Payment` | `payment` | GYMETR-Membership | Membresía | Transacción financiera |
| 8 | `QrAccess` | `qr_access` | GYMETRA-Qr | Acceso | Credencial QR del socio |
| 9 | `AccessLog` | `access_log` | GYMETRA-Qr | Acceso | Registro de entrada/salida |
| 10 | `Branch` | `branch` | GYMETRA-Qr | Acceso | Sede del gimnasio |
| 11 | `UserMin` | `user` | GYMETRA-Qr | Acceso (proyección) | Copia mínima del usuario |
| 12 | `Exercise` | `exercises` | GYMETRA-Qr | Bienestar | Catálogo de ejercicios |
| 13 | `Recipe` | `recipes` | GYMETRA-Qr | Bienestar | Catálogo de recetas |

Detalle de columnas en [`06-datos/diccionario-de-datos.md`](../06-datos/diccionario-de-datos.md).

---

## 2. Contexto de Identidad

### 2.1 `User` — la persona

```java
@Entity
@Table(name = "\"user\"")   // comillas obligatorias: "user" es palabra reservada en PostgreSQL
public class User {
    Long           userId          // @Id @GeneratedValue(IDENTITY) → "user_id"
    String         firstName       // "first_name", NOT NULL
    String         lastName        // "last_name", NOT NULL
    String         email           // NOT NULL, UNIQUE
    String         cognitoSub      // "cognito_sub", UNIQUE — identidad federada
    String         passwordHash    // "password_hash", BCrypt
    String         phone
    String         status
    OffsetDateTime createdAt       // "created_at"
    OffsetDateTime lastLogin       // "last_login"
    Long           identification  // UNIQUE, NOT NULL — cédula
    String         photoUrl        // "photo_url", TEXT
    List<UserRole> roles           // @OneToMany, LAZY, cascade ALL, orphanRemoval
}
```

> **Detalle importante:** la tabla se llama `"user"` con comillas dobles porque `user` es
> palabra reservada en PostgreSQL. Sin comillas, cualquier consulta SQL directa falla.
> La entidad `UserMin` del servicio QR replica este mismo nombre de tabla.

**Invariantes**

| Invariante | Cómo se garantiza |
|------------|-------------------|
| El email es único | `@Column(unique = true)` + índice único en la BD |
| `cognito_sub` es único | `@Column(unique = true)` — un usuario de Cognito no se duplica |
| `identification` es única y obligatoria | `@Column(unique = true, nullable = false)` |
| La contraseña nunca se almacena en claro | 🔴 No se almacena **en ninguna forma**: Cognito la custodia y GYMETRA nunca la recibe. `password_hash` existe pero nadie la escribe |
| `firstName` y `lastName` son obligatorios | `nullable = false` |

### 2.2 `Role` — los permisos

```java
@Entity @Table(name = "role")
public class Role {
    Long           roleId      // "role_id", @Id IDENTITY
    String         roleName    // "role_name", NOT NULL, UNIQUE
    String         description
    Integer        priority
    List<UserRole> userRoles   // @OneToMany mappedBy="role", LAZY, cascade ALL
}
```

**Roles sembrados** por `DataInitializer` al arrancar, si la tabla está vacía:

| `role_name` | `description` |
|-------------|---------------|
| `Admin` | Administrador del sistema |
| `Client` | Cliente del gimnasio |

> **Nota de nomenclatura:** los valores sembrados son `Admin` y `Client` con inicial en
> mayúscula. El documento previo `doc/technical_specs/data_model.md` los documentaba
> como `ADMIN` y `CLIENT`. El código es la fuente de verdad.

> **Nota de flujo:** el rol llega en el claim `cognito:groups` del JWT de Cognito, y
> `SecurityConfig.jwtAuthenticationConverter()` lo convierte a `ROLE_<grupo>`. La tabla
> `role` es la fuente local, pero **la autorización efectiva la decide Cognito**, no la
> base de datos. Ver [ADR-003](../05-arquitectura/decisiones/registros/ADR-003-autenticacion-cognito.md).

### 2.3 `UserRole` — la asignación

```java
@Entity @Table(name = "user_role", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "role_id"})
})
public class UserRole {
    Long userRoleId   // "user_role_id", @Id IDENTITY
    User user         // @ManyToOne LAZY, "user_id", NOT NULL
    Role role         // @ManyToOne LAZY, "role_id", NOT NULL
}
```

**Invariante:** un usuario no puede tener el mismo rol asignado dos veces. Lo garantiza la
restricción `UNIQUE (user_id, role_id)` a nivel de tabla.

### 2.4 `PasswordResetToken`

```java
@Entity @Table(name = "password_reset_token")
public class PasswordResetToken {
    Long          id
    String        token       // NOT NULL
    User          user        // @ManyToOne "user_id", NOT NULL
    LocalDateTime expiryDate  // "expiry_date"
}
```

**Invariante:** el token tiene fecha de expiración; uno vencido no debe permitir el cambio
de contraseña.

> **Hallazgo:** la entidad no declara unicidad sobre `token` ni índice sobre
> `expiry_date`. Ver R-10 en [riesgos](../15-control-proyecto/riesgos.md).

---

## 3. Contexto de Membresía — el núcleo

### 3.1 `Membership` — el catálogo de planes

```java
@Entity @Table(name = "membership")
public class Membership {
    Integer    membershipId   // @Id IDENTITY
    String     planName       // NOT NULL
    Integer    durationDays   // NOT NULL
    BigDecimal price          // NOT NULL
    String     status         // NOT NULL — "available" / "unavailable"
    String     description    // TEXT
    Boolean    training = false   // permiso de entrenamiento
    Boolean    nutrition = false  // permiso de nutrición
    List<UserMembership> userMemberships
}
```

**Planes sembrados** por `DataInitializer` (solo si la tabla está vacía):

| `plan_name` | `description` | `duration_days` | `price` | `status` |
|-------------|---------------|-----------------|---------|----------|
| Membresía mensual básica | Mensual | 30 | 60.000,00 | available |
| Membresía trimestral premium | Trimestral | 90 | 160.000,00 | available |
| Membresía anual completa | Anual | 365 | 550.000,00 | available |

**Invariantes**

| Invariante | Cómo se garantiza |
|------------|-------------------|
| El plan tiene precio | `nullable = false` |
| La duración es positiva | `durationDays` `nullable = false`; la validación de negocio está en el servicio |
| Un plan no disponible no se compra | `status` = `available` |
| Los beneficios son booleanos y por defecto `false` | Inicializador de campo en la entidad |

> 🔴 **Hallazgo crítico — los planes sembrados no conceden beneficios.** `DataInitializer`
> construye los tres planes **sin** asignar `training` ni `nutrition`, así que ambos quedan
> en su valor por defecto `false`. Con los datos iniciales, la verificación de permisos
> (`GET /api/user-memberships/user/{id}/permission/{permiso}`) niega tanto el acceso a
> rutinas como el de nutrición para **todos** los planes. Esto bloquea los objetivos de
> negocio de los Requisitos Funcionales RF-08 y RF-09.
> Registrado como R-01 en [`riesgos.md`](../15-control-proyecto/riesgos.md).
> **Corrección esperada:** definir explícitamente los beneficios por plan en el sembrador
> y verificar el flujo de beneficios de punta a punta.

### 3.2 `UserMembership` — el contrato socio–plan

```java
@Entity @Table(name = "user_membership")
public class UserMembership {
    Integer               id          // @Id IDENTITY
    Integer               userId      // "user_id", NOT NULL — solo el id, sin @ManyToOne
    Membership            membership  // @ManyToOne LAZY, "membership_id", NOT NULL, optional=false
    LocalDate             startDate   // NOT NULL
    LocalDate             endDate     // NOT NULL
    UserMembershipStatus  status      // @Enumerated(STRING), NOT NULL
    LocalDateTime         createdAt   // NOT NULL
}
```

> **Decisión de modelado:** `userId` es un `Integer` **sin relación JPA** a la tabla `user`.
> Es una referencia por id, no una asociación navegable. Ojo con el matiz: aunque la entidad
> no navega la relación, el script SQL **sí declara** la clave foránea con
> `ON DELETE CASCADE`; la divergencia entre las dos fuentes está en ADR-002.

**Estados posibles** (`UserMembershipStatus`, seis valores):

| Estado | Significado |
|--------|-------------|
| `ACTIVE` | Membresía vigente, concede acceso |
| `SUSPENDED` | Pausada temporalmente |
| `CANCELED` | Terminada por el socio o el administrador (terminal) |
| `EXPIRED` | Superó su `end_date` (terminal) |
| `PENDING` | Creada, aún no activada |
| `DELETED` | Borrado lógico (terminal); el servicio la excluye con `findAllByStatusNot(DELETED)` |

> El enum `UserMembershipStatus` declara **exactamente seis valores**: `ACTIVE`,
> `SUSPENDED`, `CANCELED`, `EXPIRED`, `PENDING` y `DELETED`. `DELETED` sí existe y es la
> baja lógica que usa `UserMembershipService`.

**Invariantes**

| Invariante | Cómo se garantiza |
|------------|-------------------|
| El plan asociado es obligatorio | `optional = false` + `nullable = false` |
| Las fechas de vigencia son obligatorias | `nullable = false` |
| El estado es siempre uno de los seis valores | `@Enumerated(EnumType.STRING)` |

### 3.3 `Payment` — la transacción

```java
@Entity @Table(name = "payment")
public class Payment {
    Long            id                    // @Id IDENTITY
    UserMembership  userMembership        // @ManyToOne LAZY, "user_membership_id", NOT NULL
    LocalDateTime   paymentDate           // "payment_date", NOT NULL
    BigDecimal      amount                // "amount", NOT NULL, precision 10 scale 2
    BigDecimal      monto                 // "monto", NOT NULL, precision 10 scale 2
    PaymentMethod   paymentMethod         // @Enumerated(STRING), NOT NULL
    String          metodoPago            // "metodo_pago", NOT NULL, length 20
    String          transactionReference  // "transaction_reference", length 255
    PaymentStatus   paymentStatus         // @Enumerated(STRING), NOT NULL
    LocalDateTime   fechaPago             // "fecha_pago", NOT NULL
    LocalDateTime   createdAt             // NOT NULL, updatable=false
    LocalDateTime   updatedAt             // NOT NULL
}
```

**Enums**

| Enum | Valores |
|------|---------|
| `PaymentMethod` | `CASH`, `CARD`, `GATEWAY` |
| `PaymentStatus` | `PENDING`, `CONFIRMED`, `FAILED` |

**Reglas de validación** (`PaymentService.savePaymentSimplified()`):

| Regla | Mensaje de error |
|-------|------------------|
| `userMembership` no puede ser nulo | `"UserMembership no puede ser null"` |
| El monto debe ser mayor que cero | `"Amount debe ser mayor que 0"` |
| El método de pago no puede ser vacío | `"PaymentMethod no puede ser null o vacío"` |
| El estado de pago no puede ser vacío | `"PaymentStatus no puede ser null o vacío"` |

> 🔴 **Hallazgo — columnas duplicadas en `payment`.** La entidad mantiene **pares de
> campos equivalentes en dos idiomas**: `amount`/`monto`, `paymentMethod`/`metodoPago`,
> `paymentDate`/`fechaPago`. Todas están marcadas `NOT NULL`, lo que obliga a que cada
> camino de escritura mantenga sincronizados los pares a mano. Es una deuda técnica que
> produce datos inconsistentes en cuanto un flujo de escritura olvida uno de los dos.
> `savePaymentSimplified()` solo rellena el par en inglés.
> Registrado como R-02 en [`riesgos.md`](../15-control-proyecto/riesgos.md).
> **Corrección esperada:** decidir un idioma (preferiblemente inglés, ver
> [ADR-001](../05-arquitectura/decisiones/registros/ADR-001-idioma-documentacion.md)),
> migrar los datos y eliminar las columnas redundantes.

---

## 4. Contexto de Acceso

### 4.1 `QrAccess` — la credencial de ingreso

```java
@Entity @Table(name = "qr_access")
public class QrAccess {
    Long          qrId        // "qr_id", @Id IDENTITY
    Long          userId      // "user_id"
    String        qrCode      // "qr_code", length 1024
    LocalDateTime generatedAt // "generated_at"
    String        status      // "active" | "inactive" | "expired"
}
```

**Reglas** (`QrBusinessService`)

| Regla | Implementación |
|-------|----------------|
| Un socio tiene como máximo un QR activo | `findFirstByUserIdAndStatus(userId, "active")` |
| El QR se revalida contra la membresía **cada 12 horas** | `generatedAt.isBefore(now.minusHours(12))` |
| El QR solo es `active` si hay membresía `ACTIVE` | Consulta a Membership y busca `status = ACTIVE` |
| El contenido del QR es un UUID aleatorio | `Base64(userId + ":" + UUID.randomUUID())` |

> **Nota técnica:** `qr_code` almacena una cadena Base64, **no una imagen QR**. La
> imagen se genera en el frontend con `qrcode.vue`. El contenido es un token opaco: no
> incluye información del socio, solo un identificador.
> Ver R-07 en [`riesgos.md`](../15-control-proyecto/riesgos.md).

### 4.2 `AccessLog` — la trazabilidad del ingreso

```java
@Entity @Table(name = "access_log")
public class AccessLog {
    Long          logId      // "log_id", @Id IDENTITY
    Long          userId     // "user_id"
    Long          qrId       // "qr_id"
    Long          branchId   // "branch_id"
    LocalDateTime eventTs    // "event_ts"
    LocalDateTime entryTime  // "entry_time"
    LocalDateTime exitTime   // "exit_time" — NULL mientras no hay salida
    String        result     // "granted" | "denied"
    String        notes
    Double        durationInHours   // campo calculado, no persistido
}
```

**Invariantes del dominio de acceso** (`AccessLogBusinessService`)

| Regla | Comportamiento verificado |
|-------|----------------------------|
| **R-ACC-1** No se concede acceso sin membresía activa | Lanza excepción `"User does not have an active membership"` si el QR no está `active` |
| **R-ACC-2** No hay doble entrada en el mismo turno | Lanza `"User already has an open entry for this shift"` si ya hay un ingreso abierto (`exit_time IS NULL`) en la misma sede y el mismo turno |
| **R-ACC-3** El turno divide el día en dos franjas | Mañana `06:00–12:00` · Tarde `12:01–22:00` |
| **R-ACC-4** La salida cierra el ingreso abierto | Busca el `AccessLog` abierto del usuario (opcionalmente en una sede) y asigna `exit_time` |
| **R-ACC-5** La salida requiere un ingreso previo | Lanza `"No open entry found for this user and branch"` |
| **R-ACC-6** Todo ingreso concedido queda en `result = granted` | Se asigna explícitamente al crear el registro |

**Definición de turno** (`isSameShift`)

```java
private boolean isSameShift(LocalDateTime t1, LocalDateTime t2) {
    int h1 = t1.getHour(), h2 = t2.getHour();
    if (h1 >= 6 && h1 <= 12 && h2 >= 6 && h2 <= 12)  return mismaFecha(t1, t2);
    if (h1 >= 12 && h2 <= 22 ...)                     return mismaFecha(t1, t2);
    return false;
}
```

> **Observación:** la condición del turno de tarde es `h1 >= 12 && h2 <= 22`, que
> comprueba ambos extremos pero **no** que `h2 >= 12`. Una entrada a las 08:00 (turno de
> mañana) comparada con una marca de tiempo a las 21:00 satisface `h1>=12`? No — `h1=8`.
> Pero una entrada a las 13:00 contra un evento a las 07:00 sí pasa la validación de rango
> porque solo comprueba `h1 >= 12` y `h2 <= 22`. Es una condición asimétrica.
> Registrado como R-03 en [`riesgos.md`](../15-control-proyecto/riesgos.md).

> **Rendimiento:** `marcarIngreso` y `marcarSalida` cargan **todos** los registros con
> `accessLogRepository.findAll()` y filtran en memoria. Con volumen alto de accesos esto
> es un cuello de botella. Registrado como R-05 en
> [`riesgos.md`](../15-control-proyecto/riesgos.md).

### 4.3 `Branch` — la sede

```java
@Entity @Table(name = "branch")
public class Branch {
    Long    branchId   // "branch_id", @Id IDENTITY
    String  name
    String  address
    String  city
    Integer capacity
}
```

**Invariante:** el `capacity` representa el aforo máximo. **No existe regla de negocio
que impida superar el aforo** — el campo es informativo, no se valida en
`AccessLogBusinessService`. Ver R-11 en [`riesgos.md`](../15-control-proyecto/riesgos.md).

### 4.4 `UserMin` — proyección mínima

```java
@Entity @Table(name = "\"user\"")
public class UserMin {
    Long   userId      // "user_id", @Id IDENTITY
    String cognitoSub // UNIQUE
    String email
}
```

> **Violación de propiedad de datos:** el servicio QR mapea la tabla `user`, que pertenece
> al servicio de Identidad. Funciona porque los tres servicios comparten la base de datos
> (ver [ADR-002](../05-arquitectura/decisiones/registros/ADR-002-base-datos-compartida.md)),
> pero crea acoplamiento de esquema entre servicios. Si mañana cada servicio tiene su
> propia base, esta entidad deja de compilar contra el esquema de Membership.
> Registrado como R-12 en [`riesgos.md`](../15-control-proyecto/riesgos.md).

---

## 5. Contexto de Bienestar

### 5.1 `Exercise` — catálogo de ejercicios

```java
@Entity @Table(name = "exercises")
public class Exercise {
    String id;            // @Id — id externo de ExerciseDB, ej. "0001". NO es autogenerado
    String name;          // NOT NULL
    String gifUrl;        // TEXT
    byte[] gifData;       // mapeado a la columna "gif_data"
    String target;        // músculo objetivo
    String equipment;     // equipo requerido
    String bodyPart;      // parte del cuerpo
}
```

**Reglas de sincronización** (`ExerciseSyncService`)

| Regla | Detalle |
|-------|---------|
| Si hay menos de 1.300 registros, se relanza la carga al arrancar | `@EventListener(ApplicationReadyEvent.class)` |
| Sincronización semanal automática | `@Scheduled(cron = "0 0 3 * * SUN")` — domingos 03:00 |
| Traducción de todos los términos al español | Nombres, músculo objetivo, equipo y parte del cuerpo |
| Descarga del GIF de cada ejercicio | Endpoint `/image?exerciseId={id}&resolution=360` |
| Retardo de 200 ms entre ejercicios | Para no agotar la cuota de la API de traducción |

> **Nota sobre `gifData`:** el campo Java es `byte[] gifData` y la columna es `gif_data`,
> con `@JdbcTypeCode(SqlTypes.BINARY)` para forzar el tipo `bytea` de PostgreSQL y evitar
> el error de `oid`. Es contenido binario real (la animación descargada), no una URL. La
> URL de referencia vive en el campo aparte `gifUrl`, que Hibernate mapea a la columna
> `gif_url` (naming strategy camelCase → snake_case de Spring Boot 3). La convención
> snake_case se cumple; la entidad solo no lo declara explícitamente con
> `@Column(name=...)`. Ver hallazgo H-04.

### 5.2 `Recipe` — catálogo de recetas

```java
@Entity @Table(name = "recipes")
public class Recipe {
    Integer id;               // @Id — id de Spoonacular, ej. 654321. NO es autogenerado
    String  title;            // NOT NULL, length 500
    String  summary;          // TEXT
    String  instructions;     // TEXT
    String  imageUrl;
    byte[]  imageData;        // mapeado a "image_data"
    Integer readyInMinutes;
    Integer servings;
    Double  calories;
    Double  protein;
    Double  fat;
    Double  carbs;
    String  dietType;         // "diet_type"
    String  dishType;         // "dish_type"
}
```

**Reglas de sincronización** (`NutritionSyncService`)

| Regla | Detalle |
|-------|---------|
| Si la tabla está vacía, se relanza la carga al arrancar | `@EventListener(ApplicationReadyEvent.class)` |
| Sincronización semanal automática | `@Scheduled(cron = "0 0 4 * * SUN")` — domingos 04:00 |
| Se sincronizan 4 categorías | General (200) + vegetarian (100) + ketogenic (100) + paleo (100) = **500 recetas** |
| Traducción de título, resumen e instrucciones | Al español, con caché local |
| Retardo de 150 ms entre recetas | Para respetar la cuota de la API de traducción |

**Reglas de generación de plan** (`LocalNutritionService`)

| Regla | Detalle |
|-------|---------|
| Distribución calórica diaria | Desayuno 25% · Almuerzo 45% · Cena 30% |
| El plan semanal repite el plan diario para los 7 días | Sin distribución por día de la semana |
| Selección de receta | Aleatoria entre las del tipo de plato y dieta, con tope de calorías |
| Fallback de tipo de plato | Si no hay del tipo pedido y no es desayuno, usa `"main course"` |
| Cálculo de totales | Suma de calorías, proteína, grasa y carbohidratos del plan |

> **Hallazgo — cálculo de objetivos ignorado en el plan semanal.** En
> `generateMealPlan()` para `timeFrame = "week"`, el código calcula primero
> `targetCalories / 7.0` y lo asigna al día, pero **en la línea siguiente sobrescribe ese
> valor** con `targetCalories` sin dividir. El primer cálculo es código muerto.
> Registrado como R-13 en [`riesgos.md`](../15-control-proyecto/riesgos.md).

---

## 6. Resumen de reglas de negocio por contexto

| ID | Regla | Dónde vive | Servicio |
|----|-------|------------|----------|
| R-ID-1 | Un email identifica a una sola persona | `User.email` UNIQUE | GYMETR-login |
| R-ID-2 | Un usuario no repite el mismo rol | `UNIQUE(user_id, role_id)` | GYMETR-login |
| R-MB-1 | Solo los planes `available` se pueden comprar | `Membership.status` | GYMETR-Membership |
| R-MB-2 | El monto de un pago es mayor que cero | `PaymentService` | GYMETR-Membership |
| R-MB-3 | Todo pago tiene usuario, monto, método y estado | columnas `NOT NULL` | GYMETR-Membership |
| R-MB-4 | Solo el estado `ACTIVE` concede acceso y beneficios | `QrBusinessService` | GYMETRA-Qr |
| R-AC-1 | No se concede acceso sin membresía activa | `AccessLogBusinessService` | GYMETRA-Qr |
| R-AC-2 | No hay doble entrada abierta en el mismo turno y sede | `AccessLogBusinessService` | GYMETRA-Qr |
| R-AC-3 | Un turno es 06:00–12:00 o 12:01–22:00 | `isSameShift()` | GYMETRA-Qr |
| R-AC-4 | No se puede registrar salida sin ingreso abierto | `marcarSalida()` | GYMETRA-Qr |
| R-AC-5 | El QR se revalida contra la membresía cada 12 h | `QrBusinessService` | GYMETRA-Qr |
| R-BE-1 | El plan diario reparte 25/45/30 entre comidas | `LocalNutritionService` | GYMETRA-Qr |
| R-BE-2 | Los ejercicios se traducen al español al sincronizar | `TranslationService` | GYMETRA-Qr |

---

## 7. Documentos relacionados

- [`mapa-de-dominio.md`](./mapa-de-dominio.md) — contextos y fronteras
- [`eventos-de-dominio.md`](./eventos-de-dominio.md) — hechos del dominio
- [`06-datos/modelo-de-datos.md`](../06-datos/modelo-de-datos.md) — las mismas entidades en la base de datos
- [`06-datos/diccionario-de-datos.md`](../06-datos/diccionario-de-datos.md) — columna por columna
- [`15-control-proyecto/riesgos.md`](../15-control-proyecto/riesgos.md) — R-01 a R-27
