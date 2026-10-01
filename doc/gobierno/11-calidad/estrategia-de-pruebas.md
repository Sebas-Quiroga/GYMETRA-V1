# Estrategia de pruebas

> Qué tipos de prueba existen, cuál corresponde a cada capa de GYMETRA, y por qué el sistema tiene
> cero cobertura de negocio. La pirámide propuesta es resultado del estado real del código, no de
> una aspiración.

---

## El estado, sin adornos

| Métrica | Valor |
|---------|-------|
| Pruebas de negocio | **0** |
| Pruebas que cubren un endpoint | **0 de 64** |
| Servicios con pruebas unitarias | 0 de 3 |
| Frontends con pruebas unitarias | 0 de 2 |
| Pruebas que fallen si se rompe la lógica de planes | 0 |
| Plugin de cobertura | Ninguno |
| Etapa de pruebas en el pipeline | No existe |

Los dos únicos archivos de prueba de backend son `contextLoads()` vacíos: comprueban que el
contexto de Spring arranca, nada más. La única prueba de frontend es la plantilla de Cypress de
Vite, que además **fallaría** contra la aplicación real.

---

## La pirámide que debería existir

Ninguno de estos niveles tiene pruebas hoy. El orden importa: se empieza por abajo.

```
        /\          E2E            ~5 escenarios críticos
       /  \         Recorridos de usuario completos
      /----\        Integración    Endpoint + base de datos real
     /------\       Componentes    Servicio con sus colaboradores simulados
    /--------\      Unitarias      Regla de negocio aislada
   /----------\     
```

| Nivel | Qué comprueba | Coste | Prioridad en GYMETRA |
|-------|---------------|-------|----------------------|
| **Unitarias** | Una regla de negocio, sin base de datos ni red | Muy bajo | 🔴 Máxima |
| **Componentes** | Un servicio con sus colaboradores simulados | Bajo | 🔴 Alta |
| **Integración** | Un endpoint contra la base real | Medio | 🟠 Media |
| **Contrato** | Que el OpenAPI coincide con el controlador | Bajo | 🟠 Media |
| **E2E** | Un recorrido completo de usuario | Alto | 🟡 Seleccionada |

> La tentación habitual es empezar por E2E porque "demuestra que funciona". En un sistema con la
> base compartida y una dependencia crítica entre servicios, un E2E que falla no dice **por qué**.
> Empezar por abajo es más rápido para el mismo resultado.

---

## Qué probar en cada capa, con nombres reales

### 1. Unitarias — la prioridad absoluta

| Clase | Regla a probar | Riesgo que atrapa |
|-------|----------------|-------------------|
| `LocalNutritionService.generateDayPlan` | Reparto de calorías por día del plan semanal | **R-13**, bug confirmado |
| `LocalNutritionService.generateMealPlan` | Composición de comidas con el total de calorías correcto | R-13 |
| `PaymentService.savePaymentSimplified` | Que rellena todos los campos obligatorios | **R-02**, bug confirmado |
| `MembershipProxyService.checkPermission` | Que deniega cuando Membership no responde | **R-12** |
| `QrBusinessService.getMembershipStatus` | Que una llamada rechazada no se confunde con "sin membresía" | **R-28**, bug confirmado |
| `UserService.updateUserStatus` | Que suspende de verdad, no solo localmente | **R-23** |
| `CognitoUserSyncService.syncUser` | Que crea la fila y asigna el rol por defecto | R-21 |
| `AccessLogBusinessService.marcarIngreso` | Que valida aforo y suscripción antes de registrar | **R-11** |
| Cálculo de días restantes | Que una suscripción vencida da 0 días | R-06 |
| Validación de turno | Que entrada y salida aplican las mismas reglas | **R-03** |

### 2. Componentes

| Prueba | Qué simula |
|--------|------------|
| `MembershipProxyService` con Membership caído | Un `RestTemplate` que lanza excepción |
| `MembershipProxyService` con Membership lento | Un `RestTemplate` que tarda más que el timeout |
| Sincronización con Cognito | Un cliente de Cognito simulado |
| Sincronización de ejercicios | Un cliente de RapidAPI simulado que devuelve catálogo vacío |
| Sincronización de nutrición | Spoonacular simulado, con y sin cuota |

### 3. Integración

| Endpoint | Qué debe comprobar la prueba |
|----------|------------------------------|
| `POST /api/payments` | Que el insert funciona con el esquema real, con las columnas duplicated |
| `GET /api/user-memberships/user/{id}/permission/{p}` | La respuesta que QR consume |
| `DELETE /api/auth/users/{id}` | Qué filas del historial se borran (R-22) |
| `GET /api/user-memberships/user/{id}` | La llamada real del flujo de ingreso (hoy devuelve 401 sin token, R-28) |
| `GET /api/access-log` | Que carga sin traer toda la tabla en memoria (R-05) |
| `GET /api/inspector/...` | Que requiere rol administrativo (R-18) |

### 4. Contrato

