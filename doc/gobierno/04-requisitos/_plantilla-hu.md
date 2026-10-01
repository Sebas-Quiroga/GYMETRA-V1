# Plantilla de Historia de Usuario

> Copia este archivo, renómbralo `HU-NNN-titulo-corto.md` en esta misma carpeta y
> complétalo. **No borres los comentarios entre `<!-- -->`** hasta que la HU esté lista.

---

# HU-NNN — Título corto en imperativo

| Campo | Valor |
|-------|-------|
| **ID** | HU-NNN |
| **Época** | Sprint N |
| **Prioridad** | Alta / Media / Baja |
| **Puntos** | N |
| **Servicio afectado** | `gymetr-login` / `gymetr-membership` / `gymetra-qr` / `admin-frontend` / `gymetra-frontend` |
| **Requisito cubierto** | RF-NN |
| **Estado** | Backlog / Lista / En desarrollo / En revisión / Terminada |

---

## Historia

> **Como** [rol o tipo de usuario]
> **Quiero** [acción concreta]
> **Para** [beneficio medible]

<!-- Ejemplo: Como administrador del gimnasio quiero suspender la membresía de un socio
     que lleva dos meses sin pagar para poder dejar de darle acceso al gimnasio. -->

---

## Criterios de aceptación

| ID | Criterio | Verificable por | Endpoint / Componente |
|----|----------|-----------------|-----------------------|
| CA-1 | <!-- [Given/When/Then o frase verificable] --> | Prueba unitaria | `<!-- GET /api/... -->` |
| CA-2 | | Prueba de integración | |
| CA-3 | | Prueba manual | |

### Casos de error

| ID | Situación | Respuesta esperada | Verificable por |
|----|-----------|--------------------|-----------------|
| CE-1 | <!-- El recurso no existe --> | <!-- 404 con mensaje claro --> | |
| CE-2 | <!-- Sin permisos --> | <!-- 403 --> | |
| CE-3 | <!-- Dependencia externa caída --> | <!-- 503, sin perder datos --> | |

---

## Fuera de alcance

<!-- Lo que esta HU NO hace, explícitamente. Esto evita discusiones de alcancefuture. -->

- [ ] 
- [ ] 

---

## Dependencias

| Tipo | Dependencia | Estado |
|------|-------------|--------|
| Servicio | <!-- otro microservicio --> | Disponible / Pendiente / En desarrollo |
| Datos | <!-- tabla o entidad nueva --> | Existe / Hay que crearla |
| API | <!-- endpoint que hay que definir --> | Ya existe / Hay que crearlo |
| Externa | <!-- Stripe, Cognito, Spoonacular --> | Configurada / Falta configurar |

<!-- Si esta HU requiere un endpoint nuevo, el contrato OpenAPI debe existir ANTES de
     empezar a implementar. Ver 07-api/README.md. -->

---

## Datos y privacidad

| Campo | Requisito |
|-------|-----------|
| ¿Maneja datos personales? | Sí / No |
| ¿Cuáles? | <!-- email, identificación, teléfono --> |
| ¿Se registra en logs? | Sí / No — si es Sí, explicar por qué |
| ¿Requiere cifrado en reposo? | Sí / No |

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| <!-- --> | Alta / Media / Baja | Alto / Medio / Bajo | |

---

## Definición de Listo

Verifica **antes** de asignar la HU a un sprint:

- [ ] Usuario y necesidad identificados
- [ ] Criterios de aceptación verificables y sin ambigüedad
- [ ] Casos de error definidos
- [ ] Fuera de alcance explícito
- [ ] Sin dependencias bloqueantes
- [ ] Contrato API definido (si aplica)
- [ ] Modelo de datos diseñado (si aplica)
- [ ] Requisitos de privacidad evaluados
- [ ] Estimado por el equipo

Referencia: [`../00-gobernanza/definicion-de-listo.md`](../00-gobernanza/definicion-de-listo.md)

---

## Definición de Hecho

Verifica **antes** de dar por terminada la HU:

- [ ] Compila sin errores ni advertencias nuevas
- [ ] Lint y formato limpios
- [ ] Sin secretos hardcodeados
- [ ] Pruebas unitarias escritas y en verde
- [ ] Cobertura ≥ 80 % en los archivos modificados
- [ ] Casos de error probados
- [ ] Documentación actualizada (marca los que apliquen):
  - [ ] Contrato OpenAPI
  - [ ] Modelos de datos
  - [ ] Diagramas
  - [ ] Runbook del servicio
  - [ ] Mapa de navegación (si cambia la UI)
- [ ] PR con al menos una aprobación
- [ ] Conventional Commit correcto

Referencia: [`../00-gobernanza/definicion-de-hecho.md`](../00-gobernanza/definicion-de-hecho.md)

---

## Registro de implementación

| Fecha | Acción | Autor |
|-------|--------|-------|
| YYYY-MM-DD | HU creada | |
| YYYY-MM-DD | Entra a Sprint N | |
| YYYY-MM-DD | PR abierto (#NNN) | |
| YYYY-MM-DD | Terminada | |
| YYYY-MM-DD | Validada por PO | |

---

## Notas

<!-- Decisiones tomadas durante la implementación que no quedan claras en el código.
     Si alguna tiene consecuencias de largo plazo, escribe un ADR en
     05-arquitectura/decisiones/registros/ y enlázalo aquí. -->

---

## Documentos relacionados

- [`historias-de-usuario.md`](./historias-de-usuario.md) — índice de historias
- [`no-funcionales.md`](./no-funcionales.md) — atributos de calidad
- [`matriz-de-trazabilidad.md`](./matriz-de-trazabilidad.md) — trazabilidad RF ↔ endpoint
- [`../00-gobernanza/convenciones-agil.md`](../00-gobernanza/convenciones-agil.md) — ceremonias y estimación
