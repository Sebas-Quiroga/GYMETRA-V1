<template>
  <ion-page>
    <div class="perfil-header-bar" role="banner" aria-label="Encabezado de perfil">
      <button class="perfil-back-btn" @click="$router.back()" aria-label="Volver" tabindex="0">
        <ion-icon :icon="arrowBackOutline" style="font-size: 1.7rem; color: #fff;" aria-hidden="true"></ion-icon>
      </button>
      <span class="perfil-header-title" aria-label="Perfil">Perfil</span>
      <button class="perfil-settings-btn" aria-label="Configuración" tabindex="0">
        <ion-icon :icon="settingsOutline" style="font-size: 1.5rem; color: #fff;" aria-hidden="true"></ion-icon>
      </button>
    </div>
    
    <ion-content class="perfil-content">
      <!-- Avatar y datos -->
      <div class="perfil-avatar-section" aria-label="Avatar y datos de usuario">
        <div class="perfil-avatar" :class="{ 'loading': profileLoading }">
          <img :src="avatarSrc" alt="avatar" @click="changePhoto" style="cursor:pointer" loading="lazy" aria-label="Foto de perfil" />
          <div class="avatar-overlay" @click="changePhoto" tabindex="0" role="button" aria-label="Cambiar foto de perfil">
            <ion-icon :icon="cameraOutline" class="camera-overlay-icon" style="font-size:2.2rem;color:#fff;" aria-hidden="true"></ion-icon>
          </div>
        </div>
        <div class="perfil-username-row">
          <div class="perfil-username">{{ userName }}</div>
          <ion-button class="perfil-edit-btn-inline" shape="round" color="primary" fill="solid" @click="openEditModal" aria-label="Editar nombre de usuario">
            <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
          </ion-button>
        </div>
        <div v-if="photoPreview" class="perfil-update-img-btn" style="margin-top: 10px;">
          <ion-button shape="round" color="primary" fill="solid" @click="updateAvatar" :disabled="editLoading" :aria-disabled="editLoading" aria-label="Actualizar imagen de perfil">
            <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
            <span style="margin-left:8px;">Actualizar imagen</span>
          </ion-button>
        </div>
      </div>

      <div class="perfil-info-card" aria-label="Información de usuario">
        <ion-list>
          <ion-item><ion-icon slot="start" :icon="mailOutline" style="color:#04b8e5;" aria-hidden="true"/> <span aria-label="Correo electrónico">{{ userData.email }}</span></ion-item>
          <ion-item><ion-icon slot="start" :icon="lockClosedOutline" style="color:#04b8e5;" aria-hidden="true"/> ******** <ion-button slot="end" fill="clear" size="small" aria-label="Editar contraseña"><ion-icon :icon="createOutline" /></ion-button></ion-item>
          <ion-item><ion-icon slot="start" :icon="callOutline" style="color:#04b8e5;" aria-hidden="true"/> <span aria-label="Teléfono">{{ userData.phone }}</span></ion-item>
          <ion-item><ion-icon slot="start" :icon="personCircleOutline" style="color:#04b8e5;" aria-hidden="true"/> <span aria-label="Estado">{{ userData.status }}</span></ion-item>
        </ion-list>
      </div>

      <!-- Botón de editar eliminado, ahora está junto al nombre -->

      <!-- Modal de edición de perfil -->
      <ion-modal :is-open="showEditModal" @did-dismiss="closeEditModal" aria-modal="true" role="dialog">
        <div class="modal-content" aria-label="Editar Perfil">
          <button class="modal-close-btn" @click="closeEditModal" aria-label="Cerrar modal" style="position:sticky;top:0;z-index:10;float:right;background:none;border:none;font-size:1.5rem;">×</button>
          <h2>Editar Perfil</h2>
          <form @submit.prevent="handleEditProfile" aria-label="Formulario de edición de perfil">
            <ion-item>
              <ion-label position="stacked">Nombre</ion-label>
              <ion-input v-model="editForm.firstName" maxlength="50" autocomplete="given-name" aria-label="Nombre" required />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Apellido</ion-label>
              <ion-input v-model="editForm.lastName" maxlength="50" autocomplete="family-name" aria-label="Apellido" required />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Correo electrónico</ion-label>
              <ion-input v-model="editForm.email" type="email" maxlength="100" autocomplete="email" aria-label="Correo electrónico" required />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Teléfono</ion-label>
              <ion-input v-model="editForm.phone" type="tel" maxlength="15" autocomplete="tel" aria-label="Teléfono" required />
            </ion-item>
            <div class="btn-container">
              <ion-button type="submit" expand="block" color="primary" :disabled="editLoading" :aria-disabled="editLoading" aria-label="Guardar cambios">
                <ion-spinner v-if="editLoading" name="crescent" aria-label="Cargando"></ion-spinner>
                <span v-else>Guardar Cambios</span>
              </ion-button>
              <ion-button fill="clear" color="medium" @click="closeEditModal" aria-label="Cancelar">Cancelar</ion-button>
            </div>
          </form>
        </div>
      </ion-modal>

      <!-- Toast de notificación -->
      <div v-if="notification.show" class="notification-toast" :class="notification.type" role="alert" aria-live="assertive">
        <div class="notification-content">
          <ion-icon :icon="notification.icon" class="notification-icon" aria-hidden="true"></ion-icon>
          <div class="notification-text">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.message }}</p>
          </div>
          <ion-button fill="clear" size="small" @click="dismissNotification" aria-label="Cerrar notificación">
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
        aria-label="Seleccionar imagen de perfil"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { arrowBackOutline, settingsOutline, createOutline, cameraOutline, imagesOutline, checkmarkCircle, alertCircle, informationCircle, warningOutline, trashOutline, addOutline, mailOutline, lockClosedOutline, callOutline, personCircleOutline } from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { decodeJWT } from '@/services/authService';
