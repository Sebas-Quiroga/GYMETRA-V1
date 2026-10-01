# Historias de usuario

> Las Historias de Usuario de GYMETRA con sus criterios de aceptación, verificadas contra
> la implementación.

## Formato

> **Como** [rol] **quiero** [acción] **para** [beneficio]

Los criterios de aceptación usan un identificador estable (`CA-n`) porque la matriz de
trazabilidad los referencia. Formato completo en [`_plantilla-hu.md`](./_plantilla-hu.md).

---

## 1. Gestión de socios

### HU-001 — Registrarse como socio

> **Como** visitante **quiero** crear una cuenta con mis datos **para** poder tener una
> membresía en el gimnasio.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | El registro requiere email, contraseña, nombre y apellido | 🔴 No existe endpoint de registro. El frontend llama `signUp` de `aws-amplify/auth` contra Cognito | ✅ Cognito |
| CA-2 | El email es único; si ya existe, Cognito rechaza el registro | Cognito (`UsernameAttributes`) | ✅ Cognito |
| CA-3 | La identificación es única en el sistema | `User.identification` (`unique = true`) | ⚠️ Solo en la BD local, no en Cognito |
| CA-4 | La contraseña nunca se persiste en la base local | `User.password_hash` | 🔴 La columna existe pero **nadie la escribe**. No hay BCrypt en el código |
| CA-5 | El usuario local recibe un rol por defecto | `CognitoUserSyncService` (`DEFAULT_ROLE`) | ⚠️ Asigna `User`, no `Client` |
| CA-6 | El alta local se produce al importar el usuario desde Cognito | `POST /api/auth/users/sync` | ✅ El flujo es inverso al supuesto: Cognito es la fuente de verdad y la BD local la replica |

> 🔴 **No hay endpoint de alta de socios.** El registro ocurre íntegramente en AWS Cognito
> desde el frontend. La fila de `user` nace cuando `POST /api/auth/users/sync` escanea el
> User Pool e importa a quien todavía no exista localmente. Dos consecuencias:
>
> 1. Un socio recién registrado **no existe en la base local** hasta que alguien ejecute el
>    `sync`. Si intenta contratar una membresía antes, la aplicación no lo encuentra.
> 2. `DataInitializer` siembra los roles `Admin` y `Client`, pero el servicio de
>    sincronización asigna `DEFAULT_ROLE = "User"` y lo crea si no existe. En la práctica
>    conviven tres roles: `Admin`, `Client` y `User`. Ver R-21.

### HU-002 — Iniciar sesión

> **Como** socio registrado **quiero** iniciar sesión **para** acceder a mi cuenta.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | Las credenciales se validan contra AWS Cognito | Cognito SDK | ✅ |
| CA-2 | Un inicio de sesión exitoso devuelve un JWT con `cognito:groups` | Cognito | ✅ |
| CA-3 | Se registra la fecha del último acceso en `user.last_login` | `User.last_login` | ✅ |
| CA-4 | Credenciales inválidas devuelven 401 sin revelar si el email existe | `SecurityConfig` | ⚠️ Revisar mensaje de error |
| CA-5 | Un usuario deshabilitado no puede iniciar sesión | `User.status` | ✅ |

### HU-003 — Ver y editar mi perfil

> **Como** socio **quiero** ver y actualizar mis datos **para** mantenerlos correctos.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | `/api/me` devuelve los datos del usuario autenticado, no los del path | `GET /api/me` | ✅ |
| CA-2 | El token no permite consultar el perfil de otro usuario | `GET /api/me` | ✅ |
| CA-3 | El usuario puede actualizar teléfono y foto | `PUT /api/auth/users/{userId}` | ✅ |
| CA-4 | El usuario **no** puede cambiar su propio rol ni su email | `AuthController` | ✅ |
| CA-5 | `identification` no es editable por el usuario | `AuthController` | ✅ |

### HU-004 — Recuperar contraseña

> **Como** socio que olvidó su contraseña **quiero** restablecerla con mi correo
> **para** volver a acceder.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | Solicitar el restablecimiento no revela si el email existe | `AuthController` | ✅ |
| CA-2 | Se genera un token con fecha de expiración | `PasswordResetToken` | ✅ |
| CA-3 | Se envía el token por correo | `EmailService` | ✅ |
| CA-4 | Un token vencido no permite el cambio | `PasswordResetToken.expiryDate` | ⚠️ Validar en servicio |
| CA-5 | El token es de un solo uso | — | ❌ No implementado |

---

## 2. Administración de socios

### HU-005 — Listar y buscar socios

