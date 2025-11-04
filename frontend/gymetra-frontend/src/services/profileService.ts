import { useAuthStore } from '@/stores/auth';
import { HOST_URL } from"../services/hots";

export type UpdateUserProfileOptions = {
  userId: string;
  data: Record<string, any>;
  successMsg: string;
  onSuccess?: () => void;
  loadingRef?: { value: boolean };
  showNotification: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  setUserData: (data: any) => void;
};

export const updateUserProfile = async ({
  userId,
  data,
  successMsg,
  onSuccess,
  loadingRef,
  showNotification,
  setUserData
}: UpdateUserProfileOptions) => {
  const auth = useAuthStore();
  if (loadingRef) loadingRef.value = true;
  try {
    const response = await fetch(`${HOST_URL}:8080/api/auth/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    let responseData;
    let newToken = null;
    try {
      responseData = await response.json();
      if (responseData.token) {
        newToken = responseData.token;
        auth.setToken(newToken);
        showNotification('success', successMsg, 'Datos y sesión actualizados.');
      } else {
        showNotification('success', successMsg, 'Datos actualizados.');
      }
    } catch (e) {
      responseData = await response.text();
      showNotification('success', successMsg, responseData);
    }
    if (newToken) {
      setUserData({
        userId: auth.user?.userId || '',
        email: auth.user?.email || '',
        firstName: auth.user?.firstName || '',
        lastName: auth.user?.lastName || '',
        phone: auth.user?.phone || '',
        status: auth.user?.status || '',
        photoUrl: auth.user?.photoUrl || '',
      });
    } else if (responseData && typeof responseData === 'object') {
      setUserData((prev: any) => ({ ...prev, ...responseData }));
    }
    if (onSuccess) onSuccess();
  } catch (error) {
    showNotification('error', 'Error', 'Hubo un error al actualizar el perfil.');
  } finally {
    if (loadingRef) loadingRef.value = false;
  }
};
