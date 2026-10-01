# Decisiones técnicas — <NOMBRE>

> Decisiones de este servicio, con su motivo y su estado. Cuando una decisión se revierte, se
> marca como revertida: el historial vale más que el olvido.

---

## [<PREFIJO>-DEC-001] <Título de la decisión en una frase>

| Campo | Valor |
|-------|-------|
| **Estado** | Vigente / Revertido / Error, pendiente de corrección |
| **Fecha** | AAAA-MM |
| **Riesgo** | R-NN, si aplica |

### Contexto

<Qué problema o necesidad lleva a esta decisión.>

### Decisión

<Qué se decidió, en una frase.>

### Consecuencias

**Favorables:**
- <VENTAJA>

**Adversas:**
- <PERJUICIO, con su riesgo si aplica>

### Alternativas descartadas

| Alternativa | Por qué no |
|-------------|-----------|
| <ALTERNATIVA> | <MOTIVO> |

---

## [<PREFIJO>-DEC-002] <Título>

| Campo | Valor |
|-------|-------|
| **Estado** | Vigente |
| **Fecha** | AAAA-MM |

### Contexto

<CONTEXTO>

### Decisión

<DECISIÓN>

### Consecuencias

| Consecuencia | Detalle |
|--------------|---------|
| <CONSECUENCIA> | <DETALLE> |

### Acción pendiente

<QUÉ HAY QUE HACER, o "Ninguna">

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| `ADR-NNN` (ver [`05-arquitectura/decisiones/registros/`](../../../05-arquitectura/decisiones/registros/)) | Decisión equivalente a nivel de arquitectura |
| [`R-NN`](../../../15-control-proyecto/riesgos.md) | Riesgo asociado |
| [`07-api/`](../../../07-api/README.md) | Contratos HTTP del servicio |
