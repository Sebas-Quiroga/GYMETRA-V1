# 00 — Gobernanza del proyecto

> **¿Qué es esto?** Las reglas que rigen cómo trabaja el equipo de GYMETRA: cómo se
> nombra el código, cómo se usa Git, cuándo se considera una historia terminada y
> qué está prohibido hacer con los datos de los socios.

## Por qué importa la gobernanza

En un sistema distribuido, la coordinación es el producto. El código se puede refactorizar
en una tarde, pero las reglas que impiden que dos personas rompan la misma base de datos,
suban el mismo commit dos veces o filtren una API key, **se pierden para siempre** si no
están escritas.

Esta sección es el contrato social del equipo. Si algo aquí no se cumple, el problema no es
el documento: es que la regla es difícil de cumplir y hay que cambiarla.

---

## Contenido de esta sección

| Documento | Propósito | Estado |
|-----------|-----------|--------|
| [`convenciones-git.md`](./convenciones-git.md) | Ramas, commits, pull requests, flujo de trabajo | Vigente |
| [`convenciones-agil.md`](./convenciones-agil.md) | Sprints, ceremonias, roles, HU | Vigente |
| [`definicion-de-listo.md`](./definicion-de-listo.md) | DoR — criterios para tomar una HU | Vigente |
| [`definicion-de-hecho.md`](./definicion-de-hecho.md) | DoD — criterios para cerrar una HU | Vigente |
| [`reglas-de-documentacion.md`](./reglas-de-documentacion.md) | Cuándo y cómo se escribe documentación | Vigente |
| [`documentacion-de-microservicios.md`](./documentacion-de-microservicios.md) | Estándar de documentos obligatorios por microservicio | Vigente |
| [`reglas-de-seguridad.md`](./reglas-de-seguridad.md) | Reglas de código seguro y datos sensibles | **Revisar — hallazgos abiertos** |
| [`politica-de-seguridad.md`](./politica-de-seguridad.md) | Gestión de secretos y respuesta a incidentes | **Revisar — hallazgos abiertos** |

---

## Hallazgos abiertos que exigen decisión del equipo

La auditoría del repositorio encontró las siguientes desviaciones. Cada una tiene
documentado su riesgo en el enlace indicado. Ninguna está resuelta por este marco de
gobernanza: **requiere una decisión del equipo y, en varios casos, un ADR nuevo**.

| # | Hallazgo | Riesgo | Documento |
|---|----------|--------|-----------|
| 1 | Claves de API reales hardcodeadas como valor por defecto en `application.properties` del servicio QR (RapidAPI y Spoonacular) | **Crítico** — la clave está en el historial de Git para siempre | [`politica-de-seguridad.md`](./politica-de-seguridad.md) |
| 2 | Los tres microservicios apuntan a la **misma** base de datos `gymdb` | **Alto** — un `DROP TABLE` en un servicio rompe los otros dos | [`05-arquitectura/decisiones/registros/ADR-002-base-datos-compartida.md`](../05-arquitectura/decisiones/registros/ADR-002-base-datos-compartida.md) |
| 3 | `POSTGRES_PASSWORD=123456` en `docker-compose.yml`, versionado en Git | **Alto** | [`politica-de-seguridad.md`](./politica-de-seguridad.md) |
| 4 | `.env.development` de la raíz versionado en Git | **Alto** | [`politica-de-seguridad.md`](./politica-de-seguridad.md) |
| 5 | `spring.jpa.show-sql=true` y `TRACE` de binders activos en el perfil por defecto | Medio — filtra datos personales en logs | [`reglas-de-seguridad.md`](./reglas-de-seguridad.md) |
| 6 | `@CrossOrigin(origins = "*")` en `ExerciseController` | Medio | [`reglas-de-seguridad.md`](./reglas-de-seguridad.md) |
| 7 | `GYMETR-login` no tiene `application.properties` activo (solo `.bak`); usa `application.yml` | Medio — la configuración no es homogénea | [`10-devops/configuracion-local.md`](../10-devops/configuracion-local.md) |
| 8 | Versiones de springdoc divergentes (2.7.0 en Membership, 2.5.0 en QR) | Bajo | [`10-devops/entornos.md`](../10-devops/entornos.md) |

> **Nota de alcance:** este marco documenta el estado real. No corrige el código.
> Las correcciones son decisiones de ingeniería que deben registrarse como ADR.

---

## Preguntas que esta sección debe responder

- ¿Cómo se llamarán las ramas, los commits y los directorios?
- ¿Quién aprueba una HU y bajo qué criterios?
- ¿Qué se considera "terminado"?
- ¿Qué datos no pueden tocarse sin autorización?
- ¿Qué pasa si alguien rompe una de estas reglas?
