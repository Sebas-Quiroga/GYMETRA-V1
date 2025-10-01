# 🚀 Guía de Configuración de Jenkins para GYMETRA

Esta guía te ayudará a configurar Jenkins para desplegar automáticamente GYMETRA.

## 📋 Prerrequisitos

### En el servidor Jenkins:
- Jenkins 2.400+
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Maven 3.9+
- Node.js 18+
- JDK 17

### En el servidor de despliegue:
- Docker 20.10+
- Docker Compose 2.0+
- SSH habilitado
- Usuario con permisos sudo

## 🔧 Configuración de Jenkins

### 1. Instalar Plugins Necesarios

Ve a `Jenkins > Manage Jenkins > Manage Plugins` e instala:

```
- Pipeline
- Docker Pipeline
- Git Plugin
- SSH Agent Plugin
- Credentials Plugin
- Maven Integration Plugin
- NodeJS Plugin
- Email Extension Plugin
- SonarQube Scanner (opcional)
```

### 2. Configurar Herramientas Globales

Ve a `Jenkins > Manage Jenkins > Global Tool Configuration`:

#### JDK
- Nombre: `JDK-17`
- JAVA_HOME: `/usr/lib/jvm/java-17-openjdk-amd64`

#### Maven
- Nombre: `Maven-3.9.4`
- Versión: `3.9.4` (instalar automáticamente)

#### NodeJS
- Nombre: `NodeJS-18`
- Versión: `18.x` (instalar automáticamente)

#### Git
- Nombre: `Default`
- Path to Git executable: `git`

### 3. Configurar Credenciales

Ve a `Jenkins > Manage Jenkins > Manage Credentials > Global credentials`:

#### Docker Hub Credentials
- Tipo: `Username with password`
- ID: `docker-hub-credentials`
- Username: `tu-usuario-dockerhub`
- Password: `tu-token-dockerhub`

#### SSH Deploy Key
- Tipo: `SSH Username with private key`
- ID: `ssh-deploy-key`
- Username: `deploy-user`
- Private Key: `[Contenido de tu clave SSH privada]`

#### Deploy Host
- Tipo: `Secret text`
- ID: `deploy-host`
- Secret: `deploy-user@tu-servidor-ip`

#### PostgreSQL Password
- Tipo: `Secret text`
- ID: `postgres-password`
- Secret: `tu-password-seguro-postgres`

## 🏗️ Crear Pipeline

### 1. Crear nuevo Pipeline Job

1. Ve a `Jenkins > New Item`
2. Nombre: `GYMETRA-Pipeline`
3. Tipo: `Pipeline`
4. Click `OK`

### 2. Configurar Pipeline

En la configuración del job:

#### General
- ✅ GitHub project: `https://github.com/Sebas-Quiroga/GYMETRA-V1`

#### Build Triggers
- ✅ Poll SCM: `H/5 * * * *` (cada 5 minutos)
- ✅ GitHub hook trigger for GITScm polling

#### Pipeline
- Definition: `Pipeline script from SCM`
- SCM: `Git`
- Repository URL: `https://github.com/Sebas-Quiroga/GYMETRA-V1.git`
- Credentials: `[tus-credenciales-git]`
- Branch Specifier: `*/qa-jenkis`
- Script Path: `Jenkinsfile`

### 3. Configurar Webhooks en GitHub

1. Ve a tu repositorio en GitHub
2. Settings > Webhooks > Add webhook
3. Payload URL: `http://tu-jenkins-url/github-webhook/`
4. Content type: `application/json`
5. Events: `Just the push event`

## 🌐 Configuración del Servidor de Despliegue

### 1. Preparar el servidor

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear usuario para deployment
sudo useradd -m -s /bin/bash deploy-user
sudo usermod -aG docker deploy-user
sudo usermod -aG sudo deploy-user
```

### 2. Configurar SSH

```bash
# En tu máquina local, generar clave SSH
ssh-keygen -t ed25519 -C "jenkins-deploy" -f ~/.ssh/jenkins-deploy

