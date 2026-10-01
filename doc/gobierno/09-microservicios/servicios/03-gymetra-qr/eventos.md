# Eventos — GYMETRA-Qr

> **Este servicio no publica eventos.** Hoy su comunicación es íntegramente síncrona: recibe
> peticiones del frontend y, para validar el acceso, llama a `GYMETR-Membership` por REST.

---

## Eventos que este servicio publica

**Ninguno.** Los accesos registrados en `access_log` no generan ningún evento.

---

## Eventos que este servicio consume

**Ninguno.** En particular, **no consume `membership.expired` ni `membership.cancelled`**, que
son los dos eventos que necesita para dejar de conceder acceso a quien ya no tiene membresía
(R-06).

---

## Por qué importa

QR es el último eslabón antes de que una persona entre al gimnasio. Hoy decide el acceso
preguntando a Membership en cada entrada, sin ningún registro de cambios de estado que pueda
consultar después.

| Consecuencia | Riesgo |
|--------------|--------|
| Una membresía expirada sigue concediendo acceso | R-06 |
| Una baja no llega a QR si no se consulta | R-23 |
| No hay auditoría de por qué se denegó un acceso | R-14 |
| Los accesos denegados no generan señal para análisis | R-14 |

---

## Eventos que debería consumir

| Evento | Emisor | Efecto en QR | Riesgo que resuelve |
|--------|--------|--------------|---------------------|
| `membership.expired` | Membership | Invalidar cualquier QR activo del socio | R-06 |
| `membership.cancelled` | Membership | Invalidar los QR activos del socio | R-06, R-23 |
| `membership.renewed` | Membership | Reactivar los QR y su fecha de expiración | R-06 |
| `user.suspended` | Login | Denegar el acceso con motivo `user_suspended` | R-23 |
| `user.deleted` | Login | Marcar los QR como inactivos, sin borrarlos | R-22 |

### Consumidor prioritario: `membership.expired`

#### Reglas de idempotencia

El consumidor debe poder recibir el mismo evento dos veces sin efecto:

1. Si `qr_access.active` ya es `false` para ese `userId`, no hacer nada y registrar el duplicado.
2. Si no hay QR activo, registrar el evento sin error: es un evento válido.
3. Nunca borrar filas de `qr_access`: se desactivan, para conservar el historial.

#### Reglas de orden

| Situación | Comportamiento |
|-----------|----------------|
| Llega `membership.expired` y después `membership.renewed` | El último evento válido es el que gana |
| Llega `membership.renewed` y después `membership.expired` | El socio pierde el acceso, que es el estado final |
| Llegan eventos de dos socios distintos | Se procesan en paralelo; la clave de partición es `userId` |

#### Manejo de errores

| Fallo | Reintentos | Destino final |
|-------|-----------|---------------|
| Base de datos no disponible | 5, con espera creciente | Cola de fallidos |
| Socio ya eliminado | 0 | Registro de depuración |
| Evento duplicado | 0 | Registro de depuración |
| Payload inválido | 0 | Cola de fallidos, requiere corrección manual |

---

## Eventos que debería publicar

| Evento | Cuándo | Consumidores previstos | Riesgo que resuelve |
|--------|--------|------------------------|---------------------|
| `access.denied` | Cada acceso denegado | Analítica, operación | R-14 |
| `access.granted` | Cada acceso concedido | Analítica | R-14 |
| `qr.invalidated` | Al invalidar un QR por expiración o baja | Notificaciones | R-06 |
| `exercise.catalog_synced` | Tras sincronizar con ExerciseDB | Operación | R-27 |

> `access.denied` es el evento más valioso y el más ausente: sin él no hay forma de saber que un
> socio fue rechazado sin consultar la tabla a mano. Antes de publicarlo hay que decidir si el
> volumen es aceptable: un gimnasio con alto tránsito genera muchos accesos por hora.

---

## Contención de riesgo

Hasta que existan los eventos, la mitigación depende de la consulta síncrona. La única forma de
que la expiración surta efecto es que `user_membership.status` se actualice a `EXPIRED`. Como
**no existe proceso programado que lo haga**, la mitigación es manual:

```sql
-- Actualizar suscripciones vencidas
UPDATE user_membership
SET status = 'EXPIRED'
WHERE end_date < NOW() AND status = 'ACTIVE';
```

Ejecutar esto periódicamente reduce el riesgo R-06, pero no lo elimina: sigue habiendo una ventana
entre el vencimiento y la actualización.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`patrones-de-comunicacion.md`](../../patrones-de-comunicacion.md) | Especificación de eventos y llamada síncrona |
| [`02-dominio/eventos-de-dominio.md`](../../../02-dominio/eventos-de-dominio.md) | Eventos definidos en el modelo de dominio |
| [`R-06`](../../../15-control-proyecto/riesgos.md) | Membresía expirada con acceso |
| [`R-14`](../../../15-control-proyecto/riesgos.md) | Accesos denegados sin registrar |
