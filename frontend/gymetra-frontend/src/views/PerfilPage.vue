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
        <div class="perfil-avatar">
          <img :src="userPhotoUrl" alt="avatar" />
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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { arrowBackOutline, settingsOutline, createOutline } from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { decodeJWT } from '@/services/authService';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const userData = ref({
  userId: null,
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  status: '',
  photoUrl: '',
});
const userPhotoUrl = computed(() => userData.value.photoUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png');
const userName = computed(() => {
  const { firstName, lastName, email } = userData.value;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (email) return email.split('@')[0];
  return 'Usuario';
});

const goToRegister = () => {
  router.push('/register');
};

onMounted(() => {
  if (auth.token) {
    const decoded = decodeJWT(auth.token);
    if (decoded) {
      userData.value = {
        userId: decoded.userId || null,
        email: decoded.email || '',
        firstName: decoded.firstName || '',
        lastName: decoded.lastName || '',
        phone: decoded.phone || '',
        status: decoded.status || '',
        photoUrl: decoded.photoUrl || '',
      };
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
</style>
