// src/services/useRegister.ts
import { ref } from 'vue';
import type { Ref } from 'vue';
import { API_ENDPOINTS, apiPost, type ApiResponse } from './apiService';

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
  user: {
    id: string | number;
    email: string;
    firstName: string;
    lastName: string;
  };
  token?: string;
  message: string;
}

export interface UseRegisterReturn {
  loading: Ref<boolean>;
  error: Ref<string>;
  register: (data: RegisterData) => Promise<ApiResponse<RegisterResponse>>;
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
      console.log('🚀 Enviando datos de registro:', {
        ...data,
        password: '***' // No mostrar password en logs
      });

      // Preparar datos para envío
      const registerPayload = {
        identification: data.identification.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        phone: data.phone.trim(),
        photoUrl: data.photoUrl || null
      };

      // Usar el servicio de API
      const apiResp = await apiPost<RegisterResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        registerPayload
      );

      console.log('✅ Registro exitoso:', apiResp);
      return apiResp;

    } catch (err: any) {
      console.error('💥 Error en registro:', err);

      let errorMessage = 'Error inesperado al registrar usuario';

      // Manejar mensajes específicos del backend
      if (err.message) {
        if (err.message.includes('email') || err.message.toLowerCase().includes('correo')) {
          errorMessage = 'Este correo electrónico ya está registrado';
        } else if (err.message.includes('identification') || err.message.includes('identificación')) {
          errorMessage = 'Esta identificación ya está registrada';
        } else if (err.message.includes('network') || err.message.includes('conexión')) {
          errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
        } else if (err.message.includes('timeout') || err.message.includes('tiempo')) {
          errorMessage = 'Tiempo de espera agotado. Intenta nuevamente.';
        } else {
          errorMessage = err.message;
        }
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

// Función helper para validar datos antes del envío
export const validateRegisterData = (data: RegisterData): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};

  // Validar identificación
  if (!data.identification || data.identification.trim().length === 0) {
    errors.identification = 'La identificación es obligatoria';
  } else if (!/^\d{6,12}$/.test(data.identification.trim())) {
    errors.identification = 'La identificación debe tener entre 6 y 12 dígitos';
  }

  // Validar nombres
  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.firstName = 'El nombre es obligatorio';
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = 'El nombre debe tener al menos 2 caracteres';
  } else if (data.firstName.trim().length > 50) {
    errors.firstName = 'El nombre no puede tener más de 50 caracteres';
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.lastName = 'El apellido es obligatorio';
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = 'El apellido debe tener al menos 2 caracteres';
  } else if (data.lastName.trim().length > 50) {
    errors.lastName = 'El apellido no puede tener más de 50 caracteres';
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'El correo electrónico es obligatorio';
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = 'Ingresa un correo electrónico válido';
  } else if (data.email.trim().length > 100) {
    errors.email = 'El correo no puede tener más de 100 caracteres';
  }

  // Validar password
  if (!data.password || data.password.length === 0) {
    errors.password = 'La contraseña es obligatoria';
  } else if (data.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres';
  } else if (data.password.length > 128) {
    errors.password = 'La contraseña no puede tener más de 128 caracteres';
  } else {
    // Validar complejidad de password
    const hasUpperCase = /[A-Z]/.test(data.password);
    const hasLowerCase = /[a-z]/.test(data.password);
    const hasNumbers = /\d/.test(data.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(data.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      errors.password = 'La contraseña debe tener al menos una mayúscula, una minúscula y un número';
    }
  }

  // Validar teléfono (opcional pero si se ingresa debe ser válido)
  if (data.phone && data.phone.trim().length > 0) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const cleanPhone = data.phone.trim().replace(/[\s\-\+\(\)]/g, '');
    
    if (!phoneRegex.test(data.phone.trim())) {
      errors.phone = 'El teléfono solo puede contener números, espacios, guiones y paréntesis';
    } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      errors.phone = 'El teléfono debe tener entre 7 y 15 dígitos';
    }
  }

  // Validar foto (si existe)
  if (data.photoUrl && data.photoUrl.length > 0) {
    if (data.photoUrl.length > 500000) { // ~500KB en base64
      errors.photoUrl = 'La imagen es demasiado grande. Máximo 500KB';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper para limpiar y formatear datos antes del envío
export const prepareRegisterData = (data: RegisterData): RegisterData => {
  return {
    identification: data.identification.trim(),
    firstName: data.firstName.trim().replace(/\s+/g, ' '), // Reemplazar múltiples espacios por uno
    lastName: data.lastName.trim().replace(/\s+/g, ' '),
    email: data.email.toLowerCase().trim(),
    password: data.password, // No modificar la contraseña
    phone: data.phone.trim(),
    photoUrl: data.photoUrl || ''
  };
};