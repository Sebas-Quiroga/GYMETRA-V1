# Modelo de Datos (Entidad-Relación) - GYMETRA

```mermaid
erDiagram
    USER ||--o{ USER_ROLE : has
    ROLE ||--o{ USER_ROLE : assigned_to
    
    USER ||--o{ USER_MEMBERSHIP : owns
    MEMBERSHIP_PLAN ||--o{ USER_MEMBERSHIP : defines
    
    USER ||--o{ PAYMENT : makes
    MEMBERSHIP_PLAN ||--o{ PAYMENT : paid_for
    
    USER ||--o{ ACCESS_LOG : records
    GYM_BRANCH ||--o{ ACCESS_LOG : location
    
    USER {
        uuid id PK
        string first_name
        string last_name
        string email UK
        string password_hash
        string phone
        string address
    }

    ROLE {
        uuid id PK
        string name UK
        string description
    }

    USER_ROLE {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
    }

    MEMBERSHIP_PLAN {
        uuid id PK
        string code UK
        string name
        int duration_months
        decimal price
        string description
        boolean training
        boolean nutrition
    }

    USER_MEMBERSHIP {
        uuid id PK
        uuid user_id FK
        uuid membership_plan_id FK
        date start_date
        date end_date
        string status
    }

    PAYMENT {
        uuid id PK
        uuid user_id FK
        uuid membership_plan_id FK
        decimal amount
        string method
        string status
        datetime payment_date
        string reference_code
    }

    GYM_BRANCH {
        uuid id PK
        string code UK
        string name
        string address
        string city
        int capacity
    }

    ACCESS_LOG {
        uuid id PK
        uuid user_id FK
        uuid gym_branch_id FK
        datetime access_time
        boolean validated
    }
```

## Descripción de Entidades

*   **USER**: Almacena la información de los socios y administradores.
*   **ROLE**: Define los permisos del sistema (ADMIN, CLIENT).
*   **MEMBERSHIP_PLAN**: Define los tipos de planes disponibles (Mensual, Trimestral, Anual, con/sin extras).
*   **USER_MEMBERSHIP**: Relaciona a los usuarios con sus planes actuales y periodos de vigencia.
*   **PAYMENT**: Registra las transacciones financieras.
*   **GYM_BRANCH**: Sedes físicas del gimnasio.
*   **ACCESS_LOG**: Auditoría de entradas y salidas para control de aforo y asistencia.
