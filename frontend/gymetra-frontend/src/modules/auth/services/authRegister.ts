import { ref } from 'vue';
import type { Ref } from 'vue';
import { signUp } from 'aws-amplify/auth';
import type { ApiResponse } from '../../shared/services/apiService';
export interface RegisterData {
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  photoUrl?: string;
}
export interface RegisterResponse {
  isSignUpComplete: boolean;
  userId?: string;
  nextStep: string;
  message: string;
}
export interface UseRegisterReturn {
  loading: Ref<boolean>;
  error: Ref<string>;
  register: (data: RegisterData) => Promise<ApiResponse<RegisterResponse>>;
  confirmRegistration: (username: string, code: string) => Promise<ApiResponse<any>>;
  resendSignUpCode: (username: string) => Promise<ApiResponse<any>>;
  clearError: () => void;
}
export function useRegister(): UseRegisterReturn {
  const loading = ref<boolean>(false);
  const error = ref<string>('');
  const clearError = () => {
    error.value = '';
  };
  const register = async (data: RegisterData): Promise<ApiResponse<RegisterResponse>> => {
    loading.value = true;
    error.value = '';
    try {
      console.log('🚀 Iniciando registro en Cognito para:', data.email);
      let formattedPhone = data.phone.trim();
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        formattedPhone = `+57${formattedPhone}`;
      }
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          userAttributes: {
            email: data.email.toLowerCase().trim(),
            given_name: data.firstName.trim(),
            family_name: data.lastName.trim(),
            phone_number: formattedPhone,
            preferred_username: data.identification.trim()
          }
        }
      });
      console.log('✅ Registro procesado:', { isSignUpComplete, nextStep });
      return {
        success: true,
        message: 'Registro exitoso. Por favor verifica tu correo electrónico.',
        data: {
          isSignUpComplete,
          userId,
          nextStep: nextStep.signUpStep,
          message: 'Usuario creado en Cognito'
        }
      };
    } catch (err: any) {
      console.error('💥 Error en registro Cognito:', err);
      let errorMessage = err.message || 'Error inesperado al registrar usuario';
      if (err.name === 'UsernameExistsException') {
        errorMessage = 'Este correo electrónico ya está registrado';
      } else if (err.name === 'InvalidPasswordException') {
        errorMessage = 'La contraseña no cumple con los requisitos de seguridad';
      }
      error.value = errorMessage;
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      loading.value = false;
    }
  };
  const confirmRegistration = async (username: string, code: string): Promise<ApiResponse<any>> => {
    loading.value = true;
    error.value = '';
    try {
      const { isSignUpComplete, nextStep } = await import('aws-amplify/auth').then(m => m.confirmSignUp({
        username: username.toLowerCase().trim(),
        confirmationCode: code.trim()
      }));
      return { success: true, message: 'Cuenta verificada con éxito', data: { isSignUpComplete, nextStep } };
    } catch (err: any) {
      const msg = err.message || 'Código inválido o expirado';
      error.value = msg;
      return { success: false, message: msg };
    } finally {
      loading.value = false;
    }
  };
  const resendSignUpCode = async (username: string): Promise<ApiResponse<any>> => {
    try {
      await import('aws-amplify/auth').then(m => m.resendSignUpCode({ username: username.toLowerCase().trim() }));
      return { success: true, message: 'Código reenviado con éxito' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error al reenviar código' };
    }
  };
  return {
    loading,
    error,
    register,
    confirmRegistration,
    resendSignUpCode,
    clearError
  };
}
export const validateRegisterData = (data: RegisterData) => {
    const errors: any = {};
    if (!data.email) errors.email = 'El email es obligatorio';
    if (!data.password || data.password.length < 8) errors.password = 'Mínimo 8 caracteres';
    return { isValid: Object.keys(errors).length === 0, errors };
};
export const prepareRegisterData = (data: RegisterData): RegisterData => {
  return {
    ...data,
    identification: data.identification.trim(),
    firstName: data.firstName.trim().replace(/\s+/g, ' '),
    lastName: data.lastName.trim().replace(/\s+/g, ' '),
    email: data.email.toLowerCase().trim(),
    phone: data.phone.trim()
  };
};

