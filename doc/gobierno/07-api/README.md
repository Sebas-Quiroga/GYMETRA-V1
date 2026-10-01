# 07 — API

> Contratos HTTP de los tres microservicios: endpoints, autenticación, formato de errores y
> especificación OpenAPI.

## Documentos de esta sección

| Documento | Contenido |
|-----------|-----------|
| [`directrices-api.md`](./directrices-api.md) | Convenciones de diseño de API que sigue GYMETRA |
| [`autenticacion-y-autorizacion.md`](./autenticacion-y-autorizacion.md) | Cómo se autentican y autorizan las peticiones |
| [`contratos/openapi/gymetr-login.yaml`](./contratos/openapi/gymetr-login.yaml) | Contrato OpenAPI de GYMETR-login |
| [`contratos/openapi/gymetr-membership.yaml`](./contratos/openapi/gymetr-membership.yaml) | Contrato OpenAPI de GYMETR-Membership |
| [`contratos/openapi/gymetra-qr.yaml`](./contratos/openapi/gymetra-qr.yaml) | Contrato OpenAPI de GYMETRA-Qr |

---

## Inventario de endpoints

**64 endpoints** distribuidos en 3 servicios, 14 controladores.

| Servicio | Puerto | Controladores | Endpoints | Autenticados |
|----------|--------|---------------|-----------|--------------|
| `GYMETR-login` | 8080 | 3 | 12 | 12 |
| `GYMETR-Membership` | 8081 | 5 | 25 | 23 |
| `GYMETRA-Qr` | 8090 | 6 | 27 | 11 |
| **Total** | | **14** | **64** | **46** |

> De los 64 endpoints, **18 son accesibles sin token**: 16 en el servicio QR (todo lo bajo
> `/api/exercises/**` y `/api/nutrition/**`) y 2 en Membership (`/api/memberships/available`
> y `/api/user-memberships/user/*/permission/*`). Los 46 restantes exigen un JWT válido.

---

## GYMETR-login — `:8080`

Base: `/api/auth`, `/api`, `/api/roles`. **12 endpoints, todos requieren JWT.**

| Verbo | Ruta | Propósito |
|-------|------|-----------|
| GET | `/api/auth/users` | Listar usuarios |
| GET | `/api/auth/users/{userId}` | Ver un usuario |
| PUT | `/api/auth/users/{userId}` | Actualizar usuario |
| DELETE | `/api/auth/users/{userId}` | Eliminar usuario (borrado físico) |
| PATCH | `/api/auth/users/{userId}/status` | Activar / suspender cuenta |
| POST | `/api/auth/users/sync` | Sincronizar usuario con Cognito |
| GET | `/api/me` | Perfil del usuario autenticado |
| POST | `/api/roles` | Crear rol |
| GET | `/api/roles` | Listar roles |
| GET | `/api/roles/{roleId}` | Ver un rol |
| PUT | `/api/roles/{roleId}` | Actualizar rol |
| DELETE | `/api/roles/{roleId}` | Eliminar rol |

---

## GYMETR-Membership — `:8081`

**25 endpoints.** Base por controlador: `/api`, `/api/payments`, `/api/user-memberships`,
`/api/diagnostic`, `/api/inspector`.

| Verbo | Ruta | Propósito | Auth |
|-------|------|-----------|------|
| GET | `/api/membership-config` | Leer configuración de membresía | 🔑 |
| PUT | `/api/membership-config` | Actualizar configuración | 🔑 |
| GET | `/api/memberships` | Listar todos los planes | 🔑 |
| GET | `/api/memberships/available` | Listar planes disponibles | 🌐 |
| GET | `/api/memberships/{id}` | Ver un plan | 🔑 |
| POST | `/api/memberships` | Crear plan | 🔑 |
| PUT | `/api/memberships/{id}` | Actualizar plan | 🔑 |
| DELETE | `/api/memberships/{id}` | Eliminar plan | 🔑 |
| GET | `/api/user-memberships/all` | Listar todas las suscripciones | 🔑 |
| POST | `/api/user-memberships` | Contratar una membresía | 🔑 |
| PUT | `/api/user-memberships/{id}/activate` | Activar una suscripción | 🔑 |
| PUT | `/api/user-memberships/{id}/suspend` | Suspender una suscripción | 🔑 |
| PUT | `/api/user-memberships/{id}/cancel` | Cancelar una suscripción | 🔑 |
| GET | `/api/user-memberships/user/{userId}` | Membresías de un usuario | 🔑 |
| GET | `/api/user-memberships/user/{userId}/remaining-days` | Días restantes de un usuario | 🔑 |
| GET | `/api/user-memberships/user/{userId}/permission/{permission}` | Verificar un permiso | 🌐 |
| POST | `/api/payments/create-payment-intent` | Crear un PaymentIntent en Stripe | 🔑 |
| POST | `/api/payments/confirm-payment` | Confirmar el pago | 🔑 |
| GET | `/api/payments/all` | Listar todos los pagos | 🔑 |
| POST | `/api/diagnostic/test-payment` | 🔧 Prueba de pago | 🔑 |
| GET | `/api/diagnostic/check-table-structure` | 🔧 Inspeccionar tabla | 🔑 |
| GET | `/api/diagnostic/simple-test` | 🔧 Prueba de conectividad | 🔑 |
| GET | `/api/diagnostic/user-membership/{userId}` | 🔧 Inspeccionar membresía | 🔑 |
| GET | `/api/diagnostic/check-user-membership-table` | 🔧 Inspeccionar tabla | 🔑 |
| GET | `/api/inspector/payment-table-structure` | 🔧 Ver esquema de `payment` | 🔑 |

