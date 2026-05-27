# 🔐 GYMETRA - Servicio de Autenticación (Core)

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)
![AWS Cognito](https://img.shields.io/badge/AWS-Cognito-orange)
![Port](https://img.shields.io/badge/Port-8080-blue)

Este microservicio es el **corazón de identidad** de todo el ecosistema GYMETRA. Gestiona la integración con AWS Cognito y sincroniza los perfiles de usuario con la base de datos local.

## ⚙️ Configuración del Entorno (Variables de Entorno)

Por razones de seguridad, las credenciales no deben ser compartidas públicamente. Para desplegar este microservicio, configura tu entorno:

1. En la raíz del proyecto (`backend/GYMETR-login/`), busca el archivo `.env.example`.
2. Cópialo o renómbralo a `.env` (o `.env.development`).
3. Abre tu nuevo `.env` e inserta los datos correspondientes:
   - **PostgreSQL**: Credenciales para conectarte a tu base de datos local.
   - **AWS Cognito**: URI del Issuer, el Client ID y el URI JWKS de tu User Pool.
   - **AWS Credentials**: (Opcional si usas el AWS Default Provider Chain, pero útil en local) Access Key y Secret Key.
   - **Gmail SMTP**: Correo y contraseña de aplicación para envío de correos (reset de contraseñas, etc.).

> [!IMPORTANT]
> El archivo `.env` nunca debe ser subido al repositorio Git.

## 🚀 Cómo Ejecutar

Una vez preparado tu archivo `.env` y teniendo PostgreSQL corriendo, inicia el servidor:

```bash
./mvnw spring-boot:run
```

## ✨ Responsabilidades Centrales
- **Autoridad de Identidad**: Valida que los tokens JWT de Cognito sean auténticos usando las claves públicas de AWS (JWKS).
- **Sincronización de Perfiles**: Crea automáticamente registros en la tabla `user` local cuando se detecta un nuevo registro desde Cognito.
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
