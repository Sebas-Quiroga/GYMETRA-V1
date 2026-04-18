<template>
  <ion-page>
    <!-- Header KINETIC Global -->
    <div class="perfil-header-bar" role="banner">
      <div class="header-side header-left">
        <button class="perfil-back-btn" @click="$router.back()" aria-label="Volver">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      <router-link to="/home" class="header-logo-link" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="header-logo-text">{{ APP_NAME }}</span>
      </router-link>

      <div class="header-side header-right">
        <button class="perfil-settings-btn" aria-label="Configuración">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <ion-content class="perfil-content">
      <!-- Toasts de Notificación -->
      <transition name="toast">
        <div v-if="notification.show" class="notification-toast" :class="notification.type">
          <div class="notification-content">
            <ion-icon :icon="notification.icon" class="notification-icon"></ion-icon>
            <div class="notification-text">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.message }}</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Avatar y datos -->
      <div class="perfil-avatar-section">
        <div class="perfil-avatar" :class="{ 'uploading': photoLoading }">
          <img :src="profileImageSrc" alt="avatar" @click="triggerPhotoSelect" loading="eager" />
          <div v-if="photoLoading" class="avatar-loading-overlay">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
          <div v-else class="avatar-overlay" @click="triggerPhotoSelect" role="button" aria-label="Cambiar foto">
            <ion-icon :icon="cameraOutline" aria-hidden="true"></ion-icon>
          </div>
        </div>
        <div class="perfil-username-row">
          <div class="perfil-username">{{ displayName }}</div>
          <ion-button class="perfil-edit-btn-inline" fill="clear" @click="openEditModal">
            <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
          </ion-button>
        </div>
      </div>

      <div class="perfil-info-card">
        <ion-list lines="none">
          <ion-item>
            <ion-icon slot="start" :icon="mailOutline" aria-hidden="true"></ion-icon>
            <span>{{ currentUser.email }}</span>
          </ion-item>
          <ion-item>
            <ion-icon slot="start" :icon="lockClosedOutline" aria-hidden="true"></ion-icon>
            <span>********</span>
            <ion-button slot="end" fill="clear" size="small">
              <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-item>
          <ion-item>
            <ion-icon slot="start" :icon="callOutline" aria-hidden="true"></ion-icon>
            <span>{{ currentUser.phone || 'No registrado' }}</span>
          </ion-item>
          <ion-item>
            <ion-icon slot="start" :icon="personCircleOutline" aria-hidden="true"></ion-icon>
            <span>Estado: {{ currentUser.status }}</span>
          </ion-item>
        </ion-list>
      </div>

      <!-- Modal de edición de perfil -->
      <ion-modal :is-open="showEditModal" @did-dismiss="closeEditModal" class="perfil-modal">
        <div class="modal-content">
          <h2>Editar Perfil</h2>
          <form @submit.prevent="handleEditProfile">
            <ion-item lines="none">
              <ion-input label="Nombre" label-placement="stacked" v-model="editForm.firstName" maxlength="50" required placeholder="Tu nombre"></ion-input>
            </ion-item>
            <ion-item lines="none">
              <ion-input label="Apellido" label-placement="stacked" v-model="editForm.lastName" maxlength="50" required placeholder="Tu apellido"></ion-input>
            </ion-item>
            <ion-item lines="none">
              <ion-input label="Correo" label-placement="stacked" v-model="editForm.email" type="email" required></ion-input>
            </ion-item>
            <ion-item lines="none">
              <ion-input label="Teléfono" label-placement="stacked" v-model="editForm.phone" type="tel" maxlength="15" placeholder="Tu teléfono"></ion-input>
            </ion-item>
            
            <div class="btn-container">
              <ion-button type="submit" expand="block" :disabled="editLoading" class="register-btn">
                <ion-spinner v-if="editLoading" name="crescent"></ion-spinner>
                <span v-else>Guardar Cambios</span>
              </ion-button>
              <ion-button fill="clear" @click="closeEditModal" color="medium">Cancelar</ion-button>
            </div>
          </form>
        </div>
      </ion-modal>

      <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/jpg" style="display:none" @change="handleFileSelect" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { 
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle, 
  IonButtons, IonButton, IonIcon, IonList, IonItem, 
  IonLabel, IonInput, IonModal, IonSpinner 
} from "@ionic/vue";
import { 
  arrowBackOutline, settingsOutline, createOutline, cameraOutline,
  mailOutline, lockClosedOutline, callOutline, personCircleOutline,
  checkmarkCircle, alertCircle, informationCircle
} from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';
import { syncUserProfileUpdate } from '@/services/profileService';
import { useRouter } from 'vue-router';

