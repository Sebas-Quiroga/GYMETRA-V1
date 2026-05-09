import { updateUserAttributes } from 'aws-amplify/auth';
import { useAuthStore } from '../../auth/store/auth';
import { apiAuthRequest,AUTH_API_URL } from '../../shared/services/apiService';

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

export const syncUserProfileUpdate = async (options: ProfileUpdateOptions) => {
  const { data, onSuccess, showNotification } = options;
  const auth = useAuthStore();
  
  try {
    const updatedAttributes: any = {};
    if (data.firstName) updatedAttributes.given_name = data.firstName;
    if (data.lastName) updatedAttributes.family_name = data.lastName;
    if (data.phone) {
      updatedAttributes.phone_number = data.phone.startsWith('+') ? data.phone : `+57${data.phone}`;
    }
    if (data.identification) updatedAttributes.preferred_username = data.identification;

    if (Object.keys(updatedAttributes).length > 0) {
      await updateUserAttributes({
        userAttributes: updatedAttributes
      });
    }

    const userId = auth.user?.userId;
    if (!userId) throw new Error("No hay un ID de usuario local disponible");

    const response = await apiAuthRequest(`${AUTH_API_URL}/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    auth.updateUser(data);
    if (onSuccess) onSuccess();

  } catch (error: any) {
    console.error('Error en sincronización de perfil:', error);
    showNotification('error', 'Error de Actualización', error.message || 'No se pudieron sincronizar los datos.');
    throw error;
  }
};