🔑 Requiere JWT · 🌐 Público (`permitAll`)

> 🔴 **Los 6 endpoints marcados 🔧 son herramientas de depuración.** Exigen un JWT
> válido, pero no exigen rol `Admin`, así que cualquier socio autenticado puede invocarlos
> y ver la estructura de las tablas. `/api/diagnostic/test-payment` además **dispara un
> pago real** en modo producción si el código de llamada no distingue el entorno. Ver R-18.

---

## GYMETRA-Qr — `:8090`

**27 endpoints.** Todo lo bajo `/api/exercises/**` y `/api/nutrition/**` es público.

| Verbo | Ruta | Propósito | Auth |
|-------|------|-----------|------|
| GET | `/api/qr-access/me` | QR del usuario autenticado | 🔑 |
| GET | `/api/qr-access/user/{userId}` | QR de un usuario | 🔑 |
| GET | `/api/qr-access/all/{userId}` | Historial de QR de un usuario | 🔑 |
| POST | `/api/qr-access` | Generar un QR | 🔑 |
| GET | `/api/access-log` | Listar accesos | 🔑 |
| POST | `/api/access-log/entrada` | Registrar entrada | 🔑 |
| POST | `/api/access-log/salida` | Registrar salida | 🔑 |
| GET | `/api/branches` | Listar sedes | 🔑 |
| POST | `/api/branches` | Crear sede | 🔑 |
| GET | `/api/memberships-proxy/{userId}` | Proxy de membresía de un usuario (sin invocadores en el producto) | 🔑 |
| GET | `/api/memberships-proxy/{userId}/check-permission/{permission}` | Proxy de verificación de permiso (sin invocadores en el producto) | 🔑 |
| GET | `/api/exercises` | Listar ejercicios | 🌐 |
| GET | `/api/exercises/bodyPart/{bodyPart}` | Ejercicios por parte del cuerpo | 🌐 |
| GET | `/api/exercises/target/{target}` | Ejercicios por músculo objetivo | 🌐 |
| GET | `/api/exercises/equipment/{equipment}` | Ejercicios por equipamiento | 🌐 |
| GET | `/api/exercises/exercise/{id}` | Un ejercicio por ID | 🌐 |
| GET | `/api/exercises/name/{name}` | Un ejercicio por nombre | 🌐 |
| GET | `/api/exercises/targetList` | Valores distintos de `target` | 🌐 |
| GET | `/api/exercises/bodyPartList` | Valores distintos de `body_part` | 🌐 |
| GET | `/api/exercises/equipmentList` | Valores distintos de `equipment` | 🌐 |
| GET | `/api/exercises/{id}/gif` | Binario GIF de un ejercicio | 🌐 |
| POST | `/api/exercises/sync/force` | Forzar sincronización | 🌐 |
| POST | `/api/exercises/sync/clear-and-force` | 🔴 **Borrar y resincronizar** | 🌐 |
| GET | `/api/nutrition/generate` | Generar plan nutricional | 🌐 |
| GET | `/api/nutrition/recipes/{id}` | Ver una receta | 🌐 |
| GET | `/api/nutrition/recipes/{id}/image` | Binario de imagen de receta | 🌐 |
| POST | `/api/nutrition/sync` | Sincronizar recetas | 🌐 |

🔑 Requiere JWT · 🌐 Público (`permitAll`)

