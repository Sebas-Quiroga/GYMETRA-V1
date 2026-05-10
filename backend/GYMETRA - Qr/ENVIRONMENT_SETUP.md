# 🛠️ Configuración de Variables de Entorno - Backend QR/Acceso

Este documento explica cómo configurar las variables de entorno necesarias para el servicio de control de acceso por QR.

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
# Puerto del servicio (opcional, por defecto 8090)
GYMETRA_QR_PORT=8090

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gymdb
DB_USERNAME=postgres
DB_PASSWORD=tu_password

# APIs Externas
RAPIDAPI_EXERCISE_KEY=tu_clave_rapidapi
SPOONACULAR_API_KEY=tu_clave_spoonacular

# URLs de Microservicios
MEMBERSHIP_SERVICE_URL=http://localhost:8081/api
LOGIN_SERVICE_URL=http://localhost:8080/api
```

## 🚀 Configuración Inicial

1. **Configurar base de datos PostgreSQL**:
   ```sql
   CREATE DATABASE gymdb;
   CREATE USER postgres WITH PASSWORD 'tu_password';
   GRANT ALL PRIVILEGES ON DATABASE gymdb TO postgres;
   ```

2. **Configurar APIs externas**:
   - RapidAPI para ejercicios y rutinas
   - Spoonacular para planes nutricionales

3. **Verificar conectividad con otros microservicios**:
   - Servicio de membresías (puerto 8081)
   - Servicio de login/auth (puerto 8080)

## 📋 Servicios Externos

### RapidAPI - ExerciseDB
**Propósito**: Base de datos de ejercicios para rutinas de entrenamiento
- **API**: https://exercisedb.p.rapidapi.com
- **Límite gratuito**: 500 requests/mes
- **Documentación**: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb

#### Configuración
1. Registrarse en RapidAPI
2. Buscar "ExerciseDB" de Justin M
3. Suscribirse al plan gratuito
4. Copiar API Key

#### Endpoints principales
- `GET /exercises` - Lista de ejercicios
- `GET /exercises/bodyPart/{bodyPart}` - Ejercicios por parte del cuerpo
- `GET /exercises/equipment/{equipment}` - Ejercicios por equipo

### Spoonacular API
**Propósito**: API de nutrición y recetas para planes alimenticios
- **API**: https://api.spoonacular.com
- **Límite gratuito**: 150 requests/día
- **Documentación**: https://spoonacular.com/food-api

#### Configuración
1. Registrarse en https://spoonacular.com/food-api
2. Obtener API Key gratuita
3. Verificar límites de uso

#### Endpoints principales
- `GET /recipes/complexSearch` - Búsqueda de recetas
- `GET /mealplanner/generate` - Generar plan de comidas
- `GET /food/trivia` - Trivia nutricional

### PostgreSQL
**Propósito**: Base de datos principal
- **Versión**: 14+
- **Esquema**: Configurado automáticamente por JPA/Hibernate
- **Tablas principales**: qr_codes, access_logs, user_sessions, exercises, nutrition_plans

## 🔧 Variables de Entorno

### Puerto Personalizado
```bash
export GYMETRA_QR_PORT=8090
```

### Base de Datos Externa
```bash
export DB_HOST=tu_servidor_db
export DB_PORT=5432
export DB_NAME=gymdb
export DB_USERNAME=tu_usuario
export DB_PASSWORD=tu_password
```

### Configuración de APIs Externas
```bash
export RAPIDAPI_EXERCISE_KEY=tu_clave_rapidapi
export SPOONACULAR_API_KEY=tu_clave_spoonacular
```

### URLs de Microservicios
```bash
export MEMBERSHIP_SERVICE_URL=http://tu-servidor:8081/api
export LOGIN_SERVICE_URL=http://tu-servidor:8080/api
```

## 🐳 Configuración con Docker

### Variables de Entorno en Docker
```yaml
environment:
  - GYMETRA_QR_PORT=8090
  - DB_HOST=db
  - DB_PORT=5432
  - DB_NAME=gymdb
  - DB_USERNAME=postgres
  - DB_PASSWORD=postgres
  - RAPIDAPI_EXERCISE_KEY=${RAPIDAPI_EXERCISE_KEY}
  - SPOONACULAR_API_KEY=${SPOONACULAR_API_KEY}
  - MEMBERSHIP_SERVICE_URL=http://gymetr-membership:8081/api
  - LOGIN_SERVICE_URL=http://gymetr-login:8080/api
