# CONSOLIDADO DE REGISTRO DE SOFTWARE - GYMETRA

Este documento contiene la información técnica y operativa necesaria para el registro del software GYMETRA ante la Dirección Nacional de Derecho de Autor (DNDA) de Colombia.

---

## 1. DESCRIPCIÓN TÉCNICA DEL PROGRAMA

### 1.1. Resumen Ejecutivo
GYMETRA Backend es el núcleo lógico de una plataforma integral de gestión para centros de acondicionamiento físico. El sistema ha sido desarrollado bajo una arquitectura de microservicios distribuida, utilizando el framework **Spring Boot (Java 17)** y garantizando la persistencia mediante **PostgreSQL**. La solución integra seguridad de nivel empresarial mediante el estándar **OAuth2** y **AWS Cognito**, permitiendo una escalabilidad horizontal y un alto rendimiento en la gestión de membresías, accesos y transacciones financieras.

### 1.2. Arquitectura del Sistema
El soporte lógico se divide en tres microservicios principales desacoplados que interactúan mediante protocolos **RESTful (JSON)**:
1. **Microservicio de Login (Identity Provider Interface):** Gestiona la autenticación, sincronización de perfiles y control de acceso basado en roles (RBAC).
2. **Microservicio de Membresías (Core Business Logic):** Orquestador de planes, vigencias, cálculos de renovación y procesamiento de pagos vía Stripe API.
3. **Microservicio de QR (Access Control Engine):** Motor de validación de acceso en tiempo real que genera y verifica tokens dinámicos vinculados al estado de la membresía.

### 1.3. Especificaciones Tecnológicas
* **Lenguaje:** Java 17 LTS.
* **Framework Principal:** Spring Boot 3.x.
* **Seguridad:** Spring Security, JWT (JSON Web Tokens).
* **Bases de Datos:** PostgreSQL 14+.
* **Integraciones:** AWS SDK for Java, Stripe API.

---

## 2. MANUAL DE USUARIO Y GUÍA DE OPERACIÓN

### 2.1. Flujo de Seguridad y Autenticación
El sistema delega la gestión de credenciales a **AWS Cognito**. El flujo de operación es el siguiente:
1. **Handshake:** El frontend autentica al usuario directamente con AWS Cognito.
2. **Token:** Cognito emite un **ID Token (JWT)**.
3. **Autorización:** El frontend envía este token en la cabecera de cada petición al backend: `Authorization: Bearer <JWT_TOKEN>`
4. **Validación:** El backend valida la firma del token y el `issuer` antes de procesar la solicitud.

### 2.2. Endpoints Principales
* **Gestión de Perfil:** `/api/auth/users/{id}`
* **Gestión de Membresías:** `/api/user-memberships`
* **Control de Acceso QR:** `/api/qr-access/me`

---

## 3. ESTRUCTURA DEL CÓDIGO Y MUESTRA DE AUTORÍA

### 3.1. Índice Jerárquico
La estructura sigue las mejores prácticas de **Clean Architecture**:
* `com.login.GYMETRA`: Microservicio de autenticación y sincronización.
* `com.membership.GYMETRA`: Orquestación de planes y pagos.
* `com.GYMETRA.GYMETRA.qr`: Generación y validación de tokens de acceso.

### 3.2. Fragmentos de Lógica Original (Ejemplos)

#### Algoritmo de Sincronización (Cognito Sync)
```java
@Transactional
public User syncUser(Jwt jwt) {
    String sub = jwt.getSubject();
    return userRepository.findByCognitoSub(sub)
            .map(user -> updateExistingUser(user, jwt))
            .orElseGet(() -> createNewUser(jwt));
}
```

#### Algoritmo de Extensión de Vigencia
```java
if (last.getEndDate().isAfter(today)) {
    LocalDate nuevaFechaFin = last.getEndDate().plusDays(newMembership.getMembership().getDurationDays());
    newMembership.setStartDate(today);
    newMembership.setEndDate(nuevaFechaFin);
}
```

---

## 4. INFORMACIÓN LEGAL (DNDA)
* **Nombre de la Obra:** GYMETRA - Sistema de Gestión de Gimnasios.
* **Titular de Derechos:** [Nombre de la Empresa o Autor]
* **Año de Creación:** 2026
* **Naturaleza:** Soporte Lógico (Software)
