# 📱 GYMETRA - Servicio de Acceso QR (Ejercicios y Nutrición)

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen)
![QR](https://img.shields.io/badge/QR--Generation-blue)
![Port](https://img.shields.io/badge/Port-8090-blue)

Este microservicio es el encargado de la generación de códigos QR dinámicos para el acceso físico al gimnasio, el registro de logs de entrada, y la sincronización/proveeduría de catálogos de **Ejercicios** (RapidAPI) y **Nutrición** (Spoonacular).

## ⚙️ Configuración del Entorno (Variables de Entorno)

Este microservicio consume APIs externas de terceros y requiere conectividad a PostgreSQL.

1. En la raíz de este microservicio (`backend/GYMETRA - Qr/`), encontrarás el archivo `.env.example`.
2. Renombra o copia este archivo a `.env` (o `.env.development`).
3. Rellena los datos en tu nuevo `.env`:
   - **PostgreSQL**: Credenciales locales.
   - **AWS Cognito**: URI del Issuer, el Client ID y el URI JWKS.
   - **RapidAPI (ExerciseDB)**: Clave de suscripción a ExerciseDB.
   - **Spoonacular**: Clave de API de Nutrición.

> [!IMPORTANT]
> El archivo `.env` está en `.gitignore` para prevenir fugas de claves de API. ¡No lo compartas!

## 🚀 Cómo Ejecutar

Asegúrate de que PostgreSQL esté corriendo y que hayas configurado tu `.env`:

```bash
./mvnw spring-boot:run
```

## ✨ Funcionalidades
- **Generación de QR**: Crea tokens seguros para ser escaneados por el lector físico.
- **Registro de Accesos**: Guarda un historial detallado de quién entra a qué sucursal y a qué hora.
- **Catálogo de Ejercicios y Nutrición**: Sincroniza desde APIs externas (RapidAPI, Spoonacular) traduciendo al español los registros para consumo local en la aplicación.

## 🔐 Seguridad y Unificación
Al igual que el resto del sistema, este módulo implementa **Spring Security 6** con validación de JWT de AWS Cognito. 
- Los endpoints de generación de QR están protegidos y requieren un token de usuario activo.
- Soporta CORS para integración directa con la App móvil y el Panel Admin.

## 📖 Documentación de la API (Swagger)
`http://localhost:8090/swagger-ui.html`

## 🛠️ Estándares Técnicos
- **OAuth2 Resource Server**: Validación automática de firmas RSA de Cognito.
- **REST Patterns**: Uso estricto de verbos HTTP y códigos de estado estándar.
- **Clean Architecture**: Lógica de proxy y validación de membresía delegada a servicios especializados.
