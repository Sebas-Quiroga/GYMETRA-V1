# Runbook — GYMETR-login

> Qué hacer cuando `GYMETR-login` falla a las 3 de la mañana. Los pasos están escritos para que
> alguien que no conoce el servicio pueda ejecutarlos sin preguntar.

---

## 1. Información rápida

| Campo | Valor |
|-------|-------|
| **Servicio** | `GYMETR-login` |
| **Puerto** | 8080 |
| **Paquete** | `com.login.GYMETRA` |
| **Base de datos** | `gymdb` (compartida) |
| **Tablas** | `user`, `role`, `user_role`, `password_reset_token` |
| **Spring Boot** | 3.2.0 |
| **Contenedor** | `backend` en el compose, con `container_name: gymetra_backend` |
| **Perfil de producción** | `prod` (`SPRING_PROFILES_ACTIVE=prod`) |
| **Documentación** | http://localhost:8080/swagger-ui.html (sin autenticación) |

---

## 2. Verificar que el servicio está sano

```bash
# ¿Responde el puerto?
curl -i http://localhost:8080/swagger-ui.html
```

Respuesta esperada: `200` o redirección a `/swagger-ui/index.html`.

```bash
# ¿La base de datos responde?
docker exec -it gymetra_database psql -U postgres -d gymdb -c "\dt"
```

> **No hay endpoint de salud real.** Ningún `pom.xml` incluye `spring-boot-starter-actuator`, así
> que `/actuator/health` devuelve 404. El `Jenkinsfile` consulta esa ruta, por lo que su health
> check **nunca confirma nada** y considera sano un servicio caído. Hasta que se añada actuator,
> usa la verificación de Swagger y una consulta autenticada real.

```bash
# ¿La autenticación funciona? (debe devolver 401, no 500)
curl -i http://localhost:8080/api/roles
```

| Resultado | Significado |
|-----------|-------------|
| `200` en Swagger | El proceso está vivo |
| `401` en `/api/roles` | El proceso está vivo **y** Spring Security está cargado: todo correcto |
| `500` al arrancar | Fallo de configuración, casi siempre de Cognito o de la base de datos |
| Sin respuesta | El proceso no está listening en el 8080 |

Si no responde:

```bash
docker-compose ps
docker-compose logs --tail=100 backend
```

---

## 3. Alertas frecuentes y qué hacer

### Alerta: todos los usuarios reciben 401

**Causa más probable:** las variables de Cognito no cargaron. `COGNITO_ISSUER_URI` y
`COGNITO_JWKS_URI` tienen **valor por defecto vacío**, así que el servicio arranca y rechaza
todos los tokens.

```bash
# Verificar la configuración efectiva
docker exec gymetra_backend env | grep COGNITO
```

| Variable | Valor esperado |
|----------|-----------------|
| `COGNITO_ISSUER_URI` | `https://cognito-idp.us-east-2.amazonaws.com/us-east-2_XXXX` |
| `COGNITO_JWKS_URI` | El mismo prefijo, terminado en `/.well-known/jwks.json` |
| `COGNITO_CLIENT_ID` | El client id del pool |

Si faltan, definirlas en `docker-compose.yml` o en el `.env` del despliegue y reiniciar.

### Alerta: los socios nuevos no aparecen en el sistema

**Causa:** el alta ocurre en Cognito y la fila local solo nace con
`POST /api/auth/users/sync`. Si nadie lo ejecutó, el usuario no existe para Membership (R-21).

```bash
# Comprobar si el socio está en la base
docker exec -it gymetra_database psql -U postgres -d gymdb \
  -c "SELECT user_id, email, status FROM \"user\" ORDER BY user_id DESC LIMIT 5;"

# Crear la fila a mano
curl -X POST http://localhost:8080/api/auth/users/sync \
  -H "Authorization: Bearer <token del socio>"
```

> Solución de fondo: ejecutar el sync en el primer inicio de sesión, no mediante una tarea manual.

### Alerta: un socio suspendido sigue entrando

**No es un fallo del servicio:** es el comportamiento actual. `PATCH /api/auth/users/{userId}/status`
solo escribe en la base local y **nunca llama a Cognito** (R-23).

```bash
# Suspender de verdad, desde la consola de Cognito
aws cognito-idp admin-disable-user \
  --user-pool-id us-east-2_XXXX \
  --username usuario@correo.com
```

### Alerta: el arranque falla con error de conexión a la base

```bash
# ¿Está la base levantada?
docker-compose ps database
docker-compose logs --tail=50 database

# ¿El contenedor ve la base? En docker-compose el host es 'database',
# pero application-prod.properties apunta a host.docker.internal
docker exec gymetra_backend env | grep DB_HOST
```