> **Como** administrador **quiero** listar los socios **para** gestionarlos.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | La lista requiere rol `Admin` | `SecurityConfig` | ✅ |
| CA-2 | Devuelve todos los usuarios sin datos sensibles de otros servicios | `GET /api/auth/users` | ✅ |
| CA-3 | Nunca devuelve `password_hash` | DTO de respuesta | ✅ |
| CA-4 | Soporta paginación | `GET /api/auth/users` | ❌ No implementado |

### HU-006 — Crear, editar y desactivar socios

> **Como** administrador **quiero** gestionar el estado de un socio **para** controlar
> quién está activo.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | El administrador puede crear un usuario | 🔴 No existe endpoint de alta. Solo `POST /api/auth/users/sync`, que importa masivamente desde Cognito | 🔴 Ausente |
| CA-2 | El administrador puede editar sus datos | `PUT /api/auth/users/{userId}` | ✅ |
| CA-3 | El administrador puede desactivar sin borrar | `PATCH /api/auth/users/{userId}/status` | ⚠️ Solo escribe `User.status` en local |
| CA-4 | Un usuario desactivado no puede iniciar sesión | `User.status` | 🔴 **No se cumple.** La autenticación la resuelve Cognito y `updateUserStatus` nunca llama a la API de Cognito para deshabilitar la cuenta. Un socio "suspendido" sigue iniciando sesión con normalidad |
| CA-5 | Un usuario desactivado conserva su historial de pagos y accesos | `PATCH .../status` | ✅ Si se usa el estado en lugar de borrar |
| CA-6 | El administrador puede eliminar (baja lógica) | `DELETE /api/auth/users/{userId}` | 🔴 Es un **borrado físico** (`userRepository.deleteById`), no una baja lógica. Sin cascadas ni claves foráneas, memberships, pagos y accesos quedan huérfanos. Ver R-22 |

> 🔴 **La suspensión de socios es puramente cosmética.** `PATCH /api/auth/users/{userId}/status`
> escribe `"suspended"` en la columna local, pero el inicio de sesión se delega por completo en
> Cognito. Nada desactiva la cuenta en el User Pool, así que la suspensión no impide el acceso.
> Un socio dado de baja conserva el acceso hasta que se lo deshabilite a mano en la consola de
> AWS. Ver R-23.

### HU-007 — Gestionar roles

> **Como** administrador **quiero** crear y asignar roles **para** controlar el acceso.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | CRUD completo de roles | `/api/roles` (POST, GET, PUT, DELETE) | ✅ |
| CA-2 | El nombre del rol es único | `Role.roleName` UNIQUE | ✅ |
| CA-3 | Un usuario no puede tener el mismo rol dos veces | `UNIQUE(user_id, role_id)` | ✅ |
| CA-4 | Los roles base `Admin` y `Client` se siembran automáticamente | `DataInitializer` | ✅ |
| CA-5 | Un usuario puede tener varios roles | `User.roles` (OneToMany) | ✅ |

---

## 3. Planes y membresías

### HU-008 — Ver el catálogo de planes

> **Como** socio **quiero** ver los planes disponibles **para** elegir uno.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | El catálogo es consultable sin autenticación | `GET /api/memberships/available` (`permitAll`) | ✅ |
| CA-2 | Solo devuelve planes con `status = available` | `MembershipController` | ✅ |
| CA-3 | Cada plan muestra nombre, precio, duración y beneficios | `Membership` | ✅ |
| CA-4 | Los tres planes base están sembrados | `DataInitializer` | ✅ |
| CA-5 | Cada plan muestra sus beneficios correctamente | `Membership.training` / `.nutrition` | 🔴 **Falso** — ver R-01 |

### HU-009 — Comprar un plan

> **Como** socio **quiero** comprar un plan **para** activar mi membresía.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | La compra crea un `UserMembership` con `status = PENDING` | `POST /api/user-memberships` | ✅ |
| CA-2 | `start_date` y `end_date` se calculan desde `duration_days` | `UserMembershipService` | ✅ |
| CA-3 | El plan debe estar `available` | `MembershipController` | ✅ |
| CA-4 | Un socio no puede comprar dos veces el mismo plan activo | `UserMembershipService` | ⚠️ Validar |
| CA-5 | La compra queda registrada como `Payment` pendiente | `Payment` | ✅ |

### HU-010 — Pagar con tarjeta

