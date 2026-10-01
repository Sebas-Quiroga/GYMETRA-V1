# Matriz de trazabilidad

> Qué requisito cubre cada endpoint, qué historia lo implementó y qué regla de negocio
> lo respalda.

## Propósito

La trazabilidad permite responder, para cualquier endpoint del sistema:

1. **¿Por qué existe?** → Requisito (RF) e Historia (HU)
2. **¿Qué regla obedece?** → Regla de dominio
3. **¿Cómo se prueba?** → Criterio de aceptación
4. **¿Qué pasa si lo elimino?** → Impacto en el producto

> **Principio:** cada línea de código tiene un requisito que la justifica. Si un endpoint
> no aparece en esta matriz, es código sin justificación y debe justificarse o eliminarse.

---

## 1. GYMETR-login — `:8080`

| Endpoint | Método | HU | CA | RF | Regla | Servicio |
|----------|--------|----|----|----|-------|----------|
| `/api/auth/users` | GET | HU-005 | CA-1…3 | RF-01 | — | GYMETR-login |
| `/api/auth/users/{userId}` | GET | HU-005 | CA-2 | RF-01 | — | GYMETR-login |
| `/api/auth/users/{userId}` | PUT | HU-003, HU-006 | CA-2 | RF-01 | — | GYMETR-login |
| `/api/auth/users/{userId}` | DELETE | HU-006 | CA-5, CA-6 | RF-01 | — | GYMETR-login |
| `/api/auth/users/{userId}/status` | PATCH | HU-006 | CA-3, CA-4 | RF-01 | — | GYMETR-login |
| `/api/auth/users/sync` | POST | HU-001 | CA-6 | RF-02 | — | GYMETR-login |
| `/api/me` | GET | HU-003 | CA-1, CA-2 | RF-01 | — | GYMETR-login |
| `/api/roles` | POST | HU-007 | CA-1 | RF-02 | R-ID-2 | GYMETR-login |
| `/api/roles` | GET | HU-007 | CA-1 | RF-02 | — | GYMETR-login |
| `/api/roles/{roleId}` | GET | HU-007 | CA-1 | RF-02 | — | GYMETR-login |
| `/api/roles/{roleId}` | PUT | HU-007 | CA-1 | RF-02 | — | GYMETR-login |
| `/api/roles/{roleId}` | DELETE | HU-007 | CA-1 | RF-02 | — | GYMETR-login |

**Cobertura:** 12 endpoints · 3 HUs · 2 RF

---

## 2. GYMETR-Membership — `:8081`

| Endpoint | Método | HU | CA | RF | Regla | Servicio |
|----------|--------|----|----|----|-------|----------|
| `/api/membership-config` | GET | — | — | — | — | ⚠️ Sin HU |
| `/api/membership-config` | PUT | — | — | — | — | ⚠️ Sin HU |
| `/api/memberships` | GET | HU-008 | CA-1 | RF-03 | — | Membership |
| `/api/memberships/available` | GET | HU-008 | CA-1, CA-2 | RF-03 | R-MB-1 | Membership |
| `/api/memberships` | POST | HU-009 | — | RF-03 | R-MB-1 | Membership |
| `/api/memberships/{id}` | GET | HU-008 | CA-3 | RF-03 | — | Membership |
| `/api/memberships/{id}` | PUT | — | — | RF-03 | — | Membership |
| `/api/memberships/{id}` | DELETE | — | — | RF-03 | — | Membership |
| `/api/user-memberships/all` | GET | HU-021 | CA-1 | RF-10 | — | Membership |
| `/api/user-memberships` | POST | HU-009 | CA-1, CA-2 | RF-04 | — | Membership |
| `/api/user-memberships/{id}/activate` | PUT | HU-012 | CA-1 | RF-03 | — | Membership |
| `/api/user-memberships/{id}/suspend` | PUT | HU-012 | CA-2 | RF-03 | — | Membership |
| `/api/user-memberships/{id}/cancel` | PUT | HU-012 | CA-3, CA-4 | RF-03 | — | Membership |
| `/api/user-memberships/user/{userId}` | GET | HU-011 | CA-1 | RF-04 | R-MB-4 | Membership |
| `/api/user-memberships/user/{userId}/remaining-days` | GET | HU-011 | CA-3 | RF-04 | — | Membership |
| `/api/user-memberships/user/{userId}/permission/{permission}` | GET | HU-013 | CA-1, CA-2 | RF-08, RF-09 | R-MB-4 | Membership · ⚠️ `permitAll` |
| `/api/payments/create-payment-intent` | POST | HU-010 | CA-1, CA-2, CA-3 | RF-04 | R-MB-2 | Membership |
| `/api/payments/confirm-payment` | POST | HU-010 | CA-4, CA-5, CA-6, CA-8 | RF-04 | R-MB-2, R-MB-3 | Membership |
| `/api/payments/all` | GET | HU-021 | CA-1 | RF-10 | — | Membership |
| `/api/diagnostic/*` | GET, POST | HU-024 | — | — | — | ⚠️ **Herramientas de depuración en producción** |
| `/api/inspector/payment-table-structure` | GET | — | — | — | — | ⚠️ **Expone el esquema de la BD** |

