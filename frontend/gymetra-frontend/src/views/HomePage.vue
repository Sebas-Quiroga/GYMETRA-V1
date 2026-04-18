<template>
  <ion-page>
    <!-- Header con navegación -->
    <ion-header>
      <ion-toolbar color="primary" class="custom-toolbar" role="banner" aria-label="Encabezado principal">
        <ion-title class="page-title" aria-label="Página principal">Principal</ion-title>
        <ion-buttons slot="end">
          <!-- Botón de salir -->
          <ion-button fill="clear" @click="logout" aria-label="Cerrar sesión">
            <ion-icon :icon="logOutOutline"></ion-icon>
            Salir
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-page">
      <div class="dashboard-container" role="main" aria-label="Panel principal">
        <!-- Card de Bienvenida -->
        <div class="welcome-card" aria-label="Bienvenida">
            <div class="welcome-text">
              <h2>Hola, {{ fullName }}</h2>
              <p>{{ greeting }}</p>
            </div>
            <div class="profile-avatar">
              <div class="avatar-circle" @click="navigateToProfile" tabindex="0" role="button" aria-label="Ir al perfil">
                <img 
                  v-if="profilePhoto" 
                  :src="profilePhoto" 
                  alt="Foto de perfil"
                  class="avatar-image"
                  @error="handleImageError"
                  loading="lazy"
                  aria-label="Foto de perfil"
                />
                <ion-icon 
                  v-else 
                  :icon="personOutline"
                  class="avatar-icon"
                  aria-hidden="true"
                ></ion-icon>
              </div>
            </div>
        </div>

        <!-- Stats Cards Row -->
        <div class="stats-row" aria-label="Estadísticas rápidas">
          <!-- Card Días Restantes -->
          <div class="stat-card record-card" :class="getMembershipCardClass" aria-label="Días restantes de membresía">
            <div 
              class="stat-number" 
              :data-days-critical="isDaysCritical"
              :data-days-warning="isDaysWarning"
            >
              {{ daysRemaining }}
            </div>
            <div class="stat-label">{{ daysRemainingLabel }}</div>
          </div>
          <!-- Card Rutina -->
          <div class="stat-card routine-card" @click="navigateToPlanes" tabindex="0" role="button" aria-label="Ver planes">
            <div class="stat-icon">
              <ion-icon :icon="fitnessOutline" aria-hidden="true"></ion-icon>
            </div>
            <div class="stat-label">planes</div>
          </div>
          <!-- Card QR -->
          <div class="stat-card copy-card" @click="navigateToQR" tabindex="0" role="button" aria-label="Ver código QR">
            <div class="stat-icon">
              <ion-icon :icon="qrCodeOutline" aria-hidden="true"></ion-icon>
            </div>
            <div class="stat-label">código QR</div>
          </div>
        </div>

        <!-- Tiempo Entrenado Section -->
        <div class="training-section" aria-label="Tiempo entrenado semanal">
          <div class="section-header">
            <h3>Tiempo Entrenado</h3>
            <ion-button fill="clear" size="small" class="info-btn" aria-label="Información sobre tiempo entrenado">
              <ion-icon :icon="informationCircleOutline" aria-hidden="true"></ion-icon>
            </ion-button>
          </div>
          <!-- Chart Container -->
          <div class="chart-container">
            <div class="chart-bars">
              <div class="bar-item" v-for="(bar, index) in chartData" :key="index">
                <div class="bar" :class="bar.isActive ? 'bar-active' : 'bar-inactive'"
                  :style="{ height: bar.height + '%' }" :aria-label="'Entrenamiento ' + bar.day + ': ' + bar.height + '%'" role="progressbar"></div>
                <div class="bar-label">{{ bar.day }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonIcon, IonContent, IonSpinner, onIonViewWillEnter
} from "@ionic/vue";
import {
  personOutline,
  fitnessOutline,
  informationCircleOutline,
  logOutOutline,
  qrCodeOutline,
} from "ionicons/icons";
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { apiAuthRequest } from '@/services/apiService';
import { HOST_URL } from "@/services/hots";

const auth = useAuthStore();
const router = useRouter();

