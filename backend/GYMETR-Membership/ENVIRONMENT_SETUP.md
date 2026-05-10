# 🛠️ Configuración de Variables de Entorno - Backend Membresías

Este documento explica cómo configurar las variables de entorno necesarias para el servicio de membresías.

## 📁 Archivos de Configuración

### `application.properties`
- **Ubicación**: `src/main/resources/`
- **Propósito**: Configuración principal de Spring Boot
- **Variables**: Configuradas directamente en el archivo

### Archivos `.env` (Opcional)
- **`.env.example`**: Template con valores de ejemplo
- **`.env.development`**: Valores reales para desarrollo local
- **Nota**: Spring Boot no lee `.env` por defecto, pero se pueden usar variables de entorno

### Variables de Entorno del Sistema
```bash
# Puerto del servicio (opcional, por defecto 8081)
GYMETRA_MEMBERSHIP_PORT=8081

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gymdb
DB_USERNAME=postgres
DB_PASSWORD=tu_password

# Stripe
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
STRIPE_PUBLIC_KEY=pk_test_tu_clave_publica

# Email
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

2. **Configurar Stripe para pagos**:
   - Crear cuenta en https://stripe.com
   - Obtener claves de API (modo prueba)
   - Configurar webhooks para confirmación de pagos

3. **Configurar Gmail SMTP**:
   - Generar App Password en https://myaccount.google.com/apppasswords

## 📋 Servicios Externos

### Stripe
**Propósito**: Procesamiento de pagos y suscripciones
- **Modo**: Prueba (test) para desarrollo
- **Webhooks**: Configurar para eventos de pago
- **Documentación**: https://docs.stripe.com/
- **Dashboard**: https://dashboard.stripe.com/

#### Configuración de Webhooks
1. Ir a Dashboard > Developers > Webhooks
2. Añadir endpoint: `http://tu-dominio/api/webhooks/stripe`
3. Eventos a escuchar:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`

### PostgreSQL
**Propósito**: Base de datos principal
- **Versión**: 14+
- **Esquema**: Configurado automáticamente por JPA/Hibernate
- **Tablas principales**: users, memberships, payments, user_memberships

### Gmail SMTP
**Propósito**: Envío de correos de confirmación y notificaciones
- **Servidor**: smtp.gmail.com:587
- **Seguridad**: TLS con STARTTLS
- **App Password**: Requerido para autenticación 2FA

## 🔧 Variables de Entorno

### Puerto Personalizado
```bash
export GYMETRA_MEMBERSHIP_PORT=8081
```

### Base de Datos Externa
```bash
export DB_HOST=tu_servidor_db
export DB_PORT=5432
export DB_NAME=gymdb
export DB_USERNAME=tu_usuario
export DB_PASSWORD=tu_password
```

### Configuración de Stripe
```bash
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_PUBLIC_KEY=pk_test_...
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
  - GYMETRA_MEMBERSHIP_PORT=8081
  - DB_HOST=db
  - DB_PORT=5432
  - DB_NAME=gymdb
  - DB_USERNAME=postgres
  - DB_PASSWORD=postgres
  - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
  - MAIL_PASSWORD=${MAIL_PASSWORD}
```

### Docker Compose Example
```yaml
version: '3.8'
services:
  gymetr-membership:
    build: .
    ports:
      - "8081:8081"
    environment:
      - GYMETRA_MEMBERSHIP_PORT=8081
      - DB_HOST=db
      - DB_PASSWORD=${DB_PASSWORD}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - db
```

## ⚠️ Consideraciones de Seguridad

- **Claves de Stripe**: Mantener la secret key segura, nunca exponer
- **Credenciales de BD**: No hardcodear, usar variables de entorno
- **App Password de Gmail**: Generar específicamente para la app
- **Webhooks de Stripe**: Verificar firma para seguridad

## 🐛 Solución de Problemas

### Error de conexión a BD
- Verificar PostgreSQL corriendo en puerto 5432
- Comprobar credenciales en `application.properties`
- Revisar logs: `tail -f logs/spring.log`

### Error de Stripe
- Verificar claves válidas en Dashboard de Stripe
- Comprobar modo prueba vs producción
- Revisar logs de pagos y webhooks
- Validar configuración de CORS para frontend

### Error de envío de correos
- Verificar App Password correcto
- Comprobar configuración SMTP (puerto 587)
- Revisar límites de envío de Gmail (500/día para cuentas gratuitas)

### Error de puerto ocupado
- Verificar puerto 8081 libre
- Cambiar puerto: `GYMETRA_MEMBERSHIP_PORT=8082`
- Usar `netstat -tulpn | grep :8081`

## 📊 APIs y Endpoints

### Endpoints Principales
- `GET /api/memberships` - Listar planes de membresía
- `POST /api/memberships` - Crear nueva membresía
- `POST /api/payments/create-session` - Crear sesión de pago Stripe
- `POST /api/webhooks/stripe` - Webhook de Stripe

### Swagger Documentation
- URL: `http://localhost:8081/swagger-ui.html`
- OpenAPI: `http://localhost:8081/api-docs`

## 📞 Soporte

Si tienes problemas con la configuración, consulta:
- Documentación principal en la raíz del proyecto
- Dashboard de Stripe para pagos
- Logs de Spring Boot
- Equipo de desarrollo

- **Claves de Stripe**: Mantener la secret key segura
- **Credenciales de BD**: No exponer en logs
- **App Password de Gmail**: Generar específicamente para la app

## 🐛 Solución de Problemas

### Error de conexión a BD
- Verificar PostgreSQL corriendo
- Comprobar credenciales
- Revisar configuración de red

### Error de Stripe
- Verificar claves válidas
- Comprobar modo prueba vs producción
- Revisar logs de pagos

### Error de envío de correos
- Verificar App Password
- Comprobar configuración SMTP
- Revisar límites de envío

## 📞 Soporte

Si tienes problemas con la configuración, consulta:
- Documentación principal en la raíz del proyecto
- Logs de Spring Boot
- Equipo de desarrollo