**Cobertura:** 25 endpoints · 6 HUs · 4 RF

> 🔴 **Hallazgos de esta tabla:**
> - `/api/diagnostic/test-payment`, `/check-table-structure`, `/simple-test`,
>   `/check-user-membership-table` y `/api/inspector/payment-table-structure` son
>   **herramientas de depuración** que exponen estructura de la base de datos y disparan
>   pagos de prueba. No están en `permitAll()`, así que exigen un JWT válido, pero
>   **tampoco exigen rol `Admin`**: cualquier socio autenticado puede llamarlos y ver el
>   esquema de las tablas. No deberían existir en un entorno desplegado. Ver R-18.
> - `/api/membership-config` no tiene historia de usuario: código sin justificación
>   documentada.

---

## 3. GYMETRA-Qr — `:8090`

| Endpoint | Método | HU | CA | RF | Regla | Servicio |
|----------|--------|----|----|----|-------|----------|
| `/api/qr-access/me` | GET | HU-014 | CA-1 | RF-05 | R-AC-5 | QR |
| `/api/qr-access/user/{userId}` | GET | HU-014 | CA-1 | RF-05 | R-AC-5 | QR |
| `/api/qr-access/all/{userId}` | GET | HU-017 | CA-1 | RF-07 | — | QR |
| `/api/qr-access` | POST | HU-014 | CA-2 | RF-05 | R-MB-4 | QR |
| `/api/access-log` | GET | HU-017 | CA-1, CA-2 | RF-07 | — | QR |
| `/api/access-log/entrada` | POST | HU-015 | CA-1, CA-2, CA-3 | RF-06, RF-07 | R-AC-1, R-AC-2 | QR |
| `/api/access-log/salida` | POST | HU-016 | CA-1, CA-2 | RF-07 | R-AC-4 | QR |
| `/api/branches` | GET | HU-018 | CA-1 | RF-07 | — | QR |
| `/api/branches` | POST | HU-018 | CA-2, CA-3 | RF-07 | — | QR |
| `/api/memberships-proxy/{userId}` | GET | HU-015 | CA-7 | RF-06 | R-MB-4 | QR · sin invocadores |
| `/api/memberships-proxy/{userId}/check-permission/{permission}` | GET | HU-013 | CA-1 | RF-08, RF-09 | R-MB-4 | QR · sin invocadores |
| `/api/exercises` | GET | HU-019 | CA-1 | RF-08 | — | QR · `permitAll` |
| `/api/exercises/bodyPart/{bodyPart}` | GET | HU-019 | CA-2 | RF-08 | — | QR · `permitAll` |
| `/api/exercises/target/{target}` | GET | HU-019 | CA-3 | RF-08 | — | QR · `permitAll` |
| `/api/exercises/equipment/{equipment}` | GET | HU-019 | CA-4 | RF-08 | — | QR · `permitAll` |
| `/api/exercises/exercise/{id}` | GET | HU-019 | CA-1 | RF-08 | — | QR · `permitAll` |
| `/api/exercises/name/{name}` | GET | HU-019 | CA-5 | RF-08 | — | QR · `permitAll` |
| `/api/exercises/targetList` | GET | HU-019 | CA-6 | RF-08 | — | QR · `permitAll` |
| `/api/exercises/bodyPartList` | GET | HU-019 | CA-6 | RF-08 | — | QR · `permitAll` |
| `/api/exercises/equipmentList` | GET | HU-019 | CA-6 | RF-08 | — | QR · `permitAll` |
| `/api/exercises/{id}/gif` | GET | HU-019 | CA-7 | RF-08 | — | QR · `permitAll` |
| `/api/exercises/sync/force` | POST | HU-019 | CA-9 | RF-08 | — | QR · `permitAll` |
| `/api/exercises/sync/clear-and-force` | POST | HU-019 | CA-9 | RF-08 | — | QR · `permitAll` |
| `/api/nutrition/generate` | GET | HU-020 | CA-1…5 | RF-09 | R-BE-1 | QR · `permitAll` |
| `/api/nutrition/recipes/{id}` | GET | HU-020 | CA-6 | RF-09 | — | QR · `permitAll` |
| `/api/nutrition/recipes/{id}/image` | GET | HU-020 | CA-7 | RF-09 | — | QR · `permitAll` |
| `/api/nutrition/sync` | POST | HU-020 | CA-8 | RF-09 | — | QR · `permitAll` |

**Cobertura:** 27 endpoints · 6 HUs · 5 RF

> 🔴 **Hallazgo:** `POST /api/exercises/sync/clear-and-force` está en `permitAll()` y
> ejecuta `exerciseRepository.deleteAll()` seguido de una resincronización completa de
> ~1.300 ejercicios. **Cualquiera sin autenticación puede borrar el catálogo de
> ejercicios del sistema.** Es el endpoint más expuesto del proyecto. Ver R-19.

