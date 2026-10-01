# Observabilidad

> Qué debería medirse en GYMETRA, con qué herramientas y en qué orden. Cada sección indica el
> coste y qué riesgo concreto permite detectar.

---

## El problema de partida

El sistema tiene 64 endpoints, tres servicios y una base de datos compartida, y **cero
instrumentación**. No hay forma de responder, en producción, a las preguntas básicas:

- ¿Cuántos socios entran al gimnasio cada hora?
- ¿Cuántos accesos se deniegan y por qué motivo?
- ¿Con qué frecuencia falla la llamada de QR a Membership?
- ¿Cuántos pagos fallan?
- ¿Qué versión del código está desplegada en cada servicio?

Las cinco son preguntas de operación diaria, y las cinco son imposibles de responder hoy.

---

## Nivel 1 · Salud y disponibilidad

### Qué hay

Ninguno de los tres servicios expone un endpoint de salud. El `Jenkinsfile` consulta
`/actuator/health`, que devuelve 404 porque ningún `pom.xml` incluye `spring-boot-starter-actuator`.

### Cómo corregirlo

```xml
<!-- En los tres pom.xml, dentro de <dependencies> -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```properties
# En application.properties de los tres servicios
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=when_authorized
management.health.db.enabled=true
```

| Endpoint | Qué comprueba | Quién lo consulta |
|----------|---------------|-------------------|
| `/actuator/health` | Que el servicio vive y que la base responde | Pipeline, monitor |
| `/actuator/info` | Versión, commit y fecha de build | Operador |

> Exponer solo `health` e `info` es deliberado: los demás endpoints de Actuator dan mucha
> información y no hacen falta aquí. La superficie se abre lo mínimo.

### Lo que revela

Con `management.health.db.enabled=true`, Actuator comprueba la conexión a PostgreSQL. Eso detecta el
caso real de hoy: la contraseña del perfil `prod` no coincide con la del compose, y el backend no
conecta. Ahora ese fallo es silencioso; con Actuator sería visible en un endpoint.

---

## Nivel 2 · Registro estructurado

### Qué hay hoy

| Servicio | Estado |
|----------|--------|
| Niveles de log configurados | Sí, por servicio |
| Uso de SLF4J | Parcial |
| `System.out.println` | **Sí**, con emojis, en `PaymentService` |
| `System.err.println` | **Sí**, en `MembershipProxyService` |
| Correlation ID | No |
| Salida a archivo | No: solo consola, que el contenedor consume |
| Registro centralizado | No |

### Dos ejemplos reales del código

`PaymentService.savePaymentSimplified` escribe ocho líneas de traza con emojis a `System.out`:

```java
System.out.println("\U0001F50D CREANDO PAYMENT CON ENTIDAD SIMPLIFICADA:");
System.out.println("   \U0001F4CB DATOS VALIDADOS:");
System.out.println("      - UserMembership ID: " + userMembership.getId());
// ...
System.out.println("\U0001F680 GUARDANDO PAYMENT CON JPA...");
```

`MembershipProxyService.checkPermission` captura cualquier excepción y escribe a `System.err`:

```java
} catch (Exception e) {
    System.err.println("❌ ERROR VALIDANDO PERMISO: " + e.getMessage());
    return false;
}
```

Los dos casos tienen el mismo problema: **no tienen nivel, no tienen estructura y no se pueden
filtrar**. En la salida de error estándar de un contenedor hay que buscar a mano entre el ruido.

### Cómo corregirlo

```java
// Antes
System.out.println("🔍 CREANDO PAYMENT CON ENTIDAD SIMPLIFICADA:");
System.out.println("   📋 DATOS VALIDADOS:");

// Después
private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
log.debug("Creando pago: userMembershipId={}, amount={}, status={}",
          userMembership.getId(), amount, paymentStatus);
```

| Antes | Después |
|-------|---------|
| `System.out.println` con emoji | `log.debug` con parámetros |
| `System.err.println` con `getMessage()` | `log.warn` con la excepción completa |
| Concatenación de cadenas | Marcadores `{}` |
| Sin nivel | `error` para fallo, `warn` para degradación, `info` para ciclo de vida |

**La razón de querer el nivel es concreta:** el fallo de R-02 es una violación de `NOT NULL` que hoy
aparece como una excepción en medio de varias líneas de traza. Con `log.error` y los marcadores
correctos, es la primera línea que se ve.

### Correlation ID

Sin identificador de petición, el recorrido de un acceso al gimnasio no se puede reconstruir:

```
Socio → POST /api/access-log/entrada        (QR, 8090)
      → GET  /api/user-memberships/user/1   (Membership, 8081, sin token → 401, R-28)
      → SELECT user_membership               (Membership → gymdb)