import { updateUserProfile } from '@/services/profileService';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

// Definir las propiedades de estado
const userData = ref({
  userId: auth.user?.userId || '',
  email: auth.user?.email || '',
  firstName: auth.user?.firstName || '',
  lastName: auth.user?.lastName || '',
  phone: auth.user?.phone || '',
  status: auth.user?.status || '',
  photoUrl: auth.user?.photoUrl || '',
});

// Avatar helpers
const photoPreview = ref('');
const avatarSrc = computed(() => {
  if (photoPreview.value) return photoPreview.value;
  const val = userData.value.photoUrl;
  if (!val) return '';
  if (/^([A-Za-z0-9+/=]+)$/.test(val) && val.length > 100) {
    return `data:image/png;base64,${val}`;
  }
  if (val.startsWith('data:image/')) return val;
  return val;
});
const fileInput = ref<HTMLInputElement | null>(null);
const changePhoto = () => {
  fileInput.value?.click();
};
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const result = e.target?.result as string;
    
    // Comprimir la imagen y convertirla a base64
    const base64 = result.includes(',') ? result.split(',')[1] : result;

    // Establecer la imagen base64 en el estado
    photoPreview.value = result; // Esto es solo para mostrar una vista previa
    editForm.value.photoUrl = base64; // Esto es lo que enviamos al backend
  };

  reader.readAsDataURL(file); // Este paso convierte la imagen a base64
};

const editForm = ref({
  firstName: userData.value.firstName,
  lastName: userData.value.lastName,
  email: userData.value.email,
  phone: userData.value.phone,
  photoUrl: userData.value.photoUrl,
});

const profileLoading = ref(false); // Definido para evitar el warning
// userPhotoUrl no se usa, eliminado para evitar redundancia
const userName = computed(() => userData.value.firstName + ' ' + userData.value.lastName);

// Funcionalidad del modal de edición
const showEditModal = ref(false);
const editLoading = ref(false);

const openEditModal = () => {
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};


// Función para editar el perfil
const handleEditProfile = async () => {
  editLoading.value = true;
  let base64 = editForm.value.photoUrl;
  if (base64 && !base64.startsWith('data:image/png;base64,')) {
    base64 = 'data:image/png;base64,' + base64;
  }
  const data = {
    firstName: editForm.value.firstName,
    lastName: editForm.value.lastName,
    email: editForm.value.email,
    phone: editForm.value.phone,
    photoUrl: base64 || userData.value.photoUrl,
  };
  const hasChanges =
    data.firstName !== userData.value.firstName ||
    data.lastName !== userData.value.lastName ||
    data.email !== userData.value.email ||
    data.phone !== userData.value.phone ||
    data.photoUrl !== userData.value.photoUrl;
  if (!hasChanges) {
    showNotification('info', 'Sin cambios', 'No se han detectado cambios.');
    editLoading.value = false;
    return;
  }
  await updateUserProfile({
    userId: String(userData.value.userId),
    data,
    successMsg: 'Perfil actualizado',
    onSuccess: closeEditModal,
    loadingRef: editLoading,
    showNotification,
    setUserData: (val: any) => { userData.value = typeof val === 'function' ? val(userData.value) : val; }
  });
};

// Actualizar imagen de perfil
const updateAvatar = async () => {
  if (!editForm.value.photoUrl) return;
  let base64 = editForm.value.photoUrl;
  if (!base64.startsWith('data:image/png;base64,')) {
    base64 = 'data:image/png;base64,' + base64;
  }
  const data = {
    firstName: editForm.value.firstName,
    lastName: editForm.value.lastName,
    email: editForm.value.email,
    phone: editForm.value.phone,
    photoUrl: base64,
  };
  await updateUserProfile({
    userId: String(userData.value.userId),
    data,
    successMsg: 'Imagen actualizada',
    onSuccess: () => { photoPreview.value = ''; },
    loadingRef: profileLoading,
    showNotification,
    setUserData: (val: any) => { userData.value = typeof val === 'function' ? val(userData.value) : val; }
  });
};

// Notificaciones
const notification = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  icon: 'informationCircle',
});

type NotificationType = 'success' | 'error' | 'info';
const showNotification = (type: NotificationType, title: string, message: string) => {
  notification.value = { show: true, type, title, message, icon: type === 'success' ? 'checkmarkCircle' : type === 'info' ? 'informationCircle' : 'alertCircle' };
  setTimeout(() => { notification.value.show = false; }, 5000);
};

const dismissNotification = () => {
  notification.value.show = false;
};
</script>

<style src="../theme/PerfilPage.css"></style>
