# DOCUMENTO TÉCNICO: DESCRIPCIÓN DEL PROGRAMA
## REGISTRO DE SOPORTE LÓGICO (SOFTWARE) - DNDA COLOMBIA

**NOMBRE DEL SOFTWARE:** GYMETRA Backend (Core Microservices)  
**VERSIÓN:** 1.0.0  
**FECHA:** 9 de mayo de 2026  
**ESTADO:** Finalizado / Producción  

---

### 1. RESUMEN EJECUTIVO
GYMETRA Backend es el núcleo lógico de una plataforma integral de gestión para centros de acondicionamiento físico. El sistema ha sido desarrollado bajo una arquitectura de microservicios distribuida, utilizando el framework **Spring Boot (Java 17)** y garantizando la persistencia mediante **PostgreSQL**. La solución integra seguridad de nivel empresarial mediante el estándar **OAuth2** y **AWS Cognito**, permitiendo una escalabilidad horizontal y un alto rendimiento en la gestión de membresías, accesos y transacciones financieras.

### 2. ARQUITECTURA DEL SISTEMA
El soporte lógico se divide en tres microservicios principales desacoplados que interactúan mediante protocolos **RESTful (JSON)**:

1.  **Microservicio de Login (Identity Provider Interface):** Gestiona la autenticación, sincronización de perfiles y control de acceso basado en roles (RBAC).
2.  **Microservicio de Membresías (Core Business Logic):** Orquestador de planes, vigencias, cálculos de renovación y procesamiento de pagos vía Stripe API.
3.  **Microservicio de QR (Access Control Engine):** Motor de validación de acceso en tiempo real que genera y verifica tokens dinámicos vinculados al estado de la membresía.

### 3. MODELO DE DATOS (ENTIDADES PRINCIPALES)
El sistema utiliza una base de datos relacional para garantizar la integridad referencial de la propiedad intelectual de los datos:

*   **User:** Almacena la identidad local vinculada al `sub` de AWS Cognito. Incluye campos de identificación legal, contacto y estado.
*   **Membership:** Define la estructura de los planes comerciales (duración, precio, servicios incluidos).
*   **UserMembership:** Tabla de relación que orquesta la vigencia del servicio para cada usuario, manejando estados de "ACTIVE", "PENDING", "EXPIRED".
*   **QrAccess:** Entidad que registra los tokens de acceso generados y su vinculación temporal con la identidad del usuario.
*   **AccessLog:** Registro de auditoría de entradas y salidas para el control de aforo.

### 4. ALGORITMOS DE LÓGICA ORIGINAL (NÚCLEO DEL SOFTWARE)

#### 4.1. Algoritmo de Sincronización de Identidad (Cognito Sync)
Este algoritmo garantiza la consistencia entre el proveedor de identidad en la nube y el backend local. Implementa una lógica de "find-or-create" basada en el identificador único `sub`, actualizando de forma atómica los atributos del perfil (correo, identificación, teléfono) en cada interacción autenticada, asegurando que la base de datos local siempre refleje la realidad jurídica del usuario.

#### 4.2. Algoritmo de Orquestación y Renovación de Membresías
Lógica encargada del cálculo dinámico de fechas de expiración. A diferencia de un sistema estático, el algoritmo evalúa si existe una membresía vigente para realizar una "extensión de plazo" sumando la duración del nuevo plan a la fecha de fin previa, o iniciando un nuevo ciclo si la membresía anterior ha caducado. Esto previene solapamientos de tiempo y garantiza la justicia en el cobro del servicio.

#### 4.3. Motor de Validación de Acceso QR
Algoritmo de generación de tokens efímeros. El sistema no genera QRs estáticos; en su lugar, el motor valida en tiempo real (con un caché de 12 horas) el estado de la membresía en el microservicio correspondiente antes de emitir o reactivar un código de acceso. El QR codifica una cadena única UUID firmada que es verificada por el hardware de acceso en los puntos físicos del gimnasio.

### 5. ESPECIFICACIONES TECNOLÓGICAS
*   **Lenguaje:** Java 17 LTS.
*   **Framework Principal:** Spring Boot 3.x.
*   **Seguridad:** Spring Security, JWT (JSON Web Tokens).
*   **Bases de Datos:** PostgreSQL 14+.
*   **Integraciones:** AWS SDK for Java, Stripe API.
