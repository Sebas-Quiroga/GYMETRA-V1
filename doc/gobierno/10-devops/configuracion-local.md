# Configuración local

> Cómo levantar GYMETRA en un equipo desde cero. Todo lo que hay aquí está verificado contra los
> archivos de configuración del repositorio.

---

## Requisitos

| Herramienta | Versión | Para qué |
|-------------|---------|----------|
| JDK | 17 | Los tres backends |
| Maven | 3.8 o superior | Los tres backends |
| PostgreSQL | 15 | Base de datos |
| Node.js | 18 o superior | Los dos frontends |
| Docker Desktop | Opcional | Solo para la vía de contenedores |

---

## Paso 1 · Base de datos

```bash
# Crear la base
docker run -d --name gymetra_database \
  -e POSTGRES_DB=gymdb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=<TU_CONTRASENA> \
  -p 5432:5432 \
  -v <RUTA_AL_REPO>/data/Database-Setup:/docker-entrypoint-initdb.d \
  postgres:15-alpine
```

El montaje de `data/Database-Setup` en `/docker-entrypoint-initdb.d` hace que PostgreSQL aplique
automáticamente `database_ Initial.sql` **la primera vez que se crea el volumen**. El script crea
las 10 tablas, los roles `Admin` y `Client`, y los planes de pago.

> Si el volumen ya existe, el script **no** se vuelve a aplicar. Para empezar de cero:
> `docker rm -f gymetra_database` y borra el volumen asociado.

### Verificación

```bash
docker exec -it gymetra_database psql -U postgres -d gymdb -c "\dt"
```

Deben aparecer 10 tablas. Las tablas `exercises` y `recipes` aparecerán más tarde, cuando arranque
el servicio QR con `ddl-auto: update`.

### Instalación sin Docker

```bash
# Crear usuario y base
psql -U postgres -c "CREATE DATABASE gymdb;"

# Aplicar el script
psql -U postgres -d gymdb -f "data/Database-Setup/database_ Initial.sql"
```

---

## Paso 2 · `GYMETR-login` (puerto 8080)

Es el único que se puede levantar sin los demás, porque no depende de ningún servicio.

### Variables obligatorias

```bash
cd backend/GYMETR-login

# Base de datos
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/gymdb
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=<TU_CONTRASENA>

# Cognito — sin issuer el servicio NO arranca: el bean JwtDecoder lanza excepción
export COGNITO_ISSUER_URI=https://cognito-idp.<region>.amazonaws.com/<region>_<POOL_ID>
export COGNITO_CLIENT_ID=<CLIENT_ID>
# COGNITO_JWKS_URI no hace falta: ningún servicio la lee; el JwtDecoder se construye con el issuer

# Opcionales: solo si vas a sincronizar usuarios
export AWS_ACCESS_KEY_ID=<ACCESS_KEY>
export AWS_SECRET_ACCESS_KEY=<SECRET_KEY>
```

> Alternativa al `export`: copia `backend/GYMETR-login/.env.example` como
> `.env.development` y edítalo. El `application.yml` lo importa con
> `spring.config.import=optional:file:.env.development[.properties]`.

### Arranque y verificación

```bash
mvn spring-boot:run

# En otra terminal
curl -i http://localhost:8080/swagger-ui.html          # 200
curl -i http://localhost:8080/api/roles                # 401, no 500
```

---

## Paso 3 · `GYMETR-Membership` (puerto 8081)

```bash
cd backend/GYMETR-Membership

export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/gymdb
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=<TU_CONTRASENA>
export COGNITO_ISSUER_URI=<IGUAL_QUE_LOGIN>
export COGNITO_CLIENT_ID=<IGUAL_QUE_LOGIN>

# Solo si se implementa el cobro
export STRIPE_SECRET_KEY=<CLAVE>

mvn spring-boot:run
```

Verificación:

```bash
curl http://localhost:8081/api/memberships/available   # 200, es público
curl -i http://localhost:8081/api/user-memberships    # 401
```

> Al arrancar, `DataInitializer` siembra los roles `Admin` y `Client`. Si ya existen, no los
> duplica.

---

## Paso 4 · `GYMETRA-Qr` (puerto 8090)

```bash
cd "backend/GYMETRA - Qr"     # con comillas: la ruta tiene un espacio

export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/gymdb
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=<TU_CONTRASENA>
export COGNITO_ISSUER_URI=<IGUAL_QUE_LOGIN>
export COGNITO_CLIENT_ID=<IGUAL_QUE_LOGIN>
export RAPIDAPI_EXERCISE_KEY=<CLAVE_RAPIDAPI>
export RAPIDAPI_EXERCISE_HOST=exercisedb.p.rapidapi.com
export SPOONACULAR_API_KEY=<CLAVE_SPOONACULAR>

mvn spring-boot:run
```

Verificación:

```bash
curl -i http://localhost:8090/api/branches            # 401
curl -i http://localhost:8090/api/memberships-proxy/1/check-permission/training   # 401 (exige JWT)
# La comprobación real entre servicios: ruta pública, sin token
curl -i http://localhost:8081/api/user-memberships/user/1/permission/training     # 200 true | false
```

