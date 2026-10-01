# Reglas de documentación

> Cuándo, cómo y quién escribe documentación en GYMETRA.

## Principio

> **La documentación no es un extra del trabajo. Es parte del trabajo.**

Un cambio de comportamiento sin documentación equivalente no está terminado. Ver la
[Definición de Hecho](./definicion-de-hecho.md).

---

## 1. La regla del documento vivo

```
Si el código cambió pero el documento no  →  El documento está ROTO
Si el documento dice X pero el código hace Y  →  El documento es una MENTIRA
```

### Responsabilidad

Quien abre el PR que cambia el comportamiento del sistema es responsable de actualizar
la documentación correspondiente. No es responsabilidad de "alguien más después".

---

## 2. Regla de oro

> **Un documento que nadie lee es un documento que no existe.**

Antes de crear un documento, pregúntate:

1. **¿Quién lo leerá?** Si no puedes nombrar a alguien, no lo escribas.
2. **¿Cuándo?** Si la respuesta es "nunca", no lo escribas.
3. **¿Qué decisión ayuda a tomar?** Si no ayuda a decidir nada, no lo escribas.

---

## 3. Qué se documenta y qué no

### Sí se documenta

| Documento | Cuándo se crea |
|-----------|----------------|
| **ADR** | Cuando una decisión tiene consecuencias de largo plazo o es difícil de revertir |
| **Contrato API** | Cuando se crea o cambia un endpoint |
| **Modelo de datos** | Cuando se crea o cambia una entidad |
| **Runbook** | Cuando un servicio puede caerse y alguien tiene que restaurarlo |
| **Historia de usuario** | Antes de desarrollar, no después |
| **ADR de deprecación** | Cuando se retira algo que alguien podría seguir usando |

### No se documenta

| No escribir | Por qué |
|--------------|---------|
| "Cómo funciona Java" | Ya está documentado en otro lado, mejor enlazar |
| Comentarios de cada línea de código | El código ya se lee; comenta el *por qué* |
| Historial de cambios | Para eso está Git |
| Documentación de API completa written a mano | Se genera desde OpenAPI |
| Guías de herramientas genéricas | El README de la herramienta es mejor |

---

## 4. Idioma

Ver [`ADR-001`](../05-arquitectura/decisiones/registros/ADR-001-idioma-documentacion.md).

**Resumen:** la documentación técnica de GYMETRA está en **español**, coherente con el
resto de entregables del proyecto (DNDA, manuales, diagramas) y con el contexto
académico. Los términos técnicos consolidados en la industria se mantienen en inglés
(`commit`, `microservice`, `ADR`, `sprint`, `stakeholder`, `endpoint`, `deploy`), igual
que las palabras clave del lenguaje de programación.

Esta decisión **difiere** del framework original (que recomienda inglés) y es una
adaptación conscious al contexto del proyecto. Está justificada en el propio ADR-001.

---

## 5. Estructura y nomenclatura

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Documentos | `kebab-case.md` | `mapa-de-dominio.md` |
| Plantillas | `_nombre.md` con prefijo `_` | `_plantilla-adr.md` |
| ADR | `ADR-NNN-titulo-corto.md` | `ADR-003-autenticacion-cognito.md` |
| Contratos | `nombre-servicio.yaml` | `membership-service.yaml` |
| Carpetas de servicio | `NN-nombre/` | `01-gymetr-login/` |
| carpetas de sección | `NN-nombre/` | `04-requisitos/` |

### Reglas

- **Los archivos van en español**, en `kebab-case`: guiones `-` como separador de palabras (ver
  la tabla anterior); el guion bajo `_` se reserva para el prefijo de las plantillas.
- **El prefijo `_`** hace que las plantillas ordenen primero y no se confundan con
  documentos reales.
- **Numeración correlativa** en ADRs, sin reutilizar IDs, incluso si se rechaza un ADR.
- **No usar espacios** en nombres de archivo.

---

## 6. Cómo escribir un buen documento técnico

### Estructura recomendada

```markdown
# [Título que dice QUÉ es, no "Documento de"]

> Una o dos frases: qué es esto y por qué existe.

## [Sección que responde la pregunta principal]
## [Contexto o "por qué"]
## [Ejemplo concreto]
## [Preguntas que responde]
```

### Reglas de estilo

- **Frases cortas.** Si una oración tiene más de 25 palabras, divídela.
- **Frases en imperativo** para instrucciones ("Ejecuta", "Crea", "Verifica").
- **Sin jerga innecesaria.** Si un término no es estándar, defínelo o enlázalo.
- **Tablas para comparaciones**, listas para secuencias, párrafos solo para explicación.
- **Ejemplos reales**, no inventados. Usa endpoints y clases que existen en el código.

### Diagramas

- **Mermaid** para diagramas que cambian con el código (se versionan en texto, se
  pueden revisar en un diff).
- **PNG exportado** para diagramas grandes o para entregables que se imprimen.
- **Todo diagrama tiene fuente.** Un PNG sin su `.mmd` o `.md` de origen es
  imposible de mantener. Ver [`08-uml/README.md`](../08-uml/README.md).

---

## 7. Verificación antes de dar por terminado un documento

- [ ] ¿El contenido refleja el **código real**, no una intención?
- [ ] ¿Los nombres de clases, tablas, endpoints y puertos son **exactos**?
- [ ] ¿Los enlaces internos resuelven?
- [ ] ¿Los diagramas Mermaid se renderizan sin error?
- [ ] ¿Los IDs referenciados (RF-xx, RNF-xx, ADR-00N, HU-xx) **existen**?
- [ ] ¿El documento responde las preguntas listadas en el `README.md` de su sección?

---

## 8. Documentos que ya no se usan

Cuando un documento queda obsoleto, **no lo borres y no lo dejes ahí**:

1. Muévelo a [`99-archivo/`](../99-archivo/README.md).
2. Agrega al inicio un bloque que diga qué era y por qué ya no aplica.
3. Si el documento describía algo que sigue existiendo pero cambió, escribe un ADR que
   registre el cambio y enlaza ambos.

```
> [!WARNING]
> **Documento obsoleto — 2026-03.**
> Este documento describía un gateway de API que nunca se implementó.
> La decisión final está en [ADR-007](...).
> Se conserva únicamente como registro histórico.
```
