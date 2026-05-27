# 🏋️‍♂️ GYMETRA - Servicio de Membresías y Pagos

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen)
![Stripe](https://img.shields.io/badge/Stripe-Integration-blueviolet)
![Port](https://img.shields.io/badge/Port-8081-blue)

Este microservicio gestiona el catálogo de membresías del gimnasio, la asignación de planes a los usuarios y la integración con la pasarela de pagos **Stripe**.

## ⚙️ Configuración del Entorno (Variables de Entorno)

Por seguridad, este servicio no contiene credenciales quemadas en el código. Para desplegarlo, necesitas configurar tus variables de entorno.

1. En la raíz de este microservicio (`backend/GYMETR-Membership/`), encontrarás un archivo llamado `.env.example`.
2. Copia o renombra este archivo a `.env` (o `.env.development`).
3. Abre tu nuevo `.env` y rellena los datos correspondientes:
   - **PostgreSQL**: Credenciales de acceso a tu base de datos local o remota.
   - **Stripe**: Tu clave secreta (`sk_test_...` o `sk_live_...`).
   - **AWS Cognito**: Tus credenciales de User Pool para validación JWT.
   - **Gmail SMTP**: Correo y contraseña de aplicación para envíos de recibos.

> [!IMPORTANT]
> Nunca hagas commit de tu archivo `.env` al control de versiones.

## 🚀 Cómo Ejecutar

Una vez que hayas configurado tu archivo `.env` y tengas PostgreSQL corriendo, ejecuta el proyecto mediante Maven Wrapper:

```bash
./mvnw spring-boot:run
```

## ✨ Funcionalidades
- **Gestión de Planes**: CRUD de membresías (Mensual, Trimestral, Anual).
- **Control de Vencimientos**: Seguimiento de la validez de los planes de usuario.
- **Pagos con Stripe**: Procesamiento de pagos seguros.

## 🔐 Seguridad Unificada
Este servicio actúa como un **OAuth2 Resource Server**. Solo acepta peticiones que incluyan un token válido emitido por AWS Cognito. No requiere login propio; confía en el token generado por el módulo de identidad.

## 📖 Documentación de la API (Swagger)
Una vez iniciado el servidor, puedes ver los endpoints aquí:
`http://localhost:8081/swagger-ui.html`

> [!IMPORTANT]
> Para consumir estos endpoints desde Postman o Swagger, debes incluir el encabezado:
> `Authorization: Bearer <ID_TOKEN_COGNITO>`

## 🧹 Principios de Clean Code
- **GlobalExceptionHandler**: Errores estandarizados en formato JSON.
- **Service Layer**: Lógica de negocio (como el filtrado de planes activos) centralizada en los servicios.
- **ResponseEntity**: Respuestas HTTP uniformes.
