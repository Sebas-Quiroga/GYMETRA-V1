<template>
  <ion-page>
    <div class="perfil-header-bar">
      <button class="perfil-back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <span class="perfil-header-title">Perfil</span>
      <button class="perfil-settings-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09c0 .66.38 1.26 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.33.36.51.86.51 1.36V9a2 2 0 0 1 0 4v-.09c0-.5-.18-1-.51-1.36z"/></svg>
      </button>
    </div>
    <ion-content class="perfil-content">
      <!-- Avatar y datos -->
      <div class="perfil-avatar-section">
        <div class="perfil-avatar" @click="changePhoto" :class="{ 'loading': profileLoading }">
          <img :src="photoPreview || userPhotoUrl" alt="avatar" />
          <div class="avatar-overlay">
            <ion-icon :icon="cameraOutline" class="camera-overlay-icon"></ion-icon>
          </div>
          <span class="add-icon">+</span>
        </div>
        <div class="perfil-username">{{ userName }}</div>
      </div>
      <div class="perfil-info-card">
        <ion-list>
          <ion-item>{{ userData.email }}</ion-item>
          <ion-item>********</ion-item>
          <ion-item>{{ userData.phone }}</ion-item>
          <ion-item>{{ userData.status }}</ion-item>
        </ion-list>
      </div>
      <div class="perfil-edit-btn">
        <ion-button shape="round" color="primary" fill="solid" @click="goToRegister">
          <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
        </ion-button>
      </div>

      <!-- Toast de notificación -->
      <div v-if="notification.show" class="notification-toast" :class="notification.type">
        <div class="notification-content">
          <ion-icon :icon="notification.icon" class="notification-icon"></ion-icon>
          <div class="notification-text">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.message }}</p>
          </div>
          <ion-button fill="clear" size="small" @click="dismissNotification">
            <ion-icon :icon="createOutline"></ion-icon>
          </ion-button>
        </div>
      </div>

      <!-- Input de archivo oculto -->
      <input 
        ref="fileInput" 
        type="file" 
        accept="image/png,image/jpeg,image/jpg" 
        style="display:none" 
        @change="handleFileSelect" 
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { arrowBackOutline, settingsOutline, createOutline, cameraOutline, imagesOutline, checkmarkCircle, alertCircle, informationCircle, warningOutline, trashOutline, addOutline } from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { decodeJWT } from '@/services/authService';
import { useRouter } from 'vue-router';
import { useProfile, validateImageFile, resizeImageForProfile } from '@/services/profileService';
import { loadingController, alertController, actionSheetController } from '@ionic/vue';

const auth = useAuthStore();
const router = useRouter();
const { loading: profileLoading, error: profileError, updatePhoto, clearError } = useProfile();

const userData = ref({
  userId: undefined as string | number | undefined,
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  status: '',
  photoUrl: '',
});

// Estado para la funcionalidad de foto
const fileInput = ref<HTMLInputElement>();
const photoPreview = ref('');
const notification = ref({
  show: false,
  type: 'info' as 'success' | 'error' | 'warning' | 'info',
  title: '',
  message: '',
  icon: informationCircle,
});
const userPhotoUrl = computed(() => 
  photoPreview.value || auth.userPhotoUrl
);
const userName = computed(() => auth.userName);

const goToRegister = () => {
  router.push('/register');
};

// Funciones para notificaciones
const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
  const icons = {
    success: checkmarkCircle,
    error: alertCircle,
    warning: warningOutline,
    info: informationCircle,
  };
  
  notification.value = {
    show: true,
    type,
    title,
    message,
    icon: icons[type],
  };
  
  // Auto-dismiss después de 5 segundos
  setTimeout(() => {
    dismissNotification();
  }, 5000);
};

const dismissNotification = () => {
  notification.value.show = false;
};

