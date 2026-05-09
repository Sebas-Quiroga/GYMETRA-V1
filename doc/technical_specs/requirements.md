# Especificación de Requerimientos - GYMETRA

## 1. Requerimientos Funcionales (RF)

| ID | Nombre | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-01 | Gestión de Usuarios | El sistema debe permitir el registro, inicio de sesión y gestión de perfiles de usuarios. | Alta |
| RF-02 | Autenticación y Autorización | Uso de JWT y roles (Administrador, Cliente) para proteger los endpoints. | Alta |
| RF-03 | Gestión de Planes de Membresía | El administrador debe poder crear, editar y eliminar planes de membresía. | Alta |
| RF-04 | Adquisición de Membresías | Los usuarios deben poder comprar membresías y realizar el pago (Stripe). | Alta |
| RF-05 | Control de Acceso por QR | Generación de códigos QR únicos para usuarios con membresía activa. | Alta |
| RF-06 | Validación de QR | El sistema debe permitir escanear y validar el QR en los puntos de acceso del gimnasio. | Alta |
| RF-07 | Historial de Accesos | Registro de cada entrada y salida de los usuarios en las sedes. | Media |
| RF-08 | Rutinas de Ejercicio | Los usuarios con membresías que lo incluyan pueden acceder a rutinas personalizadas. | Media |
| RF-09 | Planes de Nutrición | Acceso a recetas y planes nutricionales según el tipo de membresía. | Media |
| RF-10 | Dashboard de Métricas | El administrador debe visualizar métricas de ingresos y asistencia. | Media |

## 2. Requerimientos No Funcionales (RNF)

| ID | Categoría | Descripción |
|----|-----------|-------------|
| RNF-01 | Desempeño | El tiempo de respuesta de la API no debe superar los 200ms para operaciones críticas. |
| RNF-02 | Escalabilidad | Arquitectura basada en microservicios que permite escalar componentes de forma independiente. |
| RNF-03 | Disponibilidad | El sistema debe estar disponible el 99.9% del tiempo (Alta Disponibilidad). |
| RNF-04 | Seguridad | Encriptación de datos sensibles (BCrypt para contraseñas) y comunicación HTTPS. |
| RNF-05 | Usabilidad | Interfaz intuitiva y responsive, accesible desde web y dispositivos móviles. |
| RNF-06 | Mantenibilidad | Código documentado y siguiendo principios SOLID y Clean Code. |
| RNF-07 | Portabilidad | Despliegue mediante contenedores Docker para facilitar la portabilidad entre entornos. |
