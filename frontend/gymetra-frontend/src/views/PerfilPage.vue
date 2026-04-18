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
        <div class="perfil-avatar" :class="{ 'uploading': photoLoading }">
          <img :src="profileImageSrc" alt="avatar" @click="triggerPhotoSelect" style="cursor:pointer" loading="lazy" aria-label="Foto de perfil" />
          <div v-if="photoLoading" class="avatar-loading-overlay">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
          <div v-else class="avatar-overlay" @click="triggerPhotoSelect" tabindex="0" role="button" aria-label="Cambiar foto de perfil">
            <ion-icon :icon="cameraOutline" class="camera-overlay-icon" style="font-size:2.2rem;color:#fff;" aria-hidden="true"></ion-icon>
          </div>
        </div>
        <div class="perfil-username-row">
          <div class="perfil-username">{{ displayName }}</div>
          <ion-button class="perfil-edit-btn-inline" shape="round" color="primary" fill="solid" @click="openEditModal" aria-label="Editar nombre de usuario">
            <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
          </ion-button>
        </div>
      </div>

      <div class="perfil-info-card" aria-label="Información de usuario">
        <ion-list>
          <ion-item><ion-icon slot="start" :icon="mailOutline" style="color:#04b8e5;" aria-hidden="true"/> <span aria-label="Correo electrónico">{{ currentUser.email }}</span></ion-item>
          <ion-item><ion-icon slot="start" :icon="lockClosedOutline" style="color:#04b8e5;" aria-hidden="true"/> ******** <ion-button slot="end" fill="clear" size="small" aria-label="Editar contraseña"><ion-icon :icon="createOutline" /></ion-button></ion-item>
          <ion-item><ion-icon slot="start" :icon="callOutline" style="color:#04b8e5;" aria-hidden="true"/> <span aria-label="Teléfono">{{ currentUser.phone }}</span></ion-item>
          <ion-item><ion-icon slot="start" :icon="personCircleOutline" style="color:#04b8e5;" aria-hidden="true"/> <span aria-label="Estado">{{ currentUser.status }}</span></ion-item>
        </ion-list>
      </div>

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
import { ref, computed } from 'vue';
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
const photoPreview = ref(''); // Vista previa local mientras carga
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

  // Validar tamaño (Opcional pero recomendado para Base64)
  if (file.size > 2 * 1024 * 1024) {
    showNotification('error', 'Imagen muy pesada', 'La imagen no debe superar los 2MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const result = e.target?.result as string;
    photoPreview.value = result; // Mostrar preview local inmediata
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
        photoPreview.value = ''; // Limpiar preview local y usar la del store
      }
    });
  } catch (err) {
    // Si falla, el service ya muestra la notificación de error
    photoPreview.value = ''; 
  } finally {
    photoLoading.value = false;
  }
};

// --- Formulario y Modal ---
const showEditModal = ref(false);
const editLoading = ref(false);
const editForm = ref({ ...currentUser.value });

const openEditModal = () => {
  editForm.value = { ...currentUser.value };
  showEditModal.value = true;
};
const closeEditModal = () => (showEditModal.value = false);

const handleEditProfile = async () => {
  editLoading.value = true;
  await syncUserProfileUpdate({
    data: {
      firstName: editForm.value.firstName,
      lastName: editForm.value.lastName,
      phone: editForm.value.phone,
      photoUrl: editForm.value.photoUrl || currentUser.value.photoUrl,
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
const notification = ref({ show: false, type: 'info', title: '', message: '', icon: '' });
const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
  const icons = { success: checkmarkCircle, error: alertCircle, info: informationCircle };
  notification.value = { show: true, type, title, message, icon: icons[type] };
  setTimeout(() => notification.value.show = false, 4000);
};
const dismissNotification = () => (notification.value.show = false);
</script>

<style src="../theme/PerfilPage.css"></style>
