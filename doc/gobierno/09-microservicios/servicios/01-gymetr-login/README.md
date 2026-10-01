# GYMETR-login

> Servicio de usuarios, roles y perfil. Es el único servicio que habla con AWS Cognito para
> administration de cuentas, y el único que no depende de ningún otro servicio.

---

## Ubicación en la arquitectura

| Campo | Valor |
|-------|-------|
| **Carpeta** | `backend/GYMETR-login` |
| **Paquete raíz** | `com.login.GYMETRA` |
| **Puerto** | 8080 (`server.port: 8080` en `application.yml`; `${GYMETRA_LOGIN_PORT:8080}` en prod) |
| **Spring Boot** | 3.2.0 — el más antiguo de los tres (los otros van por 3.5.5) |
| **Java** | 17 |
| **Consumidor de AWS** | Cognito: `software.amazon.awssdk:cognitoidentityprovider` 2.20.0 (dependencia directa, no un BOM) |
| **Documentación API** | springdoc 2.5.0, expuesta en `permitAll()` |
| **Depende de** | Nada. No llama a ningún otro servicio. |

---

## Responsabilidades (lo que SÍ hace)

- **Autenticación delegada**: valida los JWT emitidos por Cognito contra el JWKS.
- **Sincronización de usuarios**: crea la fila en `user` la primera vez que un usuario se
  sincroniza, y le asigna el rol por defecto (`User`).
- **Gestión de roles**: alta, edición, consulta y borrado de roles en `role` y `user_role`.
- **Perfil**: consulta y actualización de los datos del socio, incluida la foto.
- **Estado de la cuenta**: activar, suspender o dar de baja un usuario.

---

## Fuera de alcance (lo que NO hace)

| No hace | Por qué no le corresponde |
|---------|---------------------------|
| Decidir si una membresía está vigente | Eso es de `GYMETR-Membership` |
| Registrar ingresos al gimnasio | Eso es de `GYMETRA-Qr` |
| Administrar planes o precios | Los planes son de Membership |
| Guardar contraseñas | La contraseña vive en Cognito, nunca aquí (R-25) |
| Recuperar contraseñas | No existe endpoint; ver R-20 y R-26 |

---

## Controladores

| Controlador | Ruta base | Endpoints |
|-------------|-----------|-----------|
| `AuthController` | `/api/auth` | 6 |
| `RoleController` | `/api/roles` | 5 |
| `MeController` | `/api` | 1 |
| **Total** | | **12** (0 públicos, 12 autenticados) |

> Los 12 endpoints exigen token. `SecurityConfig` no incluye ninguna ruta en `permitAll()`
> salvo `OPTIONS /**` y las rutas de documentación.

---

## Cómo ejecutarlo en local

### Requisitos

- JDK 17
- Maven 3.8 o superior
- PostgreSQL 15 con la base `gymdb` creada
- Un User Pool de Cognito con su `issuer-uri` y `jwk-set-uri`

### Variables de entorno

```bash
# Base de datos
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/gymdb
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=<tu contraseña>

# Cognito (obligatorios: sin ellos el servicio arranca pero no valida tokens)
export COGNITO_ISSUER_URI=https://cognito-idp.us-east-2.amazonaws.com/us-east-2_XXXXXXXX
export COGNITO_JWKS_URI=https://cognito-idp.us-east-2.amazonaws.com/us-east-2_XXXXXXXX/.well-known/jwks.json
export COGNITO_CLIENT_ID=<client id>
export AWS_ACCESS_KEY_ID=<para sincronizar usuarios>
export AWS_SECRET_ACCESS_KEY=<para sincronizar usuarios>
```

> `application.yml` importa `optional:file:.env.development[.properties]`, así que las variables
> también se pueden dejar en un archivo `.env.development` junto al `pom.xml`.

### Arranque

```bash
cd backend/GYMETR-login
mvn spring-boot:run
```

### Verificación

```bash
# La documentación responde 200 (está en permitAll)
curl -I http://localhost:8080/swagger-ui.html

# Un endpoint protegido sin token debe devolver 401
curl -i http://localhost:8080/api/roles
```

> **No hay endpoint de salud.** Ningún `pom.xml` incluye `spring-boot-starter-actuator`, así que
> `/actuator/health` devuelve 404. El `Jenkinsfile` consulta precisamente esa ruta, por lo que
> su health check nunca confirma nada. Ver [`13-operaciones/observabilidad.md`](../../../13-operaciones/observabilidad.md).

---

## Documentos de este servicio

| Documento | Contenido |
|-----------|-----------|
| [`modelo-de-datos.md`](modelo-de-datos.md) | Tablas `user`, `role`, `user_role`, `password_reset_token` |
| [`decisiones.md`](decisiones.md) | Cognito, rsLocator de roles, suspensión ineffective |
| [`eventos.md`](eventos.md) | Publica y consume: hoy, ninguno |
| [`runbook.md`](runbook.md) | Qué hacer cuando falla |
