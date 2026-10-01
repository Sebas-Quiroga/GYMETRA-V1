# Modelo de datos — GYMETR-Membership

> Motor: **PostgreSQL 15** · Esquema: `public` · Base: `gymdb` (compartida con los otros dos servicios)

Este servicio es dueño de tres tablas. Ningún otro debería escribirlas, y hoy cualquiera puede.

---

## Tabla: `membership` — planes de pago

| Columna | Tipo | Restricciones | Notas |
|---------|------|---------------|-------|
| `id` | BIGSERIAL | PK | La entidad lo llama `membership_id` |
| `name` | VARCHAR(100) | NOT NULL | |
| `description` | TEXT | | |
| `price` | DECIMAL(10,2) | NOT NULL | |
| `duration_days` | INTEGER | NOT NULL | Días de vigencia del plan |
| `active` | BOOLEAN | | |
| `created_at` | TIMESTAMP | default `NOW()` | |
| `features` | JSON/JSONB | | Columna añadida por Hibernate, **no está en el script SQL** |

### Problema de datos semilla

Los precios de los planes que siembra `config/DataInitializer.java` **no coinciden** con los del
script de base de datos (R-01). Un socio ve un precio en la app y la base dice otro.

| Origen | Contenido |
|--------|-----------|
| `data/Database-Setup/database_ Initial.sql` | 3 planes (29.99 / 49.99 / 299.99) insertados con `ON CONFLICT DO NOTHING` |
| `backend/GYMETR-Membership/src/main/java/com/Membership/GYMETRA/config/DataInitializer.java` | 3 planes (60000 / 160000 / 550000), con otras duraciones |

> `DataInitializer` solo siembra si `membership` está vacía: en una base creada por el script
> (el compose la monta en el arranque inicial), sus tres planes no llegan a insertarse.

`ddl-auto: update` no corrige datos, solo esquema. La discrepancia persiste hasta que alguien
alinee una de las dos fuentes.

---

## Tabla: `user_membership` — suscripciones

| Columna | Tipo | Restricciones | Notas |
|---------|------|---------------|-------|
| `id` | BIGSERIAL | PK | |
| `user_id` | BIGINT | NOT NULL, FK → `user` ON DELETE CASCADE | **No hay índice sobre esta columna** |
| `membership_id` | BIGINT | NOT NULL, FK → `membership` | |
| `start_date` | TIMESTAMP | | |
| `end_date` | TIMESTAMP | | |
| `status` | VARCHAR | | `PENDING`, `ACTIVE`, `SUSPENDED`, `CANCELED`, `EXPIRED`, `DELETED` |
| `created_at` | TIMESTAMP | | |

> La tabla es la que `GYMETRA-Qr` consulta a través del proxy de permisos. Si `status` no se
> actualiza cuando `end_date` pasa, el socio conserva el acceso indefinidamente (R-06).

---

## Tabla: `payment` — pagos

| Columna | Tipo | Restricciones | Notas |
|---------|------|---------------|-------|
| `id` | BIGSERIAL | PK | |
| `user_membership_id` | BIGINT | FK → `user_membership` | ON DELETE CASCADE en el script |
| `amount` | DECIMAL | NOT NULL | Nombre inglés |
| `monto` | DECIMAL | **NOT NULL** | Nombre español, duplica `amount` |
| `payment_method` | VARCHAR | NOT NULL | Nombre inglés |
| `metodo_pago` | VARCHAR | **NOT NULL** | Nombre español, duplica `payment_method` |
| `payment_date` | TIMESTAMP | | Nombre inglés |
| `fecha_pago` | TIMESTAMP | **NOT NULL** | Nombre español, duplica `payment_date` |
| `payment_status` | VARCHAR | **NOT NULL** | |
| `transaction_reference` | VARCHAR | | **Sin restricción de unicidad**: la misma referencia puede repetirse (R-07) |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

### El problema de las columnas duplicadas

La entidad `Payment` declara **cada dato dos veces**, en inglés y en español, y ambas versiones
son `nullable = false`. El script SQL solo define las columnas **en inglés** y no declara las
españolas, así que las tres columnas español no existen en una base creada por el script.

Consecuencia directa: `savePaymentSimplified()` rellena la pareja en inglés y omite
`monto`, `metodo_pago` y `fecha_pago`. La operación falla con una violación de `NOT NULL`
(R-02).

**Solución:** quedarse con una sola nomenclatura, no con las dos.

---

## Índices

| Índice | Estado | Nota |
|--------|--------|------|
| PK de las tres tablas | Script SQL | `BIGSERIAL` |
| FK `user_membership.user_id` | **Sin índice** | Toda consulta del proxy filtra por `user_id` |
| FK `user_membership.membership_id` | **Sin índice** | — |
| FK `payment.user_membership_id` | **Sin índice** | — |
| `payment.transaction_reference` | **Sin índice ni unicidad** | R-07 |
| `user_membership.status` | **Sin índice** | Búsqueda de suscripciones vigentes |

> No hay ningún índice declarado en las entidades con `@Table(indexes = ...)`, así que **ningún
> índice existe en una base creada solo por Hibernate**. Las consultas más frecuentes del
> servicio recorren tablas completas.

---

## Migración de esquema

**No hay migraciones.** Ni Flyway, ni Liquibase, ni control de versiones del esquema.

| Entorno | `ddl-auto` | Consecuencia |
|---------|-----------|---------------|
| Desarrollo | `update` | Hibernate crea lo que falta, incluidos los índices que no declara y las columnas español |
| Producción | `validate` | Falla al arrancar si el esquema no coincide exactamente con las entidades |

> Con `ddl-auto: update` en una base vacía, las columnas `monto`, `metodo_pago` y `fecha_pago`
> **sí** se crean, y por eso el fallo de pago no aparece en desarrollo. En producción, con
> `validate`, el servicio ni siquiera arranca. La diferencia de comportamiento entre
> ambientes es la causa de que R-02 se descubriera tarde.

---

## Decisiones de modelado

| Decisión | Alternativa descartada | Motivo |
|----------|------------------------|--------|
| Suscripciones y pagos en tablas separadas | Un solo registro | Permite histórico de renovaciones |
| `status` como `VARCHAR` libre | Enum de Java | Evita migraciones al añadir estados, a costa de no validar |
| Fecha de fin como `TIMESTAMP` | `DATE` | Permite expiración con hora, no solo por día |
| Sin tabla de facturas | Factura fiscal | Fuera del alcance del proyecto |
| Importes duplicados en dos idiomas | Una sola columna | Ninguna razón válida: es un error de modelado (R-02) |

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`06-datos/diccionario-de-datos.md`](../../../06-datos/diccionario-de-datos.md) | Detalle columnar de las 10 tablas |
| [`06-datos/modelo-de-datos.md`](../../../06-datos/modelo-de-datos.md) | Diagrama entidad-relación |
| [`R-02`](../../../15-control-proyecto/riesgos.md) | Pago incompleto por columnas duplicadas |
| [`R-06`](../../../15-control-proyecto/riesgos.md) | Membresía expirada que conserva el acceso |
| [`ADR-004`](../../../05-arquitectura/decisiones/registros/ADR-002-base-datos-compartida.md) | Por qué los servicios se separaron |
