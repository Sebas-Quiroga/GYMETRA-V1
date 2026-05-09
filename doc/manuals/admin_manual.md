# Manual del Administrador - GYMETRA

Este manual está dirigido al personal encargado de la gestión operativa y administrativa del gimnasio.

## 1. Gestión de Usuarios
*   **Listado de Usuarios**: Visualiza todos los socios registrados en el sistema.
*   **Edición**: Actualiza información de contacto o cambia el estado de un usuario (Activo/Inactivo).
*   **Roles**: Asigna o revoca permisos administrativos.

## 2. Gestión de Planes de Membresía
*   **Crear Planes**: Define el nombre, precio, duración y beneficios (ej. si incluye nutrición).
*   **Actualizar Precios**: Modifica los costos de los planes existentes.

## 3. Monitoreo de Pagos
*   Consulta el historial de transacciones realizadas a través de la plataforma.
*   Filtra por estado de pago (Confirmado, Pendiente, Fallido).

## 4. Control de Acceso y Aforo
*   **Validación Manual**: Opción para validar el acceso de un socio si tiene problemas con su QR.
*   **Logs de Acceso**: Revisa quién ha entrado y salido del gimnasio en tiempo real.
*   **Métricas**: Visualiza gráficos de asistencia por horas y días de la semana.

## 5. Gestión de Sedes
*   Configura la información de las diferentes sucursales del gimnasio y su capacidad máxima.

## 6. Respaldos y Mantenimiento
*   Se recomienda realizar backups periódicos de la base de datos PostgreSQL utilizando:
    ```bash
    pg_dump -U gymetra_user gymetra_db > backup_fecha.sql
    ```