```

### Docker Compose Example
```yaml
version: '3.8'
services:
  gymetra-qr:
    build: .
    ports:
      - "8090:8090"
    environment:
      - GYMETRA_QR_PORT=8090
      - DB_HOST=db
      - DB_PASSWORD=${DB_PASSWORD}
      - RAPIDAPI_EXERCISE_KEY=${RAPIDAPI_EXERCISE_KEY}
      - SPOONACULAR_API_KEY=${SPOONACULAR_API_KEY}
    depends_on:
      - db
      - gymetr-membership
      - gymetr-login
```

## ⚠️ Consideraciones de Seguridad

- **API Keys**: Mantener seguras, nunca exponer en frontend
- **Credenciales de BD**: No hardcodear, usar variables de entorno
- **Rate Limiting**: Monitorear uso de APIs externas para evitar límites
- **Validación**: Verificar tokens JWT para acceso a QR

## 🐛 Solución de Problemas

### Error de conexión a BD
- Verificar PostgreSQL corriendo en puerto 5432
- Comprobar credenciales en `application.properties`
- Revisar logs: `tail -f logs/spring.log`

### Error de APIs Externas
- Verificar claves válidas en dashboards respectivos
- Comprobar límites de uso (RapidAPI: 500/mes, Spoonacular: 150/día)
- Revisar conectividad de red y proxies
- Validar formato de requests/responses

### Error de comunicación entre microservicios
- Verificar que otros servicios estén corriendo
- Comprobar URLs en configuración
- Revisar logs de red y timeouts
- Validar configuración de CORS

### Error de puerto ocupado
- Verificar puerto 8090 libre
- Cambiar puerto: `GYMETRA_QR_PORT=8091`
- Usar `netstat -tulpn | grep :8090`

## 📊 APIs y Endpoints

### Endpoints Principales
- `POST /api/qr/generate` - Generar código QR de acceso
- `POST /api/qr/validate` - Validar código QR
- `GET /api/exercises` - Obtener ejercicios desde RapidAPI
- `GET /api/nutrition/plans` - Generar planes nutricionales
- `GET /api/access/logs` - Logs de acceso

### Integración con otros servicios
- **Membership Service**: Validar membresías activas
- **Login Service**: Autenticar usuarios y validar tokens

### Swagger Documentation
- URL: `http://localhost:8090/swagger-ui.html`
- OpenAPI: `http://localhost:8090/api-docs`

## 📞 Soporte

Si tienes problemas con la configuración, consulta:
- Documentación principal en la raíz del proyecto
- Dashboards de RapidAPI y Spoonacular
- Logs de Spring Boot
- Equipo de desarrollo
```

## ⚠️ Consideraciones de Seguridad

- **API Keys**: Mantener seguras, no exponer en logs
- **Credenciales de BD**: Proteger información sensible
- **Límites de API**: Monitorear uso de servicios externos

## 🐛 Solución de Problemas

### Error de conexión a BD
- Verificar PostgreSQL corriendo
- Comprobar credenciales
- Revisar configuración de red

### Error de APIs externas
- Verificar claves válidas
- Comprobar límites de uso
- Revisar conectividad a internet

### Error de integración con membresías
- Verificar URL del servicio de membresías
- Comprobar que el servicio esté corriendo
- Revisar logs de comunicación entre servicios

## 📞 Soporte

Si tienes problemas con la configuración, consulta:
- Documentación principal en la raíz del proyecto
- Logs de Spring Boot
- Equipo de desarrollo