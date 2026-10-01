# Requisitos no funcionales

> **¿Qué tan bien debe hacerlo el sistema?** Atributos de calidad con métrica medible.
> Un RNF sin número es un deseo.

## Principio

> Un requisito no funcional sin métrica **no es verificable**, y por lo tanto no es un
> requisito: es una aspiración. Este documento existe para que cada atributo de calidad
> tenga un número que alguien pueda comprobar.

---

## 1. Disponibilidad y rendimiento

| ID | Atributo | Métrica | Objetivo | ¿Cómo se mide? | Estado |
|----|----------|---------|----------|-----------------|--------|
| **RNF-01** | Tiempo de respuesta de la API | p95 de latencia en endpoints críticos | < 200 ms | Registro de access logs con tiempos | ⚠️ No instrumentado |
| **RNF-02** | Disponibilidad | Tiempo activo en el mes | ≥ 99,9 % | Monitor externo (UptimeRobot o similar) | ❌ No monitoreado |
| **RNF-03** | Tiempo de validación de acceso | De mostrar el QR a registrar el ingreso | < 5 s | `access_log.entry_time` − hora de escaneo | ⚠️ La hora de escaneo no se registra |
| **RNF-04** | Arranque del servicio | Tiempo desde que se ejecuta hasta que acepta peticiones | < 30 s | Log de arranque de Spring Boot | ⚠️ Parcial: la sincronización de ejercicios y recetas arranca en un hilo y puede tardar minutos |
| **RNF-05** | Carga simultánea | Usuarios concurrentes | 500 | Prueba de carga | ❌ No probado |

> **Nota sobre RNF-04:** `ExerciseSyncService` y `NutritionSyncService` lanzan la
> sincronización en un hilo nuevo al detectar la base vacía, así que el arranque no se
> bloquea. Pero la primera carga descarga ~1.300 GIFs y ~500 imágenes, lo que puede tardar
> **varios minutos** y consumir ancho de banda. En un entorno de pruebas eso puede agotar
> la cuota de la API de terceros.

---

## 2. Escalabilidad

| ID | Atributo | Métrica | Objetivo | Estado |
|----|----------|---------|----------|--------|
| **RNF-06** | Escalado independiente de servicios | Servicios escalables por separado | 100 % | ⚠️ Docker Compose escala por servicio ✅, pero el pipeline solo despliega `GYMETR-login` |
| **RNF-07** | Aislamiento de datos | Base de datos por servicio | 1:1 | ❌ **No cumplido** — los tres comparten `gymdb` (R-12) |
| **RNF-08** | Adición de servicios | Esfuerzo para añadir un microservicio | < 1 día | ⚠️ Requiere definir contratos OpenAPI y probarlo con el Compose |

> **RNF-07 es el incumplimiento más estructural de GYMETRA.** La base compartida impide
> escalar un servicio sin contention con los otros dos, y hace que un `DROP TABLE` en
> uno rompa los demás. Ver
> [ADR-002](../05-arquitectura/decisiones/registros/ADR-002-base-datos-compartida.md).

---

## 3. Seguridad

| ID | Atributo | Métrica | Objetivo | Estado |
|----|----------|---------|----------|--------|
| **RNF-09** | Contraseñas cifradas | Hash BCrypt con factor de coste | ≥ 10 rondas | ⚠️ **No aplica en la BD local.** Cognito custodia la contraseña; GYMETRA nunca la recibe. La columna `password_hash` existe en `User` pero **ningún código la escribe** y no hay BCrypt en el proyecto. Es una columna vestigial que conviene eliminar |
| **RNF-10** | Autenticación federada | Validación de JWT (firma, emisor, audiencia) | 100 % de endpoints protegidos | ⚠️ 4 endpoints abiertos de forma deliberada |
| **RNF-11** | Datos en tránsito cifrados | HTTPS en tránsito | Obligatorio en producción | ❌ Solo HTTP en desarrollo |
| **RNF-12** | Datos de tarjeta | ¿Almacena GYMETRA el número de tarjeta? | **Nunca** | ✅ Tokenización vía Stripe |
| **RNF-13** | Secretos fuera del código | Secretos en archivos versionados | 0 | ❌ **Hay 3** (ver R-15) |
| **RNF-14** | Protección de datos personales | Datos personales en logs de producción | 0 | ❌ El log de bindings de Hibernate está en `TRACE` |
| **RNF-15** | CORS restringido | Orígenes permitidos por entorno | Solo los del entorno | ⚠️ Comodines `localhost:*` y `*.ngrok-free.dev` hardcodeados |
| **RNF-16** | Protección del punto de acceso | Registro de intentos denegados | 100 % | ❌ **No se registran** (R-14) |

---

## 4. Usabilidad

| ID | Atributo | Métrica | Objetivo | Estado |
|----|----------|---------|----------|--------|
| **RNF-17** | Responsive | La interfaz se usa en móvil y escritorio | 100 % de pantallas | ✅ Ionic + CSS responsive |
| **RNF-18** | Navegación sin fricción | Pasos para ver el QR desde el inicio de sesión | ≤ 2 clics | ✅ `/login` → `/home` → `/qr` |
| **RNF-19** | Mensajes de error claros | Errores con mensaje accionable en español | 100 % | ⚠️ Parcial: algunos devuelven mensajes en inglés |
| **RNF-20** | Idioma de la interfaz | Todo en español | 100 % | ⚠️ Parcial: quedan mensajes en inglés en el código |