---

## 4. Cobertura de requisitos por endpoint

| Requisito | Endpoints que lo cubren | Estado |
|-----------|------------------------|--------|
| **RF-01** Gestión de usuarios | 6 | ✅ Completo |
| **RF-02** Autenticación y autorización | 6 (+ validación en los 52 restantes) | ⚠️ Parcial (no hay endpoint de alta de socios) |
| **RF-03** Planes de membresía | 9 | ✅ Completo |
| **RF-04** Adquisición y pagos | 5 | ✅ Completo |
| **RF-05** Generación de QR | 3 | ✅ Completo |
| **RF-06** Validación de QR | 2 | ⚠️ Parcial (CA-6 sin implementar) |
| **RF-07** Historial de accesos | 6 | ⚠️ Parcial (denegados no se registran) |
| **RF-08** Rutinas de ejercicio | 14 | 🔴 Bloqueado por R-01 |
| **RF-09** Planes de nutrición | 6 | 🔴 Bloqueado por R-01 |
| **RF-10** Dashboard de métricas | 2 | ⚠️ Parcial (sin filtros ni retención) |

**Total: 64 endpoints** (12 + 25 + 27)

> 6 endpoints quedan **sin requisito asociado**: los 2 de `/api/membership-config`, los 5 de
> `/api/diagnostic/*` y el de `/api/inspector/payment-table-structure`. Los 5 de diagnóstico se
> listan agrupados en una sola fila, por eso la tabla tiene 60 filas y no 64.
>
> RF-08 y RF-09 cuentan cada una los 2 endpoints de verificación de permiso
> (`/api/user-memberships/user/*/permission/*` y su proxy en QR), por eso un mismo endpoint
> aparece en dos requisitos.

---

## 5. Cobertura de reglas de negocio

| Regla | ¿Algún endpoint la protege? | ¿Alguna prueba la verifica? |
|-------|-----------------------------|------------------------------|
| R-ID-1 Email único | Sí — restricción de BD | ❌ No |
| R-ID-2 Rol único por usuario | Sí — restricción de BD | ❌ No |
| R-MB-1 Solo planes disponibles | Sí | ❌ No |
| R-MB-2 Monto mayor que cero | Sí | ❌ No |
| R-MB-3 Pago completo | Sí | ❌ No |
| R-MB-4 Solo `ACTIVE` concede | Sí | ❌ No |
| R-ACC-1 Sin membresía no hay acceso | Sí | ❌ No |
| R-ACC-2 Sin doble entrada por turno | Sí | ❌ No |
| R-ACC-3 Turnos 06-12 / 12-22 | Sí | ❌ No |
| R-ACC-4 Salida cierra ingreso | Sí | ❌ No |
| R-ACC-5 Revalidación cada 12 h | Sí | ❌ No |
| R-BE-1 Distribución 25/45/30 | Sí | ❌ No |
| R-BE-2 Traducción al español | Sí | ❌ No |

> **13 reglas de negocio, 0 pruebas.** La columna derecha es la que debería preocupa al
> equipo: cada regla podría romperse en un refactor sin que nadie lo note. Es el
> argumento central a favor de RNF-21 y RNF-22.

---

## 6. Trazabilidad inversa

### ¿Qué se rompe si elimino este servicio?

| Servicio | Dependientes | Impacto |
|----------|--------------|---------|
| **GYMETR-login** | Ambos frontends, indirectamente Membership y QR | 🔴 **Total** — sin identidad no hay JWT ni acceso a nada |
| **GYMETR-Membership** | Frontends, servicio QR | 🔴 **Alto** — sin membresías no hay pagos, ni QR, ni acceso |
| **GYMETRA-Qr** | Frontends, ¿depende de Membership? | 🟠 **Medio** — Exercise/Recipe siguen funcionando sin Membership; el acceso QR no |
| **AWS Cognito** | Los tres backends y ambos frontends | 🔴 **Total** — sin Cognito no hay autenticación |
| **Stripe** | Solo Membership | 🟡 **Parcial** — el resto del sistema sigue funcionando |
| **Spoonacular / ExerciseDB** | Solo QR | 🟢 **Bajo** — se usan datos ya sincronizados |
| **PostgreSQL** | Los tres | 🔴 **Total** — no hay persistencia alternativa |

---

## 7. Documentos relacionados

- [`historias-de-usuario.md`](./historias-de-usuario.md) — las HU con sus criterios
- [`no-funcionales.md`](./no-funcionales.md) — atributos de calidad
- [`../02-dominio/entidades-y-reglas.md`](../02-dominio/entidades-y-reglas.md) — reglas R-xx
- [`../09-microservicios/catalogo-de-servicios.md`](../09-microservicios/catalogo-de-servicios.md) — endpoints por servicio
