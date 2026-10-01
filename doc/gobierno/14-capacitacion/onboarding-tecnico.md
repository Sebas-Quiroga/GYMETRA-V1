# Onboarding técnico

> Bienvenido al equipo. Esta es la guía para los primeros días.
> Objetivo: poder hacer tu primer `commit` en 3 días.
> Si algo de este documento no se entiende o está desactualizado, corrígelo: esa será tu primera
> contribución.

> **Aviso importante antes de empezar.** El proyecto **no tiene pruebas de negocio**. Hay dos
> clases que arrancan el contexto de Spring y poco más. Eso significa que no hay red de seguridad
> al cambiar código, y que este documento tiene más valor del que tendría en un proyecto con
> pruebas. Lelo entero, no solo el día 1.

---

## Día 1 · Preparación

### Mañana: acceso y entorno

- [ ] Acceso al repositorio
- [ ] Acceso al servidor de desarrollo
- [ ] Acceso a las credenciales de AWS que el proyecto necesita
- [ ] Instalar: Docker Desktop, JDK 17, Maven, Node 18 o superior
- [ ] Configurar el entorno siguiendo [`10-devops/configuracion-local.md`](../10-devops/configuracion-local.md)

```bash
# Comprobar versiones
java -version      # debe ser 17
mvn -version
node --version     # 18 o superior
docker-compose --version
```

### Lo que va a fallar, y está previsto

Antes de que lo descubras tú, esto es lo que se sabe:

| Problema | Qué hacer |
|----------|-----------|
| `docker-compose up` solo levanta `database`, `backend` y `frontend` | Levanta Membership y QR a mano, con sus propios `pom.xml` |
| El backend de Login con perfil `prod` no conecta con la base | Usa el perfil `default`; la credencial del compose y la del `application-prod.properties` no coinciden |
| `docker-compose logs` no muestra nada útil | Los tres servicios escriben a consola, sin formato estructurado |
| El health check del pipeline devuelve 404 | Ningún servicio tiene Actuator; ignóralo por ahora |
| Los `.env` de los frontends apuntan a `localhost` | Dentro de un contenedor hay que usar el nombre del servicio |

### Tarde: leer la documentación base

En este orden, porque cada uno apoya al siguiente:

1. [`00-guia-sdd.md`](../00-guia-sdd.md) — Cómo trabaja el equipo (30 min)
2. [`01-contexto/vision-general.md`](../01-contexto/vision-general.md) — Qué se construye (20 min)
3. [`02-dominio/mapa-de-dominio.md`](../02-dominio/mapa-de-dominio.md) — El dominio (30 min)
4. [`05-arquitectura/vision-general.md`](../05-arquitectura/vision-general.md) — Cómo está construido (30 min)
5. [`00-gobernanza/convenciones-git.md`](../00-gobernanza/convenciones-git.md) — Cómo se gestiona el código (20 min)

### Reuniones del día 1

- [ ] Presentación del equipo
- [ ] 1:1 con la persona responsable del proyecto (30 min): contexto y responsabilidades
- [ ] Demo del producto, si hay grabación, verla antes

---

## Día 2 · Entender el dominio

### Documentación de dominio y requisitos

- [ ] [`02-dominio/entidades-y-reglas.md`](../02-dominio/entidades-y-reglas.md) — Entidades y reglas
- [ ] [`02-dominio/eventos-de-dominio.md`](../02-dominio/eventos-de-dominio.md) — Eventos: **ninguno implementado**
- [ ] [`04-requisitos/historias-de-usuario.md`](../04-requisitos/historias-de-usuario.md) — HUs
- [ ] [`01-contexto/glosario.md`](../01-contexto/glosario.md) — Términos

### Explorar el código

```bash
# 1. Los tres backends están en carpetas separadas
backend/GYMETR-login/
backend/GYMETR-Membership/
backend/GYMETRA\ -\ Qr/

# 2. Los dos frontends
frontend/gymetra-frontend/
frontend/admin-frontend/
```

- [ ] Leer la ficha del servicio en el que vas a trabajar: [`09-microservicios/`](../09-microservicios/README.md)
- [ ] Comparar su estructura con [`05-arquitectura/arquitectura-hexagonal.md`](../05-arquitectura/arquitectura-hexagonal.md) y anotar las diferencias
- [ ] Arrancar el servicio y probar sus endpoints principales

