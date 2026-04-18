# 🔐 GYMETRA - Servicio de Autenticación (Core)

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)
![AWS Cognito](https://img.shields.io/badge/AWS-Cognito-orange)
![Port](https://img.shields.io/badge/Port-8080-blue)

Este microservicio es el **corazón de identidad** de todo el ecosistema GYMETRA. Gestiona la integración con AWS Cognito y sincroniza los perfiles de usuario con la base de datos local.

## 🚀 Responsabilidades Centrales
- **Autoridad de Identidad**: Valida que los tokens JWT de Cognito sean auténticos.
- **Sincronización de Perfiles**: Crea automáticamente registros en la tabla `user` local cuando se detecta un nuevo usuario de Cognito.
- **Gestión de Roles**: Traduce los grupos de Cognito (`Admin`, `Client`) a autoridades de Spring Security.

## 🛠️ Tecnologías
- **Spring Security 6** (OAuth2 Resource Server)
- **AWS Amplify SDK** (en el Frontend)
- **PostgreSQL** para la persistencia de perfiles locales.

## 📖 Documentación de la API (Swagger)
Puedes probar los endpoints y ver la estructura de datos en:
`http://localhost:8080/swagger-ui.html`

> [!TIP]
> Para probar endpoints protegidos en Swagger, obtén un token desde el frontend y úsalo en el botón **Authorize** de la esquina superior derecha.

## ⚙️ Configuración Requerida
Asegúrate de tener estas variables en tu `application.properties`:
```properties
cognito.issuer=https://cognito-idp.us-east-2.amazonaws.com/us-east-2_ckSy7zPAt
cognito.client-id=3gnvfec5v6tfp32u634mq645ll
```