Los tres archivos OpenAPI de `07-api/contratos/openapi/` están escritos y son correctos, pero
**nadie los verifica contra el código**. Una prueba de contrato detectaría que:

- La URL que QR llama de verdad es `/user-memberships/user/{id}/permission/{permission}`, no la
  ruta que sugería el nombre del proxy.
- Cualquier endpoint nuevo que no se documente, y cualquier cambio de contrato no documentado.

### 5. E2E — solo cinco escenarios

Con 64 endpoints, un E2E por endpoint no es viable ni útil. Estos cinco cubren el valor completo:

| # | Escenario | Por qué |
|---|-----------|---------|
| 1 | Registro → verificación en Cognito → sync → socio existe en `user` | Cubre R-21, el arranque más frágil |
| 2 | Socio con membresía vigente → QR válido → acceso concedido | El camino que da dinero |
| 3 | Socio con membresía vencida → acceso denegado | Cubre R-06 |
| 4 | Socio sin saldo insuficiente → pago rechazado | Cubre R-02, R-03 |
| 5 | Admin suspende a un socio → el socio no puede entrar | Cubre R-23 |

---

## Herramientas

| Capa | Backend | Frontend |
|------|---------|----------|
| Unitarias | JUnit 5 vía `spring-boot-starter-test` — **ya presente** | Vitest — **ya presente** |
| Componentes | JUnit 5 + Mockito | Vitest |
| Integración | `@SpringBootTest` + **Testcontainers PostgreSQL** — ausente | — |
| Contrato | Verificación de OpenAPI contra el contexto Spring — ausente | — |
| E2E | — | Cypress (frontend socio), Playwright (admin) |
| Cobertura | JaCoCo — **ausente en los tres `pom.xml`** | v8 de Vitest |

> No usar cobertura como puerta de calidad mientras no exista una sola prueba de negocio. Medir
> cobertura con cero pruebas reales solo produce un número que nadie actúa.

### Dos observaciones sobre las herramientas

1. **`spring-boot-starter-test` ya está en los tres `pom.xml`.** Escribir la primera prueba no
   requiere añadir nada.
2. **El `admin-frontend` declara `test:e2e` con Playwright pero no tiene `@playwright/test` en sus
   dependencias.** El script existe y fallaría. El `gymetra-frontend` sí tiene Cypress
   correctamente instalado.

### Empezar desde cero

```xml
<!-- Añadir al pom.xml, dentro de <build><plugins> -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.12</version>
    <executions>
        <execution>
            <goals><goal>prepare-agent</goal></goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals><goal>report</goal></goals>
        </execution>
    </executions>
</plugin>
```

```java
// En cada pom.xml, dependencia de test
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
```

---

## La prueba que hay que escribir primero

No es arbitrario. Es la que más riesgo atrapa por línea escrita, y su fallo ya está documentado:

```java
// backend/GYMETR-Membership/src/test/java/.../PaymentServiceTest.java
// Cierra R-02: savePaymentSimplified no rellena las columnas en español
```

Esa prueba falla hoy. Cuando pasa, el riesgo R-02 está cerrado y hay una barrera que impide
regresar al mismo error.

---

## Qué NO es estrategia de pruebas

| No sirve | Por qué |
|----------|---------|
| Subir la cobertura sin pruebas de negocio | 80 % de líneas cubiertas con getters y setters no detecta ni un solo fallo real |
| Probar solo los controladores | El error de R-02 está en el servicio, no en el endpoint |
| Pruebas E2E de cada endpoint | Son lentas, frágiles y no localizan el fallo |
| Probar el logging | Los `System.out.println` con emoji de `PaymentService` no son comportamiento de negocio |
| Tests que dependen de Cognito real | Sin Testcontainers ni simuladores, la suite no se puede ejecutar en ningún sitio |

---

## Reglas de la estrategia

| Regla | Motivo |
|-------|--------|
| Cada bug corregido lleva su prueba | La prueba documenta por qué el bug no vuelve |
| Las pruebas no tocan la red real | Cognito, Spoonacular y RapidAPI se simulan siempre |
| La base de las pruebas de integración es un contenedor efímero | `gymdb` es compartida y contiene datos reales |
| Un E2E que se rompe por el tiempo se arregla, no se desactiva | Desactivarlo convierte la suite en mentira |
| La suite se ejecuta en el pipeline antes de desplegar | Hoy no lo está, y por eso no sirve de nada |

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`guia-tdd.md`](guia-tdd.md) | Cómo se aplica TDD con ejemplos reales |
| [`00-gobernanza/definicion-de-hecho.md`](../00-gobernanza/definicion-de-hecho.md) | Las pruebas como criterio de cierre |
| [`04-requisitos/no-funcionales.md`](../04-requisitos/no-funcionales.md) | Requisitos que las pruebas deben verificar |
| [`07-api/`](../07-api/README.md) | Contratos a verificar |
| [`R-02`](../15-control-proyecto/riesgos.md) | El primer bug que una prueba debe cerrar |
| [`R-24`](../15-control-proyecto/riesgos.md) | Ausencia de pruebas del núcleo de negocio |
