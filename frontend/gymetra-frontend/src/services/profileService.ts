// src/services/profileService.ts
import { ref } from 'vue';
import type { Ref } from 'vue';
import { MAIN_API_URL, apiRequest, type ApiResponse } from './apiService';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoUrl?: string;
}

export interface ProfileResponse {
  user: {
    id: string | number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    photoUrl: string;
  };
  message: string;
}

export interface UseProfileReturn {
  loading: Ref<boolean>;
  error: Ref<string>;
  updateProfile: (data: UpdateProfileData, token: string) => Promise<ApiResponse<ProfileResponse>>;
  updatePhoto: (photoUrl: string, token: string) => Promise<ApiResponse<ProfileResponse>>;
  clearError: () => void;
}

export function useProfile(): UseProfileReturn {
  const loading = ref<boolean>(false);
  const error = ref<string>('');

  const clearError = () => {
    error.value = '';
  };

  const updateProfile = async (data: UpdateProfileData, token: string): Promise<ApiResponse<ProfileResponse>> => {
    loading.value = true;
    error.value = '';

    try {
      console.log('🔄 Actualizando perfil:', {
        ...data,
        photoUrl: data.photoUrl ? '***base64***' : undefined // No mostrar la imagen completa en logs
      });

      // Preparar datos para envío
      const updatePayload = {
        ...data,
        // Limpiar datos vacíos
        ...(data.firstName && { firstName: data.firstName.trim() }),
        ...(data.lastName && { lastName: data.lastName.trim() }),
        ...(data.phone && { phone: data.phone.trim() }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
      };

      // Hacer la petición con autenticación
      const apiResp = await apiRequest<ProfileResponse>(
        `${MAIN_API_URL}/profile`,
        {
          method: 'PUT',
          body: JSON.stringify(updatePayload),
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('✅ Perfil actualizado:', apiResp);
      return apiResp;

    } catch (err: any) {
      console.error('💥 Error en actualización de perfil:', err);

      let errorMessage = 'Error inesperado al actualizar perfil';

      // Manejar mensajes específicos del backend
      if (err.message) {
        if (err.message.includes('authentication') || err.message.includes('autorización')) {
          errorMessage = 'Sesión expirada. Inicia sesión nuevamente.';
        } else if (err.message.includes('network') || err.message.includes('conexión')) {
          errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
        } else if (err.message.includes('timeout') || err.message.includes('tiempo')) {
          errorMessage = 'Tiempo de espera agotado. Intenta nuevamente.';
        } else if (err.message.includes('imagen') || err.message.includes('foto')) {
          errorMessage = 'Error al procesar la imagen. Intenta con otra foto.';
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

  const updatePhoto = async (photoUrl: string, token: string): Promise<ApiResponse<ProfileResponse>> => {
    return updateProfile({ photoUrl }, token);
  };

  return {
    loading,
    error,
    updateProfile,
    updatePhoto,
    clearError
  };
}

// Función para redimensionar imagen (reutilizada del registro)
export const resizeImageForProfile = (file: File, maxSize: number = 200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      const aspectRatio = width / height;
      
      if (width > height) {
        width = Math.min(width, maxSize);
        height = width / aspectRatio;
      } else {
        height = Math.min(height, maxSize);
        width = height * aspectRatio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Fondo blanco para JPEGs
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Comprimir imagen gradualmente
      let quality = 0.8;
      let base64 = canvas.toDataURL('image/jpeg', quality);
      
      // Reducir calidad hasta que la imagen sea menor a 100KB
      while (base64.length > 100000 && quality > 0.1) {
        quality -= 0.1;
        base64 = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve(base64);
    };
    
    img.onerror = () => reject(new Error('Error al procesar la imagen'));
    img.src = URL.createObjectURL(file);
  });
};

// Función para validar archivo de imagen
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Solo se permiten archivos PNG, JPG o JPEG'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'La imagen debe ser menor a 5MB'
    };
  }

  return { isValid: true };
};