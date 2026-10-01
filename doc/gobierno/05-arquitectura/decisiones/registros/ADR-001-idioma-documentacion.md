# ADR-001 — Idioma de la documentación

| Campo | Valor |
|-------|-------|
| **ID** | ADR-001 |
| **Título** | Idioma de la documentación |
| **Fecha** | 2026-09 |
| **Estado** | Accepted |
| **Decisor** | Equipo GYMETRA |
| **Reemplaza** | — |
| **Impacto** | Bajo |

---

## 1. Contexto

El equipo de GYMETRA trabaja en español. **El código, en cambio, está en inglés**: las 90
clases del backend usan nombres ingleses (`UserMembership`, `PaymentService`,
`CognitoUserSyncService`, `EditUserRequest`) y las rutas de la API también
(`/api/user-memberships`). Lo que sí está en español son los **comentarios** —84 comentarios
con tildes o `ñ`— y los **mensajes de error** dirigidos al usuario.

Los entregables del proyecto (DNDA, manuales, informes de prácticas) están en español.

Aun así, la documentación de referencia de arquitectura —plantillas de ADR, guías de
microservicios, catálogos de API— casi siempre viene en inglés.

**Restricciones:**

- El equipo lee y escribe en español con fluidez.
- Los stakeholders del proyecto (coordinación, usuarios finales) no leen inglés técnico.
- El código ya está en inglés, así que documentar en español **reduce la fricción** para
  quien lee, y evita traducir mentalmente entre lo que dice el código y lo que se explica.

---

## 2. Decisión

**Toda la documentación de GYMETRA —este marco de gobernanza incluido— se escribe en
español.**

Se aplica a:

| Elemento | ¿En español? | Estado real |
|----------|---------------|-------------|
| Documentación de arquitectura y gobernanza | ✅ Sí | En español |
| ADRs | ✅ Sí | En español |
| Comentarios del código | ✅ Sí | En español (84 comentarios) |
| Mensajes de error al usuario | ✅ Sí | En español |
| Contratos OpenAPI (descripciones) | ✅ Sí | En español |
| Nombres de clases, métodos, variables | ❌ **En inglés** | 90 clases, ninguna en español |
| Nombres de rutas y campos JSON | ❌ **En inglés** | `/api/user-memberships`, `cognito_sub` |

> **Excepción deliberada:** los identificadores técnicos (nombres de clases, rutas, campos
> JSON, variables de entorno) se mantienen en inglés. Son parte de la interfaz pública del
> sistema y mezclarlos con español generaría más ruido que valor. Cambiarlos rompería
> consumidores y no aporta nada.
>
> Esto aplica también al código: la documentación en español describe una base de código en
> inglés, y esa asimetría es intencionada, no un descuido.

---

## 3. Consecuencias

### Positivas

- Documentación accesible para todo el equipo y para los stakeholders no técnicos.
- Sin fricción de traducción entre el código y su documentación.
- El código y la documentación se leen igual, lo que reduce errores de interpretación.
- Coherencia con los entregables ya producidos (DNDA, manuales).

### Negativas

- ⚠️ **Plantillas y ADR de referencia de la industria están en inglés.** Traducirlos
  implica mantener una versión en otro idioma si el equipo crece o entra alguien de otro
  país.
- ⚠️ **El ecosistema de herramientas favorece el inglés.** Documentación de Spring
  Boot, Stripe o Cognito está en inglés, así que el equipo tiene que leer dos idiomas de
  todos modos.
- ⚠️ **Búsqueda:** parte del equipo puede buscar términos técnicos en inglés y no
  encontrar la documentación en español.

### Neutras

- Los términos técnicos que no tienen traducción clara (commit, endpoint, token) se
  mantienen en inglés dentro del texto en español.

---

## 4. Alternativas para el futuro

**Revisar esta decisión si:**

- Se incorpora al equipo alguien que solo trabaja en inglés.
- GYMETRA se convierte en producto comercializable fuera del mercado hispanohablante.
- Se decide publicar la documentación como parte de un proyecto open source.

En cualquiera de esos casos, la opción más_simple es mantener **esta documentación en
español y añadir un resumen en inglés** en el `README.md` raíz, en lugar de duplicar todo.

---

## 5. Estado de implementación

| Aspecto | Estado |
|---------|--------|
| ¿Está implementado? | Sí |
| ¿Dónde? | Todo `doc/gobierno/` |
| ¿Desde cuándo? | Desde el inicio de este marco |

---

## Documentos relacionados

- [vision-general.md](../../vision-general.md) — arquitectura del sistema
- [`../../../01-contexto/glosario.md`](../../../01-contexto/glosario.md) — glosario de términos
- [`../../../00-gobernanza/reglas-de-documentacion.md`](../../../00-gobernanza/reglas-de-documentacion.md) — reglas de escritura
