# 10 · DevOps

> Cómo se construye, configura y despliega GYMETRA hoy. Todo lo de esta sección está verificado
> contra `docker-compose.yml`, el `Jenkinsfile`, los `Dockerfile` y los archivos de configuración
> de los tres servicios.

---

## Qué hay y qué falta

| Componente | ¿Definido en el compose? | ¿Lo construye el pipeline? |
|------------|--------------------------|----------------------------|
| PostgreSQL 15 | ✅ `database` | — |
| `GYMETR-login` (8080) | ✅ `backend` | ✅ |
| `gymetra-frontend` (8100) | ✅ `frontend` | ✅ |
| `GYMETR-Membership` (8081) | ❌ No | ❌ No |
| `GYMETRA-Qr` (8090) | ❌ No | ❌ No |
| `admin-frontend` | ❌ No | ❌ No |

**El repositorio tiene cinco proyectos y el despliegue cubre dos.** Dos de los tres servicios
backend y el panel de administración no existen en la infraestructura. Es R-17.

---

## Documentos de esta sección

| Documento | Contenido |
|-----------|-----------|
| [`entornos.md`](entornos.md) | Los tres ambientes, sus variables y sus diferencias reales |
| [`configuracion-local.md`](configuracion-local.md) | Cómo levantar el proyecto en un equipo desde cero |

---

## Pipeline de despliegue

`Jenkinsfile`, disparado cada 5 minutos por `pollSCM` sobre la rama `develop`:

| Etapa | Qué hace | Problema detectado |
|-------|----------|--------------------|
| `Checkout` | Clone shallow, captura commit y hora, verifica que exista el compose | — |
| `Environment Check` | Verifica Docker y disponibilidad de los puertos 8080 y 8100 | Solo mira 2 de los 4 puertos del sistema |
| `Pre-deploy Cleanup` | `down --remove-orphans`, poda de imágenes y volúmenes | **`docker volume prune -f` borra el volumen de PostgreSQL** |
| `Build Services` | Construye `backend` y `frontend` en paralelo | No construye Membership, QR ni admin |
| `Tag Images` | Etiqueta por commit corto y fecha de build | — |
| `Deploy` | `docker-compose up -d` | Despliega 3 de 5 servicios |
| `Health Check` | Consulta `/actuator/health` en 8080 y la raíz en 8100 | **404: ningún servicio tiene Actuator** |
| `Post-deploy Info` | Muestra contenedores y logs | — |

### Dos fallos que hacen que el pipeline no sirva de señal

1. **El health check consulta una ruta que no existe.** Ningún `pom.xml` incluye
   `spring-boot-starter-actuator`, así que `/actuator/health` devuelve 404. El `try/catch` de
   PowerShell lo captura y el stage termina en verde igualmente. Un despliegue con el backend
   caído se reporta como exitoso.
2. **`docker volume prune -f` borra la base de datos.** El volumen `postgres_data` se elimina en
   cada despliegue. Solo sobrevive si el `down` falla antes, lo que no está garantizado.

### Endurecimiento pendiente

| Cambio | Motivo |
|--------|--------|
| No usar `docker volume prune -f`, o filtrar por etiqueta | Evita perder los datos de producción en cada despliegue |
| Añadir Actuator o cambiar el health check a una ruta real | Que el stage signifique algo |
| Construir los cinco proyectos | Desplegar el sistema completo, no una parte |
| `skipStagesAfterUnstable()` está activo | Con un build parcial, los stages posteriores se saltan: puede desplegarse menos de lo esperado |
| Fijar la versión de imagen en lugar de `latest` | Un redeploy no controlado puede cambiar de versión |

---

## Construcción de imágenes

| Imagen | Contexto de build | Puerto interno |
|--------|------------------|----------------|
| `gymetra/backend:latest` | `./backend/GYMETR-login` | 8080 |
| `gymetra/frontend:latest` | `./frontend/gymetra-frontend` | 80 |

Ambos contextos son rutas relativas al compose, así que **el `backend` del compose es solo
`GYMETR-login`**, pese al nombre genérico. No hay `Dockerfile` para Membership, QR ni
`admin-frontend` en el pipeline, aunque el servicio de Login sí tiene el suyo.

---

## Red y volúmenes

| Elemento | Nombre | Tipo | Nota |
|----------|--------|------|------|
| Red | `gymetra-net` | bridge | Los tres contenedores la comparten |
| Volumen | `postgres_data` | local | **Se borra en cada despliegue** |
| Puerto de base de datos | `5000:5432` | — | 5000 está libre, pero es un puerto atypical para PostgreSQL |
| Puerto de base en el host | `host.docker.internal:5432` | — | Configurado en el perfil prod del backend |

> La red es bridge con nombre de proyecto, así que los contenedores se resuelven por nombre:
> `database:5432`, `backend:8080`. **Ningún frontend usa hoy esas resoluciones**: las variables
> reales son `VITE_API_URL_LOGIN`, `VITE_API_URL_MEMBERSHIP` y `VITE_API_URL_QR`, y los `.env` de
> cada frontend apuntan a `localhost`. La `VITE_API_URL` de la raíz del repositorio es una
> **variable muerta**: `grep import.meta.env.VITE_API_URL[^_]` devuelve 0, no la consume ningún
> componente. Además, el `Dockerfile` del frontend **no copia `.env` alguno**, así que dentro del
> contenedor no se inyecta ninguna URL de backend.

---

## Problemas de configuración verificados

| Problema | Detalle | Riesgo |
|----------|---------|--------|
| Contraseña de base de datos inconsistente | El compose crea la base con `123456`; `application-prod.properties` de Login conecta con `1234567890` | R-15 |
| `DB_HOST` no se usa | El compose define `DB_HOST=database`; el perfil prod lo ignora y usa `host.docker.internal` | R-15 |
| Servicio inexistente | `app.services.membership-url=http://localhost:8081/api` apunta a `localhost`, que dentro de un contenedor es el propio contenedor | R-12 |
| Secretos en el repositorio | Clave secreta de Stripe, contraseña de SMTP, claves de RapidAPI y Spoonacular, identificadores de Cognito | R-15 |
| Sin `.gitignore` para `.env` | Los `.env.development` con valores reales están versionados junto a los `.env.example` | R-15 |
| Puerto de base de datos expuesto | `5000:5432` publica PostgreSQL en todas las interfaces | R-15 |

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`00-gobernanza/politica-de-seguridad.md`](../00-gobernanza/politica-de-seguridad.md) | Política de secretos y accesos |
| [`09-microservicios/`](../09-microservicios/README.md) | Qué servicios deberían existir |
| [`13-operaciones/observabilidad.md`](../13-operaciones/observabilidad.md) | Qué debería medir el pipeline |
| [`R-15`](../15-control-proyecto/riesgos.md) | Secretos en archivos versionados |
| [`R-17`](../15-control-proyecto/riesgos.md) | Pipeline que solo construye 2 de 5 proyectos |
