# Eventos — GYMETR-login

> **Este servicio no publica ni consume eventos.** No hay broker de mensajes en el sistema. Esta
> página documenta el estado real y qué eventos debería emitir cuando se implemente la
> asincronía.

---

## Eventos que este servicio publica

**Ninguno.** No hay RabbitMQ, Kafka, SQS ni ninguna otra cola en el proyecto, ni Outbox, ni
polling. La única comunicación de `GYMETR-login` con el resto del sistema son las 12 llamadas
HTTP que recibe y las que hace a Cognito.

---

## Eventos que este servicio consume

**Ninguno.**

---

## Por qué importa

La ausencia de eventos es la causa raíz de tres riesgos que no se resuelven con más código de
síncronía:

| Consecuencia | Riesgo |
|--------------|--------|
| La suspensión de un socio no llega a QR ni a Cognito | R-23 |
| Un cambio de rol no invalida los tokens ya emitidos | R-16 |
| El alta de un socio no notifica a Membership | R-21 |

El patrón actual de "sincronizar a mano" (`POST /api/auth/users/sync`) es un parche sintomático de esa
ausencia: existe una tarea que alguien tiene que acordarse de ejecutar.

---

## Eventos que debería publicar

| Evento | Cuándo | Consumidores previstos | Riesgo que resuelve |
|--------|--------|------------------------|---------------------|
| `user.registered` | Tras el primer `sync` exitoso | Membership | R-21 |
| `user.role_changed` | Cuando `RoleController` asigna o quita un rol | Membership, QR | R-16, R-21 |
| `user.suspended` | Cuando `PATCH /status` pone `suspended` | Cognito (mediante QR), Membership | R-23 |
| `user.deleted` | Antes del borrado físico, para que los demásreactionen | Membership, QR | R-22 |
| `user.profile_updated` | Cambio de email o identificación | Membership | — |

### Esquema propuesto: `user.suspended`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `eventId` | UUID | Sí | Identificador único |
| `occurredAt` | ISO-8601 | Sí | Momento de la suspensión |
| `userId` | Long | Sí | Socio afectado |
| `reason` | string | No | Motivo registrado por el administrador |
| `suspendedBy` | Long | No | Administrador que ordenó la suspensión |
| `source` | string | Sí | `admin-api` |

> El evento debe publicarse **después** de que Cognito confirme la suspensión. Si se publica
> antes, el consumidor da por hecho un estado que Cognito todavía no ha aplicado, y la suspensión
> vuelve a ser cosmética por un camino distinto.

---

## Garantías de entrega

| Aspecto | Valor deseado |
|---------|----------------|
| Entrega | Al menos una vez |
| Idempotencia | Obligatoria en el consumidor |
| Orden | Por `userId` |
| Mensaje perdido | No permitido para `user.suspended` |
| Reintentos | 5, con espera creciente |
| Destino de fallidos | Cola de fallidos con alerta al equipo |

---

## Manejo de errores

| Fallo del consumidor | Reintentos | Destino final |
|----------------------|-----------|---------------|
| Servicio caído | 5, con espera creciente | Cola de fallidos |
| Socio ya eliminado | 0 | Registro de depuración |
| `userId` desconocido | 0 | Cola de fallidos y alerta |
| Payload inválido | 0 | Cola de fallidos, requiere corrección manual |

---

## Migración de síncrono a asíncrono

Para pasar un flujo de hoy a un evento, en este orden:

1. **Añadir el publicador** sin quitar el flujo síncrono. Ambos activos.
2. **Añadir el consumidor** idempotente, que solo registre lo que hace.
3. **Comparar** los resultados de ambas vías durante un ciclo completo de negocio.
4. **Apagar la vía síncrona** y dejar el evento como única fuente.
5. **Eliminar** el código de la vía antigua.

Saltarse el paso 3 es la causa habitual de perder datos en una migración de este tipo.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`02-dominio/eventos-de-dominio.md`](../../../02-dominio/eventos-de-dominio.md) | Eventos definidos en el modelo de dominio |
| [`patrones-de-comunicacion.md`](../../patrones-de-comunicacion.md) | Especificación completa de un evento |
| [`13-operaciones/incident-management.md`](../../../13-operaciones/gestion-de-incidentes.md) | Qué hacer cuando falla un consumidor |
| [`R-23`](../../../15-control-proyecto/riesgos.md) | Suspensión inefectiva |