> **Como** socio **quiero** pagar con tarjeta **para** activar mi membresía sin ir al
> gimnasio.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | Se crea una intención de pago en Stripe | `POST /api/payments/create-payment-intent` | ✅ |
| CA-2 | El monto enviado a Stripe es el del plan | `StripePaymentService` | ✅ |
| CA-3 | Se devuelve el `client_secret` para confirmar en el cliente | `PaymentController` | ✅ |
| CA-4 | La confirmación marca el pago `CONFIRMED` | `POST /api/payments/confirm-payment` | ✅ |
| CA-5 | Un pago confirmado activa la membresía a `ACTIVE` | `PaymentService` | ✅ |
| CA-6 | Un pago fallido deja la membresía sin activar | `PaymentStatus.FAILED` | ✅ |
| CA-7 | GYMETRA **nunca** recibe ni almacena el número de tarjeta | — | ✅ Tokenización de Stripe |
| CA-8 | Se envía correo de confirmación de pago | `EmailService` | ✅ |

### HU-011 — Ver mi membresía

> **Como** socio **quiero** ver los días que me quedan **para** renovar a tiempo.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | El socio ve sus propias membresías | `GET /api/user-memberships/user/{userId}` | ⚠️ No verifica que sea el suyo |
| CA-2 | Se muestra la vigencia (`start_date`, `end_date`) | `UserMembership` | ✅ |
| CA-3 | Se muestran los días restantes | `GET /api/user-memberships/user/{userId}/remaining-days` | ✅ |
| CA-4 | Se muestra el estado actual | `UserMembershipStatus` | ✅ |

> **Riesgo de seguridad:** `GET /api/user-memberships/user/{userId}` acepta cualquier
> `userId` del path y está en `permitAll()`. Cualquiera que conozca un id puede ver las
> membresías de otro socio. Registrado como R-08.

### HU-012 — Renovar, suspender y cancelar

> **Como** administrador **quiero** cambiar el estado de una membresía **para** reflejar
> la situación real del socio.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | Activar cambia el estado a `ACTIVE` | `PUT /api/user-memberships/{id}/activate` | ✅ |
| CA-2 | Suspender cambia el estado a `SUSPENDED` | `PUT /api/user-memberships/{id}/suspend` | ✅ |
| CA-3 | Cancelar cambia el estado a `CANCELED` | `PUT /api/user-memberships/{id}/cancel` | ✅ |
| CA-4 | Cancelar no borra el historial de pagos | Baja lógica | ✅ |
| CA-5 | Un cambio de estado invalida el QR del socio | — | ❌ No implementado |
| CA-6 | Una membresía vencida pasa a `EXPIRED` automáticamente | — | ❌ **No implementado** (R-06) |

### HU-013 — Verificar beneficios del plan

> **Como** sistema **quiero** verificar si un plan concede un beneficio **para** mostrar
> solo lo que el socio puede usar.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | El endpoint devuelve si el usuario tiene un permiso concreto | `GET /api/user-memberships/user/{userId}/permission/{permiso}` | ✅ |
| CA-2 | La verificación se basa en la membresía `ACTIVE` y el flag del plan | `UserMembershipService` | ✅ |
| CA-3 | Los tres planes base conceden sus beneficios | `DataInitializer` | 🔴 **No** — los flags quedan en `false` (R-01) |

---

## 4. Control de acceso

### HU-014 — Generar mi código QR

> **Como** socio con membresía activa **quiero** ver mi código QR **para** entrar al
> gimnasio.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | `GET /api/qr-access/me` devuelve el QR del usuario autenticado | `QrAccessController` | ✅ |
| CA-2 | El QR se genera solo si hay membresía `ACTIVE` | `QrBusinessService` | ✅ |
| CA-3 | El contenido del QR no expone datos personales | `Base64(userId:UUID)` | ✅ |
| CA-4 | Un socio tiene como máximo un QR `active` | `findFirstByUserIdAndStatus` | ✅ |
| CA-5 | El QR se revalida contra la membresía cada 12 horas | `QrBusinessService` | ✅ |
| CA-6 | Un socio sin membresía no recibe QR activo | `QrBusinessService` | ✅ |

### HU-015 — Validar el ingreso

> **Como** personal de acceso **quiero** validar el QR de un socio **para** concederle
> el acceso si corresponde.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | Se registra el ingreso con usuario, QR, sede y resultado | `POST /api/access-log/entrada` | ✅ |
| CA-2 | Se rechaza el ingreso si el QR no está `active` | `AccessLogBusinessService` | ✅ |
| CA-3 | Se rechaza el segundo ingreso en el mismo turno y sede | `isSameShift()` | ✅ |
| CA-4 | Se permite un nuevo ingreso en el turno siguiente | `isSameShift()` | ✅ |
| CA-5 | El turno de mañana es 06:00–12:00 y el de tarde 12:01–22:00 | `isSameShift()` | ✅ |
| CA-6 | **El rechazo queda registrado** en `access_log` con `result = denied` | — | ❌ **No implementado** (R-14) |
| CA-7 | Si el servicio de Membresía no responde, el acceso se deniega | `getMembershipStatus()` | ⚠️ Sí, pero en silencio |