> **Causa raíz conocida:** `docker-compose.yml` define `DB_HOST=database` como variable de
> entorno, pero `application-prod.properties` **ignora esa variable** y usa
> `jdbc:postgresql://host.docker.internal:5432/gymdb` con la contraseña `1234567890`, mientras
> el compose crea la base con contraseña `123456`. Por eso el backend en Docker no conecta
> con la base del compose. Ver R-15 y
> [`10-devops/entornos.md`](../../../10-devops/entornos.md).

### Alerta: `password_hash` violates not-null constraint

**Causa:** la columna es NOT NULL en el script y ningún código la escribe (R-25).

```sql
-- Comprobar si hay filas con el hash vacío
SELECT user_id, email FROM "user" WHERE password_hash IS NULL OR password_hash = '';
```

La solución real es eliminar la columna, no darle un valor falso.

---

## 4. Procedimientos por componente

### 4.1 Base de datos

```bash
# Verificar salud
docker exec -it gymetra_database psql -U postgres -d gymdb -c "SELECT 1;"

# Ver conexiones activas
docker exec -it gymetra_database psql -U postgres -d gymdb \
  -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'gymdb';"

# Logs de PostgreSQL
docker-compose logs --tail=100 database
```

### 4.2 Cognito

```bash
# Verificar que el JWKS responde
curl -s https://cognito-idp.us-east-2.amazonaws.com/us-east-2_XXXX/.well-known/jwks.json | head -20

# Listar usuarios del pool
aws cognito-idp list-users --user-pool-id us-east-2_XXXX --max-results 10

# Verificar el estado de una cuenta
aws cognito-idp admin-get-user --user-pool-id us-east-2_XXXX --username usuario@correo.com
```

---

## 5. Operaciones de mantenimiento

### 5.1 Reiniciar el servicio

```bash
docker-compose restart backend
docker-compose logs -f backend
```

### 5.2 Despliegue de una corrección urgente

```bash
git checkout <commit-corregido>
docker-compose build --progress=plain backend
docker-compose up -d backend
docker-compose logs --tail=50 backend
```

> El `Jenkinsfile` construye solo 2 de los 5 proyectos del repositorio y su health check consulta
> una ruta inexistente. **No confíes en un pipeline verde como señal de salud**: verifica a mano
> después de desplegar (R-17).

### 5.3 Revertir

```bash
# Volver a la imagen anterior por etiqueta de commit
git log --oneline -5
docker image tag gymetra/backend:<commit-anterior> gymetra/backend:latest
docker-compose up -d backend
```

> Revertir el código no revierte los cambios de base de datos. Con `ddl-auto: update` en
> desarrollo, una versión anterior puede no funcionar contra un esquema que ya cambió.

---

## 6. Comunicación durante un incidente

| Momento | Quién informa | Qué dice |
|---------|---------------|----------|
| Detección | Quien lo detecta | Qué falla, desde cuándo, cuántos usuarios |
| Contención | Responsable técnico | Qué se hizo para parar el daño |
| Resolución | Responsable técnico | Qué se cambió y cómo se verificó |
| Cierre | Responsable técnico | Qué queda pendiente y en qué riesgo está anotado |

Canal: el que use el equipo. **Lo que no se escribe, se pierde**: todo incidente se anota en
[`15-control-proyecto/riesgos.md`](../../../15-control-proyecto/riesgos.md) si dejó un riesgo
abierto.

---

## 7. Checklist posterior a un incidente

- [ ] ¿Se identificó la causa raíz?
- [ ] ¿Se corrigió la causa o solo el síntoma?
- [ ] ¿Hay una prueba que habría detectado este fallo? Si no, se escribe.
- [ ] ¿El fallo corresponde a un riesgo ya registrado? Se actualiza su estado.
- [ ] ¿Corresponde a un riesgo nuevo? Se registra con su número y su responsable.
- [ ] ¿Se revisó el impacto en los datos? ¿Quedó historial incompleto?
- [ ] ¿Se documento el incidente para quien no estaba presente?

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`13-operaciones/observabilidad.md`](../../../13-operaciones/observabilidad.md) | Qué debería medirse de este servicio |
| [`13-operaciones/gestion-de-incidentes.md`](../../../13-operaciones/gestion-de-incidentes.md) | Severidad y roles durante un incidente |
| [`10-devops/entornos.md`](../../../10-devops/entornos.md) | Variables de entorno por ambiente |
| [`07-api/`](../../../07-api/README.md) | Los 12 endpoints y su autenticación |