> El `application.properties` de QR trae **claves reales como valor por defecto**. Aunque no
> exportes nada, el servicio usará esas claves. Ver R-15.

---

## Paso 5 · Frontend del socio

```bash
cd frontend/gymetra-frontend
npm install
cp .env.example .env.development
```

Editar `.env.development`:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL_LOGIN` | `http://localhost:8080/api` |
| `VITE_API_URL_MEMBERSHIP` | `http://localhost:8081/api` |
| `VITE_API_URL_QR` | `http://localhost:8090/api` |
| `VITE_COGNITO_REGION` | Región del pool |
| `VITE_COGNITO_USER_POOL_ID` | Identificador del pool |
| `VITE_COGNITO_CLIENT_ID` | Client id de la app |
| `VITE_STRIPE_PUBLIC_KEY` | Clave pública de Stripe |

```bash
npm run dev
```

> `npm run dev` levanta Vite en el puerto fijado en `vite.config.ts`: **8100** en el frontend
> del socio y **8101** en el de administración (no el 5173 por defecto de Vite). Vite lee las
> variables `VITE_*` **en tiempo de build**: si cambias el `.env`, reinicia el servidor.

---

## Paso 6 · Frontend de administración

```bash
cd frontend/admin-frontend
npm install
cp .env.example .env.development
```

Mismas variables de servicio y de Cognito que el frontend del socio, **sin la de Stripe**.

```bash
npm run dev
```

---

## Orden de arranque

```
1. PostgreSQL          →  sin dependencias
2. GYMETR-login        →  sin dependencias
3. GYMETR-Membership   →  necesita la base
4. GYMETRA-Qr          →  necesita Membership en 8081 para validar accesos
5. Frontends           →  necesitan los backends
```

Si QR arranca antes que Membership, no falla: la llamada falla en el primer acceso, no al iniciar.

---

## Problemas frecuentes de arranque

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `COGNITO_ISSUER_URI` vacío | GYMETR-login no arranca: `JwtDecoders.fromIssuerLocation("")` lanza excepción en el bean `JwtDecoder` | Exportar `COGNITO_ISSUER_URI`; el valor por defecto es vacío |
| `Connection refused` a la base | PostgreSQL no está levantado, o la contraseña no coincide | `docker ps`; verificar `SPRING_DATASOURCE_PASSWORD` |
| `password_hash` violates not-null | El script marca la columna NOT NULL y el código no la escribe | R-25; la corrección es quitar la columna |
| El pago simplificado devuelve 500 | `savePaymentSimplified` no rellena `monto`, `metodo_pago` ni `fecha_pago` | Usar el endpoint completo; R-02 |
| `Table exercises doesn't exist` en producción | Con `validate`, Hibernate exige las tablas que el script no crea | Aplicar el esquema completo o alinear script y entidades |
| `UnknownHost: database` | El `.env` del frontend apunta a `localhost` y corre en contenedor | Usar el nombre del servicio del compose |
| El frontend carga pero la API falla | `VITE_API_URL_*` apunta a un puerto equivocado | Verificar que los tres backends estén arriba |
| 404 en `/actuator/health` | **Esperado**: no hay Actuator | Usar `/swagger-ui.html` como comprobación |

---

## Verificación completa del entorno

```bash
# 1. Base de datos
docker exec -it gymetra_database psql -U postgres -d gymdb -c "SELECT 1;"

# 2. Los tres backends responden (200 en docs, 401 en endpoint protegido)
for p in 8080 8081 8090; do
  echo -n "puerto $p: "
  curl -s -o /dev/null -w "%{http_code}" http://localhost:$p/swagger-ui.html
  echo
done

# 3. La llamada entre servicios funciona (ruta pública de Membership, sin token)
curl -s "http://localhost:8081/api/user-memberships/user/1/permission/training"

# 4. Los frontends sirven
curl -s -o /dev/null -w "socio: %{http_code}\n"  http://localhost:8100
curl -s -o /dev/null -w "admin: %{http_code}\n"  http://localhost:8101
```

Si los cuatro pasos responden correctamente, el entorno local está completo.

---

## Datos de ejemplo

El script SQL siembra roles y planes, pero **no crea usuarios**. Para probar el flujo completo hace
falta un socio, y la vía prevista es:

1. Registrarse en el frontend del socio, que da de alta la cuenta en Cognito.
2. Llamar a `POST /api/auth/users/sync` con el token del socio recién registrado, que crea la
   fila en `user` y le asigna el rol `User`.

Ese es el punto frágil del arranque: la fila local **no se crea sola**, hay que dispararla a
mano. Es R-21.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`entornos.md`](entornos.md) | Variables por ambiente |
| [`08-uml/`](../08-uml/README.md) | Vista de componentes y despliegue |
| [`09-microservicios/`](../09-microservicios/README.md) | Arranque de cada servicio |
| [`14-capacitacion/onboarding-tecnico.md`](../14-capacitacion/onboarding-tecnico.md) | Guion de incorporación al equipo |
| [`R-21`](../15-control-proyecto/riesgos.md) | El registro no crea la fila local |
