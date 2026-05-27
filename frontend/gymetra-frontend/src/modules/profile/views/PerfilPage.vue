<template>
  <ion-page>
    <div class="perfil-header-bar" role="banner">
      <div class="header-side header-left">
        <button class="perfil-back-btn" @click="router.back()" aria-label="Volver">
          <ArrowLeft :size="22" stroke-width="2.5" />
        </button>
      </div>
      <router-link to="/home" class="header-logo-link" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="brand-name-header">GYMETRA</span>
      </router-link>
      <div class="header-side header-right">
        <button class="perfil-settings-btn" aria-label="Configuración">
          <Settings :size="20" stroke-width="2" />
        </button>
      </div>
    </div>

    <ion-content class="perfil-content">


      <div class="perfil-avatar-section">
        <div class="perfil-avatar" :class="{ 'uploading': isPhotoUploading }">
          <img :src="userAvatarSource" alt="avatar" @click="openFilePicker" loading="eager" />
          <div v-if="isPhotoUploading" class="avatar-loading-overlay">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
          <div v-else class="avatar-overlay" @click="openFilePicker" role="button" aria-label="Cambiar foto">
            <Camera :size="24" aria-hidden="true" />
          </div>
        </div>
        <div class="perfil-username-row">
          <div class="perfil-username">{{ userFullName }}</div>
          <ion-button class="perfil-edit-btn-inline" fill="clear" @click="openEditProfileModal">
            <Pencil slot="icon-only" :size="18" />
          </ion-button>
        </div>
      </div>

      <div class="perfil-info-card">
        <ion-list lines="none">
          <ion-item>
            <Mail slot="start" :size="20" aria-hidden="true" class="lucide-icon-list" />
            <span>{{ userData.email }}</span>
          </ion-item>
          <ion-item>
            <Lock slot="start" :size="20" aria-hidden="true" class="lucide-icon-list" />
            <span>********</span>
            <ion-button slot="end" fill="clear" size="small">
              <Pencil slot="icon-only" :size="18" />
            </ion-button>
          </ion-item>
          <ion-item>
            <Phone slot="start" :size="20" aria-hidden="true" class="lucide-icon-list" />
            <span>{{ userData.phone || 'No registrado' }}</span>
          </ion-item>
          <ion-item>
            <User slot="start" :size="20" aria-hidden="true" class="lucide-icon-list" />
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
import { ArrowLeft, Settings, Camera, Mail, Lock, Phone, User, Pencil } from '@lucide/vue';
import { useAuthStore } from '../../auth/store/auth';
import { useNotification } from '../../shared/composables/useNotification';
import { useProfileForm } from '../composables/useProfileForm';

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

const {
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
} = useProfileForm(userData, showNotification);
</script>

<style src="../theme/PerfilPage.css"></style>
