# GYMETRA-Qr

> Servicio de control de acceso, QR y contenido externo. Es el que depende de otro servicio:
> llama a `GYMETR-Membership` para decidir si concede el acceso. También consume APIs externas
> (Spoonacular, ExerciseDB, MyMemory) y las expone a través del backend.

---

## Ubicación en la arquitectura

| Campo | Valor |
|-------|-------|
| **Carpeta** | `backend/GYMETRA - Qr` (con espacio en el nombre del directorio) |
| **Paquete raíz** | `com.GYMETRA.GYMETRA` (subpaquete `qr`) |
| **Puerto** | 8090 |
| **Spring Boot** | 3.5.5 |
| **Java** | 17 |
| **Documentación API** | springdoc 2.5.0 |
| **Depende de** | `GYMETR-Membership`, puerto 8081 |
| **Consumido por** | Frontend del socio y frontend de administración |
| **APIs externas** | Spoonacular, ExerciseDB (RapidAPI), MyMemory (traductor) |

---

## Responsabilidades (lo que SÍ hace)

- **Control de acceso**: genera códigos QR, valida el acceso y registra entradas/salidas en `access_log`.
- **Consulta de membresía**: pregunta a Membership si un usuario tiene un permiso para entrar.
- **Sucursales**: alta y consulta de `branch`.
- **Ejercicios**: catálogo de ejercicios y sincronización con ExerciseDB.
- **Nutrición**: recetas y búsqueda a través de Spoonacular.
- **Traducción**: traduce textos usando MyMemory.

---

## Fuera de alcance (lo que NO hace)

| No hace | Por qué no le corresponde |
|---------|---------------------------|
| Decidir la vigencia de una membresía | Eso es de `GYMETR-Membership` |
| Crear o modificar usuarios | Eso es de `GYMETR-login` |
| Administrar planes o pagos | Eso es de `GYMETR-Membership` |
| Emitir facturas | Fuera del alcance |
| Guardar las claves de terceros en el frontend | Las claves deben quedarse en el backend (R-09) |

---

## Controladores

| Controlador | Ruta base | Endpoints |
|-------------|-----------|-----------|
| `QrAccessController` | `/api/qr-access` | 4 |
| `AccessLogController` | `/api/access-log` | 3 |
| `MembershipProxyController` | `/api/memberships-proxy` | 2 |
| `BranchController` | `/api/branches` | 2 |
| `ExerciseController` | `/api/exercises` | 12 (12 públicos) |
| `NutritionController` | `/api/nutrition` | 4 (4 públicos) |
| **Total** | | **27** (16 públicos, 11 autenticados) |

Los 16 endpoints públicos son **todos** los de `ExerciseController` y `NutritionController`: el
`SecurityConfig` de QR abre `/api/exercises/**` y `/api/nutrition/**` sin autenticación. Los 11
restantes —acceso, registro, sucursales y proxy— requieren token.

> Esa apertura tiene un coste que no es evidente en la tabla: `POST /api/exercises/sync/clear-and-force`
> es público y **borra todo el catálogo de ejercicios** (R-19). Un `curl` sin token puede vaciarlo.

---

## Comunicación con otros servicios

QR es el **único servicio que llama a otro**. Conviene separar tres cosas que se suelen confundir.

### 1. El frontend llama a Membership directamente (sin pasar por QR)

```http
GET http://localhost:8081/api/user-memberships/user/{userId}
```

Lo hacen `useQrAccess.ts` y `useUserMembership.ts` con el JWT del socio. Exige token.

### 2. QR llama a Membership con un `RestTemplate` sin token

```http
GET http://localhost:8081/api/user-memberships/user/{userId}
GET http://localhost:8081/api/user-memberships/user/{userId}/permission/{permission}
```

- **El primero** lo invoca `QrBusinessService.getMembershipStatus()` dentro de
  `POST /api/access-log/entrada`. No está en el `permitAll()` de Membership, así que devuelve
  **401**; la excepción se captura, se devuelve `false` y el QR queda `inactive`, con lo que el
  ingreso se deniega (R-28).
- **El segundo** lo invoca el bean `MembershipProxyService.checkPermission()`, que usan
  **4 de los 12 endpoints** de `ExerciseController` (leen el header `X-User-Id`, no el JWT).
  Sí es **público** (R-18): cualquiera puede enumerar quién tiene `training` o `nutrition`.

