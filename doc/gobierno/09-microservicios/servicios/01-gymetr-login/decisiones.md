# Decisiones técnicas — GYMETR-login

> Decisiones tomadas en este servicio, con su motivo y su estado. Cuando una decisión se revierte,
> se marca como revertida: el historial vale más que el olvido.

---

## [LOG-DEC-001] La autenticación vive en AWS Cognito, no en el backend

| Campo | Valor |
|-------|-------|
| **Estado** | Vigente |
| **Fecha** | 2026-09 |
| **Decide** | El equipo de backend |

### Contexto

El proyecto es una app móvil para socios de gimnasios. Hacer autenticación propia implica guardar
contraseñas, protegerlas, resetarlas, vencerlas y contratar auditorías. Cognito resuelve todo eso.

### Decisión

Cognito es la autoridad sobre identidad y contraseña. El backend solo valida el JWT.

### Consecuencias

**Favorables:**
- No hay contraseñas en `gymdb`, así que una filtración de la base no expone credenciales.
- La suspension y el borrado de cuentas son funciones maduras del proveedor.
- El escalado horizontal no requiere estado de sesión en el backend.

**Adversas:**
- `password_hash` sigue declarado en la tabla `user` y nunca se escribe (R-25).
- La tabla `password_reset_token` y cuatro DTOs de login quedaron como código muerto.
- La suspensión implementada (`PATCH /status`) **solo cambia la fila local** y no llama a
  `AdminUserGlobalState`, así que un socio suspendido sigue iniciando sesión (R-23).
- El registro ocurre en Cognito desde el frontend; la fila local nace con
  `POST /api/auth/users/sync`, y entre el alta y el sync el usuario no existe para el sistema
  (R-21).

### Alternativas descartadas

| Alternativa | Por qué no |
|-------------|-----------|
| Spring Security con BCrypt | Obliga a custodiar contraseñas, con el riesgo y el coste que implica |
| Sesiones con cookie | No funciona bien en app móvil con Ionic |
| Auth0 o Firebase | Dependencia adicional con el mismo problema que Cognito |

---

## [LOG-DEC-002] El rol por defecto del socio nuevo es `User`

| Campo | Valor |
|-------|-------|
| **Estado** | Vigente, pero inconsistente |
| **Fecha** | 2026-09 |

### Decisión

`CognitoUserSyncService` usa `DEFAULT_ROLE = "User"` y lo crea si no existe.

### Problema

`DataInitializer`, de este servicio (`config/DataInitializer.java`), siembra los roles `Admin` y
`Client` al arrancar; el `DataInitializer` de membresías no toca `role` y solo siembra planes.
Conviven tres nombres de rol, y `RoleController` permite crear más por API. No hay ninguna
política que diga cuál es la fuente de verdad: la tabla `user_role` o el grupo `cognito:groups`
del token.

### Consecuencia

Un endpoint que espere `hasRole("Admin")` no se activará con el rol `User` ni con `Client`. Hoy
esto no rompe nada porque **ningún controlador usa `@PreAuthorize`**: los tres `SecurityConfig`
terminan en `anyRequest().authenticated()`, así que cualquier socio autenticado puede llamar a
los endpoints de administración (R-16).

### Acción pendiente

Decidir la fuente de verdad, eliminar la otra y unificar el nombre del rol.

---

## [LOG-DEC-003] La suspensión de usuarios se implementa solo en la base local

| Campo | Valor |
|-------|-------|
| **Estado** | Revertido en la práctica, nunca corregido |
| **Fecha** | 2026-09 |

### Contexto

El requisito dice que un administrador puede suspender a un socio. La implementación actual
escribe `"suspended"` en `user.status`.

### Por qué está mal

La autenticación la resuelve Cognito por completo. Un usuario suspendido en la base local sigue
con su cuenta habilitada en Cognito y sigue iniciando sesión con normalidad. La suspensión es
cosmética: no suspende nada (R-23).

### Corrección necesaria

Complementar el `PATCH /api/auth/users/{userId}/status` con una llamada a la API de Cognito
(`AdminUserGlobalState`, o `DisableMFAPreference`/bloqueo según la política), de modo que la
baja sea efectiva en el único lugar donde se decide.

---

## [LOG-DEC-004] La foto de perfil se guarda fuera de la base

| Campo | Valor |
|-------|-------|
| **Estado** | Vigente |
| **Decide** | El equipo de backend |

### Decisión

`user.photo_url` almacena una **URL**, no el archivo. `spring.servlet.multipart.max-file-size`
está en 10 MB, lo que indica que la subida existe, pero la imagen termina en S3 (opcional) o en
un servicio de almacenamiento externo.

### Consecuencia

La base no crece con binarios. A cambio, si el almacenamiento externo no está configurado, la
URL apunta a un recurso inexistente y la interfaz muestra un avatar vacío sin explicación.

---

## [LOG-DEC-005] `GYMETR-login` se queda en Spring Boot 3.2.0

| Campo | Valor |
|-------|-------|
| **Estado** | Vigente, pendiente de actualizar |
| **Fecha** | 2026-09 |

### Contexto

Los tres servicios spring boot: `GYMETR-login` en 3.2.0, `GYMETR-Membership` y `GYMETRA-Qr` en
3.5.5. También difieren en springdoc (2.5.0 en login y QR, 2.7.0 en Membership) y en el SDK de
AWS: solo `GYMETR-login` declara `software.amazon.awssdk:cognitoidentityprovider` 2.20.0, como
dependencia directa y no como un BOM; `GYMETR-Membership` no declara ninguna dependencia AWS.

### Por qué importa

Un proyecto con tres microservicios sobre versiones distintas del framework acumula
incompatibilidades difíciles: diferencias en el manejo de errores, en la serialización, en el
cliente HTTP y en el soporte de las librerías de seguridad. Cuando dos servicios necesitan el mismo
comportamiento, es seguro asumir que no lo tendrán.

### Acción pendiente

Subir `GYMETR-login` a 3.5.5 y unificar springdoc. Es un cambio de bajo riesgo, porque el
servicio no tiene pruebas que validar (R-24, R-04).

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`ADR-003`](../../../05-arquitectura/decisiones/registros/ADR-003-autenticacion-cognito.md) | Decisión de Cognito a nivel de arquitectura |
| [`R-16`](../../../15-control-proyecto/riesgos.md) | Autorización sin exigir rol |
| [`R-23`](../../../15-control-proyecto/riesgos.md) | Suspensión inefectiva |
| [`07-api/autenticacion-y-autorizacion.md`](../../../07-api/autenticacion-y-autorizacion.md) | Flujo de autenticación completo |
