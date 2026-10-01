# Entornos

> Los tres ambientes que usa GYMETRA, con las variables reales de cada uno. Los valores concretos
> de secretos **no se reproducen aquí**: están en el repositorio, y eso ya es el problema R-15.

---

## Resumen de ambientes

| | Desarrollo | Producción (Docker) | Local sin Docker |
|---|---|---|---|
| **Base de datos** | `localhost:5432` | `host.docker.internal:5432` | `localhost:5432` |
| **Usuario / contraseña** | `postgres` / la del `.env` | `postgres` / **difiere del compose** | `postgres` / la del `.env` |
| **`ddl-auto`** | `update` | `validate` (solo Login) | `update` |
| **Perfil de Spring** | por defecto | `prod` | por defecto |
| **Puerto Login** | 8080 | `${GYMETRA_LOGIN_PORT:8080}` | 8080 |
| **Puerto Membership** | 8081 | `${GYMETRA_MEMBERSHIP_PORT:8081}` | 8081 |
| **Puerto QR** | 8090 | `${GYMETRA_QR_PORT:8090}` | 8090 |
| **Frontend** | `localhost:8100` (socio) · `localhost:8101` (admin) | `8100` (nginx) | `localhost:8100` (socio) |

---

## 1. Desarrollo

### Servicios backend

Cada backend importa su `.env.development` local mediante
`spring.config.import=optional:file:.env.development[.properties]`. El prefijo `optional:` evita
que el arranque falle si el archivo no existe, lo que hace que **un `.env` ausente se manifieste
como un fallo de autenticación más adelante y no como un error de configuración claro**.

| Variable | Servicio | Valor por defecto en el código |
|----------|----------|-------------------------------|
| `SPRING_DATASOURCE_URL` | los tres | `jdbc:postgresql://localhost:5432/gymdb` |
| `SPRING_DATASOURCE_USERNAME` | los tres | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | los tres | vacío |
| `COGNITO_ISSUER_URI` | los tres | **vacío** | En Login el arranque falla: `JwtDecoders.fromIssuerLocation("")` lanza excepción en el bean `JwtDecoder` |
| `COGNITO_JWKS_URI` | ninguno | **vacío** | **Ningún servicio la lee**: los tres construyen su propio `JwtDecoder` con el issuer |
| `COGNITO_CLIENT_ID` | los tres | vacío |
| `AWS_ACCESS_KEY_ID` | Login | vacío |
| `AWS_SECRET_ACCESS_KEY` | Login | vacío |
| `SPRING_MAIL_HOST` | Login, Membership | `smtp.gmail.com` |
| `SPRING_MAIL_PORT` | Login, Membership | `587` |
| `SPRING_MAIL_USERNAME` | Login, Membership | vacío |
| `SPRING_MAIL_PASSWORD` | Login, Membership | vacío |
| `STRIPE_SECRET_KEY` | Membership | vacío |
| `RAPIDAPI_EXERCISE_KEY` | QR | **clave real escrita en el código** |
| `RAPIDAPI_EXERCISE_HOST` | QR | `exercisedb.p.rapidapi.com` |
| `SPOONACULAR_API_KEY` | QR | **clave real escrita en el código** |

> Los valores por defecto de las claves externas están en el propio `application.properties` de
> QR, no solo en el `.env`. Aunque se vacíe el `.env`, la clave real sigue en el código (R-15).

### Configuración de aplicación fija

| Propiedad | Servicio | Valor | Nota |
|-----------|----------|-------|------|
| `app.services.membership-url` | QR | `http://localhost:8081/api` | Sin variable de entorno: no se puede cambiar por ambiente |
| `spoonacular.api.url` | QR | `https://api.spoonacular.com` | Sin variable |
| `server.address` | los tres | `0.0.0.0` | Escucha en todas las interfaces |

### Frontend del socio

`frontend/gymetra-frontend/.env.development`:

| Variable | Valor | Nota |
|----------|-------|------|
| `VITE_API_URL_LOGIN` | `http://localhost:8080/api` | El código concatena `/auth/users` y `/me`: con `/api/auth` las rutas saldrían duplicadas |
| `VITE_API_URL_MEMBERSHIP` | `http://localhost:8081/api` | |
| `VITE_API_URL_QR` | `http://localhost:8090/api` | |
| `VITE_COGNITO_REGION` | región del pool | |
| `VITE_COGNITO_USER_POOL_ID` | identificador del pool | **Valor real versionado** |
| `VITE_COGNITO_CLIENT_ID` | client id de la app | **Valor real versionado** |
| `VITE_STRIPE_PUBLIC_KEY` | clave pública de Stripe | Valor de prueba, versionado |

