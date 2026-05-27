# Documentación de la API - GYMETRA

El sistema expone varias APIs RESTful documentadas mediante Swagger/OpenAPI.

## 1. Servicio de Autenticación (Login Service)
**Puerto Base**: `8080`

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/api/auth/login` | Inicia sesión y retorna un JWT. | Todos |
| POST | `/api/auth/register` | Registra un nuevo usuario. | Todos |
| GET | `/api/me` | Obtiene la información del usuario autenticado. | Autenticado |
| GET | `/api/roles` | Lista los roles disponibles. | ADMIN |

## 2. Servicio de Membresías (Membership Service)
**Puerto Base**: `8081`

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/memberships` | Lista todos los planes disponibles. | Todos |
| POST | `/api/memberships` | Crea un nuevo plan de membresía. | ADMIN |
| GET | `/api/user-memberships/user/{userId}` | Obtiene las membresías de un usuario. | CLIENT, ADMIN |
| POST | `/api/payments/create-checkout-session` | Inicia un proceso de pago en Stripe. | CLIENT |

## 3. Servicio de Control de Acceso (QR Service)
**Puerto Base**: `8082`

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/access/my-qr` | Genera o recupera el QR del usuario. | CLIENT |
| POST | `/api/access/validate` | Valida un código QR escaneado. | ADMIN |
| GET | `/api/access/logs` | Historial de ingresos. | ADMIN |
| GET | `/api/exercises` | Lista rutinas de ejercicios. | CLIENT (con plan) |

## Ejemplo de Respuesta (UserMembership)
```json
{
  "id": 123,
  "userId": 45,
  "membership": {
    "planName": "Plan Premium",
    "durationDays": 30
  },
  "startDate": "2024-05-01",
  "endDate": "2024-06-01",
  "status": "ACTIVE"
}
```
