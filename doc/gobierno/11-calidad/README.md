# 11 · Calidad

> Qué se prueba hoy en GYMETRA: prácticamente nada. Esta sección documenta el estado real, la
> estrategia que debería aplicarse y el orden concreto para revertir la situación.

---

## Estado real de las pruebas

| Proyecto | Dependencias de prueba | Scripts de prueba | Archivos de prueba | Pruebas reales |
|----------|----------------------|-------------------|--------------------|----------------|
| `GYMETR-login` | `spring-boot-starter-test` | — | 1 | 0 |
| `GYMETR-Membership` | `spring-boot-starter-test` | — | 1 | 0 |
| `GYMETRA - Qr` | `spring-boot-starter-test` | — | **0** | 0 |
| `gymetra-frontend` | `vitest`, `cypress` | `test:unit`, `test:e2e` | 5 | 2 de plantilla |
| `admin-frontend` | `vitest` | `test:unit`, `test:e2e` | **0** | 0 |

### Los únicos archivos de prueba del repositorio

| Archivo | Qué hace |
|---------|----------|
| `GYMETR-login/.../GymetraApplicationTests.java` | `contextLoads()` vacío |
| `GYMETR-Membership/.../GymetraApplicationTests.java` | `contextLoads()` vacío |
| `gymetra-frontend/tests/e2e/specs/test.cy.ts` | Plantilla de Cypress: busca el texto *"Ready to create an app?"* |

Ese último archivo **fallaría contra la aplicación real**: comprueba el texto de la plantilla de
Vite, no el de GYMETRA.

### Lo que no existe

| Ausente | Consecuencia |
|---------|--------------|
| Pruebas unitarias del núcleo de negocio | Ningún cambio es verificable (R-24) |
| Cobertura de código | No se puede saber qué se ha probado (R-04) |
| Plugin de cobertura en los `pom.xml` | No hay informe posible |
| Pruebas de integración | La base compartida no se valida (R-12) |
| Pruebas de contrato | Los contratos OpenAPI no se verifican contra el código (R-04) |
| Pruebas de los servicios QR y admin | Sin cobertura alguna |

> Los tres `pom.xml` incluyen `spring-boot-starter-test`, así que la infraestructura está
> preparada. Lo que falta son las pruebas.

### Un detalle importante del pipeline

`docker-compose.yml` construye el backend con el argumento `SKIP_TESTS=true`, y el `Jenkinsfile`
no ejecuta ninguna etapa de pruebas. Aunque mañana se escribieran mil pruebas, **el pipeline
seguiría sin ejecutarlas**. La calidad no es un problema solo de cobertura: también lo es del
proceso.

---

## Documentos de esta sección

| Documento | Contenido |
|-----------|-----------|
| [`estrategia-de-pruebas.md`](estrategia-de-pruebas.md) | Qué tipos de prueba, en qué capas y con qué prioridad |
| [`guia-tdd.md`](guia-tdd.md) | Cómo se trabaja con TDD aquí, con ejemplos del código real |

---

## Números de referencia

| Métrica | Valor |
|---------|-------|
| Endpoints en el sistema | 64 |
| Pruebas automatizadas que los cubren | 0 |
| Servicios backend sin ninguna prueba de negocio | 3 de 3 |
| Fracción de endpoints con prueba de integración | 0 % |
| Plugins de cobertura configurados | 0 |

Cuando la cobertura de endpoints es 0, ninguna otra métrica importa: el sistema no se puede
cambiar con confianza.

---

## Lo primero que hay que hacer

Ordenado por relación entre esfuerzo y riesgo que reduce:

| # | Acción | Riesgo que ataca | Esfuerzo |
|---|--------|------------------|----------|
| 1 | Quitar `SKIP_TESTS=true` y añadir una etapa de pruebas al pipeline | R-04, R-17 | Bajo |
| 2 | Probar los cálculos de planes y calorías | R-13, R-03 | Medio |
| 3 | Probar el registro de pagos y la duplicación de columnas | R-02 | Bajo |
| 4 | Probar el proxy de permisos y su respuesta ante caída | R-06, R-12 | Medio |
| 5 | Probar la sincronización de Cognito y la asignación de roles | R-21, R-23 | Medio |
| 6 | Probar los endpoints de diagnóstico con rol y sin rol | R-16, R-18 | Bajo |
| 7 | Probar el aforo máximo | R-11 | Bajo |
| 8 | Probar el borrado en cascada y el historial | R-22 | Medio |
| 9 | Contratos OpenAPI contra los controladores | R-04 | Medio |
| 10 | Sustituir la prueba de Cypress de plantilla por recorridos reales | R-04 | Medio |

El orden no es caprichoso: los puntos 2 a 8 son reglas de negocio con bugs **ya identificados y
documentados**. Escribir la prueba de un bug conocido la deja cerrado, y ese es el mejor punto de
entrada.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`00-gobernanza/definicion-de-listo.md`](../00-gobernanza/definicion-de-listo.md) | Criterios de entrada |
| [`00-gobernanza/definicion-de-hecho.md`](../00-gobernanza/definicion-de-hecho.md) | Criterios de salida |
| [`04-requisitos/no-funcionales.md`](../04-requisitos/no-funcionales.md) | Requisitos no funcionales |
| [`13-operaciones/observabilidad.md`](../13-operaciones/observabilidad.md) | Detección de fallos en producción |
| [`R-04`](../15-control-proyecto/riesgos.md) | Cobertura prácticamente nula |
| [`R-24`](../15-control-proyecto/riesgos.md) | Sin pruebas unitarias del núcleo de negocio |