### 3. `/api/memberships-proxy/**` vive en QR y nadie lo invoca

```http
GET /api/memberships-proxy/{userId}
GET /api/memberships-proxy/{userId}/check-permission/{permission}
```

`MembershipProxyController`, en `http://localhost:8090`. Exige JWT (no está en `permitAll`).
Solo los llaman `static/membership-test.html` y un `curl` manual: **ningún frontend los usa**.

```text
Frontend ──GET /api/user-memberships/user/{userId}──► Membership   (con JWT)

QR ──GET /api/user-memberships/user/{userId}────────► Membership   (sin token → 401, R-28)
QR ──GET /api/user-memberships/user/{userId}/permission/{p}──► Membership   (público, R-18)
```

| Propiedad | Valor | Estado |
|-----------|-------|--------|
| URL | `http://localhost:8081/api` (fijo en `application.properties`) | Sin variable de entorno |
| Cliente HTTP | `new RestTemplate()` (bean en `SecurityConfig`) | Sin interceptores |
| Timeout de conexión | **No definido** | ❌ R-12 |
| Timeout de lectura | **No definido** | ❌ R-12 |
| Reintentos | **No definidos** | ❌ R-12 |
| Circuit breaker | **No implementado** | ❌ R-12 |
| Fallback | **No implementado** | ❌ R-12 |
| Autenticación entre servicios | **Ninguna**: va sin token | ❌ R-28 |

Si Membership no responde, el acceso se bloquea. No hay degradación: las excepciones se
capturan y se devuelve `false`, y el socio recibe "sin acceso" sin ninguna diferencia
respecto a "no tiene membresía" (R-14, R-28).

---

## APIs externas

| Servicio | URL base | Claves en `application.properties` |
|----------|----------|------------------------------------|
| Spoonacular | `https://api.spoonacular.com` | `spoonacular.api.key` (con valor por defecto) |
| ExerciseDB (RapidAPI) | `https://exercisedb.p.rapidapi.com` | `rapidapi.exercise.key` y `rapidapi.exercise.host` |
| MyMemory | `https://api.mymemory.translated.net` | Ninguna (clave opcional) |

**Punto crítico:** `VITE_SPOONACULAR_API_KEY` aparece en instrucciones del frontend, pero **no existe
en ningún `.env`**. El código de frontend intenta leerla y la documentación indica añadirla, lo
que expondría esa clave en el bundle JavaScript (R-09, R-15).

---

## Cómo ejecutarlo en local

### Requisitos

- JDK 17
- Maven 3.8 o superior
- PostgreSQL 15 con `gymdb` creada
- `GYMETR-Membership` corriendo en 8081

### Variables de entorno

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/gymdb
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=<tu contraseña>

# APIs externas (opcional para desarrollo)
export SPOONACULAR_API_KEY=<clave>
export RAPIDAPI_EXERCISE_KEY=<clave>
export RAPIDAPI_EXERCISE_HOST=exercisedb.p.rapidapi.com
```

> `application.properties` tiene valores por defecto para las claves. **Nunca** se deben usar esas
> claves en producción: el valor por defecto puede quedar comprometido (R-09).

### Arranque

```bash
cd "backend/GYMETRA - Qr"
mvn spring-boot:run
```

### Verificación

```bash
# Sucursales
curl -i http://localhost:8090/api/branches

# Acceso log (requiere token)
curl -i http://localhost:8090/api/access-log

# Verificar que ve a Membership
curl -i http://localhost:8090/api/memberships-proxy/1/check-permission/training
```

> **No hay endpoint de salud.** Igual que los otros dos servicios.

---

## Documentos de este servicio

| Documento | Contenido |
|-----------|-----------|
| [`modelo-de-datos.md`](modelo-de-datos.md) | Tablas `qr_access`, `access_log`, `branch`, `exercises`, `recipes` y `user` (`UserMin`, solo lectura) |
| [`decisiones.md`](decisiones.md) | Dependencia crítica de Membership, claves externas, traductor |
| [`eventos.md`](eventos.md) | Publica y consume: hoy, ninguno |
| [`runbook.md`](runbook.md) | Qué hacer cuando falla, especialmente cuando cae Membership |
