# Modelo de datos — <NOMBRE>

> Motor: **<MOTOR>** · Esquema: `<ESQUEMA>` · Base: `<BASE>`

Este servicio es dueño de las siguientes tablas. Ningún otro debería escribirlas.

---

## Tabla: `<nombre>`

| Columna | Tipo | Restricciones | Notas |
|---------|------|---------------|-------|
| `id` | BIGSERIAL | PK | |
| `<campo>` | `<TIPO>` | `<RESTRICCIONES>` | <NOTAS> |

### Problema o inconsistencia

<Descripción de la inconsistencia, o "Ninguna detectada">

| Problema | Detalle | Riesgo |
|----------|---------|--------|
| <PROBLEMA> | <DETALLE VERIFICADO EN CÓDIGO> | R-NN |

---

## Índices

| Índice | Estado | Nota |
|--------|--------|------|
| PK de cada tabla | Script SQL | `BIGSERIAL` |
| <ÍNDICE> | **Sin índice** | <CONSECUENCIA> |

> Ninguna entidad declara índices con `@Table(indexes = ...)`, así que en una base creada solo por
> Hibernate solo existen las claves primarias.

---

## Relaciones

| Relación | Tipo | Cascada |
|----------|------|---------|
| `<tabla>.<campo>` → `<tabla_padre>` | N-1 | <ON DELETE CASCADE, o sin cascada> |

---

## Migración de esquema

**No hay migraciones.** Ni Flyway, ni Liquibase.

| Entorno | `ddl-auto` | Consecuencia |
|---------|-----------|---------------|
| Desarrollo | `update` | <CONSECUENCIA> |
| Producción | `validate` | <CONSECUENCIA> |

---

## Decisiones de modelado

| Decisión | Alternativa descartada | Motivo |
|----------|------------------------|--------|
| <DECISIÓN> | <ALTERNATIVA> | <MOTIVO> |

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`06-datos/diccionario-de-datos.md`](../../../06-datos/diccionario-de-datos.md) | Detalle columnar de las tablas |
| [`06-datos/modelo-de-datos.md`](../../../06-datos/modelo-de-datos.md) | Diagrama entidad-relación |
| [`R-NN`](../../../15-control-proyecto/riesgos.md) | Riesgo asociado |
