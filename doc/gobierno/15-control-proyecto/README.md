# 15 — Control del proyecto

> **¿Qué es esto?** Administración del proyecto: riesgos, dependencias, preguntas sin responder y
> deuda técnica. La diferencia entre un proyecto que se entrega y uno que "se sigue aplazando".

---

## Qué hay aquí y cómo se llena

Este directorio contiene **dos archivos**: `README.md` (este índice) y `riesgos.md`. Los tres
registros de más abajo —dependencias, preguntas abiertas y deuda técnica— **aún no tienen archivo
propio** y se llevan mientras tanto aquí.

### `riesgos.md` ⭐
Registro de riesgos del proyecto.
**Cuándo llenarlo:** desde el inicio del proyecto. Actualizar en cada retrospectiva.

Los 28 riesgos registrados están **verificados contra el código**: cada entrada cita el archivo
donde el defecto es observable. No hay riesgos hipotéticos.

| ID | Riesgo | Nivel | Estrategia | Responsable |
|----|--------|-------|------------|-------------|
| R-01 | Los planes no conceden beneficios | 🔴 Crítico | Evitar | Producto |
| R-02 | `Payment` tiene columnas duplicadas en dos idiomas | 🟡 Bajo | Mitigar | Datos |
| R-03 | La validación de turno es asimétrica | 🟠 Medio | Mitigar | Backend / QR |
| R-04 | Cobertura de pruebas prácticamente nula | 🟠 Medio | Mitigar | Calidad |
| R-05 | Los accesos se calculan cargando toda la tabla en memoria | 🔴 Alto | Mitigar | Backend / QR |
| R-06 | Las membresías vencidas nunca se marcan `EXPIRED` | 🔴 Crítico | Evitar | Backend |
| R-07 | `qr_code` guarda texto Base64, no una imagen QR | 🟠 Medio | Mitigar | Backend / QR |
| R-08 | Endpoints públicos que permiten enumerar membresías | 🟡 Bajo | Mitigar | Seguridad |
| R-09 | `VITE_SPOONACULAR_API_KEY` ni está definida ni debe ir en el frontend | 🟡 Bajo | Transferir | Seguridad / Frontend |
| R-10 | `password_reset_token` sin unicidad ni índice | 🟡 Bajo | Aceptar | Datos |
| R-11 | El aforo máximo no se valida | 🔴 Alto | Mitigar | Backend / QR |
| R-12 | Los tres servicios comparten la base de datos | 🔴 Crítico | Evitar | Arquitectura |
| R-13 | El plan semanal ignora el cálculo de calorías por día | 🔴 Alto | Mitigar | Backend / QR |
| R-14 | Los accesos denegados no se registran | 🟠 Medio | Mitigar | Producto |
| R-15 | Hay secretos en archivos versionados | 🟠 Medio | Mitigar | Seguridad / DevOps |
| R-16 | Autorización solo por "autenticado", sin exigir rol `Admin` | 🔴 Alto | Mitigar | Seguridad |
| R-17 | El pipeline solo construye 2 de 5 proyectos | 🟠 Medio | Mitigar | DevOps |
| R-18 | Endpoints de diagnóstico sin restricción de rol | 🟠 Medio | Mitigar | Seguridad |
| R-19 | Endpoint público que borra el catálogo de ejercicios | 🔴 Crítico | Evitar | Backend / QR |
| R-20 | No hay recuperación de contraseña | 🟡 Bajo | Mitigar | Producto |
| R-21 | El registro no crea la fila local y los roles divergen | 🟡 Bajo | Mitigar | Backend / Login |
| R-22 | El borrado de usuario destruye el historial financiero y de accesos | 🔴 Crítico | Evitar | Backend / Login |
| R-23 | La suspensión de socios no suspende nada | 🔴 Alto | Mitigar | Backend / Login |
| R-24 | No hay pruebas unitarias del núcleo de negocio | 🔴 Alto | Mitigar | Calidad |
| R-25 | La columna `password_hash` está muerta | 🟡 Bajo | Evitar | Datos |
| R-26 | El reseteo de contraseña apunta a la fuente equivocada | 🟠 Medio | Mitigar | Backend / Login |
| R-27 | La sincronización depende de APIs externas con cuota | 🟠 Medio | Mitigar | Backend / QR |
| R-28 | QR llama a Membership sin token y esa ruta exige JWT (401) | 🔴 Crítico | Evitar | Backend / QR |

**Nivel = probabilidad × impacto, con la casuística verificada en las fichas de `riesgos.md`:**
- Alta × Alta = 🔴 Crítico (R-01, R-06, R-12, R-19, R-22, R-28 — los seis con estrategia
  *Evitar*) o 🔴 Alto (R-05, R-11, R-13, R-24 — los cuatro con estrategia *Mitigar*).
- Media × Alta = 🔴 Alto (R-16, R-23).
- Alta × Media = 🟠 Medio (R-04, R-14, R-15, R-17).
- Media × Media = 🟠 Medio (R-03, R-07, R-18, R-27) o 🟡 Bajo (R-02, R-08, R-21).
- Baja × Media = 🟠 Medio cuando la probabilidad es baja solo porque el flujo aún no existe (R-26).
- Alta × Baja = 🟡 Bajo (R-09, R-20).
- Baja × Bajo = 🟡 Bajo (R-10, R-25).
- Media × Baja y Baja × Alto: sin casos registrados.

