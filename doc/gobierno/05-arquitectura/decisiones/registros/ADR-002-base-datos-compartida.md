# ADR-002 — Base de datos compartida entre microservicios

| Campo | Valor |
|-------|-------|
| **ID** | ADR-002 |
| **Título** | Base de datos compartida entre microservicios |
| **Fecha** | 2026-09 |
| **Estado** | Accepted |
| **Decisor** | Equipo GYMETRA |
| **Revisado por** | Arquitectura GYMETRA |
| **Reemplaza** | — |
| **Impacto** | 🔴 **Alto** |

---

## 1. Contexto

GYMETRA se implementó como tres microservicios Spring Boot: `GYMETR-login`,
`GYMETR-Membership` y `GYMETRA-Qr`. La decisión habitual en una arquitectura de
microservicios es que **cada servicio tenga su propia base de datos**, y que si necesita
datos de otro, se los pida por su API.

En la práctica, los tres servicios se configuraragainst la **misma base de datos
`gymdb`**, y comparten sus tablas. `GYMETR-login` lee y escribe `"user"`; Membership lee
`"user"` para asociar socios a planes; QR lee `"user"` para validar el propietario de un QR.

**Restricciones del proyecto:**

- Equipo pequeño, sin tiempo ni infraestructura para operar tres bases de datos.
- Un solo servidor de aplicación en desarrollo.
- Docker Compose como mecanismo de orquestación.

---

## 2. Decisión

**Los tres microservicios comparten una única instancia de PostgreSQL (`gymdb`) y sus
tablas.**

En la práctica esto significa que la independencia de datos es aparente, no real: cada
servicio lee y escribe directamente en las tablas de los demás, sin pasar por su API.

### Alternativas consideradas

| Alternativa | Ventajas | Desventajas | ¿Por qué se descartó? |
|-------------|----------|--------------|------------------------|
| **Base por servicio** | Autonomía real, escalado independiente, sin acoplamiento de esquema | 3 instancias que operar, migraciones separadas, más complejidad de despliegue | Exigía más infraestructura de la que el equipo podía sostener al inicio |
| **Esquema por servicio en la misma base** | Autonomía de esquema, una sola instancia | Sigue habiendo acoplamiento, una caída afecta a todos | Intermedio, pero no se implementó |
| **Base compartida (elegida)** | Una sola instancia, backups y migraciones simples, cero configuración | Acoplamiento fuerte, `DROP TABLE` en uno rompe los otros, no se puede escalar ni soberano | Se eligió por simplicidad operativa |

**Fundamento:** con un equipo reducido, operar tres bases de datos habría costado más que
el beneficio de la autonomía. Se aceptó el acoplamiento como **deuda técnica consciente**
para poder avanzar rápido.

---

## 3. Consecuencias

### Positivas

- Una sola instancia que respaldar, monitorear y mantener.
- Las consultas de negocio (pago + membresía + usuario) se resuelven con SQL directo o
  `JOIN`, sin viajes de red.
- El arranque es más rápido: un solo contenedor de base de datos.
- Menos configuración en los tres servicios.

### Negativas

- ⚠️ **La autonomía de datos es ficticia.** GYMETRA no puede escalarse de forma
  independiente porque todos compiten por los mismos recursos de base de datos.
- ⚠️ **Un `DROP TABLE` o un `TRUNCATE` en un servicio destruye los datos de los otros.**
  Y eso ya pasó: `POST /api/exercises/sync/clear-and-force` hace
  `exerciseRepository.deleteAll()` y está en `permitAll()`. Cualquier persona sin
  autenticación puede borrar el catálogo.
- ⚠️ **Los cambios de esquema son Acoplados.** Si Membership añade una columna a
  `"user"`, los otros dos servicios deben seguir funcionando contra el esquema nuevo. Sin
  migraciones por servicio, cualquier cambio requiere coordinar los despliegues.
- ⚠️ **No se puede ubicar un servicio cerca de sus datos.** Con una base compartida, los
  tres servicios están en la misma región por obligación.
- ⚠️ **Las pruebas de integración son interdependientes.** Un servicio no se puede probar
  aislado de los datos de los otros.
- ⚠️ **El borrado de datos de un usuario es inconsistente.** No hay cascada de borrado
  entre servicios: si se elimina un usuario en `login`, sus membresías y registros de
  acceso quedan huérfanos.

### Neutras

- El punto único de fallo sigue siendo uno, tanto si hay una base como tres. La
  diferencia es el alcance del fallo.

---

## 4. Alternativas para el futuro

**Revisar esta decisión si:**

- El volumen de datos de acceso (la tabla más grande) hace que la base compartida sea un
  cuello de botella.
- Se necesita escalar servicios de forma independiente.
- Se alcanza una disponibilidad que no permita un punto único de fallo.
- Se decide migrar a eventos en vez de REST síncrono (ver
  [ADR-006](./ADR-006-proxy-validacion-membresia.md)).

**Ruta de migración sugerida:**

1. Crear la tabla de datos en el servicio propietario y conceder acceso de solo lectura a
   los demás.
2. Exponer esos datos por API en lugar de por SQL.
3. Darle al servicio propietario su propia base.
4. Repetir con los demás servicios.

> **Nota:** no hay fecha comprometida para esta migración. Es el deuda técnica más
> importante del sistema, y está registrada como riesgo R-12 en
> [`15-control-proyecto/riesgos.md`](../../../15-control-proyecto/riesgos.md).

---

## 5. Estado de implementación

| Aspecto | Estado |
|---------|--------|
| ¿Está implementado? | Sí |
| ¿Desde cuándo? | Desde el inicio del proyecto |
| ¿Dónde? | `docker-compose.yml` (servicio `database`), la configuración de los tres servicios (`application.yml` en GYMETR-login, `application.properties` en Membership y en QR), todas apuntan a `jdbc:postgresql://localhost:5432/gymdb` |
| ¿Documentado? | Este ADR, sección de datos, mapa de dominio |

---

## Documentos relacionados

- [ADR-005 — PostgreSQL como almacén de datos](./ADR-005-base-datos-postgresql.md) — por qué PostgreSQL
- [ADR-006 — Validación de membresía por proxy HTTP](./ADR-006-proxy-validacion-membresia.md) — la alternativa que la base compartida volvió inviable
- [vision-general.md](../../vision-general.md) — vista de contenedores
- [`../../../06-datos/modelo-de-datos.md`](../../../06-datos/modelo-de-datos.md) — estructura de la base
- [`../../../02-dominio/mapa-de-dominio.md`](../../../02-dominio/mapa-de-dominio.md) — límites de contexto de facto