```bash
# Ejemplo con Membership
cd "backend/GYMETR-Membership"
mvn spring-boot:run

# En otra terminal
curl -i http://localhost:8081/api/user-memberships/user/1/permission/access_gym
```

> **Ojo con el puerto de la base.** Con el compose actual Postgres se publica en
> `5000:5432`, pero los `pom.xml` de los backends apuntan a `localhost:5432`. O bien publicas
> también el 5432 en el `docker-compose.yml`, o bien exportas
> `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5000/gymdb` antes de ejecutar
> `mvn spring-boot:run`. Sin uno de los dos pasos, el servicio no conecta.

### Reunión del día 2

- [ ] Sesión de dominio con la persona responsable (1 hora)
  - Pide que explique el flujo principal de acceso al gimnasio
  - **Anota los términos que no entiendas** y añádelos al glosario

---

## Día 3 · Primera contribución

### La tarea

Se te asignará una tarea pequeña: un arreglo de un error o una mejora de documentación. El objetivo
es aprender el flujo, no la complejidad.

### Flujo TDD para tu primera tarea

1. Leer la historia y los criterios de aceptación
2. Escribir la prueba que verifica el criterio
3. Implementar lo mínimo para que pase
4. Refactorizar si hace falta
5. Abrir el PR con la convención de
   [`00-gobernanza/convenciones-git.md`](../00-gobernanza/convenciones-git.md)

> El paso 2 no es opcional aunque hoy no haya red de seguridad. **Escribe la prueba primero
> precisamente porque no hay red de seguridad**: es la única forma de saber que no has roto nada.

### Antes de abrir el PR

- [ ] `mvn test` pasa
- [ ] El título del commit sigue `tipo(scope): descripción`
- [ ] La rama se llama `feat/HU-XXX-descripcion` o `fix/BUG-XXX-descripcion`
- [ ] Si tocaste documentación, actualizaste los enlaces relacionados

### Comprobaciones que hoy pasan sin comprobar nada

Esto es importante que lo sepas el primer día:

| Comando | Qué parece que hace | Qué hace realmente |
|---------|--------------------|--------------------|
| `mvn test` | Verifica el código | Arranca dos contextos de Spring y termina |
| Health check del pipeline | Verifica que el servicio vive | Devuelve 404 y el pipeline lo ignora |
| `docker-compose ps` | Muestra el estado | Muestra el contenedor, no la salud de la aplicación |

> Si añades una prueba real, deja de ser decorativa. Es la contribución de mayor valor posible en
> este momento del proyecto.

---

## Semana 1 · Profundizar

| Día | Actividad |
|-----|-----------|
| 4 | Participar en una revisión de código: observa primero |
| 5 | Asistir al daily con algo concreto que aportar |
| 5 | Leer [`05-arquitectura/guia-de-patrones.md`](../05-arquitectura/guia-de-patrones.md) |
| 5 | Leer [`11-calidad/guia-tdd.md`](../11-calidad/guia-tdd.md) y [`11-calidad/estrategia-de-pruebas.md`](../11-calidad/estrategia-de-pruebas.md) enteros |

---

## Semana 2 · Independencia guiada

- [ ] Completar una historia de usuario de forma independiente
- [ ] Participar activamente en una revisión de código
- [ ] Leer [`07-api/autenticacion-y-autorizacion.md`](../07-api/autenticacion-y-autorizacion.md)
  y entender el modelo de tokens
- [ ] Asistir a la retrospectiva

---

## Arquitectura: los 5 conceptos que hay que entender

### 1. Contexto limitado por servicio

Los tres servicios tienen límites reales, pero **comparten la misma base de datos**. Eso rompe la
independencia que el nombre sugiere: cualquier migración afecta a los tres. Léelo en
[`06-datos/modelo-de-datos.md`](../06-datos/modelo-de-datos.md) antes de tocar el esquema.

### 2. La estructura real no es hexagonal

La documentación de arquitectura describe arquitectura hexagonal, y
[`05-arquitectura/arquitectura-hexagonal.md`](../05-arquitectura/arquitectura-hexagonal.md) lo
reconoce. En el código hay tres capas por paquete:

```
controller/   → HTTP
service/      → lógica de negocio y llamadas entre servicios
repository/   → persistencia
entity/       → modelo JPA
```

