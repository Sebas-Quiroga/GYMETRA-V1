# Guía de patrones

> Catálogo de patrones de diseño y de microservicios aplicados en GYMETRA, con ejemplos
> reales del código y evaluación de su uso.

## Propósito

Un patrón es una solución reutilizable a un problema recurrente. Este documento registra
cuáles están presentes en GYMETRA, dónde, y si se aplican bien o mal. No es un catálogo
académico: solo incluye lo que se puede señalar con un archivo y una línea.

---

## 1. Patrones creacionales

### Singleton — ⚠️ parcial

Spring gestiona los beans como singletons por defecto, así que la tabla de "singletons"
tiene más entradas de las que parece.

| Componente | Dónde |
|-----------|-------|
| `SecurityConfig` | Configuración de seguridad de `GYMETR-login` |
| `StripeClient` (implícito) | Configuración de Membership |
| `ExerciseSyncService` | Sincronización de ejercicios en QR |
| `NutritionSyncService` | Sincronización de nutrición en QR |

> ⚠️ **Riesgo con `ExerciseSyncService`:** si guarda estado mutable (por ejemplo, un
> `AtomicBoolean` de "sincronizando"), ese estado es compartido por todos los hilos. Con
> peticiones simultáneas a `/api/exercises/sync/force` se puede lanzar una sincronización
> duplicada. Vale la pena revisar si el método es `synchronized` o si usa un lock.

### Strategy — ✅ usado por Spring internamente

Spring resuelve la inyección por tipo de interfaz, lo que es una implementación del patrón
Strategy. `PaymentService` lo usa implícitamente al depender de `PaymentRepository`: la
implementación concreta se decide en tiempo de ejecución.

### Builder — ✅ en `Payment`

`Payment` no tiene constructor estático ni método de fábrica: usa la anotación `@Builder` de
Lombok, que genera un constructor por bloques con todos los campos. Es el equivalente
práctico del patrón en este proyecto y evita el constructor positional de diez argumentos.
Ahora bien, el builder no protege ninguna invariante: `paymentStatus` es obligatorio en la
base (`nullable = false`) pero el builder acepta cualquier valor, y el `@Setter` de Lombok
permite cambiarlo después. Que un pago nazca `PENDING` es una convención, no una garantía.

---

## 2. Patrones estructurales

### Adapter — ✅ usado en `AccessLogBusinessService`

El servicio de negocio trabaja con la entidad JPA, pero la capa de persistencia es
adaptable. Un ejemplo claro es el cliente HTTP de Membership dentro de QR: la clase
`MembershipProxyController` adapta una llamada REST a un método de negocio local
(`checkPermission`). Si mañana se reemplaza HTTP por un bus de eventos, el resto del
servicio no cambia.

### Facade — ✅ en la API pública

Los controladores de cada servicio actúan como *facades* sobre la lógica de negocio. El
frontend llama a `/api/payments/confirm-payment` sin saber que internamente hay un
`PaymentService`, una llamada a Stripe y una transacción de base de datos.

### Decorator — ⚠️ no identificado de forma explícita

Spring AOP aplica decoradores implícitos a través de `@Transactional` y `@PreAuthorize`,
pero no hay decoradores de negocio propios.

---

## 3. Patrones de comportamiento

### Strategy — ✅ en la traducción de la API de ejercicios

`ExerciseSyncService` consulta la API de ejercicios y traduce los nombres al español
usando un servicio de traducción. La estrategia de traducción (MyMemory u otra) se puede
cambiar sin tocar el resto del flujo.

### Observer — ❌ no implementado

La sincronización de ejercicios y la de nutrición se ejecutan en hilos independientes al
detectar la base vacía, pero no hay patrón Observer formal. No hay eventos de dominio
publicados a ningún otro servicio. Ver
[ADR-006](./decisiones/registros/ADR-006-proxy-validacion-membresia.md).

### Chain of Responsibility — ✅ en Spring Security

La cadena de filtros de Spring Security procesa la petición: primero CORS, luego
autenticación (JWT), luego autorización por rol. Cada filtro decide si deja pasar la
petición o la rechaza.

### Repository — ✅ usado consistentemente

Los tres servicios siguen el patrón Repository con Spring Data JPA. Todos los
controladores usan repositorios inyectados, ninguno accede a la base directamente con JDBC
o EntityManager. Esto es positivo y mantiene la separación de capas.

### Unit of Work — ✅ en las transacciones

Los métodos `@Transactional` de los servicios actúan como Unit of Work: todo el trabajo
dentro del método se confirma o se revierte como una unidad.

---

## 4. Patrones de microservicios

