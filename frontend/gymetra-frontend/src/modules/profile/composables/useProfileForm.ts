import { ref, reactive, computed } from 'vue';
import { syncUserProfileUpdate } from '../services/profileService';

export function useProfileForm(userData: any, showNotification: any) {
  const avatarPreviewUrl = ref('');
  const isPhotoUploading = ref(false);
  const avatarFileInput = ref<HTMLInputElement | null>(null);

  const isEditModalVisible = ref(false);
  const isEditProcessing = ref(false);
  
  const editProfileForm = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const userAvatarSource = computed(() => {
    if (avatarPreviewUrl.value) return avatarPreviewUrl.value;
    const url = userData.value.photoUrl;
    if (!url) return 'https://www.gravatar.com/avatar/000?d=mp&f=y';
    return url.startsWith('data:') || url.startsWith('http') ? url : `data:image/jpeg;base64,${url}`;
  });

  const openFilePicker = () => avatarFileInput.value?.click();

  const handleAvatarFileSelect = (event: Event) => {
    const inputElement = event.target as HTMLInputElement;
    const selectedFile = inputElement.files?.[0];
    
    if (!selectedFile) return;
    if (selectedFile.size > 2 * 1024 * 1024) {
      showNotification('error', 'Imagen muy pesada', 'Máximo 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (readerEvent) => {
      const base64Data = readerEvent.target?.result as string;
      avatarPreviewUrl.value = base64Data;
      await uploadProfileAvatar(base64Data);
    };
    reader.readAsDataURL(selectedFile);
  };

  const uploadProfileAvatar = async (base64String: string) => {
    if (isPhotoUploading.value) return;
    
    isPhotoUploading.value = true;
    try {
      await syncUserProfileUpdate({
        data: { photoUrl: base64String, identification: userData.value.identification },
        showNotification,
        onSuccess: () => {
          showNotification('success', 'Foto Actualizada', 'Cambios guardados correctamente.');
          avatarPreviewUrl.value = '';
        }
      });
    } catch (error) {
      avatarPreviewUrl.value = '';
    } finally {
      isPhotoUploading.value = false;
    }
  };

  const openEditProfileModal = () => {
    editProfileForm.firstName = userData.value.firstName;
    editProfileForm.lastName = userData.value.lastName;
    editProfileForm.email = userData.value.email;
    editProfileForm.phone = userData.value.phone;
    isEditModalVisible.value = true;
  };

  const closeEditModal = () => { 
    isEditModalVisible.value = false; 
  };

  const handleUpdateProfile = async () => {
    isEditProcessing.value = true;
    try {
      await syncUserProfileUpdate({
        data: { 
          ...editProfileForm, 
          photoUrl: userData.value.photoUrl, 
          identification: userData.value.identification 
        },
        showNotification,
        onSuccess: () => {
          closeEditModal();
          avatarPreviewUrl.value = '';
        }
      });
    } finally {
      isEditProcessing.value = false;
    }
  };

  return {
    avatarPreviewUrl,
    isPhotoUploading,
    avatarFileInput,
    isEditModalVisible,
    isEditProcessing,
    editProfileForm,
    userAvatarSource,
    openFilePicker,
    handleAvatarFileSelect,
    openEditProfileModal,
    closeEditModal,
    handleUpdateProfile
  };
}