// Inyectar APP_NAME desde el entorno o constante si fuera necesario
const APP_NAME = "GYMETRA";

const auth = useAuthStore();
const router = useRouter();

// --- Datos del Usuario (Store) ---
const currentUser = computed(() => ({
  userId: auth.user?.userId || '',
  email: auth.user?.email || '',
  firstName: auth.user?.firstName || '',
  lastName: auth.user?.lastName || '',
  phone: auth.user?.phone || '',
  status: auth.user?.status || '',
  photoUrl: auth.user?.photoUrl || '',
  identification: auth.user?.cognitoSub || ''
}));

const displayName = computed(() => {
  if (!auth.user?.firstName) return "Usuario";
  return `${auth.user.firstName} ${auth.user.lastName || ''}`;
});

// --- Gestión de Imagen ---
const photoPreview = ref(''); 
const photoLoading = ref(false);
const profileImageSrc = computed(() => {
  if (photoPreview.value) return photoPreview.value;
  const url = currentUser.value.photoUrl;
  if (!url) return 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  return url.startsWith('data:') || url.startsWith('http') ? url : `data:image/jpeg;base64,${url}`;
});

const fileInput = ref<HTMLInputElement | null>(null);
const triggerPhotoSelect = () => fileInput.value?.click();

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showNotification('error', 'Imagen muy pesada', 'La imagen no debe superar los 2MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const result = e.target?.result as string;
    photoPreview.value = result; 
    await updateProfilePhoto(result);
  };
  reader.readAsDataURL(file);
};

const updateProfilePhoto = async (base64Photo: string) => {
  if (photoLoading.value) return;
  photoLoading.value = true;
  
  try {
    await syncUserProfileUpdate({
      data: {
        photoUrl: base64Photo,
        identification: currentUser.value.identification
      },
      showNotification,
      onSuccess: () => {
        showNotification('success', 'Foto Actualizada', 'Tu nueva foto de perfil se ha guardado correctamente.');
        photoPreview.value = ''; 
      }
    });
  } catch (err) {
    photoPreview.value = ''; 
  } finally {
    photoLoading.value = false;
  }
};

// --- Formulario y Modal ---
const showEditModal = ref(false);
const editLoading = ref(false);
const editForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
});

const openEditModal = () => {
  editForm.firstName = currentUser.value.firstName;
  editForm.lastName = currentUser.value.lastName;
  editForm.email = currentUser.value.email;
  editForm.phone = currentUser.value.phone;
  showEditModal.value = true;
};
const closeEditModal = () => (showEditModal.value = false);

const handleEditProfile = async () => {
  editLoading.value = true;
  await syncUserProfileUpdate({
    data: {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      phone: editForm.phone,
      photoUrl: currentUser.value.photoUrl, // Mantener la actual si no se cambió aquí
      identification: currentUser.value.identification
    },
    showNotification,
    onSuccess: () => {
      closeEditModal();
      photoPreview.value = '';
    }
  });
  editLoading.value = false;
};

// --- Notificaciones ---
const notification = reactive({ show: false, type: 'info' as 'info' | 'success' | 'error', title: '', message: '', icon: '' });
const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
  const icons = { success: checkmarkCircle, error: alertCircle, info: informationCircle };
  notification.type = type;
  notification.title = title;
  notification.message = message;
  notification.icon = icons[type];
  notification.show = true;
  setTimeout(() => notification.show = false, 4000);
};
</script>

<style src="../theme/PerfilPage.css"></style>