```

Tres servicios, dos saltos, ningún identificador común. Si el segundo falla, no hay forma de
enlazar el error con la petición que lo provocó.

```java
// Filtro que genera y propaga el identificador
@Component
public class CorrelationIdFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(CorrelationIdFilter.class);
    public static final String HEADER = "X-Correlation-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String id = request.getHeader(HEADER);
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        MDC.put("correlationId", id);
        response.setHeader(HEADER, id);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove("correlationId");
        }
    }
}
```

Con `MDC`, cualquier línea de log de la petición incluye el identificador, y el cliente HTTP
interior lo reenvía como cabecera.

---

## Nivel 3 · Métricas

### Qué medir, con qué valor concreto

| Métrica | Tipo | Para qué | Riesgo que detecta |
|---------|------|----------|--------------------|
| `accessos.total` | Contador | Volumen de uso del gimnasio | — |
| `accessos.denegado` | Contador con etiqueta `motivo` | **Por qué se rechaza a alguien** | R-14 |
| `accessos.por_sucursal` | Contador con etiqueta | Distribución del uso | — |
| `membresias.vigentes` | Medidor | Sospecha de expiraciones no aplicadas | R-06 |
| `pagos.fallidos` | Contador | Errores de pago | R-02 |
| `llamadas.membership` | Temporizador con etiqueta `resultado` | **La dependencia crítica** | R-12 |
| `llamadas.membership.timeout` | Contador | El fallo concreto que hoy no existe | R-12 |
| `sincronizacion.cognito` | Temporizador | Éxito de la sincronización | R-21 |
| `sincronizacion.externas` | Temporizador con etiqueta `api` | Cuota de Spoonacular y RapidAPI | R-27 |
| `http.solicitudes` | Temporizador por ruta y estado | Base de todo lo demás | — |
| `jvm.memoria` | Medidor | Fuga de memoria | R-05 |

### Las tres que importan

1. **`llamadas.membership` con etiqueta `resultado`.** Sin ella, una caída de Membership es
   invisible hasta que un socio se queja. Es la métrica que más rápido paga su coste.
2. **`accessos.denegado` con etiqueta `motivo`.** Distingue "no tiene membresía" de "el servicio
   no respondió". Hoy el código devuelve `false` en ambos casos (R-14).
3. **`pagos.fallidos`.** Convierte R-02 de un error de pago en un dato medible.

### Cómo montarlo

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
    <scope>runtime</scope>
</dependency>
```

```properties
management.endpoints.web.exposure.include=health,info,prometheus
```

```java
private final MeterRegistry registry;

@Timed(value = "gymetra.membership.permission",
       description = "Consulta de permiso a Membership")
public boolean checkPermission(Long userId, String permission) {
    // ...
    registry.counter("gymetra.accessos.denegado", "motivo", motivo).increment();
}
```

---

## Nivel 4 · Trazas

### Qué falta

No hay OpenTelemetry, ni Zipkin, ni ninguna instrumentación de traza. Sin trazas no se puede ver
dónde se va el tiempo de una petición, ni qué salto de un recorrido entre servicios es el lento.

### Para qué serviría aquí

El recorrido del acceso al gimnasio tiene dos saltos de red. Con traza se vería inmediatamente si
los 2 segundos de espera son:

- La base de datos de Membership.
- La llamada de red entre contenedores.
- La lógica de `checkPermission`.

Y eso determina si la solución es un índice, una red o código.

### Coste

Es la pieza más cara de montar y la que menos urgencia tiene: primero métricas, después trazas.

---

## Nivel 5 · Alertas

Solo tiene sentido definir alertas cuando hay métricas que las disparen. Las mínimas:

| Alerta | Condición | Severidad | Responde |
|--------|-----------|-----------|----------|
| Servicio caído | `/actuator/health` no responde 2 min | Crítica | Runbook del servicio |
| Base de datos inaccesible | `db` en estado `DOWN` | Crítica | Sección de base de datos |
| Membership no responde | `llamadas.membership{resultado="error"}` sube | Crítica | Runbook de Membership |
| Tasa de denegación alta | `accessos.denegado` / `accessos.total` > 20 % en 5 min | Alta | Puede ser un fallo o un abuso |
| Pagos fallando | `pagos.fallidos` > 0 sostenido | Alta | R-02 |
| Memoria alta | `jvm.memoria` > 85 % sostenido | Media | R-05 |
| Cuota externa agotada | `sincronizacion.externas{resultado="quota"}` | Media | R-27 |

> La tercera alerta es la que habría detectado la dependencia crítica antes de que un socio
> llamara a recepción para preguntar por qué no lo dejan entrar.

---

## Orden de implementación

| Fase | Qué | Esfuerzo | Efecto |
|------|------|----------|--------|
| 1 | Actuator en los tres servicios | Bajo | El pipeline empieza a ser fiable |
| 2 | SLF4J con niveles en los tres servicios | Bajo | Logs filtrables |
| 3 | Correlation ID | Medio | Se puede seguir un recorrido |
| 4 | Registro de denegaciones con motivo | Bajo | R-14 atacable |
| 5 | Métricas de Micrometer | Medio | Base de las alertas |
| 6 | Prometheus y Grafana | Medio | Histórico y visualización |
| 7 | Alertas | Medio | Detección automática |
| 8 | Trazas | Alto | Diagnóstico de latencia |

Las fases 1, 2 y 4 son baratas y atacan problemas reales del código actual. Son las primeras.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`gestion-de-incidentes.md`](gestion-de-incidentes.md) | Qué hacer cuando salta una alerta |
| [`10-devops/README.md`](../10-devops/README.md) | El health check que hay que corregir |
| [`09-microservicios/servicios/*/runbook.md`](../09-microservicios/README.md) | Runbooks por servicio |
| [`R-14`](../15-control-proyecto/riesgos.md) | Accesos denegados sin registrar |
| [`R-17`](../15-control-proyecto/riesgos.md) | Pipeline que no detecta caídas |
