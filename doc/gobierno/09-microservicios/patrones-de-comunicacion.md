# Patrones de comunicación

> Cómo se hablan los servicios de GYMETRA, qué se usa hoy y qué queda pendiente. Los patrones se
> eligen por el tipo de acoplamiento que toleran, no por moda.

---

## Patrones disponibles y cuáles usa GYMETRA

| Patrón | Acoplamiento | ¿En GYMETRA? | Dónde |
|--------|--------------|--------------|-------|
| **Llamada REST síncrona** | Fuerte | ✅ En uso | `GYMETRA-Qr` → `GYMETR-Membership` |
| **Base de datos compartida** | Muy fuerte | ⚠️ En uso, no declarado | Los tres servicios sobre `gymdb` |
| **Eventos de dominio** | Débil | ❌ No | Ninguno |
| **Cola de mensajes** | Débil | ❌ No | No hay broker |
| **gRPC** | Medio | ❌ No | — |
| **GraphQL** | Medio | ❌ No | — |
| **Webhook** | Medio | ❌ No | — |
| **Polling** | Débil | ❌ No | — |
| **CQRS** | — | ❌ No | — |
| **Sagas** | — | ❌ No | — |

---

## La llamada síncrona que sí existe

### Contexto

Es la única llamada interna del sistema y concentra el riesgo más alto: **el estado de acceso
depende de que Membership responda.** Hay tres caminos distintos y no conviene confundirlos.

#### A. Ingreso al gimnasio — el camino del negocio

```
Socio/curl → GYMETRA-Qr : POST /api/access-log/entrada { userId, branchId }
              AccessLogBusinessService.marcarIngreso
                → QrBusinessService.getOrCreateQrForUser(userId)
                  1. SELECT qr_access WHERE user_id=? AND status='active'   [local]
                  2. si el QR tiene más de 12h (o si es nuevo):
                     → GYMETR-Membership : GET /api/user-memberships/user/{userId}
                     ← [{status:"ACTIVE"|...}, ...]   (TODAS las membresías)
                       filtro en memoria: alguna con status == "ACTIVE"
                3. SELECT access_log (findAll) + filtro en memoria de turno
                4. INSERT access_log (result='granted')
              ← 200 / 400
```

> **El flujo de entrada no pasa por `check-permission`.** Pide el listado completo de
> membresías y decide en memoria con `status == "ACTIVE"`. Las denegaciones no quedan en
> `access_log`: esa tabla solo registra entradas concedidas (R-14).

#### B. Ejercicios — el único `checkPermission` que se ejecuta

```
Socio → GYMETRA-Qr : GET /api/exercises/...   (4 de los 12 endpoints)
         ExerciseController, lee el header X-User-Id (NO el JWT)
           → MembershipProxyService.checkPermission(userId, "training")  [bean, mismo proceso]
              → GYMETR-Membership : GET /api/user-memberships/user/{userId}/permission/training
              ← true / false     (403 si es false o si falta el header)
```

`MembershipProxyService` es un bean Java: la llamada ocurre **dentro del proceso de QR**, no
mediante el endpoint HTTP `check-permission`. El resto de endpoints de `ExerciseController` y
todos los de `NutritionController` no consultan a Membership.

#### C. `/api/memberships-proxy/**` — expuesto, pero nadie lo invoca

| Endpoint (vive en QR, :8090) | Quién lo dispara |
|-------------------------------|------------------|
| `GET /api/memberships-proxy/{userId}` | Solo `static/membership-test.html` y `curl` |
| `GET /api/memberships-proxy/{userId}/check-permission/{permission}` | Ningún cliente: solo `curl` |

Ningún frontend lo usa. Los frontends llaman a Membership **directamente**:
`useQrAccess.ts` y `useUserMembership.ts` usan `GET /api/user-memberships/user/{userId}`.
Ambos endpoints exigen JWT: no están en el `permitAll()` de QR.

### Configuración actual

| Propiedad | Valor | Ubicación |
|-----------|-------|-----------|
| URL del servicio | `http://localhost:8081/api` | `application.properties` de QR |
| Variable de entorno | Ninguna: la URL está fija | `app.services.membership-url` |
| Cliente HTTP | `new RestTemplate()` | `SecurityConfig` de QR |
| Timeout de conexión | **No definido** | `SecurityConfig` de QR |
| Timeout de lectura | **No definido** | `SecurityConfig` de QR |
| Reintentos | **No definidos** | — |
| Circuit breaker | **No implementado** | — |
| Valor por defecto ante fallo | **No implementado: deniega el acceso** | — |
| Autenticación de la llamada | **Ninguna**: va sin token | — |

