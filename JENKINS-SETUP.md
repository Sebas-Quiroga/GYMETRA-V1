# 🔧 Configuración de Jenkins para GYMETRA

## Información del Repositorio
- **URL**: https://github.com/Sebas-Quiroga/GYMETRA-V1.git
- **Rama objetivo**: `develop`
- **Owner**: Sebas-Quiroga
- **Repositorio**: GYMETRA-V1

## 📋 Pasos para Configurar Jenkins Job

### 1. Crear Nuevo Pipeline Job

1. En Jenkins, ir a "New Item"
2. Nombre del job: `GYMETRA-Deploy-Develop`
3. Seleccionar "Pipeline" y hacer click en "OK"

### 2. Configuración de Triggers (Build Triggers)

**Activar estos triggers:**
```
☑️ GitHub hook trigger for GITScm polling
   (Sin configuración adicional - solo marcar la casilla)

☑️ Consultar repositorio (SCM)
   Schedule: H/5 * * * *
   (Esto revisa cambios cada 5 minutos como backup)
```

**NO activar estos triggers:**
```
❌ Build when a change is pushed to GitLab
   (Tu repositorio está en GitHub, no GitLab)

❌ Construir tras otros proyectos
   (No tienes dependencias de otros proyectos)

❌ Ejecutar periódicamente  
   (No necesitas builds programados sin cambios)

❌ Lanzar ejecuciones remotas
   (No necesitas triggers remotos)
```

### 2.1. Configuración General del Proyecto

```
☑️ GitHub project
   Project url: https://github.com/Sebas-Quiroga/GYMETRA-V1/
```

```
Definition: Pipeline script from SCM

SCM: Git
   Repository URL: https://github.com/Sebas-Quiroga/GYMETRA-V1.git
   Credentials: [Seleccionar o crear credenciales si es necesario]
   
Branches to build:
   Branch Specifier: */develop
   
Repository browser: (Auto)

Script Path: Jenkinsfile
```

### 3. Configuración Pipeline

Si el repositorio es privado:

1. Ir a "Manage Jenkins" → "Credentials"
2. Seleccionar dominio apropiado
3. "Add Credentials"
4. Kind: "Username with password" o "SSH Username with private key"
5. ID: `github-credentials`
6. Configurar según tu método de autenticación

### 5. Variables de Entorno (Opcionales)

En la configuración del job, puedes agregar variables adicionales:

```
DOCKER_BUILD_ARGS=--no-cache
NOTIFICATION_EMAIL=tu-email@ejemplo.com
SLACK_CHANNEL=#deployments
```

## 🚀 Configuración de GitHub Webhook (Recomendado)

Para despliegue inmediato en lugar de polling cada 5 minutos:

### 1. En GitHub:
1. Ir a Settings → Webhooks → Add webhook
2. Payload URL: `http://tu-jenkins-url/github-webhook/`
3. Content type: `application/json`
4. Events: "Just the push event"
5. Active: ☑️

### 2. En Jenkins:
- Asegurarse de que "GitHub hook trigger for GITScm polling" esté habilitado

## 📊 Configuraciones de Despliegue

### Puertos Utilizados:
- **Backend**: 8080
- **Frontend**: 8100

### Servicios Desplegados:
- **gymetra_backend**: Spring Boot API
- **gymetra_frontend**: Vue/Ionic SPA

### Health Checks:
- Backend: `http://localhost:8080/actuator/health`
- Frontend: `http://localhost:8100`

## 🔔 Configuración de Notificaciones (Opcional)

### Email:
Descomentar y configurar en el Jenkinsfile:
```groovy
emailext (
    subject: "✅ GYMETRA - Despliegue Exitoso",
    body: "El despliegue de GYMETRA desde la rama develop ha sido exitoso.",
    to: "tu-email@ejemplo.com"
)
```

### Slack:
Instalar plugin de Slack y configurar:
```groovy
slackSend (
    channel: '#deployments',
    color: 'good',
    message: "✅ GYMETRA desplegado exitosamente en develop"
)
```

## 🛠️ Prerequisitos del Servidor Jenkins

### Software Requerido:
```bash
# Docker
docker --version
# Docker Compose
docker-compose --version
# curl (para health checks)
curl --version
# git
git --version
```

### Permisos:
- Jenkins user debe tener acceso a Docker
- Puertos 8080 y 8100 deben estar disponibles

### Plugins de Jenkins Recomendados:
- Git plugin
- Pipeline plugin
- Docker Pipeline plugin
- GitHub plugin
- Email Extension plugin (opcional)
- Slack Notification plugin (opcional)

## 🔍 Troubleshooting

### Problema: Error de permisos de Docker
**Solución**:
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Problema: Puerto ocupado
**Solución**:
```bash
# Verificar qué proceso usa el puerto
sudo netstat -tulpn | grep :8080
# Detener servicios anteriores
docker-compose down
```

### Problema: Build falla
**Verificar**:
1. Logs de Jenkins Console Output
2. Logs de Docker: `docker-compose logs`
3. Espacio en disco: `df -h`
4. Memoria disponible: `free -h`

## 📈 Monitoreo Post-Despliegue

### URLs de Verificación:
- Frontend: http://localhost:8100
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health Check: http://localhost:8080/actuator/health

### Comandos de Monitoreo:
```bash
# Estado de contenedores
docker-compose ps

# Logs en tiempo real
docker-compose logs -f

# Uso de recursos
docker stats

# Verificar conectividad
curl -f http://localhost:8080/actuator/health
curl -f http://localhost:8100
```

## 📝 Notas Importantes

1. **Primera Ejecución**: Puede tomar más tiempo debido a la descarga de imágenes base
2. **Actualizaciones**: Cambios en Dockerfile requieren rebuild completo
3. **Rollback**: Usar `git revert` en develop y Jenkins hará redeploy automático
4. **Logs**: Se conservan en Jenkins por defecto durante 30 días

---
*Configuración específica para: https://github.com/Sebas-Quiroga/GYMETRA-V1.git*
*Rama: develop*
*Fecha: Septiembre 2025*