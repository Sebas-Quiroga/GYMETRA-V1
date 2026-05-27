# Diagrama de Arquitectura de Sistema - GYMETRA

El sistema sigue una arquitectura de microservicios distribuida, comunicada vía REST y orquestada con Docker.

```mermaid
graph TD
    subgraph Frontend
        AdminWeb[Admin Dashboard - Vue.js]
        UserApp[User App - Ionic/Vue]
    end

    subgraph API_Gateway_and_Security
        Auth[Auth Service - Cognito/Local]
    end

    subgraph Microservices
        MS_Membership[Membership Service]
        MS_QR[QR & Access Service]
        MS_Login[Login Service]
    end

    subgraph Persistence
        DB[(PostgreSQL)]
    end

    subgraph External_Services
        Stripe[Stripe Payments]
        AWS_Cognito[AWS Cognito]
    end

    UserApp --> MS_Login
    AdminWeb --> MS_Login
    
    UserApp --> MS_Membership
    UserApp --> MS_QR
    
    AdminWeb --> MS_Membership
    AdminWeb --> MS_QR

    MS_Login --> DB
    MS_Membership --> DB
    MS_QR --> DB

    MS_Membership --> Stripe
    MS_Login --> AWS_Cognito
    MS_QR -.-> MS_Membership : Proxy Validation
```

## Descripción de Componentes

1.  **Frontend**:
    *   **Admin Dashboard**: Aplicación web para la gestión de usuarios, planes y visualización de métricas.
    *   **User App**: Aplicación móvil/web para que los socios gestionen su membresía y generen su QR de acceso.
2.  **Servicios Backend**:
    *   **Login Service**: Gestiona la autenticación, roles y sincronización con AWS Cognito.
    *   **Membership Service**: Administra los planes de suscripción, pagos con Stripe y estados de membresía de los usuarios.
    *   **QR & Access Service**: Genera y valida códigos QR, registra logs de acceso y gestiona rutinas/nutrición.
3.  **Persistencia**:
    *   **PostgreSQL**: Base de datos relacional para almacenar toda la información del negocio.
4.  **Integraciones**:
    *   **Stripe**: Pasarela para el procesamiento de pagos seguro.
    *   **AWS Cognito**: Proveedor de identidad externo para autenticación escalable.
