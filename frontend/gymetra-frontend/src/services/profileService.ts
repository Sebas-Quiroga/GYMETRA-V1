import { updateUserAttributes } from 'aws-amplify/auth';
import { useAuthStore } from '@/stores/auth';
import { apiAuthRequest, LOGIN_API_URL } from './apiService';

export type ProfileUpdateOptions = {
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
    identification?: string;
  };
  onSuccess?: () => void;
  showNotification: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
};

/**
 * Actualiza el perfil de usuario en Cognito y en la base de datos local.
 * Garantiza que la información esté sincronizada en ambas plataformas.
 */
export const syncUserProfileUpdate = async (options: ProfileUpdateOptions) => {
  const { data, onSuccess, showNotification } = options;
  const auth = useAuthStore();
  
  try {
    // 1. Preparar y actualizar atributos en AWS Cognito (Solo si hay datos de perfil, NO la foto)
    const updatedAttributes: any = {};
    if (data.firstName) updatedAttributes.given_name = data.firstName;
    if (data.lastName) updatedAttributes.family_name = data.lastName;
    if (data.phone) {
      updatedAttributes.phone_number = data.phone.startsWith('+') ? data.phone : `+57${data.phone}`;
    }
    if (data.identification) updatedAttributes.preferred_username = data.identification;

    // Solo llamamos a Cognito si hay atributos para actualizar
    if (Object.keys(updatedAttributes).length > 0) {
      await updateUserAttributes({
        userAttributes: updatedAttributes
      });
      console.log('✅ Atributos sincronizados en Cognito:', updatedAttributes);
    }

    // 2. Actualizar base de datos local (Spring Boot) - SIEMPRE, incluye la foto si viene
    const userId = auth.user?.userId;
    if (!userId) throw new Error("No hay un ID de usuario local disponible");

    // Limpiamos el objeto data para enviar solo lo que viene en la petición parcial
    const response = await apiAuthRequest(`${LOGIN_API_URL}/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (response.success) {
      // 3. Sincronizar el store local
      auth.updateUser(data);
      if (onSuccess) onSuccess();
    } else {
      throw new Error(response.message);
    }

  } catch (error: any) {
    console.error('❌ Error en sincronización de perfil:', error);
    showNotification('error', 'Error de Actualización', error.message || 'No se pudieron sincronizar los datos.');
    throw error; // Re-lanzar para que el modal/UI pueda manejar el fin del loading
  }
};
