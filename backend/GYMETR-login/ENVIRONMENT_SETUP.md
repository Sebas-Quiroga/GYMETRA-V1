# 🛠️ Configuración de Variables de Entorno - Backend Login/Auth

Este documento explica cómo configurar las variables de entorno necesarias para el servicio de autenticación y login.

## 📁 Archivos de Configuración

### `application.yml` / `application.properties`
- **Ubicación**: `src/main/resources/`
- **Propósito**: Configuración principal de Spring Boot
- **Variables**: Configuradas directamente en el archivo

### Archivos `.env` (Opcional)
- **`.env.example`**: Template con valores de ejemplo
- **`.env.development`**: Valores reales para desarrollo local
- **Nota**: Spring Boot no lee `.env` por defecto, pero se pueden usar variables de entorno

### Variables de Entorno del Sistema
```bash
# Puerto del servicio (opcional, por defecto 8080)
GYMETRA_LOGIN_PORT=8080

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gymdb
DB_USERNAME=postgres
DB_PASSWORD=tu_password

# AWS Cognito
COGNITO_REGION=us-east-2
COGNITO_USER_POOL_ID=us-east-2_ckSy7zPAt
COGNITO_CLIENT_ID=3gnvfec5v6tfp32u634mq645ll

# Correo SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_app_password
```

## 🚀 Configuración Inicial

1. **Configurar base de datos PostgreSQL**:
   ```sql
   CREATE DATABASE gymdb;
   CREATE USER postgres WITH PASSWORD 'tu_password';
   GRANT ALL PRIVILEGES ON DATABASE gymdb TO postgres;
   ```

2. **Configurar AWS Cognito**:
   - User Pool ID: `us-east-2_ckSy7zPAt`
   - Client ID: `3gnvfec5v6tfp32u634mq645ll`

3. **Configurar Gmail SMTP**:
   - Generar App Password en https://myaccount.google.com/apppasswords
   - Usar el App Password (no la contraseña regular)

## 📋 Servicios Externos

### AWS Cognito
**Propósito**: Autenticación y autorización de usuarios
- **Configuración**: JWT OAuth2 Resource Server
- **User Pool**: us-east-2_ckSy7zPAt
- **Documentación**: https://docs.aws.amazon.com/cognito/

### PostgreSQL
**Propósito**: Base de datos principal
- **Versión**: 14+
- **Esquema**: Configurado automáticamente por JPA/Hibernate
- **Documentación**: https://www.postgresql.org/docs/

### Gmail SMTP
**Propósito**: Envío de correos electrónicos
- **Servidor**: smtp.gmail.com:587
- **Seguridad**: TLS
- **App Password**: Requerido para autenticación

## 🔧 Variables de Entorno

### Puerto Personalizado
```bash
export GYMETRA_LOGIN_PORT=8080
```

### Base de Datos Externa
```bash
export DB_HOST=tu_servidor_db
export DB_PORT=5432
export DB_NAME=gymdb
export DB_USERNAME=tu_usuario
export DB_PASSWORD=tu_password
```

### Configuración de Correo
```bash
export MAIL_USERNAME=tu_email@gmail.com
export MAIL_PASSWORD=tu_app_password
```

## 🐳 Configuración con Docker

### Variables de Entorno en Docker
```yaml
environment:
  - GYMETRA_LOGIN_PORT=8080
  - DB_HOST=db
  - DB_PORT=5432
  - DB_NAME=gymdb
  - DB_USERNAME=postgres
  - DB_PASSWORD=postgres
  - MAIL_USERNAME=${MAIL_USERNAME}
  - MAIL_PASSWORD=${MAIL_PASSWORD}
```

### Docker Compose Example
```yaml
version: '3.8'
services:
  gymetr-login:
    build: .
    ports:
      - "8080:8080"
    environment:
      - GYMETRA_LOGIN_PORT=8080
      - DB_HOST=db
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - db
```

## ⚠️ Consideraciones de Seguridad

- **Credenciales de BD**: Nunca hardcodear en código fuente
- **App Password de Gmail**: Generar específicamente para la aplicación
- **Variables sensibles**: Usar variables de entorno o Docker secrets
- **Archivos .env**: Nunca subir a Git los archivos con valores reales

## 🐛 Solución de Problemas

### Error de conexión a BD
- Verificar que PostgreSQL esté corriendo en el puerto correcto
- Comprobar credenciales en `application.yml`
- Revisar logs de Spring Boot: `tail -f logs/spring.log`

### Error de JWT/Cognito
- Verificar User Pool ID y Client ID en AWS Console
- Comprobar región de AWS (us-east-2)
- Revisar configuración de CORS si es necesario
- Validar tokens JWT en https://jwt.io

### Error de envío de correos
- Verificar App Password de Gmail (no contraseña regular)
- Comprobar configuración SMTP (puerto 587, TLS)
- Revisar límites de envío de Gmail
- Verificar que "Acceso de aplicaciones menos seguras" esté habilitado

### Error de puerto ocupado
- Verificar que el puerto 8080 no esté en uso
- Cambiar puerto con `GYMETRA_LOGIN_PORT=8081`
- Usar `netstat -tulpn | grep :8080` para verificar

## 📊 Monitoreo y Logs

### Logs de Spring Boot
```bash
# Ver logs en tiempo real
./mvnw spring-boot:run | tee logs/spring.log

# Ver logs de errores específicos
grep "ERROR" logs/spring.log
```

### Endpoints de Monitoreo
- **Health Check**: `GET /actuator/health`
- **Info**: `GET /actuator/info`
- **Metrics**: `GET /actuator/metrics`

## 📞 Soporte

Si tienes problemas con la configuración, consulta:
- Documentación principal en la raíz del proyecto
- Logs de Spring Boot
- Equipo de desarrollo
- Documentación de Spring Boot: https://docs.spring.io/spring-boot/docs/current/reference/html/