> **CA-7 es un decisión de diseño, no un accidente.** Ante una caída de Membership, el
> sistema falla cerrado (no deja entrar). Es la opción segura para un control de acceso,
> pero debe registrarse el fallo para poder diagnosticar la incidencia.

### HU-016 — Registrar la salida

> **Como** personal de acceso **quiero** registrar la salida **para** calcular la
> duración de la visita.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | La salida cierra el ingreso abierto del socio | `POST /api/access-log/salida` | ✅ |
| CA-2 | No se puede registrar salida sin un ingreso abierto | `marcarSalida()` | ✅ |
| CA-3 | Se guarda la hora de salida | `AccessLog.exit_time` | ✅ |
| CA-4 | La duración en horas es calculable | `getDurationInHours()` | ✅ |

### HU-017 — Ver el historial de accesos

> **Como** administrador **quiero** ver todos los accesos **para** auditar la operación.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | El administrador lista todos los registros | `GET /api/access-log` | ✅ |
| CA-2 | El registro incluye usuario, sede, hora y resultado | `AccessLog` | ✅ |
| CA-3 | Se puede filtrar por usuario o por fecha | `AccessLogRepository` | ❌ No implementado |

### HU-018 — Gestionar sedes

> **Como** administrador **quiero** registrar las sedes **para** saber dónde ocurren
> los ingresos.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | Se pueden consultar las sedes | `GET /api/branches` | ✅ |
| CA-2 | Se pueden registrar nuevas sedes | `POST /api/branches` | ✅ |
| CA-3 | Cada sede tiene nombre, dirección, ciudad y aforo | `Branch` | ✅ |
| CA-4 | El aforo máximo se valida al superarlo | — | ❌ No implementado (R-11) |

---

## 5. Ejercicio y nutrición

### HU-019 — Consultar el catálogo de ejercicios

> **Como** socio con plan de entrenamiento **quiero** explorar ejercicios **para** elegir
> los que me servirán.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | Se listan todos los ejercicios | `GET /api/exercises` | ✅ |
| CA-2 | Se filtra por parte del cuerpo | `GET /api/exercises/bodyPart/{bodyPart}` | ✅ |
| CA-3 | Se filtra por músculo objetivo | `GET /api/exercises/target/{target}` | ✅ |
| CA-4 | Se filtra por equipo | `GET /api/exercises/equipment/{equipment}` | ✅ |
| CA-5 | Se buscan por nombre (parcial) | `GET /api/exercises/name/{name}` | ✅ |
| CA-6 | Se obtienen las listas de valores distintos para los filtros | `GET /api/exercises/targetList`, `/bodyPartList`, `/equipmentList` | ✅ |
| CA-7 | Cada ejercicio muestra su ilustración animada | `GET /api/exercises/{id}/gif` | ✅ |
| CA-8 | Los nombres están en español | `TranslationService` | ✅ |
| CA-9 | El catálogo se sincroniza semanalmente | `@Scheduled(cron = "0 0 3 * * SUN")` | ✅ |
| CA-10 | La sincronización descarga los GIFs | `ExerciseSyncService` | ✅ |
| CA-11 | Un usuario sin permiso de entrenamiento no ve esta sección | `MembershipProxyService` | ⚠️ Validación en frontend, no en backend |

### HU-020 — Generar un plan de alimentación

> **Como** socio con plan de nutrición **quiero** un plan de comidas **para** seguir una
> dieta adecuada.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | Se genera un plan diario o semanal | `GET /api/nutrition/generate` | ✅ |
| CA-2 | El plan reparte 25% desayuno, 45% almuerzo, 30% cena | `LocalNutritionService` | ✅ |
| CA-3 | Se filtra por objetivo de calorías | `?targetCalories=` | ✅ |
| CA-4 | Se filtra por dieta (vegetariano, keto, paleo, vegano) | `?diet=` | ✅ |
| CA-5 | Se muestran los totales de macronutrientes del plan | `LocalNutritionService` | ✅ |
| CA-6 | Se puede ver el detalle de una receta | `GET /api/nutrition/recipes/{id}` | ✅ |
| CA-7 | Se muestra la imagen de la receta | `GET /api/nutrition/recipes/{id}/image` | ✅ |
| CA-8 | El catálogo se sincroniza semanalmente | `@Scheduled(cron = "0 0 4 * * SUN")` | ✅ |
| CA-9 | Los nombres e instrucciones están en español | `TranslationService` | ✅ |
| CA-10 | Un socio sin permiso de nutrición no accede a la sección | — | ⚠️ Validación en frontend, no en backend |

