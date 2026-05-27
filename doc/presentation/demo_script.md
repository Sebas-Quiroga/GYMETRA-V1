# Script de Demo en Vivo - GYMETRA

Este guion describe los pasos a seguir durante la demostración en vivo del proyecto.

## Preparación
*   Asegurarse de que Docker esté corriendo (`docker-compose up`).
*   Tener abiertos los dos frontends (Socio: `localhost:8100`, Admin: `localhost:8101`).
*   Tener la base de datos con los datos de prueba cargados.

## Escenario 1: Registro y Navegación del Socio (5 min)
1.  **Registro**: Crear un usuario `test_user@gymetra.com`. Mostrar validaciones de campos.
2.  **Home**: Mostrar la interfaz "premium", las rutinas y planes de nutrición (bloqueados si no hay membresía).
3.  **Perfil**: Mostrar datos básicos del usuario recién creado.

## Escenario 2: Compra de Membresía (5 min)
1.  **Selección**: Ir a "Planes" y seleccionar "Plan Premium".
2.  **Checkout**: Mostrar la redirección a Stripe (usar tarjeta de prueba `4242...`).
3.  **Confirmación**: Regresar a GYMETRA y mostrar que el plan ahora está activo.
4.  **Acceso Extra**: Mostrar que ahora las rutinas y nutrición están desbloqueadas.

## Escenario 3: Control de Acceso por QR (5 min)
1.  **Generación**: Ir a "Mi QR" y generar el código. Explicar que es dinámico.
2.  **Validación (Vista Admin)**:
    *   Cambiar a la pestaña de Admin.
    *   Ir a "Control de Acceso".
    *   Simular el escaneo del código (o ingresar el código manualmente).
    *   Mostrar el mensaje de "Acceso Permitido".
3.  **Logs**: Mostrar el nuevo registro en el historial de accesos del administrador.

## Escenario 4: Métricas Administrativas (3 min)
1.  **Dashboard**: Mostrar las gráficas de ingresos mensuales y asistencia diaria.
2.  **Gestión de Usuarios**: Mostrar cómo el administrador puede editar o suspender a un usuario.

## Cierre
*   Resaltar la integración fluida entre los microservicios.
*   Mencionar que el sistema es escalable y seguro.