# Copiar clave pública al servidor
ssh-copy-id -i ~/.ssh/jenkins-deploy.pub deploy-user@tu-servidor-ip

# Probar conexión
ssh -i ~/.ssh/jenkins-deploy deploy-user@tu-servidor-ip
```

### 3. Preparar directorio de despliegue

```bash
# En el servidor de despliegue
sudo mkdir -p /opt/gymetra
sudo chown deploy-user:deploy-user /opt/gymetra
sudo chmod 755 /opt/gymetra
```

## 🔒 Configuración de Seguridad

### 1. Variables de Entorno Seguras

Edita los archivos `.env.staging` y `.env.production` con valores seguros:

```bash
# Staging
POSTGRES_PASSWORD=tu_password_staging_muy_seguro
JWT_SECRET=tu_jwt_secret_staging_super_largo_y_seguro

# Production  
POSTGRES_PASSWORD=tu_password_production_ultra_seguro
JWT_SECRET=tu_jwt_secret_production_extremadamente_seguro
```

### 2. Configurar Firewall

```bash
# Permitir solo puertos necesarios
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp  # API Login
sudo ufw allow 8081/tcp  # API Core
sudo ufw allow 8082/tcp  # API Membership
sudo ufw enable
```

## 🚀 Proceso de Despliegue

### Ramas y Ambientes

- `qa-jenkis` → Staging (automático)
- `main` → Production (requiere aprobación manual)
- `release/*` → Staging (automático)

### Pipeline Flow

1. **Checkout**: Descarga código
2. **Build & Test**: Compila y prueba servicios
3. **Code Quality**: SonarQube (opcional)
4. **Build Images**: Construye imágenes Docker
5. **Push Images**: Sube a Docker Hub
6. **Deploy**: Despliega en servidor
7. **Health Check**: Verifica servicios

### Comandos Manuales

```bash
# Verificar deployment
ssh deploy-user@tu-servidor-ip
cd /opt/gymetra
docker-compose ps

# Ver logs
docker-compose logs -f

# Restart servicios
docker-compose restart

# Rollback (usar backup)
docker-compose down
cp docker-compose.yml.backup.YYYYMMDD_HHMMSS docker-compose.yml
docker-compose up -d
```

## 📊 Monitoreo

### Health Check URLs

- Frontend: `http://tu-servidor/health`
- Login API: `http://tu-servidor:8080/actuator/health`
- Core API: `http://tu-servidor:8081/actuator/health`
- Membership API: `http://tu-servidor:8082/actuator/health`

### Logs

```bash
# Ver logs de servicios
docker-compose logs gymetra-login
docker-compose logs gymetra-core
docker-compose logs gymetra-membership
docker-compose logs gymetra-frontend

# Logs en tiempo real
docker-compose logs -f
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Fallo en build**:
   - Verificar que Maven y Node.js estén instalados
   - Revisar logs del pipeline

2. **Fallo en push de imágenes**:
   - Verificar credenciales de Docker Hub
   - Verificar que el repositorio existe

3. **Fallo en deployment**:
   - Verificar conectividad SSH
   - Verificar permisos del usuario deploy
   - Verificar que Docker esté ejecutándose

4. **Servicios no saludables**:
   - Verificar logs de contenedores
   - Verificar configuración de base de datos
   - Verificar puertos abiertos

### Comandos de Debug

```bash
# En Jenkins (pipeline)
sh 'docker --version'
sh 'docker-compose --version'
sh 'mvn --version'
sh 'node --version'

# En servidor deployment
docker ps -a
docker images
docker-compose logs
docker system df
```

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del pipeline en Jenkins
2. Revisa los logs de los contenedores
3. Verifica la conectividad de red
4. Revisa la documentación de Docker Compose

¡Tu pipeline de GYMETRA está listo para deployment automático! 🎉
