// src/services/useRegister.ts
import { ref } from 'vue';
import type { Ref } from 'vue';
import { signUp } from 'aws-amplify/auth';
import type { ApiResponse } from './apiService';

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
  clearError: () => void;
}

/**
 * Hook para el registro de usuarios usando AWS Cognito.
 * El registro crea el usuario en el User Pool de Cognito.
 * El perfil local en la BD del backend se creará automáticamente 
 * durante el primer login exitoso (vía CognitoUserSyncService).
 */
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

      // Cognito requiere números de teléfono en formato E.164 (ej: +573001234567)
      let formattedPhone = data.phone.trim();
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        formattedPhone = `+57${formattedPhone}`; // Asumimos Colombia por defecto si no tiene prefijo
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
          },
          // Si tienes atributos personalizados en Cognito, agrégalos aquí:
          // 'custom:identification': data.identification
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

  return {
    loading,
    error,
    register,
    clearError
  };
}

// ... (se mantienen las funciones de validación si son necesarias para la UI)
export const validateRegisterData = (data: RegisterData) => {
    // Mantener validación local para mejorar UX antes de llamar a Cognito
    const errors: any = {};
    if (!data.email) errors.email = 'El email es obligatorio';
    if (!data.password || data.password.length < 8) errors.password = 'Mínimo 8 caracteres';
    return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Función helper para limpiar y formatear datos antes del envío.
 * Requerida por RegisterPage.vue para normalizar inputs.
 */
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