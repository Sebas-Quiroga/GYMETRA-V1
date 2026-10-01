# 09 — Microservicios

> **¿Qué es esto?** La ficha de cada servicio: qué hace, qué datos posee, qué decisiones lo
> toluene y qué hacer cuando falla a las 3 de la mañana. Un microservicio sin ficha es un microservicio
> que solo conoce su autor.

---

## Estructura de cada microservicio

Cada servicio tiene su propia carpeta con cinco documentos. Los cinco son obligatorios: si un
servicio no publica eventos, `eventos.md` lo dice explícitamente en lugar de quedar vacío.

```
servicios/
├── 01-gymetr-login/
│   ├── README.md              ← qué hace y qué NO hace
│   ├── modelo-de-datos.md     ← qué tablas posee y por qué
│   ├── decisiones.md          ← decisiones técnicas tomadas aquí
│   ├── eventos.md             ← qué publica y qué consume
│   └── runbook.md             ← qué hacer cuando falla
├── 02-gymetr-membership/
│   └── (los mismos cinco)
└── 03-gymetra-qr/
    └── (los mismos cinco)
```

### Documentos transversales (aplican a TODOS los servicios)

| Documento | Para qué sirve |
|-----------|----------------|
| [`catalogo-de-servicios.md`](catalogo-de-servicios.md) ⭐ | **Empieza aquí.** Mapa, registro y matriz de comunicación |
| [`reglas-de-frontera.md`](reglas-de-frontera.md) | Qué puede hacer cada servicio y qué no |
| [`patrones-de-comunicacion.md`](patrones-de-comunicacion.md) | Cómo se hablan los servicios |
| Matriz de propiedad de datos | Qué servicio es dueño de qué tabla |

---

## Los tres servicios de GYMETRA

| # | Servicio | Puerto | Responsabilidad | Tablas que posee |
|---|----------|--------|-----------------|------------------|
| 01 | `GYMETR-login` | 8080 | Usuarios, roles, perfil, sincronización con Cognito | `user`, `role`, `user_role`, `password_reset_token` |
| 02 | `GYMETR-Membership` | 8081 | Planes, membresías, pagos y permisos | `membership`, `user_membership`, `payment` |
| 03 | `GYMETRA-Qr` | 8090 | QR, accesos, sedes, ejercicios y nutrición | `qr_access`, `access_log`, `branch`, `exercises`, `recipes` · lee `user` (`UserMin`, solo lectura) |

> **Advertencia sobre la separación real:** los tres servicios comparten la misma base de datos
> `gymdb` y se leen las tablas de los demás sin ninguna restricción. La separación es de código,
> no de datos. Ver [R-12](../15-control-proyecto/riesgos.md) y
> [ADR-002](../05-arquitectura/decisiones/registros/ADR-002-base-datos-compartida.md).

---

## Patrones de comunicación: cómo se hablan

| Patrón | ¿Existe en GYMETRA? | Dónde |
|--------|----------------------|-------|
| **REST síncrono** | ✅ Sí, es el único | `GYMETRA-Qr` → `GYMETR-Membership` |
| **Eventos de dominio** | ❌ No | Ninguno de los tres servicios publica eventos |
| **Cola de mensajes** | ❌ No | No hay broker (ni RabbitMQ, ni Kafka, ni SQS) |
| **gRPC** | ❌ No | Todo es JSON sobre HTTP |
| **Base de datos compartida** | ⚠️ Sí, y es el patrón dominante | Los tres leen y escriben `gymdb` |

**Consecuencia:** sin eventos ni colas, la consistencia entre servicios solo puede resolverse de
forma síncrona o confiando en que nadie más escriba la tabla. Por eso el borrado de un usuario
afecta a pagos y accesos (R-22) y por eso la suspensión local no se propaga (R-23).

---

## Contrato de eventos

**No hay eventos.** Ninguno de los tres servicios publica ni consume mensajes. Las consecuencias
son tres y están documentadas en el registro de riesgos:

| Consecuencia | Riesgo |
|--------------|--------|
| La expiración de membresías no se propaga a QR | R-06 |
| La suspensión de un socio no llega a Cognito | R-23 |
| Los cambios de rol no invalidan tokens emitidos | R-16, R-21 |

Cuando se implemente el primer evento, esta sección debe incluir: el nombre del evento, su
esquema, quién lo publica, quién lo consume, qué garantiza la entrega y qué se hace con los
mensajes fallidos.

---

## Correlaciones con otras secciones

| Sección | Relación |
|---------|----------|
| [`05-arquitectura/`](../05-arquitectura/README.md) | Decisiones estructurales y ADR por servicio |
| [`06-datos/`](../06-datos/README.md) | Modelo de datos compartido, diccionario columnar |
| [`07-api/`](../07-api/README.md) | Contratos OpenAPI de cada servicio |
| [`10-devops/`](../10-devops/README.md) | Entornos, despliegue y ports |
| [`13-operaciones/`](../13-operaciones/README.md) | Runbooks, observabilidad e incidentes |
| [`15-control-proyecto/riesgos.md`](../15-control-proyecto/riesgos.md) | Riesgos que afectan a los servicios |

---

## Numeración de servicios

La numeración es fija y no se reutiliza. Si un servicio se elimina, su número queda retired
(retirado) en lugar de reasignarse, para que los enlaces históricos del repositorio no se rompan.

| Estado | Significado |
|--------|-------------|
| Activo | En producción o en desarrollo activo |
| Nuevo | En construcción, aún no desplegado |
| Retirado | Fuera de producción, conservado por su historial |
