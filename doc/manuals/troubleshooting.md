# Guía de Troubleshooting Común - GYMETRA

## 1. Problemas de Acceso / Login
*   **Error "Usuario no autorizado"**: Verifique que el usuario tenga el rol correcto asignado en la base de datos o en Cognito.
*   **Token expirado**: El sistema requiere que el usuario vuelva a iniciar sesión cada cierto tiempo (configurado en Cognito).

## 2. El Código QR no se Genera
*   **Causa**: El usuario no tiene una membresía activa o su pago está pendiente.
*   **Solución**: Verificar el estado de la membresía en el panel de administrador.
*   **Causa**: El servicio de QR no puede comunicarse con el servicio de Membresías.
*   **Solución**: Revisar la conectividad de red entre contenedores Docker.

## 3. Fallos en el Pago
*   **Causa**: Problemas con la tarjeta del cliente o configuración de la API Key de Stripe.
*   **Solución**: Revisar los logs del servicio de Membresías y el Dashboard de Stripe.

## 4. Problemas de Conectividad con la Base de Datos
*   **Causa**: El contenedor de PostgreSQL no ha terminado de iniciar o las credenciales son incorrectas.
*   **Solución**: Ejecutar `docker ps` para ver el estado del contenedor y revisar el archivo `.env`.

## 5. El Frontend no carga
*   **Causa**: El puerto (8100 o 8101) ya está siendo utilizado por otra aplicación.
*   **Solución**: Cambiar el puerto en el archivo `vite.config.ts` o cerrar la aplicación que ocupa el puerto.
