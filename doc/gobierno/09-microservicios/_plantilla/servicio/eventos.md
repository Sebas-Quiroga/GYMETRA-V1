# Eventos — <NOMBRE>

> **Estado real:** este servicio publica N eventos y consume M.
> Si no hay broker en el sistema, dejarlo escrito: la ausencia de eventos es un hecho
> arquitectónico, no un olvido de la documentación.

---

## Eventos que este servicio publica

| Evento | Cuándo | Consumidores | Riesgo que resuelve |
|--------|--------|--------------|---------------------|
| <EVENTO> | <CONDICIÓN> | <SERVICIO> | R-NN |

> Si no publica ninguno: **Ninguno.** No hay RabbitMQ, Kafka, SQS ni Outbox en el proyecto.

---

## Eventos que este servicio consume

| Evento | Emisor | Para qué |
|--------|--------|----------|
| <EVENTO> | <SERVICIO> | <EFECTO> |

> Si no consume ninguno: **Ninguno.**

---

## Por qué importa

<Qué consecuencia tiene la ausencia de eventos, con su riesgo.>

| Consecuencia | Riesgo |
|--------------|--------|
| <CONSECUENCIA> | R-NN |

---

## Esquema de un evento

### Evento: `<nombre.del.evento>`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `eventId` | UUID | Sí | Identificador único del evento |
| `occurredAt` | ISO-8601 | Sí | Momento en que ocurrió el hecho |
| `<campo>` | `<TIPO>` | Sí | <DESCRIPCIÓN> |
| `source` | string | Sí | `<origen que lo publica>` |

### Garantías de entrega

| Aspecto | Valor deseado |
|---------|----------------|
| Entrega | Al menos una vez |
| Idempotencia | Obligatoria en el consumidor |
| Clave de partición | `<campo que garantiza el orden>` |
| Evento perdido | Permitido / No permitido, según el caso |
| Reintentos | 5, con espera creciente |
| Destino de fallidos | Cola de fallidos con alerta al equipo |

### Reglas de idempotencia

<Cómo evita el consumidor el efecto duplicado, en pasos numerados.>

### Manejo de errores

| Fallo | Reintentos | Destino final |
|-------|-----------|---------------|
| <FALLO> | <N> | <DESTINO> |

---

## Migración de síncrono a asíncrono

1. **Añadir el publicador** sin quitar el flujo síncrono. Ambos activos.
2. **Añadir el consumidor** idempotente, que solo registre lo que hace.
3. **Comparar** los resultados de ambas vías durante un ciclo completo de negocio.
4. **Apagar la vía síncrona** y dejar el evento como única fuente.
5. **Eliminar** el código de la vía antigua.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`02-dominio/eventos-de-dominio.md`](../../../02-dominio/eventos-de-dominio.md) | Eventos definidos en el modelo de dominio |
| [`patrones-de-comunicacion.md`](../../patrones-de-comunicacion.md) | Especificación completa de un evento |
| [`R-NN`](../../../15-control-proyecto/riesgos.md) | Riesgo asociado |