**No hay `domain/` ni `application/` separados.** La lógica de negocio vive en `service/`, junto a
las llamadas HTTP. Es la diferencia más importante entre lo que dice la documentación y lo que hay,
y hay que tenerla presente al contribuir.

### 3. No hay eventos

`02-dominio/eventos-de-dominio.md` documenta el modelo de eventos como diseño previsto. **No hay
broker, ni publicación, ni consumo.** La comunicación entre servicios es REST síncrona. No busques
código de eventos: no existe.

### 4. El flujo de una petición real

El único flujo de negocio entre servicios es el del ingreso:

```
Socio → POST /api/access-log/entrada        (QR, 8090)
      → GET  /api/user-memberships/user/1   (Membership, 8081, sin token → 401, R-28)
```

Un salto de red, sin timeout ni reintentos. Si Membership no responde, el acceso se deniega.

Hay una segunda llamada de red, no del negocio: **4 de los 12 endpoints** de `ExerciseController`
usan el bean `MembershipProxyService.checkPermission`, que llama a
`GET /api/user-memberships/user/{userId}/permission/training` (ruta pública). El endpoint
`/api/memberships-proxy/**` existe en QR, exige JWT y **nadie lo invoca**.

### 5. La autorización no existe como concepto

Los tres `SecurityConfig` terminan en `.anyRequest().authenticated()`. **Ningún controlador exige
rol.** Autenticado no es lo mismo que autorizado, y esa diferencia es el riesgo R-16.

---

## Preguntas frecuentes

**¿Por qué no puedo commitear directamente en `main`?**
Porque el flujo es PR con al menos una aprobación. Ver
[`00-gobernanza/convenciones-git.md`](../00-gobernanza/convenciones-git.md).

**¿Cómo cambio el esquema de la base de datos?**
Con una migración versionada en
[`06-datos/modelo-de-datos.md`](../06-datos/modelo-de-datos.md). **Hoy no hay herramienta de
migraciones**: ni Flyway ni Liquibase. El esquema se crea con el script SQL y `ddl-auto: update`.
Esa es una deuda real del proyecto.

**¿Cómo sé si un cambio en la API rompe a un consumidor?**
No hay pruebas de contrato. Lo único disponible es la especificación OpenAPI en
[`07-api/README.md`](../07-api/README.md) y revisar a mano quién llama a lo que cambias.

**¿Dónde pregunto si me atasco?**
1. Busca primero en esta documentación
2. Pregunta en el canal del equipo
3. No esperes más de una hora

**¿Qué hago si encuentro documentación incorrecta?**
Corrígela y abre un PR. La documentación es código.

**¿Puedo usar `System.out.println`?**
No. Usa el logger con su nivel. En `PaymentService` hay ocho líneas de traza con emoji a
`System.out`, y en `MembershipProxyService` un `System.err.println` que se traga las excepciones.
No copies ese patrón.

---

## Recursos adicionales

| Recurso | Ubicación | Para qué |
|---------|-----------|----------|
| Guía Git | [`00-gobernanza/convenciones-git.md`](../00-gobernanza/convenciones-git.md) | Convenciones de commit y rama |
| ADRs del proyecto | [`05-arquitectura/decisiones/`](../05-arquitectura/decisiones/README.md) | Decisiones tomadas y por qué |
| Runbook del servicio | [`09-microservicios/servicios/`](../09-microservicios/README.md) | Operar y diagnosticar |
| Riesgos conocidos | [`15-control-proyecto/riesgos.md`](../15-control-proyecto/riesgos.md) | Lo que ya está roto |
| Convenciones de SDD | [`00-guia-sdd.md`](../00-guia-sdd.md) | Cómo se trabaja en el proyecto |
| Guía de calidad | [`11-calidad/estrategia-de-pruebas.md`](../11-calidad/estrategia-de-pruebas.md) | Qué se debería probar |

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`10-devops/configuracion-local.md`](../10-devops/configuracion-local.md) | Preparación técnica |
| [`11-calidad/guia-tdd.md`](../11-calidad/guia-tdd.md) | Flujo de trabajo |
| [`00-gobernanza/convenciones-git.md`](../00-gobernanza/convenciones-git.md) | Convenciones de código |
| [`09-microservicios/servicios/`](../09-microservicios/README.md) | Tu servicio |
