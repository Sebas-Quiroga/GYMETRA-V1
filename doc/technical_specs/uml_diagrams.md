# Diagramas UML - GYMETRA

## 1. Diagrama de Casos de Uso

```mermaid
useCaseDiagram
    actor "Socio (Cliente)" as Socio
    actor "Administrador" as Admin
    actor "Sistema de Pagos" as Stripe

    package GYMETRA {
        usecase "Registrarse/Login" as UC1
        usecase "Comprar Membresía" as UC2
        usecase "Generar QR de Acceso" as UC3
        usecase "Ver Rutinas/Nutrición" as UC4
        usecase "Gestionar Usuarios" as UC5
        usecase "Gestionar Planes" as UC6
        usecase "Ver Reportes/Métricas" as UC7
        usecase "Validar Acceso" as UC8
    }

    Socio --> UC1
    Socio --> UC2
    Socio --> UC3
    Socio --> UC4

    Admin --> UC1
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8

    UC2 -- Stripe : Procesar Pago
```

## 2. Diagrama de Secuencia: Proceso de Compra y Acceso

```mermaid
sequenceDiagram
    participant U as Socio
    participant F as Frontend
    participant M as Membership Service
    participant S as Stripe API
    participant Q as QR Service

    U->>F: Selecciona Plan
    F->>M: POST /api/payments/checkout
    M->>S: Crear Sesión de Pago
    S-->>M: Session URL
    M-->>F: Redirigir a Stripe
    U->>S: Ingresar datos tarjeta
    S-->>M: Webhook (Pago Exitoso)
    M->>M: Activar UserMembership
    U->>F: Ver código QR
    F->>Q: GET /api/access/my-qr
    Q->>M: Validar Membresía Activa
    M-->>Q: OK (Active)
    Q-->>F: Código QR (Base64)
    F-->>U: Mostrar QR
```
