# Implementación de Seguridad - GYMETRA

La plataforma GYMETRA implementa múltiples capas de seguridad siguiendo las mejores prácticas de la industria y mitigaciones de OWASP.

## 1. Autenticación y Autorización
*   **Proveedor de Identidad**: Integración con **AWS Cognito** para la gestión centralizada de identidades.
*   **Protocolo**: Uso de **OAuth2** y **OpenID Connect (OIDC)**.
*   **Tokens**: Los servicios backend actúan como *Resource Servers*, validando tokens **JWT** emitidos por Cognito.
*   **Roles y Permisos**: Implementación de RBAC (Role-Based Access Control). Los grupos de Cognito (`Admin`, `Client`) se mapean a `GrantedAuthority` en Spring Security.

## 2. Encriptación de Datos
*   **Tránsito**: Toda la comunicación entre cliente y servidor, y entre microservicios, se realiza sobre **HTTPS/TLS**.
*   **Reposo**: Las contraseñas en la base de datos local (cuando aplica) se encriptan utilizando el algoritmo **BCrypt** con un factor de costo de 10. Los datos sensibles en PostgreSQL pueden ser encriptados mediante el módulo `pgcrypto`.

## 3. Mitigaciones OWASP Top 10
*   **Inyecciones (SQLi)**: Uso de **Spring Data JPA** y consultas parametrizadas que previenen de forma nativa la inyección SQL.
*   **Exposición de Datos Sensibles**: Los DTOs (Data Transfer Objects) se utilizan para filtrar información sensible antes de enviarla al frontend.
*   **Broken Access Control**: Verificación de roles en cada endpoint mediante `@PreAuthorize` o configuración en `SecurityFilterChain`.
*   **Cross-Site Scripting (XSS)**: Los frontends (Vue.js) escapan automáticamente el contenido renderizado. Se configuran headers de seguridad (Content-Security-Policy).
*   **CSRF**: Deshabilitado para APIs REST stateless (JWT), pero mitigado mediante el uso de tokens de corta duración y validación estricta de origen (CORS).

## 4. Validación de Entradas
*   Uso de anotaciones de validación de JSR-303/JSR-380 (`@NotNull`, `@Size`, `@Email`, etc.) en los controladores y entidades para asegurar la integridad de los datos.

## 5. Auditoría de Usuarios
*   Se registra el historial de accesos (logs) en la tabla `access_log`.
*   Campos de auditoría en tablas principales: `created_at`, `updated_at`, `created_by`, `updated_by`.
