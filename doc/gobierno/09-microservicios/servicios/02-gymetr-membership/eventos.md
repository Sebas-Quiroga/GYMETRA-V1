# Eventos — GYMETR-Membership

> **Este servicio no publica ni consume eventos.** No hay broker de mensajes en el sistema. Esta
> página documenta el estado real y qué eventos debería emitir cuando se implemente la
> asincronía.

---

## Eventos que este servicio publica

**Ninguno.** La información de una membresía solo se propaga cuando alguien pregunta
explícitamente por ella.

---

## Eventos que este servicio consume

**Ninguno.**

---

## Por qué importa

Este servicio contiene el dato más crítico del negocio —la vigencia de una suscripción— y es el
único que puede actualizarlo, pero **no avisa a nadie cuando cambia**. Las consecuencias:

| Consecuencia | Riesgo |
|--------------|--------|
| La membresía expira y QR sigue concediendo acceso | R-06 |
| Una cancelación no se refleja en el acceso | R-06, R-23 |
| Un pago confirmado no actualiza el estado de la suscripción | R-01, R-02 |
| Los planes despublicados siguen visibles en otros servicios | R-01 |

El patrón actual —"que QR pregunte en cada acceso"— convierte a este servicio en un punto único
de fallo: si cae, el gimnasio deja de admitir socios.

---

## Eventos que debería publicar

| Evento | Cuándo | Consumidores previstos | Riesgo que resuelve |
|--------|--------|------------------------|---------------------|
| `membership.expired` | Un proceso programado detecta que `end_date` pasó | QR | R-06 |
| `membership.cancelled` | El socio cancela | QR, Login | R-06, R-23 |
| `membership.renewed` | Se crea una suscripción nueva | QR | R-06 |
| `payment.completed` | Se confirma un pago | Login, QR | R-01, R-02 |
| `membership.plan_changed` | Se edita un plan o su precio | Login, frontend | R-01 |

### Evento prioritario: `membership.expired`

Es el más urgente porque hoy un socio que no renueva **conserva el acceso indefinidamente**, y
ningún proceso marca la suscripción como expirada.

#### Esquema

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `eventId` | UUID | Sí | Identificador único del evento |
| `occurredAt` | ISO-8601 | Sí | Momento de la expiración |
| `userId` | Long | Sí | Socio afectado |
| `userMembershipId` | Long | Sí | Suscripción expirada |
| `membershipId` | Long | Sí | Plan que se venció |
| `endDate` | ISO-8601 | Sí | Fecha que se superó |
| `source` | string | Sí | `scheduler` o `admin` |

#### Garantías

| Aspecto | Valor |
|---------|-------|
| Entrega | Al menos una vez |
| Idempotencia | Obligatoria: `QR` puede recibir el mismo evento dos veces |
| Orden | Por `userId` |
| Clave de partición | `userId` |
| Evento perdido | No permitido: el evento **es** la señal de expiración |

#### Manejo de errores

| Fallo | Reintentos | Destino final |
|-------|-----------|---------------|
| QR caído | 5, con espera creciente | Cola de fallidos y reintento manual |
| Suscripción ya expirada | 0, se descarta | Registro de depuración |
| `userId` desconocido | 0 | Cola de fallidos y alerta |
| Payload inválido | 0 | Cola de fallidos |

---

## Eventos que debería consumir

| Evento | Emisor | Para qué |
|--------|--------|----------|
| `user.registered` | Login | Crear la suscripción inicial si el plan se incluye en el alta |
| `user.deleted` | Login | Cancelar suscripciones de un usuario eliminado, en vez de borrarlas en cascada (R-22) |
| `user.suspended` | Login | Suspender también el acceso al gimnasio (R-23) |

> El evento `user.deleted` es la alternativa correcta al borrado en cascada: hoy, borrar un socio
> destruye también su historial de pagos y de accesos, porque el script SQL declara 9 claves
> foráneas, todas con `ON DELETE CASCADE`, y 5 cuelgan directamente de `user` (R-22).

---

## Proceso programado que falta

Para que `membership.expired` exista, hace falta un proceso que lo dispare. **Hoy no existe.**

| Aspecto | Especificación |
|---------|----------------|
| Frecuencia | Diaria, fuera del horario de mayor afluencia |
| Consulta | Suscripciones con `end_date < NOW()` y `status = 'ACTIVE'` |
| Efecto | Marca `status = 'EXPIRED'` y publica `membership.expired` |
| Idempotencia | Reejecutable: el filtro por `status = 'ACTIVE'` impide duplicados |
| Reintentos | El evento se publica después de confirmar la actualización de la fila |

---

## Migración de síncrono a asíncrono

1. **Añadir el publicador** sin quitar la consulta síncrona de QR.
2. **Añadir el consumidor** idempotente que registra lo que hace.
3. **Comparar** ambos resultados durante un ciclo completo de renovaciones.
4. **Apagar la vía síncrona** y dejar el evento como única señal.
5. **Eliminar** el código de la vía antigua, incluido el proxy si queda sin uso.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`02-dominio/eventos-de-dominio.md`](../../../02-dominio/eventos-de-dominio.md) | Eventos definidos en el modelo de dominio |
| [`patrones-de-comunicacion.md`](../../patrones-de-comunicacion.md) | Especificación completa de un evento |
| [`R-06`](../../../15-control-proyecto/riesgos.md) | Membresía expirada que conserva el acceso |
| [`R-22`](../../../15-control-proyecto/riesgos.md) | Borrado en cascada del historial |
