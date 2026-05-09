<template>
  <ion-page>
    <div class="perfil-header-bar" role="banner">
      <div class="header-side header-left">
        <button class="perfil-back-btn" @click="router.back()" aria-label="Volver">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>
      <router-link to="/home" class="header-logo-link" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="brand-name-header">GYMETRA</span>
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

      <div class="perfil-avatar-section">
        <div class="perfil-avatar" :class="{ 'uploading': isPhotoUploading }">
          <img :src="userAvatarSource" alt="avatar" @click="openFilePicker" loading="eager" />
          <div v-if="isPhotoUploading" class="avatar-loading-overlay">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
          <div v-else class="avatar-overlay" @click="openFilePicker" role="button" aria-label="Cambiar foto">
            <ion-icon :icon="cameraOutline" aria-hidden="true"></ion-icon>
          </div>
        </div>
        <div class="perfil-username-row">
          <div class="perfil-username">{{ userFullName }}</div>
          <ion-button class="perfil-edit-btn-inline" fill="clear" @click="openEditProfileModal">
            <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
          </ion-button>
        </div>
      </div>

      <div class="perfil-info-card">
        <ion-list lines="none">
          <ion-item>
            <ion-icon slot="start" :icon="mailOutline" aria-hidden="true"></ion-icon>
            <span>{{ userData.email }}</span>
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
            <span>{{ userData.phone || 'No registrado' }}</span>
          </ion-item>
          <ion-item>
            <ion-icon slot="start" :icon="personCircleOutline" aria-hidden="true"></ion-icon>
            <span>Estado: {{ userData.status }}</span>
          </ion-item>
        </ion-list>
      </div>

      <ion-modal :is-open="isEditModalVisible" @did-dismiss="closeEditModal" class="perfil-modal">
        <div class="modal-content">
          <h2>Editar Perfil</h2>
          <form @submit.prevent="handleUpdateProfile">
            <ion-item lines="none">
              <ion-input label="Nombre" label-placement="stacked" v-model="editProfileForm.firstName" :maxlength="50" required placeholder="Tu nombre"></ion-input>
            </ion-item>
            <ion-item lines="none">
              <ion-input label="Apellido" label-placement="stacked" v-model="editProfileForm.lastName" :maxlength="50" required placeholder="Tu apellido"></ion-input>
            </ion-item>
            <ion-item lines="none">
              <ion-input label="Correo" label-placement="stacked" v-model="editProfileForm.email" type="email" required></ion-input>
            </ion-item>
            <ion-item lines="none">
              <ion-input label="Teléfono" label-placement="stacked" v-model="editProfileForm.phone" type="tel" :maxlength="15" placeholder="Tu teléfono"></ion-input>
            </ion-item>
            <div class="btn-container">
              <ion-button type="submit" expand="block" :disabled="isEditProcessing" class="register-btn">
                <ion-spinner v-if="isEditProcessing" name="crescent"></ion-spinner>
                <span v-else>Guardar Cambios</span>
              </ion-button>
              <ion-button fill="clear" @click="closeEditModal" color="medium">Cancelar</ion-button>
            </div>
          </form>
        </div>
      </ion-modal>

      <input ref="avatarFileInput" type="file" accept="image/png,image/jpeg,image/jpg" style="display:none" @change="handleAvatarFileSelect" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonButton, IonIcon, IonList, IonItem, IonInput, IonModal, IonSpinner } from "@ionic/vue";
import { cameraOutline, mailOutline, lockClosedOutline, callOutline, personCircleOutline, createOutline } from 'ionicons/icons';
import { useAuthStore } from '../../auth/store/auth';
import { syncUserProfileUpdate } from '../services/profileService';
import { useNotification } from '../../shared/composables/useNotification';

const auth = useAuthStore();
const router = useRouter();
const { notification, showNotification } = useNotification();

const userData = computed(() => ({
  userId: auth.user?.userId || 0,
  email: auth.user?.email || '',
  firstName: auth.user?.firstName || '',
  lastName: auth.user?.lastName || '',
  phone: auth.user?.phone || '',
  status: auth.user?.status || '',
  photoUrl: auth.user?.photoUrl || '',
  identification: auth.user?.cognitoSub || ''
}));

const userFullName = computed(() => {
  if (!auth.user?.firstName) return "Usuario";
  return `${auth.user.firstName} ${auth.user.lastName || ''}`;
});

const avatarPreviewUrl = ref('');
const isPhotoUploading = ref(false);
const avatarFileInput = ref<HTMLInputElement | null>(null);

const userAvatarSource = computed(() => {
  if (avatarPreviewUrl.value) return avatarPreviewUrl.value;
  const url = userData.value.photoUrl;
  if (!url) return 'https://www.gravatar.com/avatar/000?d=mp&f=y';
  return url.startsWith('data:') || url.startsWith('http') ? url : `data:image/jpeg;base64,${url}`;
});

const isEditModalVisible = ref(false);
const isEditProcessing = ref(false);
const editProfileForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
});

const openFilePicker = () => avatarFileInput.value?.click();

const handleAvatarFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showNotification('error', 'Imagen muy pesada', 'Máximo 2MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target?.result as string;
    avatarPreviewUrl.value = base64Data;
    await uploadProfileAvatar(base64Data);
  };
  reader.readAsDataURL(file);
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

const closeEditModal = () => { isEditModalVisible.value = false; };

const handleUpdateProfile = async () => {
  isEditProcessing.value = true;
  try {
    await syncUserProfileUpdate({
      data: { ...editProfileForm, photoUrl: userData.value.photoUrl, identification: userData.value.identification },
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
</script>

<style src="../theme/PerfilPage.css"></style>
