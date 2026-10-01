# 13 · Operaciones

> Cómo se sabe qué está pasando en GYMETRA y qué se hace cuando algo falla. El titular de esta
> sección es una conclusión incómoda: hoy no se sabe, porque no hay instrumentación.

---

## Estado real de la observabilidad

| Capacidad | ¿Existe? | Detalle |
|-----------|----------|---------|
| Endpoint de salud | ❌ | Ningún servicio incluye `spring-boot-starter-actuator` |
| Métricas | ❌ | No hay Micrometer ni Prometheus |
| Trazas distribuidas | ❌ | No hay OpenTelemetry ni Zipkin |
| Registro centralizado | ❌ | Cada servicio escribe a su consola |
| Alertas | ❌ | No hay definición de ninguna |
| Paneles de operación | ❌ | No hay Grafana ni similar |
| Historial de errores | ❌ | No hay Sentry ni equivalente |
| Niveles de log configurados | ⚠️ | Sí, pero solo para desarrollo: Hibernate SQL a `DEBUG` |
| Logs estructurados | ❌ | Mezcla de SLF4J, `System.out` y `System.err` |
| Correlation ID por petición | ❌ | No hay identificador que una dos peticiones entre servicios |

> La ausencia de Actuator es la más grave, porque el pipeline **ya consulta** `/actuator/health` y
> por tanto cree que sí existe.

---

## Documentos de esta sección

| Documento | Contenido |
|-----------|-----------|
| [`observabilidad.md`](observabilidad.md) | Qué se debería medir, con qué herramientas y en qué orden |
| [`gestion-de-incidentes.md`](gestion-de-incidentes.md) | Severidad, roles, procedimiento y comunicación |

---

## Cómo se opera hoy

En la práctica, el ciclo es:

1. Un usuario o el administrador nota que algo falla.
2. Alguien abre el servidor y mira `docker-compose logs`.
3. Busca a mano entre la salida de tres servicios.
4. Reinicia lo que parezca estar caído.
5. Si no se arregla, mira el código.

Funciona a escala de un sistema pequeño, y por eso no se ha invertido en herramientas. El problema
aparece cuando hay que responder a un socio que pregunta por qué su pago falló, o demostrar que
un acceso se denegó por un motivo concreto: **hoy no hay forma de saberlo**.

---

## Qué falta y por qué importa

| Falta | Consecuencia concreta |
|-------|-----------------------|
| Salud por servicio | Un despliegue con el backend caído se reporta como exitoso (R-17) |
| Correlación entre servicios | No se puede seguir el recorrido de un acceso: socio → QR → Membership |
| Registro de accesos denegados | Sin R-14 no hay forma de demostrar por qué se rechazó a alguien |
| Registro de fallos de pago | R-02 pasa inadvertido: el socio ve un error genérico |
| Métrica de peticiones denegadas por caída de Membership | Sin ella, una dependencia crítica que falla no se ve |
| Alerta de caída del pipeline | Un despliegue roto puede pasar días sin que nadie lo note |

---

## Números de referencia

| Métrica | Valor |
|---------|-------|
| Endpoints expuestos | 64 |
| Endpoints con registro de auditoría | 0 |
| Endpoints con métricas | 0 |
| Servicios con health check funcional | 0 de 3 |
| Alertas definidas | 0 |
| Tiempo de detección medio estimado | El que tarde un usuario en avisar |

---

## Lo mínimo que hay que montar

En orden, por relación entre esfuerzo y daño que evita:

| # | Acción | Esfuerzo | Qué desbloquea |
|---|--------|----------|-----------------|
| 1 | Añadir `spring-boot-starter-actuator` a los tres `pom.xml` | Bajo | Que el health check del pipeline signifique algo |
| 2 | Configurar `management.endpoints.web.exposure` con `health` e `info` | Bajo | Lo mismo, con menos superficie |
| 3 | Corregir la URL de health check del `Jenkinsfile` | Bajo | Detección de despliegue roto |
| 4 | Cambiar los `System.out.println` y `System.err.println` por SLF4J | Bajo | Logs con nivel y estructura |
| 5 | Añadir correlation ID en el filtro de petición | Medio | Seguir un recorrido entre servicios |
| 6 | Registrar los accesos denegados con motivo | Bajo | R-14, y capacidad de auditar |
| 7 | Métricas de Micrometer en los tres servicios | Medio | Base para cualquier alerta |
| 8 | Prometheus y Grafana | Medio | Visualización y histórico |
| 9 | Alertas mínimas | Medio | Detección sin intervención humana |

Los puntos 1 a 4 son baratos y eliminan de raíz el problema más desconcertante del sistema: **no
saber si algo está funcionando**.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`10-devops/`](../10-devops/README.md) | Pipeline y despliegue |
| [`09-microservicios/`](../09-microservicios/README.md) | Runbooks por servicio |
| [`11-calidad/`](../11-calidad/README.md) | Lo que las pruebas no cubren, lo vigila la operación |
| [`R-14`](../15-control-proyecto/riesgos.md) | Accesos denegados sin registrar |
| [`R-17`](../15-control-proyecto/riesgos.md) | Health check que no comprueba nada |
