import { resetPassword as amplifyResetPassword, confirmResetPassword } from 'aws-amplify/auth';
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
    throw new Error(err.message || 'Error al enviar correo de recuperación');
  }
}
export async function validateRecoveryToken(token: string): Promise<string> {
  if (!token) throw new Error('El código es requerido');
  return "Código recibido correctamente";
}
export async function resetPassword(email: string, token: string, newPassword: string): Promise<string> {
  try {
    await confirmResetPassword({
      username: email,
      confirmationCode: token,
      newPassword
    });
    return "Contraseña restablecida con éxito. Ya puedes iniciar sesión.";
  } catch (err: any) {
    throw new Error(err.message || 'Error al restablecer la contraseña');
  }
}