### Frontend de administración

`frontend/admin-frontend/.env.development` tiene las mismas variables de servicio y de Cognito,
**sin la de Stripe**.

### Raíz del repositorio

| Archivo | Variable | Valor |
|---------|----------|-------|
| `.env.development` | `VITE_API_URL` | `http://localhost:8080/api/auth` |
| `.env.production` | `VITE_API_URL` | `http://backend:8080/api/auth` |

> **`VITE_API_URL` es una variable muerta.** No la consume ningún frontend:
> `grep import.meta.env.VITE_API_URL[^_]` devuelve 0 coincidencias. Las variables que el código
> lee de verdad son `VITE_API_URL_LOGIN`, `VITE_API_URL_MEMBERSHIP` y `VITE_API_URL_QR`, y están
> en el `.env` de cada frontend, apuntando a `localhost`.
>
> Tampoco sirve de nada que el `.env.production` de la raíz use el nombre del contenedor
> (`http://backend:8080`): el `Dockerfile` del frontend **no copia ningún `.env`**, así que esa
> URL no llega a la imagen. Dentro de un contenedor habría que inyectar las tres variables reales
> (o usar `localhost`, que tampoco funciona). El `admin-frontend` no tiene servicio en el compose.

---

## 2. Producción (Docker)

### Lo que define `docker-compose.yml`

| Servicio | Imagen | Puertos | Variables de entorno |
|----------|--------|---------|----------------------|
| `database` | `postgres:15-alpine` | `5000:5432` | `POSTGRES_DB=gymdb`, `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD` |
| `backend` | `gymetra/backend:latest` | `8080:8080` | `SPRING_PROFILES_ACTIVE=prod`, `JAVA_OPTS`, `DB_HOST=database` |
| `frontend` | `gymetra/frontend:latest` | `8100:80` | `NODE_ENV=production` |

### Lo que el perfil `prod` hace con esas variables

`backend/GYMETR-login/src/main/resources/application-prod.properties`:

| Propiedad | Valor | Problema |
|-----------|-------|----------|
| `spring.datasource.url` | `jdbc:postgresql://host.docker.internal:5432/gymdb` | **Ignora `DB_HOST=database`** y apunta al host, no al servicio |
| `spring.datasource.password` | literales en el archivo | **No coincide** con `POSTGRES_PASSWORD` del compose |
| `spring.jpa.hibernate.ddl-auto` | `validate` | Correcto: no altera el esquema en producción |
| `spring.mail.username` / `password` | literales reales | Secreto en el código (R-15) |
| `jwt.secret` | literal en el archivo | Secreto en el código, y además **no se usa**: la autenticación es contra Cognito (R-15) |
| `server.port` | `${GYMETRA_LOGIN_PORT:8080}` | Correcto, parametrizado |

### Los otros dos servicios no tienen perfil de producción

| Servicio | `application-prod.*` | Consecuencia |
|----------|----------------------|--------------|
| `GYMETR-login` | Sí | `ddl-auto: validate` |
| `GYMETR-Membership` | **No** | Con `SPRING_PROFILES_ACTIVE=prod` seguiría con `ddl-auto: update` |
| `GYMETRA-Qr` | **No** | Igual |

> La diferencia importa mucho: `update` en producción significa que Hibernate puede modificar el
> esquema de la base sin que nadie lo haya pedido.

### Inicialización de la base

El compose monta `./data/Database-Setup` en `/docker-entrypoint-initdb.d`, así que PostgreSQL
ejecuta todos los `.sql` de esa carpeta **solo la primera vez**, cuando el volumen está vacío.
Después, el volumen manda y los cambios en los scripts no se aplican.

Consecuencia directa: si el volumen se borra —y el pipeline ejecuta `docker volume prune -f` en
cada despliegue— la base se reconstruye desde los scripts, perdiendo todos los datos.

---

## 3. Local sin Docker

