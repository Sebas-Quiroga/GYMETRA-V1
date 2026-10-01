# Decisiones técnicas — GYMETRA-Qr

> Decisiones de este servicio, con su motivo y su estado. La más importante: la dependencia
> crítica con `GYMETR-Membership` y cómo se gestiona hoy.

---

## [QR-DEC-001] QR depende de Membership para validar el acceso

| Campo | Valor |
|-------|-------|
| **Estado** | Vigente |
| **Fecha** | 2026-09 |
| **Riesgo** | R-12, R-06 |

### Contexto

El acceso al gimnasio depende de que un usuario tenga una membresía vigente. Ese dato vive en
`user_membership`, que es propiedad de `GYMETR-Membership`.

### Decisión

En lugar de leer la base compartida, QR llama por REST a Membership con un `RestTemplate`
sin token:

```
GET http://localhost:8081/api/user-memberships/user/{userId}                  (ingreso)
GET http://localhost:8081/api/user-memberships/user/{userId}/permission/{p}   (ejercicios)
```

La primera **exige JWT** en Membership y QR no envía ninguno: devuelve 401, la excepción se
captura y el resultado se interpreta como "sin membresía" (R-28).

### Consecuencias

**Favorables:**
- Se preserva la frontera entre servicios.
- El servicio que posee la regla de negocio la ejecuta.

**Adversas:**
- **Punto único de fallo:** si Membership se cae, el gimnasio deja de admitir socios.
- **Sin timeout:** no existe `connectTimeout` ni `readTimeout` en el cliente HTTP.
- **Sin fallback:** no hay caché ni valor por defecto ante fallo.
- **Sin circuit breaker ni reintentos:** una caída momentánea bloquea todos los accesos.
- **Sin autenticación entre servicios:** la llamada va sin token.

### Acción pendiente

Implementar en el cliente HTTP:
1. Timeouts explícitos (2 s conexión, 3 s lectura, como mínimo)
2. Circuit breaker
3. Reintentos con backoff
4. Fallback: si Membership no responde, usar la última decisión válida en caché (con TTL corto)
   o denegar con registro explícito del motivo

---

## [QR-DEC-002] Las claves de terceros están en el backend y el frontend intenta leer una

| Campo | Valor |
|-------|-------|
| **Estado** | Inconsistente |
| **Fecha** | 2026-09 |
| **Riesgo** | R-09, R-15 |

### Contexto

QR consume tres APIs externas: Spoonacular, ExerciseDB (RapidAPI) y MyMemory. Las claves están en
`application.properties` del backend.

### El problema

El frontend (`gymetra-frontend`) intenta leer `VITE_SPOONACULAR_API_KEY` desde variables de
entorno, y la documentación del proyecto indica añadirla. Si esa clave existe en el `.env` del
frontend, **se expone en el bundle JavaScript que descarga el navegador**.

**Regla de oro:** las claves de terceros nunca salen del backend. El frontend debe llamar a
endpoints del backend (`/api/nutrition`, `/api/exercises`), nunca directamente a Spoonacular ni a
RapidAPI.

### Estado actual

- El backend lee las claves desde propiedades y variables de entorno.
- El frontend consulta nutrición y ejercicios a través del backend, que es el camino correcto.
- Pero también existe la instrucción de añadir `VITE_SPOONACULAR_API_KEY` en el frontend, lo que
  es incorrecto y peligroso (R-09).

### Acción pendiente

Eliminar cualquier referencia a claves de frontend para estas APIs y documentar claramente que
todas las llamadas pasan por el backend.

---

## [QR-DEC-003] Traducción con MyMemory, sin control de cuota

| Campo | Valor |
|-------|-------|
| **Estado** | Vigente, con riesgo de límite |
| **Fecha** | 2026-09 |
| **Riesgo** | R-27 |

### Contexto

`NutritionController` y `ExerciseController` traducen textos usando MyMemory, que tiene límites de
cuota por IP y por clave según el plan.

### Decisión

Usar MyMemory directamente desde el backend, sin caché persistente ni límites locales.

### Consecuencias

Si se supera la cuota, las traducciones fallan y el sistema no degrada: devuelve error o texto sin
traducir. Además, todas las peticiones salen desde la misma IP en despliegue, por lo que el límite
se comparte entre todos los usuarios.

### Acción pendiente

Añadir:
- Caché de traducciones, con clave `texto` más `idioma_destino`
- Límite de peticiones por minuto
- Degradación elegante: si el traductor falla, devolver el texto original

---

## [QR-DEC-004] Caché local de ejercicios y recetas para mitigar cuota

| Campo | Valor |
|-------|-------|
| **Estado** | Parcial |
| **Fecha** | 2026-09 |
| **Riesgo** | R-27 |

### Contexto

`exercises` y `recipes` existen como entidades JPA. El objetivo declarado es cachear los datos de
ExerciseDB y Spoonacular para no superar sus cuotas.

### Estado real

Las tablas existen, creadas por Hibernate, pero **no hay lógica visible que sincronice desde las
APIs externas hacia estas tablas**. El código consulta las APIs externas directamente y, cuando
falla, puede recurrir a datos locales, pero la sincronización no está implementada de forma
sistemática.

### Acción pendiente

Documentar y completar la estrategia de sincronización: cuándo se llena la caché, con qué
frecuencia y qué pasa si la API externa no responde y hay datos antiguos.

---

## [QR-DEC-005] El nombre del directorio contiene un espacio

| Campo | Valor |
|-------|-------|
| **Estado** | Técnico, no funcional pero molesto |
| **Fecha** | 2026-09 |

### Contexto

El directorio del backend es `backend/GYMETRA - Qr`, con un espacio antes de `- Qr`. Eso complica
scripts, rutas en CI, comandos Maven y cualquier automatismo.

### Consecuencia

Los scripts de build deben citar la ruta. No es un fallo de negocio, pero es una fricción
innecesaria para operaciones y CI/CD.

### Acción pendiente

Renombrar a `backend/GYMETRA-Qr` o `backend/gymetra-qr`, ajustando rutas en `docker-compose.yml`,
`Jenkinsfile`, scripts y documentación.

---

## [QR-DEC-006] `MembershipProxyController` no aporta resiliencia

| Campo | Valor |
|-------|-------|
| **Estado** | Vigente |
| **Fecha** | 2026-09 |

### Contexto

QR tiene su propio `MembershipProxyController`, que reenvía la consulta al servicio de Membership.
Encapsular la dependencia en un punto es útil para cambiar la URL en un solo sitio, pero hoy ese
controlador no añade timeout, caché ni transformación.

### Consecuencia

La capa de abstracción no protege de la dependencia crítica: transmite el fallo tal cual.

### Acción pendiente

Mover la resiliencia —timeouts, circuit breaker y fallback— a este cliente, en lugar de dejarla
dispersa entre llamadas.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`patrones-de-comunicacion.md`](../../patrones-de-comunicacion.md) | Llamada síncrona QR → Membership |
| [`R-06`](../../../15-control-proyecto/riesgos.md) | Membresía expirada con acceso |
| [`R-09`](../../../15-control-proyecto/riesgos.md) | Claves de terceros expuestas |
| [`R-12`](../../../15-control-proyecto/riesgos.md) | Dependencia crítica entre servicios |
| [`R-15`](../../../15-control-proyecto/riesgos.md) | Configuración de producción inconsistente |
| [`R-27`](../../../15-control-proyecto/riesgos.md) | Traducción y cuota de APIs externas |
| [`07-api/`](../../../07-api/README.md) | Endpoints de QR y acceso |
