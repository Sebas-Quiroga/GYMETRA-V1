import { resetPassword as amplifyResetPassword, confirmResetPassword } from 'aws-amplify/auth';

/**
 * Inicia el proceso de recuperación de contraseña en Cognito.
 * Envía un código de verificación al correo del usuario.
 */
export async function sendRecoveryToken(email: string): Promise<string> {
  try {
    const output = await amplifyResetPassword({ username: email });
    const { nextStep } = output;
    
    switch (nextStep.resetPasswordStep) {
      case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
        return `Código enviado a ${nextStep.codeDeliveryDetails.destination}`;
      case 'DONE':
        return 'Contraseña ya restablecida';
      default:
        return 'Proceso de recuperación iniciado';
    }
  } catch (err: any) {
    console.error('❌ Error en resetPassword (Cognito):', err);
    throw new Error(err.message || 'Error al enviar correo de recuperación');
  }
}

/**
 * En Cognito, la validación del código se hace junto con el cambio de contraseña.
 * Por lo tanto, esta función es un placeholder para mantener compatibilidad con la UI.
 */
export async function validateRecoveryToken(token: string): Promise<string> {
  // En Cognito no hay un paso separado de "validar token" sin cambiar la pass,
  // pero para no romper el flujo de 3 pasos de la UI, simplemente retornamos éxito.
  if (!token) throw new Error('El código es requerido');
  return "Código recibido correctamente";
}

/**
 * Finaliza el cambio de contraseña usando el código recibido.
 */
export async function resetPassword(email: string, token: string, newPassword: string): Promise<string> {
  try {
    await confirmResetPassword({
      username: email,
      confirmationCode: token,
      newPassword
    });
    return "Contraseña restablecida con éxito. Ya puedes iniciar sesión.";
  } catch (err: any) {
    console.error('❌ Error en confirmResetPassword (Cognito):', err);
    throw new Error(err.message || 'Error al restablecer la contraseña');
  }
}