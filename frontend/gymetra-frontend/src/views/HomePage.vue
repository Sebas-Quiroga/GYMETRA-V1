<template>
  <ion-page>
    <!-- Header con navegación -->
    <ion-header>
      <ion-toolbar color="primary" class="custom-toolbar">
        <ion-title class="page-title">Principal</ion-title>
        <ion-buttons slot="end">
          <!-- Botón de salir -->
          <ion-button fill="clear" @click="logout">
            <ion-icon :icon="logOutOutline"></ion-icon>
            Salir
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-page">
      <div class="dashboard-container">
        <!-- Card de Bienvenida -->
        <div class="welcome-card">
          <div class="welcome-content">
            <div class="welcome-text">
              <h2>Hola, {{ userFirstName }}</h2>
              <p>{{ greeting }}</p>
            </div>
            <div class="profile-avatar">
              <div class="avatar-circle">
                <ion-icon :icon="personOutline"></ion-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards Row -->
        <div class="stats-row">
          <!-- Card Recordes -->
          <div class="stat-card record-card">
            <div class="stat-number">20</div>
            <div class="stat-label">Recordes</div>
          </div>
          <!-- Card Rutina -->
          <div class="stat-card routine-card">
            <div class="stat-icon">
              <ion-icon :icon="fitnessOutline"></ion-icon>
            </div>
            <div class="stat-label">Rutina</div>
          </div>
          <!-- Card Copiar -->
          <div class="stat-card copy-card">
            <div class="stat-icon">
              <ion-icon :icon="qrCodeOutline"></ion-icon>
            </div>
            <div class="stat-label">codigo QR</div>
          </div>
        </div>

        <!-- Tiempo Entrenado Section -->
        <div class="training-section">
          <div class="section-header">
            <h3>Tiempo Entrenado</h3>
            <ion-button fill="clear" size="small" class="info-btn">
              <ion-icon :icon="informationCircleOutline"></ion-icon>
            </ion-button>
          </div>
          <!-- Chart Container -->
          <div class="chart-container">
            <div class="chart-bars">
              <div class="bar-item" v-for="(bar, index) in chartData" :key="index">
                <div class="bar" :class="bar.isActive ? 'bar-active' : 'bar-inactive'"
                  :style="{ height: bar.height + '%' }"></div>
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
import { ref, computed, onMounted } from "vue";
import {
  personOutline,
  fitnessOutline,
  copyOutline,
  informationCircleOutline,
  logOutOutline,
} from "ionicons/icons";
import { qrCodeOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const logout = () => {
  auth.clearToken()
  router.push('/login')
}

const userData = ref({
  userId: null,
  email: "",
  firstName: "",
  lastName: "",
  status: "",
  roleIds: [],
  exp: null,
  iat: null,
});

const chartData = ref([
  { day: 'L', height: 60, isActive: false },
  { day: 'M', height: 45, isActive: false },
  { day: 'X', height: 70, isActive: false },
  { day: 'J', height: 100, isActive: true },
  { day: 'V', height: 55, isActive: false },
  { day: 'S', height: 40, isActive: false },
  { day: 'D', height: 65, isActive: false },
]);

const decodeJWT = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Token JWT inválido');
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const decoded = atob(paddedBase64);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
};

const userFirstName = computed(() => {
  const { firstName, email } = userData.value;
  if (firstName && firstName.trim() !== "") return firstName;
  if (email) {
    const emailName = email.split('@')[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  return "Usuario";
});

const greeting = computed(() => {
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const today = dayNames[new Date().getDay()];
  return `${today} activo`;
});

const currentDay = computed(() => {
  const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const today = new Date().getDay();
  return days[today];
});

const loadUserData = () => {
  if (auth.token) {
    const decoded = decodeJWT(auth.token);
    if (decoded) {
      userData.value = {
        userId: decoded.userId || null,
        email: decoded.email || "",
        firstName: decoded.firstName || "",
        lastName: decoded.lastName || "",
        status: decoded.status || "",
        roleIds: decoded.roleIds || [],
        exp: decoded.exp,
        iat: decoded.iat,
      };
      if (decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp < now) {
          console.warn('Token expirado');
        }
      }
    }
  }
};

const updateChartForCurrentDay = () => {
  const currentDayName = currentDay.value;
  chartData.value = chartData.value.map(bar => ({
    ...bar,
    isActive: bar.day === currentDayName
  }));
};

onMounted(() => {
  auth.initializeToken();
  loadUserData();
  updateChartForCurrentDay();
});
</script>

<style scoped>
/* Página principal */
.home-page {
  --background: #07B7E0 !important;
  --padding-start: 0 !important;
  --padding-end: 0 !important;
  --padding-top: 0 !important;
  --padding-bottom: 0 !important;
}

.home-page::part(scroll) {
  background: #07B7E0 !important;
}

/* Header personalizado */
.custom-toolbar {
  --background: #07B7E0;
  --color: white;
  --border-width: 0;
}

.page-title {
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

ion-buttons ion-button {
  --color: white;
}

/* Container principal */
.dashboard-container {
  padding: 20px;
  min-height: 100vh;
  background: #07B7E0;
}

/* Card de Bienvenida */
.welcome-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h2 {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 5px 0;
  text-shadow: none;
}

.welcome-text p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.profile-avatar {
  position: relative;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.avatar-circle ion-icon {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.8);
}

/* Row de estadísticas */
.stats-row {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px 15px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.2);
}

/* Card de recordes */
.record-card .stat-number {
  color: white;
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 5px;
  text-shadow: none;
}

.stat-label {
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Íconos de las cards */
.stat-icon {
  margin-bottom: 8px;
}

.stat-icon ion-icon {
  font-size: 32px;
  color: white;
  filter: none;
}

/* Sección de entrenamiento */
.training-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h3 {
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  text-shadow: none;
}

.info-btn {
  --color: rgba(255, 255, 255, 0.8);
  margin: 0;
  --padding-start: 8px;
  --padding-end: 8px;
}

.info-btn ion-icon {
  font-size: 20px;
}

/* Container del gráfico */
.chart-container {
  height: 200px;
  display: flex;
  align-items: end;
  padding: 0 10px;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: end;
  width: 100%;
  height: 100%;
  gap: 8px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: end;
}

.bar {
  width: 100%;
  border-radius: 6px 6px 2px 2px;
  transition: all 0.3s ease;
  margin-bottom: 10px;
  min-height: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bar-active {
  background: white;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
}

.bar-inactive {
  background: rgba(255, 255, 255, 0.7);
}

.bar-label {
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

/* Responsive */
@media (max-width: 480px) {
  .dashboard-container {
    padding: 15px;
  }

  .stats-row {
    gap: 10px;
  }

  .stat-card {
    padding: 15px 10px;
  }

  .record-card .stat-number {
    font-size: 1.8rem;
  }

  .stat-icon ion-icon {
    font-size: 28px;
  }

  .welcome-text h2 {
    font-size: 1.5rem;
  }

  .chart-bars {
    gap: 6px;
  }
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-card,
.stat-card,
.training-section {
  animation: fadeInUp 0.6s ease-out forwards;
}

.stat-card:nth-child(1) {
  animation-delay: 0.1s;
}

.stat-card:nth-child(2) {
  animation-delay: 0.2s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.3s;
}

.training-section {
  animation-delay: 0.4s;
}
</style>