> 🔴 **`POST /api/exercises/sync/clear-and-force` es el endpoint más expuesto del
> proyecto.** No requiere token, ejecuta `exerciseRepository.deleteAll()` y luego
> relanza la descarga completa de ~1.300 ejercicios desde la API de terceros. Cualquiera
> que conozca la URL puede:
> 1. Borrar el catálogo de ejercicios.
> 2. Forzar ~1.300 peticiones a RapidAPI, agotando la cuota.
> 3. Durante la ventana de sincronización, dejar a los socios sin rutinas.
>
> Ver R-19.

---

## Convenciones de la API

GYMETRA sigue un estilo REST consistente. Los detalles están en
[`directrices-api.md`](./directrices-api.md).

| Aspecto | Convención |
|---------|------------|
| Prefijo de rutas | `/api` en todos los servicios |
| Versionado | 🔴 No versionado. No hay `/v1` |
| Pluralización | Recursos en plural (`/users`, `/roles`, `/memberships`, `/payments`) |
| Verbos HTTP | GET leer, POST crear/acción, PUT actualizar, PATCH estado parcial, DELETE borrar |
| Respuesta de éxito | El objeto directamente, o `ResponseEntity.ok(...)` |
| Respuesta de borrado | GYMETR-login devuelve `200 OK` con texto plano (`"Usuario eliminado exitosamente"`, `"Rol eliminado exitosamente"`); `DELETE /api/memberships/{id}` devuelve `204 No Content` sin cuerpo |
| Errores | JSON, pero **no uniforme**: Membership y QR emiten `{timestamp, status, error, message}` en su manejador global; GYMETR-login emite `{success, message}` en sus 400; `path` solo aparece en la respuesta por defecto de Spring |
| Fecha | ISO-8601 |
| Moneda | `BigDecimal` con 2 decimales, en la moneda local (sin ISO-4217) |
| Paginación | 🔴 No implementada. `GET /api/payments/all` y `/api/access-log` devuelven todo |
| Filtros | 🔴 No implementados en el listado de accesos ni de pagos |
| Versionado de API | 🔴 Ausente |

> 🔴 **La ausencia de paginación es el problema más serio de la API.** `GET /api/payments/all`
> y `GET /api/access-log` cargan la tabla completa en memoria y la serializan entera.
> `access_log` es la tabla que más crece. Con unos cientos de miles de accesos, la respuesta
> agota la memoria del contenedor o del navegador. Es un vector de denegación de servicio
> trivial de activar.

---

## Autenticación y autorización

Todos los servicios usan **JWT stateless** emitido por AWS Cognito. Ver
[`autenticacion-y-autorizacion.md`](./autenticacion-y-autorizacion.md) para el detalle.

Resumen:

| Servicio | `permitAll()` declarado | Endpoints abiertos |
|----------|-------------------------|--------------------|
| `GYMETR-login` | `/public/**`, docs, swagger, `OPTIONS` | 0 funcionales |
| `GYMETR-Membership` | `/public/**`, `/api/memberships/available`, `/api/user-memberships/user/*/permission/*`, docs, swagger | 2 |
| `GYMETRA-Qr` | `/public/**`, `/api/exercises/**`, `/api/nutrition/**`, docs, swagger | 16 |

---

## Especificación OpenAPI (springdoc)

Cada servicio expone su documentación interactiva:

| Servicio | Swagger UI | JSON |
|----------|------------|------|
| `GYMETR-login` | `http://localhost:8080/swagger-ui.html` | `/v3/api-docs` |
| `GYMETR-Membership` | `http://localhost:8081/swagger-ui.html` | `/api-docs` (redefine `springdoc.api-docs.path`, no existe `/v3/api-docs`) |
| `GYMETRA-Qr` | `http://localhost:8090/swagger-ui.html` | `/v3/api-docs` (no define `springdoc.api-docs.path`) |

> ⚠️ **Las versiones de springdoc difieren** (2.7.0 en Membership, 2.5.0 en QR), lo que
> puede producir contratos ligeramente distintos para operaciones equivalentes. Y las
> rutas de documentación están en `permitAll()` en los tres servicios: **cualquiera puede
> ver el mapa completo de la API en un entorno desplegado.**

---

## Documentos relacionados

- [`directrices-api.md`](./directrices-api.md) — convenciones de diseño
- [`autenticacion-y-autorizacion.md`](./autenticacion-y-autorizacion.md) — JWT, Cognito, roles
- [`../04-requisitos/matriz-de-trazabilidad.md`](../04-requisitos/matriz-de-trazabilidad.md) — qué requisito cubre cada endpoint
- [`../09-microservicios/catalogo-de-servicios.md`](../09-microservicios/catalogo-de-servicios.md) — detalle por servicio
- [`../00-gobernanza/reglas-de-seguridad.md`](../00-gobernanza/reglas-de-seguridad.md) — reglas de seguridad
