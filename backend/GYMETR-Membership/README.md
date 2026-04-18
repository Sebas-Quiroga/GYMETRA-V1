# 💳 GYMETRA - Servicio de Membresías y Pagos

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen)
![Stripe](https://img.shields.io/badge/Stripe-Integration-blueviolet)
![Port](https://img.shields.io/badge/Port-8081-blue)

Este microservicio gestiona el catálogo de membresías del gimnasio, la asignación de planes a los usuarios y la integración con la pasarela de pagos **Stripe**.

## 🚀 Funcionalidades
- **Gestión de Planes**: CRUD de membresías (Mensual, Trimestral, Anual).
- **Control de Vencimientos**: Seguimiento de la validez de los planes de usuario.
- **Pagos con Stripe**: Procesamiento de pagos seguros.

## 🔒 Seguridad Unificada
Este servicio actúa como un **OAuth2 Resource Server**. Solo acepta peticiones que incluyan un token válido emitido por AWS Cognito. No requiere login propio; confía en el token generado por el módulo de identidad.

## 📖 Documentación de la API (Swagger)
`http://localhost:8081/swagger-ui.html`

> [!IMPORTANT]
> Para consumir estos endpoints desde Postman o Swagger, debes incluir el encabezado:
> `Authorization: Bearer <ID_TOKEN_COGNITO>`

## 🧹 Principios de Clean Code
- **GlobalExceptionHandler**: Errores estandarizados en formato JSON.
- **Service Layer**: Lógica de negocio (como el filtrado de planes activos) centralizada en los servicios.
- **ResponseEntity**: Respuestas HTTP uniformes.