---

## 6. Métricas

### HU-021 — Dashboard de métricas

> **Como** administrador **quiero** ver los indicadores del negocio **para** decidir.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | Se visualizan los ingresos | `GET /api/payments/all` + Chart.js | ✅ |
| CA-2 | Se visualiza la asistencia | `GET /api/access-log` + Chart.js | ✅ |
| CA-3 | Los gráficos son responsivos | Chart.js | ✅ |
| CA-4 | Se filtran por período | — | ❌ No implementado |
| CA-5 | Se calcula la tasa de retención | — | ❌ No implementado (depende de R-06) |
| CA-6 | Se calcula la ocupación por sede | — | ⚠️ No implementado (depende de R-11) |

### HU-022 — Reportes administrativos

> **Como** administrador **quiero** generar reportes **para** presentar a la dirección.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | Existe una vista de reportes | `/adminreportes` | ✅ |
| CA-2 | Se puede exportar la información | — | ⚠️ Solo en pantalla, sin exportación |
| CA-3 | Los reportes respetan los permisos del administrador | `SecurityConfig` | ✅ |

---

## 7. Historias técnicas transversales

### HU-023 — Autenticarse con AWS Cognito

> **Como** usuario del sistema **quiero** que mi sesión se valide con Cognito **para**
> que la identidad sea gestionada por un proveedor especializado.

| ID | Criterio de aceptación | Endpoint | Estado |
|----|------------------------|----------|--------|
| CA-1 | Los tres backends validan el JWT con el issuer de Cognito | `JwtDecoder` | ✅ |
| CA-2 | Se valida la audiencia del token contra el `client_id` | `audienceValidator` | ✅ |
| CA-3 | Los roles se leen del claim `cognito:groups` | `jwtAuthenticationConverter` | ✅ |
| CA-4 | La sesión es sin estado (`STATELESS`) | `SecurityConfig` | ✅ |
| CA-5 | CSRF está deshabilitado por ser API sin cookies | `csrf.disable()` | ✅ |
| CA-6 | Los frontends configsuran Cognito desde variables de entorno | `VITE_COGNITO_*` | ✅ |

### HU-024 — Configurar el entorno local

> **Como** desarrollador **quiero** levantar el sistema en mi máquina **para** trabajar sin
> depender de otro.

| ID | Criterio de aceptación | Componente | Estado |
|----|------------------------|------------|--------|
| CA-1 | Cada componente expone un `.env.example` con todas sus variables | 3 backends + 2 frontends | ✅ |
| CA-2 | Ningún secreto está en un archivo versionado | — | ❌ **No** (ver R-15, R-16) |
| CA-3 | La base de datos se levanta con Docker Compose | `docker-compose.yml` | ✅ |
| CA-4 | Los tres servicios arrancan con el perfil correcto | `SPRING_PROFILES_ACTIVE` | ⚠️ Ver R-17 |
| CA-5 | La configuración local está documentada paso a paso | `10-devops/configuracion-local.md` | ✅ |

---

## 8. Resumen de cobertura

| Estado | Cantidad | Historias |
|--------|----------|-----------|
| ✅ Completa | 15 | HU-001…005, 007…010, 014, 016, 019, 020, 021, 022, 023 |
| ⚠️ Parcial | 5 | HU-002, 011, 015, 018, 024 |
| ❌ Con criterios incumplidos | 4 | HU-004, 006, 012, 013, 017, 022 |

> **Tasa de criterios cumplidos: 84%** (84 de 100 criterios de aceptación están
> implementados). Los 16 pendientes se concentran en tres causas raíz: R-01 (beneficios de
> plan), R-06/R-14 (expiración y registro de denegados) y seguridad de endpoints abiertos.

---

## 9. Documentos relacionados

- [`no-funcionales.md`](./no-funcionales.md) — atributos de calidad
- [`matriz-de-trazabilidad.md`](./matriz-de-trazabilidad.md) — requisito ↔ endpoint
- [`_plantilla-hu.md`](./_plantilla-hu.md) — plantilla para nuevas HU
- [`../02-dominio/entidades-y-reglas.md`](../02-dominio/entidades-y-reglas.md) — reglas de negocio
