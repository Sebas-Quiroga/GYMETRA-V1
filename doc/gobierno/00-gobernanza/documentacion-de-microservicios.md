# Estándar de documentación por microservicio

> Define exactamente qué documentos debe tener cada microservicio, quién los escribe,
> cuándo se crean y cuándo deben actualizarse. **El incumplimiento bloquea el merge.**

---

## Estructura obligatoria por servicio

Cada microservicio vive en `09-microservicios/servicios/NN-nombre-servicio/` y DEBE tener:

```
09-microservicios/servicios/NN-nombre-servicio/
├── README.md            ⭐ OBLIGATORIO desde el sprint 1
├── modelo-de-datos.md   ⭐ OBLIGATORIO antes de crear migraciones
├── eventos.md           ⭐ OBLIGATORIO si el servicio publica/consume eventos
├── decisiones.md        🔵 RECOMENDADO — decisiones técnicas internas del servicio
└── runbook.md           ⭐ OBLIGATORIO antes del primer despliegue a staging
```

Y su contrato OpenAPI en:

```
07-api/contratos/openapi/nombre-servicio.yaml   ⭐ OBLIGATORIO si expone endpoints REST
```

---

## README.md — Ficha técnica del servicio

**Cuándo crearlo:** al inicio del sprint en que se crea el servicio
**Responsable:** el desarrollador asignado al servicio
**Cuándo se actualiza:** cuando cambian la responsabilidad, los puertos o las dependencias entre servicios

Contenido mínimo (usa [`_plantilla/servicio/README.md`](../09-microservicios/_plantilla/servicio/README.md)):

| Sección | Qué debe decir |
|---------|----------------|
| Responsabilidad | Una frase: qué hace y de qué datos es dueño autoritativo |
| Ubicación en la arquitectura | Puerto, carpeta, motor de BD, con quién se comunica |
| Responsabilidades (lo que SÍ hace) | Lista concreta de responsabilidades |
| Fuera de alcance (lo que NO hace) | Qué delegó y a quién |
| Cómo ejecutarlo en local | Comandos exactos, deben funcionar |
| Documentos relacionados | Enlaces al resto de archivos del servicio |

---

## modelo-de-datos.md — Modelo de datos del servicio

**Cuándo crearlo:** antes del primer script de migración
**Responsable:** el desarrollador asignado al servicio
**Cuándo se actualiza:** cuando se crea o modifica una tabla

Contenido mínimo:
- Diagrama ER (Mermaid) de las tablas del servicio
- Descripción de cada tabla con columnas, tipos, restricciones y propósito
- Justificación del motor de BD elegido (PostgreSQL, MongoDB, Redis, etc.)
- Estrategia de migración (Flyway, Liquibase o scripts manuales)

**Regla:** un campo cuya razón de existir no es obvia DEBE llevar comentario en el diagrama.

---

## eventos.md — Catálogo de eventos del servicio

**Cuándo crearlo:** cuando el servicio publica o consume su primer evento de dominio
**Responsable:** el desarrollador asignado al servicio
**Cuándo se actualiza:** cuando se añade, modifica o elimina un evento

Contenido mínimo:
- Tabla de eventos publicados: nombre, tema/cuando se emite, esquema
- Tabla de eventos consumidos: nombre, de qué servicio llega, qué acción dispara
- Esquema del payload (puede referenciar el contrato OpenAPI)

Ver el estándar de eventos: [`02-dominio/eventos-de-dominio.md`](../02-dominio/eventos-de-dominio.md)

---

## decisiones.md — Decisiones técnicas del servicio

**Cuándo crearlo:** cuando el equipo toma una decisión técnica no obvia sobre el servicio
**Responsable:** quien tomó la decisión
**Cuándo se actualiza:** cuando se toma una decisión nueva o se revoca una anterior

Formato recomendado: miniADR (sin el rigor completo de un ADR de arquitectura):

```markdown
### Decisión: [nombre corto]
**Fecha:** [fecha]
**Contexto:** [qué problema se resolvía]
**Decisión:** [qué se decidió]
**Consecuencias:** [compromisos conocidos]
```

---

## runbook.md — Manual de operación del servicio

**Cuándo crearlo:** antes del primer despliegue a staging
**Responsable:** desarrollador responsable + DevOps
**Cuándo se actualiza:** cuando se descubre un problema operativo nuevo o cambia un procedimiento

Contenido mínimo:
- Cómo verificar que el servicio está sano (health check, métricas clave)
- Síntomas conocidos y sus causas: "Si ves X, el problema es Y, la solución es Z"
- Cómo hacer rollback del servicio
- Cómo ejecutar las migraciones de BD
- Alertas configuradas y qué hacer cuando se disparan

---

## Contrato OpenAPI

**Cuándo crearlo:** antes de implementar el primer endpoint del servicio (API-first)
**Responsable:** el desarrollador asignado al servicio
**Cuándo se actualiza:** cuando se añade, modifica o elimina un endpoint

**Regla API-first:** el contrato se escribe ANTES del código. Los tests de contrato validan
que el código cumple el contrato, no al revés.

Usa la plantilla: [`07-api/contratos/openapi/_plantilla-servicio.yaml`](../07-api/contratos/openapi/_plantilla-servicio.yaml)

---

## Cómo añadir un microservicio nuevo

1. Copia `09-microservicios/_plantilla/servicio/` → `09-microservicios/servicios/NN-nombre/`
2. Actualiza [`09-microservicios/catalogo-de-servicios.md`](../09-microservicios/catalogo-de-servicios.md) con la entrada del nuevo servicio
3. Actualiza [`09-microservicios/reglas-de-frontera.md`](../09-microservicios/reglas-de-frontera.md) (o créalo si no existe)
4. Copia `07-api/contratos/openapi/_plantilla-servicio.yaml` → `07-api/contratos/openapi/nombre-servicio.yaml`
5. Abre un PR con al menos el `README.md` y el contrato API esbozado

---

## Correlaciones

- Plantilla de servicio → [`09-microservicios/_plantilla/`](../09-microservicios/_plantilla/README.md)
- Catálogo de servicios → [`09-microservicios/catalogo-de-servicios.md`](../09-microservicios/catalogo-de-servicios.md)
- Contratos API → [`07-api/contratos/openapi/`](../07-api/contratos/openapi/)
- Reglas generales de documentación → [`00-gobernanza/reglas-de-documentacion.md`](./reglas-de-documentacion.md)