> ⚠️ **La llamada va sin token y Membership exige JWT.** `GET /api/user-memberships/user/{userId}`
> **no** está en el `permitAll()` de Membership (ahí solo están `/*/permission/*` y
> `/api/memberships/available`). Por análisis estático esa llamada devuelve 401;
> `getMembershipStatus()` captura la excepción y devuelve `false`, con lo que el QR queda
> `inactive` y el ingreso se deniega. El endpoint de permisos sí es público y responde
> normalmente. Detalle en R-28.

### Consecuencias

| Escenario | Resultado actual |
|-----------|------------------|
| Membership está caído | **El gimnasio no admite a nadie**, aunque las membresías sean válidas |
| Membership responde lento | La petición de acceso se cuelga sin timeout |
| Membership se despliega y cambia su contrato | QR falla en silencio si el proxy no está actualizado |
| Se escala Membership | Se escala también QR, porque la latencia se suma |

---

## La comunicación real: la base de datos

Sin eventos ni colas, los servicios se comunican por la base de datos. No es un patrón, es una
consecuencia de cómo se construyó, y es la razón de tres riesgos:

| Consecuencia | Riesgo |
|--------------|--------|
| Los tres servicios se pisan en las mismas tablas | R-12 |
| Borrar un usuario arrastra pagos y accesos | R-22 |
| Cambiar el estado de un socio no notifica a nadie | R-23 |
| La membresía vencida sigue concediendo acceso | R-06 |

---

## Eventos que harían falta

Estos son los eventos que el sistema necesita y no tiene. Cada uno resolvería un riesgo concreto:

| Evento | Publica | Consume | Riesgo que resuelve | Prioridad |
|--------|---------|---------|---------------------|-----------|
| `membership.expired` | Membership | QR | R-06 | 🔴 Alta |
| `membership.cancelled` | Membership | QR | R-06, R-23 | 🔴 Alta |
| `user.suspended` | Login | Membership, QR | R-23 | 🔴 Alta |
| `user.role_changed` | Login | Membership, QR | R-16, R-21 | 🟠 Media |
| `payment.completed` | Membership | Login, QR | R-01 | 🟠 Media |
| `user.registered` | Login | Membership | R-21 | 🟠 Media |
| `access.denied` | QR | — (analítica) | R-14 | 🟡 Baja |
| `exercise.catalog_synced` | QR | — (operación) | R-27 | 🟡 Baja |

---

## Especificación de un evento

Si se implementa el primer evento, esta es la ficha que debe acompañarlo:

```markdown
### Evento: `membership.expired`

**Publica:** GYMETR-Membership
**Consume:** GYMETRA-Qr
**Transporte:** cola de mensajes (a definir)
**Entrega:** al menos una vez, con reintentos y cola de fallidos

#### Esquema

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `eventId` | UUID | Sí | Identificador único del evento |
| `occurredAt` | ISO-8601 | Sí | Momento en que ocurrió el hecho |
| `userId` | Long | Sí | Socio afectado |
| `membershipId` | Long | No | Suscripción que expiró |
| `endDate` | date | Sí | Fecha de vencimiento que se superó |
| `source` | string | Sí | "scheduler" o "admin" |

#### Garantías

- El consumidor es idempotente: puede recibir el mismo evento dos veces sin efecto duplicado.
- Los eventos nunca se reordenan dentro de la misma clave de partición (`userId`).
- Un evento no consumido no bloquea al productor.

#### Manejo de errores

| Fallo | Reintentos | Destino final |
|-------|-----------|---------------|
| QR caído | 5, con espera creciente | Cola de fallidos, reintento manual |
| Membresía ya expirada | 0, se descarta | Registro de depuración |
| `userId` desconocido | 0 | Cola de fallidos, alerta al equipo |
```

---

## Pautas de implementación

| Pauta | Motivo |
|-------|--------|
| Los eventos llevan su propia versión | Un cambio de esquema no debe romper a los consumidores |
| El productor no espera respuesta | Un evento nunca es síncrono por definición |
| El consumidor registra los accesos denegados | Es el dato que hoy se pierde (R-14) |
| La clave de partición es `userId` | Garantiza orden por socio |
| Un evento nunca lleva datos personales sensibles | Se transportan por colas con retención limitada |

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`catalogo-de-servicios.md`](catalogo-de-servicios.md) | Matriz de comunicación entre servicios |
| [`reglas-de-frontera.md`](reglas-de-frontera.md) | Qué puede hacer cada servicio |
| [`07-api/`](../07-api/README.md) | Contratos HTTP de la llamada síncrona |
| [`02-dominio/eventos-de-dominio.md`](../02-dominio/eventos-de-dominio.md) | Eventos definidos en el modelo de dominio |
| [`R-06`](../15-control-proyecto/riesgos.md) | Riesgo que motiva el evento más urgente |