// Funciones para cambio de foto
const changePhoto = async () => {
  if (profileLoading.value) return;
  
  const actionSheet = await actionSheetController.create({
    header: 'Cambiar Foto de Perfil',
    buttons: [
      {
        text: 'Tomar Foto',
        icon: cameraOutline,
        handler: () => {
          takePhoto();
        }
      },
      {
        text: 'Seleccionar de Galería',
        icon: imagesOutline,
        handler: () => {
          selectFromGallery();
        }
      },
      {
        text: 'Eliminar Foto',
        icon: trashOutline,
        role: 'destructive',
        handler: () => {
          removePhoto();
        }
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ]
  });
  
  await actionSheet.present();
};

const selectFromGallery = () => {
  if (fileInput.value) {
    fileInput.value.accept = "image/png,image/jpeg,image/jpg";
    fileInput.value.click();
  }
};

const takePhoto = () => {
  if (fileInput.value) {
    fileInput.value.accept = "image/png,image/jpeg,image/jpg";
    fileInput.value.setAttribute('capture', 'camera');
    fileInput.value.click();
  }
};

const removePhoto = async () => {
  try {
    const loading = await loadingController.create({
      message: 'Eliminando foto...',
    });
    await loading.present();
    
    const response = await updatePhoto('', auth.token);
    
    if (response.success) {
      userData.value.photoUrl = '';
      photoPreview.value = '';
      // Actualizar el store
      auth.updateUserPhoto('');
      showNotification('success', 'Foto eliminada', 'Tu foto de perfil ha sido eliminada');
    } else {
      showNotification('error', 'Error', response.message || 'No se pudo eliminar la foto');
    }
    
    await loading.dismiss();
  } catch (error) {
    console.error('Error eliminando foto:', error);
    showNotification('error', 'Error', 'Error al eliminar la foto');
  }
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      showNotification('warning', 'Archivo no válido', validation.error || 'Archivo no válido');
      return;
    }
    
    const loading = await loadingController.create({
      message: 'Procesando imagen...',
    });
    await loading.present();
    
    try {
      // Crear preview inmediatamente
      photoPreview.value = URL.createObjectURL(file);
      
      // Redimensionar imagen
      const base64 = await resizeImageForProfile(file, 200);
      
      // Subir foto al servidor
      const response = await updatePhoto(base64, auth.token);
      
      if (response.success) {
        // Actualizar datos del usuario
        userData.value.photoUrl = base64;
        // Actualizar el store
        auth.updateUserPhoto(base64);
        showNotification('success', 'Foto actualizada', '¡Tu foto de perfil ha sido actualizada!');
      } else {
        // Revertir preview si falló
        photoPreview.value = '';
        showNotification('error', 'Error', response.message || 'No se pudo actualizar la foto');
      }
      
    } catch (error) {
      console.error('Error procesando imagen:', error);
      photoPreview.value = '';
      showNotification('error', 'Error', 'Error al procesar la imagen');
    } finally {
      await loading.dismiss();
    }
  }
  
  // Limpiar el input
  target.value = '';
};

onMounted(() => {
  // Inicializar token si no está cargado
  if (!auth.token) {
    auth.initializeToken();
  }
  
  // Usar datos del store si están disponibles
  if (auth.user) {
    userData.value = {
      userId: auth.user.userId,
      email: auth.user.email || '',
      firstName: auth.user.firstName || '',
      lastName: auth.user.lastName || '',
      phone: auth.user.phone || '',
      status: auth.user.status || '',
      photoUrl: auth.user.photoUrl || '',
    };
  } else if (auth.token) {
    // Decodificar token si el store no tiene los datos
    const decoded = decodeJWT(auth.token);
    if (decoded) {
      const decodedData = {
        userId: decoded.userId,
        email: decoded.email || '',
        firstName: decoded.firstName || '',
        lastName: decoded.lastName || '',
        phone: decoded.phone || '',
        status: decoded.status || '',
        photoUrl: decoded.photoUrl || '',
      };
      userData.value = decodedData;
      // Actualizar el store con los datos decodificados
      auth.updateUser(decodedData);
    }
  }
});
</script>

<style src="../theme/PerfilPage.css"></style>
<style>
.perfil-header-bar {
  background: #07B7E0;
  min-height: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 22px;
  box-shadow: none;
}
.perfil-back-btn {
  background: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  cursor: pointer;
  padding: 0;
}
.perfil-header-title {
  color: #fff;
  font-size: 1.45rem;
  font-weight: 800;
  font-family: 'Nunito', sans-serif;
  display: flex;
  align-items: center;
  flex: 1;
}
.perfil-settings-btn {
  background: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  cursor: pointer;
  padding: 0;
}

/* Estilos para el avatar interactivo */
.perfil-avatar {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.perfil-avatar:hover {
  transform: scale(1.05);
}

.perfil-avatar.loading {
  opacity: 0.7;
  pointer-events: none;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(7, 183, 224, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
}

.perfil-avatar:hover .avatar-overlay {
  opacity: 1;
}

.camera-overlay-icon {
  color: white;
  font-size: 24px;
}

/* Estilos para notificaciones */
.notification-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 90%;
  width: 400px;
  z-index: 10000;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-out;
}

.notification-toast.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.notification-toast.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.notification-toast.warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.notification-toast.info {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
}

.notification-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.notification-text {
  flex: 1;
}

.notification-text h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.notification-text p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
