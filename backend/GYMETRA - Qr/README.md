# 📱 GYMETRA - Servicio de Acceso QR

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen)
![QR](https://img.shields.io/badge/QR--Generation-blue)
![Port](https://img.shields.io/badge/Port-8090-blue)

Este microservicio es el encargado de la generación de códigos QR dinámicos para el acceso físico al gimnasio y el registro de logs de entrada.

## 🚀 Funcionalidades
- **Generación de QR**: Crea tokens seguros para ser escaneados por el lector físico.
- **Registro de Accesos**: Guarda un historial detallado de quién entra a qué sucursal y a qué hora.
- **Gestión de Sucursales**: Mapeo de las diferentes sedes del gimnasio.

## 🔐 Seguridad y Unificación
Al igual que el resto del sistema, este módulo implementa **Spring Security 6** con validación de JWT de AWS Cognito. 
- Los endpoints de generación de QR están protegidos y requieren un token de usuario activo.
- Soporta CORS para integración directa con la App móvil y el Panel Admin.

## 📖 Documentación de la API (Swagger)
`http://localhost:8090/swagger-ui.html`

## ⚙️ Estándares Técnicos
- **OAuth2 Resource Server**: Validación automática de firmas RSA de Cognito.
- **REST Patterns**: Uso estricto de verbos HTTP y códigos de estado estándar.
- **Clean Architecture**: Lógica de proxy y validación de membresía delegada a servicios especializados.
