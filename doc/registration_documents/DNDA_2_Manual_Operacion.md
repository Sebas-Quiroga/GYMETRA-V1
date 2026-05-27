# MANUAL DE USUARIO Y GUÍA DE OPERACIÓN TÉCNICA
## GYMETRA BACKEND (CORE MICROSERVICES)

**DIRIGIDO A:** Desarrolladores de Frontend, Administradores de Sistemas y Operadores Técnicos.

---

### 1. INTRODUCCIÓN
Este manual describe la interacción operativa con los microservicios de GYMETRA. El backend actúa como un Resource Server bajo el estándar **OAuth2**, lo que significa que todas las peticiones (a excepción de los endpoints públicos de salud del sistema) deben incluir un token de acceso válido.

### 2. FLUJO DE SEGURIDAD Y AUTENTICACIÓN
El sistema delega la gestión de credenciales a **AWS Cognito**. El flujo de operación es el siguiente:

1.  **Handshake:** El frontend autentica al usuario directamente con AWS Cognito.
2.  **Token:** Cognito emite un **ID Token (JWT)**.
3.  **Autorización:** El frontend envía este token en la cabecera de cada petición al backend:  
    `Authorization: Bearer <JWT_TOKEN>`
4.  **Validación:** El backend valida la firma del token y el `issuer` antes de procesar la solicitud.

### 3. GUÍA DE ENDPOINTS PRINCIPALES

#### 3.1. Gestión de Perfil y Sincronización (/api/auth)
*   `GET /api/auth/users/{id}`: Recupera la información detallada del perfil del usuario.
*   `PUT /api/auth/users/{id}`: Permite la actualización de datos personales (Nombre, Apellido, Teléfono).
*   `POST /api/auth/users/sync`: Fuerza la sincronización masiva entre Cognito y la base de datos local.

#### 3.2. Gestión de Membresías y Pagos (/api/user-memberships)
*   `POST /api/user-memberships`: Crea o renueva una membresía. El sistema calculará automáticamente la fecha de inicio y fin.
*   `GET /api/user-memberships/user/{userId}`: Historial completo de planes adquiridos por el usuario.
*   `GET /api/user-memberships/user/{userId}/remaining-days`: Devuelve el conteo de días de acceso disponibles.

#### 3.3. Control de Acceso QR (/api/qr-access)
*   `GET /api/qr-access/me`: Genera u obtiene el código QR dinámico para el usuario autenticado.
*   `GET /api/qr-access/user/{userId}`: Endpoint administrativo para verificar el código QR de un cliente específico.

### 4. CÓDIGOS DE RESPUESTA Y ERRORES
El sistema sigue los estándares HTTP para la comunicación de estados:

*   **200 OK / 201 Created:** Operación exitosa.
*   **400 Bad Request:** Los datos enviados son inválidos (ej. fecha de fin anterior a la de inicio).
*   **401 Unauthorized:** El token JWT ha expirado o es inválido.
*   **403 Forbidden:** El usuario no cuenta con los permisos necesarios (roles) para la acción.
*   **404 Not Found:** El recurso solicitado (Usuario o Membresía) no existe.
*   **500 Internal Server Error:** Error inesperado en el procesamiento lógico.

### 5. REQUISITOS DE OPERACIÓN
Para el correcto funcionamiento del software, los servicios deben contar con conectividad a:
*   Instancia de Base de Datos PostgreSQL.
*   Endpoints de AWS Cognito (Identity Provider).
*   API de Stripe (para el procesamiento de pagos en tiempo real).
