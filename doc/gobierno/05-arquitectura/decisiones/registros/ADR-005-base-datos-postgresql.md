# ADR-005 — PostgreSQL como almacén de datos

| Campo | Valor |
|-------|-------|
| **ID** | ADR-005 |
| **Título** | PostgreSQL como almacén de datos |
| **Fecha** | 2026-09 |
| **Estado** | Accepted |
| **Decisor** | Equipo GYMETRA |
| **Reemplaza** | — |
| **Impacto** | Bajo |

---

## 1. Contexto

GYMETRA necesita persistir datos relacionales: usuarios y sus roles, planes de membresía,
suscripciones, pagos, códigos QR, registros de acceso, sedes, catálogo de ejercicios y
recetas. Las relaciones entre esas entidades son claras (un socio tiene una suscripción, una
suscripción tiene pagos, un socio genera accesos), y hay necesidad de consultas que cruzan
varias tablas.

El proyecto necesita además:
- Coste cero o mínimo en infraestructura.
-(operation sin equipo de base de datos dedicado.
- Portabilidad entre el entorno de desarrollo y producción.
- Compatibilidad con el despliegue en Docker.

### Alternativas consideradas

| Alternativa | Ventajas | Desventajas | ¿Por qué se descartó? |
|-------------|----------|--------------|------------------------|
| **MySQL** | Muy conocida, buen rendimiento | No añade ventaja frente a PostgreSQL para este caso | PostgreSQL es estrictamente superior aquí |
| **SQLite** | Cero configuración, ideal para desarrollo | No sirve para producción con concurrencia real | Solo útil en pruebas unitarias aisladas |
| **MongoDB** | Flexible con esquemas cambiantes | El modelo es relacional, con mejor encaje en JPA; los analíticos con joins son débiles | Los datos de GYMETRA son altamente relacionales |
| **PostgreSQL (elegida)** | Relacional completo, con lugar para JSON si hace falta, excelente soporte en Spring Data JPA, licencia PostgreSQL | Algo más pesado que SQLite para arrancar | La mejor relación capacidad/coste para el caso |

**Fundamento:** los datos de GYMETRA son relacionales por naturaleza y el equipo ya conoce
modelado relacional y JPA. PostgreSQL ofrece capacidades de JSON cuando se necesiten, sin
salir del mismo motor.

---

## 2. Decisión

**PostgreSQL 15 es el almacén de datos del sistema, ejecutado en un contenedor
`postgres:15-alpine`.**

### Configuración actual

| Aspecto | Valor |
|---------|-------|
| **Versión** | 15 (alpine) |
| **Nombre de la base** | `gymdb` |
| **Usuario** | `postgres` |
| **Puertos** | ⚠️ `5000:5432` en el Compose y en `application.properties.bak`; `5432` en `application.yml` y en `application-prod.properties` |
| **Volumen** | ✅ `postgres_data:/var/lib/postgresql/data`, con el nombre `postgres_data` declarado en el bloque `volumes:` del Compose |
| **Pooling** | Sin pool de conexiones externo (PgBouncer) |
| **Migraciones** | ⚠️ Ninguna. Sin Flyway ni Liquibase |
| **Esquema en desarrollo** | `ddl-auto: update` (`application.yml`) |
| **Esquema en producción** | `ddl-auto: validate` (`application-prod.properties`) |

> ⚠️ **Cuatro problemas de configuración documentados:**
> 1. **El mapeo de puertos no coincide.** El Compose expone PostgreSQL en el puerto `5000`
>    del host, pero la configuración de los tres servicios apunta a `localhost:5432`
>    (`application.yml` en GYMETR-login, `application.properties` en Membership y en QR). Solo
>    funciona si se cambia el puerto del Compose o si PostgreSQL corre fuera de Docker.
>    `application-prod.properties` sí usa `5432` (vía `host.docker.internal`).
> 2. **La contraseña no coincide entre entornos.** `docker-compose.yml` define
>    `POSTGRES_PASSWORD=123456`, mientras que `.env.development` y
>    `application-prod.properties` usan `1234567890`. Con la configuración actual, la
>    aplicación **no puede conectarse** a la base que levanta el Compose.
> 3. **No hay migraciones versionadas.** En desarrollo, Hibernate crea y altera el esquema
>    al arrancar (`update`). En producción, `validate` solo comprueba que el esquema
>    coincida con las entidades y **falla el arranque si no coincide**. Como no existe
>    ningún script de migración, nadie sabe cómo llevar el esquema de una versión a otra: el
>    único mecanismo es arrancar en desarrollo, dejar que Hibernate lo altere, y confiar.
> 4. **Sin reversibilidad.** Ningún cambio de esquema se puede deshacer automáticamente.

---

## 3. Consecuencias

### Positivas

- Coste cero: la imagen oficial `postgres:15-alpine` es ligera y gratuita.
- Soporte excelente en Spring Data JPA y en el ecosistema Spring.
- Integridad referencial con claves foráneas, útil para mantener coherentes pagos y
  membresías.
- PostgreSQL permite añadir campos JSON si en el futuro se necesitan metadatos flexibles,
  sin cambiar de motor.
- Docker Compose lo levanta en un comando, lo que simplifica el arranque del entorno.

### Negativas

- ⚠️ **Es un punto único de fallo** (junto con el hecho de que los tres servicios la
  comparten; ver [ADR-002](./ADR-002-base-datos-compartida.md)). Si PostgreSQL se cae, el
  sistema entero deja de funcionar.
- ⚠️ **El esquema se gestiona de forma distinta en cada entorno, y ninguno de los dos
  caminos es adecuado.** Desarrollo usa `ddl-auto: update`, que muta la base al arrancar sin
  registro de lo que cambió. Producción usa `ddl-auto: validate`, que es más seguro porque
  no altera nada, pero **falla el arranque** si el esquema no coincide exactamente con las
  entidades, y no hay migraciones versionadas que permitan llevar el esquema al estado
  esperado. El resultado es que un cambio de entidad exige intervención manual.
- ⚠️ **Las credenciales de la base están en texto plano** en `docker-compose.yml`,
  `.env.development` y `application-prod.properties`, y no coinciden entre sí.
  Ver R-15.
- ⚠️ **Sin pool de conexiones.** Con tres servicios y pocos usuarios, el límite
  por defecto de PostgreSQL (100 conexiones) es suficiente, pero no hay protección si el
  tráfico crece o hay conexiones que no se cierran.
- ⚠️ **Sin réplicas ni backups automáticos.** No hay estrategia documentada de respaldo ni
  de recuperación ante desastres.

### Neutras

- La decisión de compartir una única instancia entre los tres servicios es
  [ADR-002](./ADR-002-base-datos-compartida.md), no de este ADR. Aquí solo se decide el
  motor.

---

## 4. Alternativas para el futuro

**Revisar esta decisión si:**

- Se separan las bases de datos por servicio (ver [ADR-002](./ADR-002-base-datos-compartida.md)).
- El volumen de registros de acceso crece y la tabla deja de caber cómodamente en un
  disco.
- Se necesita disponibilidad superior a la que ofrece un único servidor.

**Evolución natural:**

1. Adoptar **Flyway** o **Liquibase** para migraciones versionadas y auditadas, sustituyendo
   `ddl-auto: update`.
2. Configurar **backups automáticos** con `pg_dump` programado.
3. Añadir un **pool de conexiones** (PgBouncer) si el tráfico lo justifica.
4. Considerar **réplicas de lectura** para las consultas analíticas del dashboard de métricas.

---

## 5. Estado de implementación

| Aspecto | Estado |
|---------|--------|
| ¿Está implementado? | Sí |
| ¿Desde cuándo? | Desde el inicio del proyecto |
| ¿Dónde? | `docker-compose.yml` (servicio `database`), configuración de los tres servicios: `application.yml` en GYMETR-login, `application.properties` en Membership y en QR |
| ¿Documentado? | Este ADR, modelo de datos, runbook de base de datos |

---

## Documentos relacionados

- [ADR-002 — Base de datos compartida](./ADR-002-base-datos-compartida.md) — la decisión de compartir esta base
- [vision-general.md](../../vision-general.md) — vista de despliegue
- [`../../../06-datos/modelo-de-datos.md`](../../../06-datos/modelo-de-datos.md) — entidades y relaciones
- [`../../../10-devops/configuracion-local.md`](../../../10-devops/configuracion-local.md) — variables de entorno
