<template>
  <ion-page>
    <div class="home-header" role="banner">
      <div class="home-header-left">
        <div class="home-avatar-wrap" @click="navigateToProfile" tabindex="0" role="button" aria-label="Ir al perfil">
          <img
            v-if="profilePhotoUrl"
            :src="profilePhotoUrl"
            alt="Foto de perfil"
            class="home-avatar-img"
            @error="handleImageError"
            loading="lazy"
          />
          <div v-else class="home-avatar-fallback">
            {{ userFirstName.charAt(0) }}
          </div>
        </div>
      </div>
      <router-link to="/home" class="home-logo-link" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="brand-name-header">GYMETRA</span>
      </router-link>
      <div class="home-header-right">
        <button class="home-logout-btn" @click="handleLogout" aria-label="Cerrar sesión">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>

    <ion-content class="home-content">
      <div class="home-container" role="main">
        <section class="home-welcome">
          <h1 class="home-welcome-name">Hola, {{ userFirstName }}</h1>
          <p class="home-welcome-sub">{{ welcomeGreeting }}</p>
        </section>

        <div class="home-bento">
          <div class="bento-membership" :class="membershipCardClass" aria-label="Días restantes de membresía">
            <span class="membership-badge">Membresía Activa</span>
            <div class="membership-days-row">
              <span class="membership-days" aria-live="polite">{{ daysRemaining }}</span>
              <span class="membership-days-label">{{ membershipRemainingText }}</span>
            </div>
            <div class="membership-bar-bg">
              <div class="membership-bar-fill" :style="{ width: membershipProgressPercentage + '%' }"></div>
            </div>
            <div class="membership-glow" aria-hidden="true"></div>
          </div>

          <button class="bento-qr" @click="navigateToQR" aria-label="Check-in QR">
            <div class="bento-qr-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <path d="M14 14h1v1h-1zM17 14h1v1h-1zM20 14h1v1h-1zM14 17h1v1h-1zM17 17h1v1h-1zM20 17h1v1h-1zM14 20h1v1h-1zM17 20h1v1h-1zM20 20h1v1h-1z"/>
              </svg>
            </div>
            <span class="bento-qr-label">Check-in QR</span>
            <span class="bento-qr-sub">Acceso Rápido</span>
          </button>

          <div class="bento-cta" @click="navigateToMembership" tabindex="0" role="button" aria-label="Adquirir plan">
            <div class="cta-content">
              <span class="cta-eyebrow">Rendimiento de Élite</span>
              <h3 class="cta-title">POTENCIA TU <span class="cta-accent">ENTRENO</span></h3>
              <p class="cta-sub">Adquiere un plan PRO y domina el gimnasio</p>
            </div>
            <div class="cta-action">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>

          <div class="bento-chart" aria-label="Dashboard de Actividad">
            <div class="bento-chart-header">
              <div class="header-main-info">
                <h3 class="bento-chart-title">Actividad</h3>
                <p class="bento-chart-sub">Análisis Semanal</p>
              </div>
              <div class="header-stats">
                <div class="stat-item">
                  <span class="stat-value">12.4h</span>
                  <span class="stat-label">Total</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item estimated-time">
                  <span class="stat-value">45m</span>
                  <span class="stat-label">Estimado</span>
                </div>
              </div>
            </div>
            <div class="bento-chart-visual">
              <div class="bento-chart-bars" role="img" aria-label="Gráfica de barras semanal">
                <div v-for="(bar, index) in activityChartData" :key="index" class="chart-col">
                  <div class="chart-bar-container">
                    <div
                      class="chart-bar"
                      :class="bar.isActive ? 'chart-bar-active' : 'chart-bar-inactive'"
                      :style="{ height: (bar.height / 100) * 120 + 'px' }"
                    >
                      <div v-if="bar.isActive" class="chart-bar-glow"></div>
                    </div>
                  </div>
                  <span class="chart-day" :class="{ 'chart-day-active': bar.isActive }">{{ bar.day }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="hasTrainingPermission" class="bento-action-card" @click="navigateToRutinas" tabindex="0" role="button">
            <div class="bento-action-icon bento-action-icon-teal">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6.5 6.5h11M6.5 12h11M6.5 17.5h11"/>
                <circle cx="3.5" cy="6.5" r="1"/>
                <circle cx="3.5" cy="12" r="1"/>
                <circle cx="3.5" cy="17.5" r="1"/>
              </svg>
            </div>
            <div>
              <h4 class="bento-action-title">Planes de Entrenamiento</h4>
              <p class="bento-action-sub">Gestión de Rutinas</p>
            </div>
          </div>

          <div v-if="hasNutritionPermission" class="bento-action-card" @click="navigateToNutrition" tabindex="0" role="button">
            <div class="bento-action-icon bento-action-icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div>
              <h4 class="bento-action-title">Plan Nutricional</h4>
              <p class="bento-action-sub">Fase de Volumen · Día 14</p>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { IonPage, IonContent, onIonViewWillEnter } from "@ionic/vue";
import { useAuthStore } from "../../auth/store/auth";
import { useUserMembership } from "../composables/useUserMembership";

const auth = useAuthStore();
const router = useRouter();
const { 
  daysRemaining, isLoadingMemberships, membershipStatus, 
  loadMemberships, hasPermission 
} = useUserMembership(auth.user?.userId);

const userFirstName = computed(() => auth.user?.firstName || "Usuario");

const profilePhotoUrl = computed(() => {
  const url = auth.user?.photoUrl;
  if (!url) return null;
  return url.startsWith("data:") || url.startsWith("http") ? url : `data:image/jpeg;base64,${url}`;
});

const welcomeGreeting = computed(() => {
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return `${dayNames[new Date().getDay()]} activo · Tu progreso hoy es excepcional.`;
});

const membershipRemainingText = computed(() => {
  if (isLoadingMemberships.value) return "Cargando...";
  const days = parseInt(daysRemaining.value);
  if (isNaN(days) || days === 0) return "Sin membresía activa";
  return days === 1 ? "Día restante" : "Días restantes";
});

const membershipProgressPercentage = computed(() => {
  const days = parseInt(daysRemaining.value);
  return isNaN(days) || days === 0 ? 0 : Math.min(100, Math.round((days / 365) * 100));
});

const membershipCardClass = computed(() => `state-${membershipStatus.value}`);
const hasTrainingPermission = computed(() => hasPermission('training'));
const hasNutritionPermission = computed(() => hasPermission('nutrition'));

const activityChartData = ref([
  { day: "L", height: 60, isActive: false },
  { day: "M", height: 80, isActive: false },
  { day: "X", height: 50, isActive: false },
  { day: "J", height: 100, isActive: false },
  { day: "V", height: 70, isActive: false },
  { day: "S", height: 90, isActive: false },
  { day: "D", height: 30, isActive: false },
]);

const updateChartDayHighlight = () => {
  const dayLetters = ["D", "L", "M", "X", "J", "V", "S"];
  const currentDayLetter = dayLetters[new Date().getDay()];
  activityChartData.value = activityChartData.value.map(bar => ({ 
    ...bar, 
    isActive: bar.day === currentDayLetter 
  }));
};

const handleLogout = async () => {
  await auth.logout();
  router.push("/login");
};

const navigateToProfile = () => router.push("/perfil");
const navigateToMembership = () => router.push("/Planes");
const navigateToNutrition = () => router.push("/nutrition-plan");
const navigateToRutinas = () => router.push("/rutinas");
const navigateToQR = () => router.push({ path: "/qr", query: { fromHome: "1" } });
const handleImageError = (event: any) => { event.target.src = ""; };

onIonViewWillEnter(() => auth.user?.userId && loadMemberships());
onMounted(updateChartDayHighlight);
watch(() => auth.user?.userId, (id) => id && loadMemberships());
</script>

<style scoped>
@import '../theme/HomePage.css';
</style>