> **Ejemplo de RNF-20 incumplido:** `LocalNutritionService` y `RecipeRepository` usan
> literales en inglés (`"breakfast"`, `"main course"`, `"day"`). Funciona porque
> `TranslationService` los traduce al español al sincronizar, pero el filtrado interno
> depende de que esos valores **en inglés** se mantengan.

---

## 5. Mantenibilidad

| ID | Atributo | Métrica | Objetivo | Estado |
|----|----------|---------|----------|--------|
| **RNF-21** | Cobertura de pruebas | Cobertura de código de negocio | ≥ 80 % | ❌ **Casi 0 %** (R-04) |
| **RNF-22** | Pruebas automatizadas | Pruebas de negocio escritas | ≥ 1 por regla de negocio | ❌ Solo 2 pruebas de contexto |
| **RNF-23** | Documentación al día | Documentos desactualizados | 0 | ✅ Este marco (tras esta auditoría) |
| **RNF-24** | Convenciones de código | Archivos que pasan el linter | 100 % | ⚠️ Hay linters configurados, pero no se ejecutan en el pipeline |
| **RNF-25** | Principios SOLID | Violaciones graves de diseño | 0 | ⚠️ Parcial |

> **Sobre SOLID:** `AccessLogBusinessService` tiene lógica de negocio (reglas de turno,
> validación de membresía) en un servicio que además carga tablas completas en memoria.
> No es una violación de SOLID, pero sí un **code smell** de acceso a datos.

---

## 6. Operabilidad

| ID | Atributo | Métrica | Objetivo | Estado |
|----|----------|---------|----------|--------|
| **RNF-26** | Logs estructurados | Logs con timestamp, nivel y servicio | 100 % | ⚠️ Parcial: hay `System.out.println` en `PaymentService` |
| **RNF-27** | Trazabilidad de peticiones | ID de correlación entre servicios | Implementado | ❌ No implementado |
| **RNF-28** | Métricas de negocio | Dashboard con las 3 métricas prioritarias | Operativo | ❌ No implementado |
| **RNF-29** | Gestión de incidentes | Runbook por servicio | 1 por servicio | ✅ Este marco, sección 13 |
| **RNF-30** | Despliegue automatizado | Pipeline de CI/CD funcional | 100 % de los servicios | ⚠️ El Jenkinsfile solo construye 2 de 5 (R-17) |

> **Sobre RNF-26:** `PaymentService` tiene al menos 8 llamadas a `System.out.println`
> en producción, que no pasan por el sistema de logging ni respetan niveles. En un
> entorno contenedorizado, esas líneas no aparecen en los logs estructurados que
>_revisiona la infraestructura.

---

## 7. Compatibilidad

| ID | Atributo | Definición | Estado |
|----|----------|------------|--------|
| **RNF-31** | Navegadores | Últimas 2 versiones de Chrome, Firefox, Safari, Edge | ✅ Con `@vitejs/plugin-legacy` |
| **RNF-32** | Java | Versión 17 LTS | ✅ `pom.xml` de los tres servicios |
| **RNF-33** | PostgreSQL | Versión 15 | ✅ `postgres:15-alpine` |
| **RNF-34** | Móviles | iOS 15+, Android 10+ | ✅ Con Ionic |

---

## 8. Resumen de cumplimiento

| Estado | Cantidad | IDs |
|--------|----------|-----|
| ✅ Cumplido | 9 | RNF-12, RNF-17, RNF-18, RNF-23, RNF-29, RNF-31, RNF-32, RNF-33, RNF-34 |
| ⚠️ Parcial | 14 | RNF-01, RNF-03, RNF-04, RNF-06, RNF-08, RNF-09, RNF-10, RNF-15, RNF-19, RNF-20, RNF-24, RNF-25, RNF-26, RNF-30 |
| ❌ No cumplido | 11 | RNF-02, RNF-05, RNF-07, RNF-11, RNF-13, RNF-14, RNF-16, RNF-21, RNF-22, RNF-27, RNF-28 |
| **Total** | **34** | |

> **Patrón claro:** los requisitos funcionales están mayormente cubiertos; los no
> funcionales de **calidad operativa** (pruebas, observabilidad, despliegue) son la
> debilidad del proyecto. Es un patrón habitual cuando el foco del equipo está en
> construir la funcionalidad, y es exactamente lo que un proyecto de Sistemas
> Distribuidos debería corregir.

---

## 9. Los cinco RNF prioritarios

Si solo se pueden abordar cinco, estos son los de mayor retorno:

| # | RNF | Por qué |
|---|-----|---------|
| 1 | **RNF-21 / RNF-22** (pruebas) | Sin pruebas no hay forma de saber si un cambio rompió algo. Es la condición previa de todo lo demás. |
| 2 | **RNF-07** (base por servicio) | Desbloquea el escalado real y elimina la acoplamiento de esquema. |
| 3 | **RNF-16** (registro de denegados) | Sin esto no se puede detectar el abuso de un QR robado ni medir el acceso. |
| 4 | **RNF-13** (secretos) | Una clave filtrada es un incidente, no una deuda técnica. |
| 5 | **RNF-30** (despliegue de los 5 servicios) | La mitad del sistema no se puede desplegar con el pipeline actual. |

---

## 10. Documentos relacionados

- [`historias-de-usuario.md`](./historias-de-usuario.md) — requisitos funcionales
- [`matriz-de-trazabilidad.md`](./matriz-de-trazabilidad.md) — RF ↔ RNF ↔ endpoint
- [`../11-calidad/estrategia-de-pruebas.md`](../11-calidad/estrategia-de-pruebas.md) — cómo cumplir RNF-21
- [`../15-control-proyecto/riesgos.md`](../15-control-proyecto/riesgos.md) — riesgos asociados