Cuando una combinación y una ficha no coincidan, **manda la ficha**: el Nivel es un juicio del
registro, no un cálculo automático.

**Estrategias:**
- **Evitar:** cambiar el plan para que el riesgo no pueda ocurrir.
- **Mitigar:** reducir la probabilidad o el impacto.
- **Transferir:** pasar el riesgo a otro (proveedor, contrato, seguro).
- **Aceptar:** registrar y vigilar, sin actuar.

### Registros sin archivo propio (pendientes)

> No existen `dependencias.md`, `preguntas-abiertas.md` ni `deuda-tecnica.md`: al listar este
> directorio solo aparecen `README.md` y `riesgos.md`. Estos tres registros se llevan en este
> índice hasta que se abra su archivo propio; entonces se mueven tal cual y se actualiza la lista
> de arriba.

#### Dependencias del proyecto
**Cuándo llenarlo:** servicios de terceros, equipos externos, decisiones pendientes de los
interesados.

| Dependencia | Tipo | Necesaria para | Responsable externo | Estado |
|-------------|------|----------------|---------------------|--------|
| [RapidAPI / ExerciseDB] | Externa | Catálogo de ejercicios | RapidAPI | En uso |
| [Spoonacular] | Externa | Recetas y planes nutricionales | Spoonacular | En uso |
| [MyMemory] | Externa | Traducción de ejercicios | MyMemory | En uso, cuota/free |
| [AWS Cognito] | Externa | Autenticación y registro | Amazon Web Services | En uso |
| [GitHub] | Externa | Repositorio y CI | GitHub | En uso |

#### Preguntas abiertas ⭐
Preguntas sin responder que bloquean o podrían bloquear el proyecto.
**Cuándo llenarlo:** cada vez que el equipo encuentre algo que no sabe y que requiere una decisión.
**Criticidad:** cuando una pregunta tenga respuesta, se convierte en un ADR (si es arquitectónica) o
se cierra aquí.

| # | Pregunta | Contexto | Necesaria para | Quién responde | Estado |
|---|---------|----------|----------------|----------------|--------|
| Q-01 | ¿Cuál es la fuente de verdad de los roles: `cognito:groups` o la tabla `user_role`? | Hoy conviven tres nombres de rol | R-16, R-21 | Seguridad | 🔴 Sin responder |
| Q-02 | ¿Los planes premium dan beneficios distintos o solo duran más? | Los flags existen pero no se usan | R-01 | Producto | 🔴 Sin responder |
| Q-03 | ¿Se separan las bases de datos o se comparten tres esquemas? | Los tres servicios comparten `gymdb` | R-12 | Arquitectura | 🟠 Sin responder |
| Q-04 | ¿Se implementa la recuperación de contraseña contra Cognito? | El diseño documentado actualiza la tabla local | R-20, R-26 | Producto | 🟠 Sin responder |
| Q-05 | ¿Cuál es la fuente de los datos de nutrición: Spoonacular o el servicio local? | Hay servicio local y remoto | R-27 | Backend | 🟠 Sin responder |

#### Deuda técnica
Deuda técnica y mejoras identificadas.
**Cuándo llenarlo:** cuando el equipo detecte algo que "funciona, pero no como debería".
Separarla claramente de los HUs de producto.

| ID | Descripción | Impacto si no se resuelve | Esfuerzo | Prioridad |
|----|-------------|--------------------------|----------|-----------|
| TD-01 | Consultas con `findAll()` + filtro en memoria | Degradación de rendimiento | 2 SP | Alta |
| TD-02 | Logs de `System.out.println` con emojis | Ruido en los logs de producción | 1 SP | Media |
| TD-03 | Columnas duplicadas en `Payment` | Datos inconsistentes | 3 SP | Alta |
| TD-04 | `password_hash` y `password_reset_token` muertos | Confusión sobre la fuente de verdad | 1 SP | Baja |
| TD-05 | Código muerto: DTOs de login y `PasswordResetToken` | Ruido y mantenimiento imposible | 1 SP | Media |
| TD-06 | Falta `docker-compose` por servicio | Entornos no reproducibles | 2 SP | Media |

---

## Correlaciones con otras secciones

| Alimentado por... | Por qué |
|-------------------|---------|
| [`05-arquitectura/`](../05-arquitectura/README.md) — decisiones difíciles | Riesgos técnicos |
| [`04-requisitos/no-funcionales.md`](../04-requisitos/no-funcionales.md) — RNF exigentes | Riesgos de rendimiento y calidad |
| [`13-operaciones/`](../13-operaciones/README.md) — incidentes | Deuda técnica posterior a incidentes |
| [`03-producto/`](../03-producto/README.md) — backlog | Coordinar prioridad técnica vs. negocio |

---

## Preguntas que esta sección debe responder

- ¿Qué puede salir mal y qué tan preparados estamos?
- ¿De qué cosas externas dependemos que no controlamos?
- ¿Qué decisiones están bloqueadas esperando información?
- ¿Qué código necesita mejorarse antes de que sea un problema mayor?

---

## Navegación

| Sección | Contenido |
|---------|-----------|
| [← 14 — Capacitación](../14-capacitacion/README.md) | Operación e incidencias |
| **15 — Control del proyecto** | Riesgos, dependencias, preguntas, deuda técnica |
