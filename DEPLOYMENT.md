# 🚀 Guía de Despliegue GYMETRA con Jenkins

Esta guía explica cómo configurar y usar el sistema de despliegue automatizado para GYMETRA usando Jenkins y Docker.

## 📋 Requisitos Previos

### En el Servidor Jenkins:
- Docker Engine instalado
- Docker Compose instalado
- Acceso al repositorio Git
- Puertos 8080 y 8100 disponibles

### Verificación:
```bash
docker --version
docker-compose --version
```

## 🏗️ Arquitectura del Despliegue

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub/Git    │───▶│     Jenkins     │───▶│     Docker      │
│   rama develop  │    │    Pipeline     │    │   Containers    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                       ┌───────────────┼───────────────┐
                                       ▼               ▼               ▼
                               ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
                               │   Backend   │ │  Frontend   │ │   Network   │
                               │   :8080     │ │   :8100     │ │ gymetra-net │
                               └─────────────┘ └─────────────┘ └─────────────┘
```

## 🔧 Configuración de Jenkins

### 1. Crear un Pipeline Job

1. En Jenkins, crear un nuevo elemento "Pipeline"
2. Configurar el repositorio Git
3. Establecer la rama como `develop`
4. Configurar el archivo de pipeline como `Jenkinsfile`

### 2. Configuración del Job

```groovy
// En la configuración del Pipeline:
- Definition: Pipeline script from SCM
- SCM: Git
- Repository URL: [URL_de_tu_repositorio]
- Branch: */develop
- Script Path: Jenkinsfile
```

### 3. Configuración de Triggers

El Jenkinsfile incluye polling automático cada 5 minutos:
```groovy
triggers {
    pollSCM('H/5 * * * *')
}
```

## 📁 Estructura de Archivos

```
GYMETRA-V1/
├── Jenkinsfile                     # Pipeline de Jenkins
├── docker-compose.yml              # Orquestación de servicios
├── deploy.sh                       # Script de despliegue manual (Linux/Mac)
├── deploy.bat                      # Script de despliegue manual (Windows)
├── .dockerignore                   # Archivos a ignorar por Docker
├── backend/
│   └── GYMETR-login/
│       ├── Dockerfile              # Imagen del backend
│       └── .dockerignore
└── frontend/
    └── gymetra-frontend/
        ├── Dockerfile              # Imagen del frontend
        └── .dockerignore
```

## 🚀 Proceso de Despliegue

### Automático (Jenkins)

1. **Trigger**: Cambios en la rama `develop` o polling automático
2. **Checkout**: Descarga del código desde Git
3. **Environment Check**: Verificación de Docker y puertos
4. **Pre-deploy Cleanup**: Limpieza de despliegues anteriores
5. **Build Services**: Construcción paralela de backend y frontend
6. **Deploy**: Despliegue de servicios con docker-compose
7. **Health Check**: Verificación de salud de los servicios
8. **Post-deploy Info**: Información del despliegue

### Manual

#### Linux/Mac:
```bash
# Despliegue completo
./deploy.sh deploy

# Ver estado
./deploy.sh status

# Ver logs
./deploy.sh logs

# Detener
./deploy.sh stop
```

#### Windows:
```cmd
REM Despliegue completo
deploy.bat deploy

REM Ver estado
deploy.bat status

REM Ver logs
deploy.bat logs

REM Detener
deploy.bat stop
```

## 🌐 Acceso a la Aplicación

Una vez desplegado:

- **Frontend**: http://localhost:8100
- **Backend**: http://localhost:8080
- **API Docs**: http://localhost:8080/swagger-ui.html
- **Health Check**: http://localhost:8080/actuator/health

## 📊 Monitoreo

### Logs de Contenedores
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs del backend
docker-compose logs -f backend

# Ver logs del frontend
docker-compose logs -f frontend
```

### Estado de Contenedores
```bash
# Ver estado de contenedores
docker-compose ps

# Ver información detallada
docker-compose top
```

## 🛠️ Comandos Útiles

### Docker Compose
```bash
# Construir sin caché
docker-compose build --no-cache

# Recrear contenedores
docker-compose up -d --force-recreate

# Ver uso de recursos
docker stats
```

### Limpieza
```bash
# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes no utilizadas
docker image prune

# Limpiar todo el sistema
docker system prune -a
```

## ⚠️ Troubleshooting

### Problemas Comunes

1. **Puerto ocupado**:
   ```bash
   # Ver qué proceso usa el puerto
   netstat -tulpn | grep :8080
   # o
   lsof -i :8080
   ```

2. **Contenedor no inicia**:
   ```bash
   # Ver logs detallados
   docker-compose logs backend
   ```

3. **Build falla**:
   ```bash
   # Construir sin caché
   docker-compose build --no-cache backend
   ```

4. **Memoria insuficiente**:
   - Ajustar `JAVA_OPTS` en docker-compose.yml
   - Verificar recursos disponibles con `docker system df`

### Logs de Debug

```bash
# Jenkins
# Ver logs de Jenkins para el job específico

# Docker
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend

# Sistema
docker system events
```

## 🔒 Consideraciones de Seguridad

1. **Puertos**: Solo exponer puertos necesarios
2. **Usuarios**: Los contenedores corren con usuarios no-root
3. **Variables**: Usar variables de entorno para secrets
4. **Red**: Los servicios están en una red aislada

## 📈 Optimizaciones

1. **Multi-stage builds**: Imágenes más pequeñas
2. **Health checks**: Verificación automática de salud
3. **Restart policies**: Reinicio automático en fallos
4. **Resource limits**: Limitar uso de CPU y memoria

## 🔄 Pipeline Stages

| Stage | Descripción | Tiempo Estimado |
|-------|-------------|-----------------|
| Checkout | Descarga código | 30s |
| Environment Check | Verifica prerequisitos | 15s |
| Pre-deploy Cleanup | Limpia despliegue anterior | 30s |
| Build Services | Construye imágenes | 2-5min |
| Deploy | Despliega contenedores | 30s |
| Health Check | Verifica servicios | 60s |
| Post-deploy Info | Muestra información | 15s |

## 📞 Soporte

Para problemas con el despliegue:

1. Revisar logs de Jenkins
2. Verificar logs de contenedores
3. Comprobar recursos del sistema
4. Validar configuración de red

---

*Documentación actualizada: Septiembre 2025*