### Base de datos por servicio — ❌ no implementado

Los tres servicios comparten `gymdb`. Ver
[ADR-002](./decisiones/registros/ADR-002-base-datos-compartida.md).

### API Gateway — ❌ no implementado

No hay un punto de entrada único. Cada frontend conoce las URLs de los tres servicios y
los llama directamente, con CORS configurado en cada backend.

### Registro y descubrimiento de servicios — ❌ no implementado

Las URLs de los servicios están hardcodeadas en la configuración y en las variables de
entorno de los frontends. No hay Consul, Eureka ni nada equivalente.

### Circuit Breaker — ❌ no implementado

Cuando Membership está caído, el escaneo **no devuelve ningún error**: `QrBusinessService`
captura la excepción del `RestTemplate` y deja el QR `inactive`, de modo que todos los
accesos se deniegan sin síntoma visible ni reintento ni timeout configurado. Un Circuit
Breaker (Resilience4j) con un fallback explícito convertiría ese fallo en un mensaje claro y
evitaría esperas largas contra un servicio muerto.

### Saga — ⚠️ parcial

La compra de una membresía implica: (1) crear PaymentIntent en Stripe, (2) confirmar el
pago, (3) crear la `user_membership` en la base. Si el paso 3 falla después de que el
paso 2 tuvo éxito, el pago queda registrado como `CONFIRMED` pero sin membresía activa. No
hay compensación ni patrón Saga formal.

### API Composition — ✅ parcial

El dashboard de métricas en `admin-frontend` puede composed datos de Membership (pagos,
membresías) y de Login (usuarios, roles) haciendo llamadas a ambos servicios y
combinando los resultados en el frontend. No hay un backend de composición, pero el
patrón se aplica en el cliente.

### CQRS — ❌ no implementado

Los tres servicios usan el mismo modelo JPA para lectura y escritura. No hay separación de
modelos de lectura y escritura.

### Event Sourcing — ❌ no implementado

El estado de un pago o de una membresía se almacena como el valor actual, no como una
secuencia de eventos. Los registros de acceso (`access_log`) son el único rastro
histórico, pero no reconstruyen el estado de las entidades.

### Sidecar — ❌ no implementado

No hay proxy, ni Envoy, ni Istio. La lógica transversal (autenticación, CORS, logging) está
integrada en cada servicio por separado.

---

## 5. Resumen

| Patrón | Estado | Dónde |
|--------|--------|-------|
| Repository | ✅ Bien aplicado | Todos los repositorios JPA |
| Facade | ✅ Bien aplicado | Controladores REST |
| Chain of Responsibility | ✅ Bien aplicado | Filtros de Spring Security |
| Unit of Work | ✅ Bien aplicado | `@Transactional` en servicios |
| Strategy | ✅ Aplicado | Traducción, inyección Spring |
| Adapter | ✅ Aplicado | Proxy de Membership en QR |
| API Composition | ⚠️ Solo en el frontend | Dashboard admin |
| Saga | ⚠️ Solo transaccional | Flujo de compra |
| Base de datos por servicio | ❌ No implementado | Una base para tres servicios |
| API Gateway | ❌ No implementado | URLs directas desde frontend |
| Descubrimiento de servicios | ❌ No implementado | URLs hardcodeadas |
| Circuit Breaker | ❌ No implementado | QR degrada sin control |
| CQRS | ❌ No implementado | Modelo único lectura/escritura |
| Event Sourcing | ❌ No implementado | Estado actual, no historial |
| Sidecar | ❌ No implementado | Lógica transversal en cada servicio |

---

## 6. Patrones recomendados (no implementados)

| Patrón | Motivo | Esfuerzo |
|---------|--------|----------|
| **API Gateway** | Simplifica el CORS, centraliza rate limiting, oculta la topología interna | Medio |
| **Circuit Breaker** | Evita que un fallo de Membership tire el acceso al gimnasio | Bajo (Resilience4j) |
| **Base de datos por servicio** | Autonomía real, permite escalar de forma independiente | Alto |
| **Outbox pattern** | Garantiza que un cambio de estado en Membership notifique a QR de forma fiable | Medio |
| **Health check** | Permite que el orquestador reinicie servicios que no están healthy | Bajo (Spring Actuator) |

---

## Documentos relacionados

- [`vision-general.md`](./vision-general.md) — arquitectura del sistema
- [`arquitectura-hexagonal.md`](./arquitectura-hexagonal.md) — puertos y adaptadores
- [`decisiones/README.md`](./decisiones/README.md) — decisiones de arquitectura
- [`../09-microservicios/README.md`](../09-microservicios/README.md) — guía de microservicios
