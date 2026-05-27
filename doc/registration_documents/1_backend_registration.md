# Documento de Registro de Software - GYMETRA Backend

## 1. Información General
*   **Nombre**: GYMETRA Backend (Core Microservices)
*   **Versión**: 1.0.0
*   **Lenguaje**: Java 17 (Spring Boot 3.x)
*   **Persistencia**: PostgreSQL 14+

## 2. Descripción Funcional
El backend de GYMETRA es el núcleo lógico del sistema, encargado de la gestión distribuida de datos y servicios. Proporciona una interfaz RESTful para los frontends y coordina las integraciones externas.

### Funciones Principales:
*   **Orquestación de Membresías**: Lógica de creación, renovación y expiración de planes.
*   **Servicio de Pagos**: Integración con Stripe API para procesamiento de transacciones.
*   **Seguridad y Auth**: Emisión y validación de tokens JWT, sincronización con AWS Cognito.
*   **Motor de Acceso**: Generación de códigos QR únicos y validación en tiempo real contra la base de datos de asistencia.

## 3. Descripción Técnica
*   **Arquitectura**: Microservicios desacoplados (Login, Membership, QR).
*   **Protocolo de Comunicación**: REST (JSON).
*   **Seguridad**: Spring Security, OAuth2 Resource Server.

## 4. Algoritmos Representativos
*   **Sincronización de Usuarios (Cognito)**: Algoritmo para mantener la consistencia entre el proveedor de identidad y la base de datos local.
*   **Lógica de Renovación**: Algoritmo para calcular la nueva fecha de fin sumando la duración del plan a la fecha actual o a la fecha de vencimiento previa si aún es vigente.

## 5. Muestra de Código Fuente
```java
@Transactional
public UserMembership createOrUpdateMembership(UserMembership newMembership) {
    // Lógica de cálculo de fechas y estado
    LocalDate nuevaFechaFin = last.getEndDate().plusDays(newMembership.getMembership().getDurationDays());
    newMembership.setEndDate(nuevaFechaFin);
    return repository.save(newMembership);
}
```