Es el escenario para desarrollo individual: PostgreSQL instalado en la máquina y cada servicio
arrancado con Maven.

| Requisito | Detalle |
|-----------|---------|
| PostgreSQL 15 | Base `gymdb` creada y con `data/Database-Setup/database_ Initial.sql` aplicado |
| JDK 17 | Los tres backends |
| Maven 3.8+ | Los tres backends |
| Node 18+ | Los dos frontends |

Ver [`configuracion-local.md`](configuracion-local.md) para el procedimiento paso a paso.

---

## Tabla maestra de variables

| Variable | Servicio | Entorno | Sin valor |
|----------|----------|---------|-----------|
| `SPRING_DATASOURCE_URL` | los tres | todos | Con valor por defecto |
| `SPRING_DATASOURCE_USERNAME` | los tres | todos | Con valor por defecto |
| `SPRING_DATASOURCE_PASSWORD` | los tres | todos | ⚠️ Sin valor por defecto |
| `COGNITO_ISSUER_URI` | los tres | todos | ⚠️ **Vacío**: GYMETR-login **no arranca**; la excepción la lanza el bean `JwtDecoder`, no devuelve 401 |
| `COGNITO_JWKS_URI` | ninguno | todos | Vacío; **ningún servicio la consume**, no es obligatoria |
| `COGNITO_CLIENT_ID` | los tres | todos | Vacío |
| `AWS_ACCESS_KEY_ID` | Login | dev | Vacío |
| `AWS_SECRET_ACCESS_KEY` | Login | dev | Vacío |
| `SPRING_MAIL_*` | Login, Membership | todos | Vacío |
| `STRIPE_SECRET_KEY` | Membership | todos | Vacío |
| `RAPIDAPI_EXERCISE_KEY` | QR | todos | ⚠️ **Clave real en el código** |
| `SPOONACULAR_API_KEY` | QR | todos | ⚠️ **Clave real en el código** |
| `GYMETRA_LOGIN_PORT` | Login | prod | 8080 |
| `GYMETRA_MEMBERSHIP_PORT` | Membership | todos | 8081 |
| `GYMETRA_QR_PORT` | QR | todos | 8090 |
| `DB_HOST` | Login (compose) | prod | ⚠️ **Declarado y no usado** |
| `JAVA_OPTS` | Login (compose) | prod | `-Xmx512m -Xms256m` |
| `VITE_API_URL` | raíz | dev/prod | ⚠️ **Variable muerta**: no la lee ningún frontend |
| `VITE_API_URL_LOGIN` | ambos frontends | dev | URL del servicio de login |
| `VITE_API_URL_MEMBERSHIP` | ambos frontends | dev | URL del servicio de membresías |
| `VITE_API_URL_QR` | ambos frontends | dev | URL del servicio QR |
| `VITE_COGNITO_*` | ambos frontends | dev | Datos del pool |
| `VITE_STRIPE_PUBLIC_KEY` | frontend socio | dev | Clave pública |

---

## Qué debería cambiar

| Cambio | Motivo | Riesgo |
|--------|--------|--------|
| Externalizar los secretos del perfil `prod` | Están en el código fuente | R-15 |
| Que `application-prod.properties` use `${DB_HOST}` y `${DB_PASSWORD}` | Hoy ignora las variables del compose | R-15 |
| Unificar la contraseña de base de datos | Hoy no coinciden y el backend no conecta | R-15 |
| Añadir perfil `prod` a Membership y QR | Para que no sigan con `ddl-auto: update` en producción | R-15 |
| Sacar las claves de Spoonacular y RapidAPI del valor por defecto | Quedan en el código aunque se vacíe el `.env` | R-15, R-09 |
| Parametrizar `app.services.membership-url` | Hoy está fija en `localhost` | — |
| No publicar `5000:5432` | PostgreSQL no necesita estar expuesto | R-15 |
| Añadir los `.env` de los frontends al `.gitignore` | Están versionados con valores reales | R-15 |

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`00-gobernanza/politica-de-seguridad.md`](../00-gobernanza/politica-de-seguridad.md) | Política de manejo de secretos |
| [`R-15`](../15-control-proyecto/riesgos.md) | Detalle de los secretos versionados |
| [`ADR-005`](../05-arquitectura/decisiones/registros/ADR-005-base-datos-postgresql.md) | Decisión sobre la base de datos |
