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
          <div class="welcome-content">
            <div class="welcome-text">
              <h2>Hola, {{ userFirstName }}</h2>
              <p>{{ greeting }}</p>
            </div>
            <div class="profile-avatar">
              <div class="avatar-circle" @click="navigateToProfile" tabindex="0" role="button" aria-label="Ir al perfil">
                <!-- Mostrar foto si existe, sino mostrar icono -->
                <img 
                  v-if="userPhotoUrl" 
                  :src="userPhotoUrl" 
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
import { HOST_URL } from"../services/hots";

const auth = useAuthStore()
const router = useRouter()

// Estados para membresías
const userMemberships = ref<any[]>([])
const loadingMemberships = ref(false)

const logout = () => {
  auth.clearToken();
  router.push("/login");
};

const navigateToPlanes = () => {
  router.push('/Planes')
}

// Estado reactivo para el QR temporal (puedes moverlo a un store si prefieres)
const qrCodeData = ref<string | null>(null)

const navigateToQR = async () => {
  // Obtener el userId del usuario autenticado
  const userId = userData.value.userId;
  if (!userId) {
    console.error('No hay userId disponible para consultar el QR');
    return;
  }
  try {
    const response = await fetch(`${HOST_URL}:8090/api/qr-access/user/${userId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    if (data && data.qrCode) {
      qrCodeData.value = data.qrCode;
      // Guardar en window para acceso global
      (window as any).qrCodeData = data.qrCode;
      // Guardar en localStorage para fallback
      localStorage.setItem('qrCodeData', data.qrCode);
      // Navegar a la vista QR
      router.push({ path: '/qr', query: { fromHome: '1' } });
    } else {
  // Solo mostrar errores en consola
    }
  } catch (error) {
    console.error('Error consultando el QR:', error);
  }
}

const navigateToProfile = () => {
  router.push('/perfil')
}

const userData = ref({
  userId: null,
  email: "",
  firstName: "",
  lastName: "",
  status: "",
  roleIds: [],
  photoUrl: "", // Agregar campo photoUrl
  exp: null,
  iat: null,
});

// Estado para la URL de la foto usando el store
const userPhotoUrl = computed(() => auth.userPhotoUrl);

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

// Función para decodificar base64 y crear URL de imagen
const decodeBase64Image = (base64String: string): string => {
  try {
    if (!base64String) return '';
    
    // Si ya tiene el prefijo data:, devolverlo tal como está
    if (base64String.startsWith('data:')) {
      return base64String;
    }
    
    // Si es solo la cadena base64, agregar el prefijo apropiado
    // Asumimos que es una imagen JPEG por defecto, pero puedes ajustarlo
    return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.error('Error decodificando imagen base64:', error);
    return '';
  }
};

// Función para manejar errores de carga de imagen
const handleImageError = () => {
  // Solo mostrar errores en consola
  // Ya no necesitamos hacer nada aquí, el store maneja los estados
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

const loadUserData = async () => {
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
        photoUrl: decoded.photoUrl || "", // Extraer photoUrl del token
        exp: decoded.exp,
        iat: decoded.iat,
      };
      
      // Decodificar y establecer la URL de la foto
      if (userData.value.photoUrl) {
        // El store ya maneja la foto, no necesitamos decodificarla aquí
  // Solo mostrar errores en consola
      }
      
      if (decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp < now) {
          // Solo mostrar errores en consola
        }
      }

      // Cargar membresías una vez que tenemos el userId
      if (userData.value.userId) {
        await loadUserMemberships();
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

// ===============================
// Funciones para membresías
// ===============================
const loadUserMemberships = async () => {
  if (!userData.value.userId) {
  // Solo mostrar errores en consola
    return;
  }

  try {
    loadingMemberships.value = true;
  // Solo mostrar errores en consola
    
    // Usar la API directamente como en el componente de estado
    const response = await fetch(`${HOST_URL}:8081/api/user-memberships/user/${userData.value.userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const memberships = await response.json();
  // Solo mostrar errores en consola
    
    // Filtrar solo membresías activas
    const activeMemberships = memberships
      .filter((m: any) => m.status === 'ACTIVE')
      .sort((a: any, b: any) => 
        new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      );
    
    userMemberships.value = activeMemberships;
  // Solo mostrar errores en consola
    
  } catch (error: any) {
    console.error('❌ Error cargando membresías:', error);
    // En caso de error, mantener el arreglo vacío
    userMemberships.value = [];
  } finally {
    loadingMemberships.value = false;
  }
};

// Computed para días restantes - usando la misma lógica del componente de estado
const daysRemaining = computed(() => {
  if (loadingMemberships.value) {
    return '--';
  }

  if (userMemberships.value.length === 0) {
    return '0';
  }

  // Tomar la primera membresía activa (ya están ordenadas por fecha)
  const activeMembership = userMemberships.value[0];
  
  if (!activeMembership?.endDate) return '0';
  
  try {
    const endDate = new Date(activeMembership.endDate);
    const today = new Date();
    
    // Set times to start of day for accurate comparison
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays).toString();
  } catch (error) {
    console.error('Error calculating days:', error);
    return '0';
  }
});

// Computed para el label de días restantes
const daysRemainingLabel = computed(() => {
  if (loadingMemberships.value) {
    return 'Cargando...';
  }

  const days = parseInt(daysRemaining.value);
  
  if (isNaN(days) || days === 0) {
    return 'Sin membresía activa';
  } else if (days === 1) {
    return 'Día restante';
  } else if (days <= 7) {
    return 'Días restantes ⚠️';
  } else {
    return 'Días restantes';
  }
});

// Computed para estados de advertencia
const isDaysCritical = computed(() => {
  const days = parseInt(daysRemaining.value);
  return !isNaN(days) && days > 0 && days <= 3;
});

const isDaysWarning = computed(() => {
  const days = parseInt(daysRemaining.value);
  return !isNaN(days) && days > 3 && days <= 7;
});

// Computed para clase de la card
const getMembershipCardClass = computed(() => {
  const days = parseInt(daysRemaining.value);
  
  if (loadingMemberships.value) return 'loading-state';
  if (isNaN(days) || days === 0) return 'no-membership';
  if (days <= 3) return 'critical-state';
  if (days <= 7) return 'warning-state';
  return 'active-state';
});

// Nueva lógica para el componente QR
const qrCode = ref<string | null>(null);
const qrStatus = ref('');
const qrEndDate = ref<string | null>(null);

onMounted(() => {
  if (window && (window as any).qrCodeData) {
    qrCode.value = (window as any).qrCodeData;
  } else {
    qrCode.value = localStorage.getItem('qrCodeData');
  }
  qrStatus.value = qrCode.value ? 'Membresía activa' : 'Sin QR';
  qrEndDate.value = null;
});

onMounted(async () => {
  auth.initializeToken();
  await loadUserData();
  updateChartForCurrentDay();
});
</script>

<style>
@import '../theme/HomePage.css';
</style>