// --- Datos del Usuario (Reactivos desde el Store) ---
const firstName = computed(() => auth.user?.firstName || "Usuario")
const lastName = computed(() => auth.user?.lastName || "")

const fullName = computed(() => `${firstName.value} ${lastName.value}`)
const profilePhoto = computed(() => {
  const url = auth.user?.photoUrl;
  if (!url) return 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  return url.startsWith('data:') || url.startsWith('http') ? url : `data:image/jpeg;base64,${url}`;
});

const greeting = computed(() => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return `${days[new Date().getDay()]} activo`;
});

// --- Navegación ---
const logout = async () => {
  auth.clearToken();
  router.push("/login");
};

const navigateToProfile = () => router.push('/perfil');
const navigateToPlanes = () => router.push('/Planes');
const navigateToQR = () => router.push({ path: '/qr', query: { fromHome: '1' } });

// --- Membresías ---
const userMemberships = ref<any[]>([]);
const loadingMemberships = ref(false);

const loadUserMemberships = async () => {
    if (!auth.user?.userId) return;
    loadingMemberships.value = true;
    try {
        const response = await apiAuthRequest(`${HOST_URL}:8081/api/user-memberships/user/${auth.user.userId}`);
        if (response.success && response.data) {
          const memberships = response.data;
          userMemberships.value = (Array.isArray(memberships) ? memberships : [])
            .filter((m: any) => m.status === 'ACTIVE')
            .sort((a: any, b: any) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
        }
    } catch (e) {
        console.error("Error cargando membresías:", e);
    } finally {
        loadingMemberships.value = false;
    }
};

// Computed para días restantes
const daysRemaining = computed(() => {
  if (loadingMemberships.value) return '--';
  if (userMemberships.value.length === 0) return '0';
  const activeMembership = userMemberships.value[0];
  if (!activeMembership?.endDate) return '0';
  
  const endDate = new Date(activeMembership.endDate);
  const today = new Date();
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays).toString();
});

const daysRemainingLabel = computed(() => {
  if (loadingMemberships.value) return 'Cargando...';
  const days = parseInt(daysRemaining.value);
  if (isNaN(days) || days === 0) return 'Sin membresía activa';
  return days === 1 ? 'Día restante' : 'Días restantes';
});

const isDaysCritical = computed(() => {
  const days = parseInt(daysRemaining.value);
  return !isNaN(days) && days > 0 && days <= 3;
});

const isDaysWarning = computed(() => {
  const days = parseInt(daysRemaining.value);
  return !isNaN(days) && days > 3 && days <= 7;
});

const getMembershipCardClass = computed(() => {
  const days = parseInt(daysRemaining.value);
  if (loadingMemberships.value) return 'loading-state';
  if (isNaN(days) || days === 0) return 'no-membership';
  if (days <= 3) return 'critical-state';
  if (days <= 7) return 'warning-state';
  return 'active-state';
});

// --- QR y Gráfica ---
const qrCode = ref<string | null>(null);
const qrStatus = ref('');

const chartData = ref([
  { day: 'L', height: 60, isActive: false },
  { day: 'M', height: 45, isActive: false },
  { day: 'X', height: 70, isActive: false },
  { day: 'J', height: 100, isActive: false },
  { day: 'V', height: 55, isActive: false },
  { day: 'S', height: 40, isActive: false },
  { day: 'D', height: 65, isActive: false },
]);

const updateChartForCurrentDay = () => {
  const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const currentDayName = days[new Date().getDay()];
  chartData.value = chartData.value.map(bar => ({
    ...bar,
    isActive: bar.day === currentDayName
  }));
};

const handleImageError = (e: any) => {
  e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
};

// --- Ciclo de Vida ---
onIonViewWillEnter(async () => {
  if (auth.user?.userId) {
    await loadUserMemberships();
  }
});

onMounted(async () => {
  updateChartForCurrentDay();
  qrCode.value = localStorage.getItem('qrCodeData');
  qrStatus.value = qrCode.value ? 'Membresía activa' : 'Sin QR';
});

watch(() => auth.user?.userId, (newId) => {
  if (newId) loadUserMemberships();
});
</script>

<style scoped>
@import '../theme/HomePage.css';
</style>