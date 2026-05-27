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
          <LogOut :size="22" stroke-width="2" />
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
              <QrCode :size="40" stroke-width="1.5" />
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
              <ChevronRight :size="24" stroke-width="3" />
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
              <Dumbbell :size="22" stroke-width="2" />
            </div>
            <div>
              <h4 class="bento-action-title">Planes de Entrenamiento</h4>
              <p class="bento-action-sub">Gestión de Rutinas</p>
            </div>
          </div>

          <div v-if="hasNutritionPermission" class="bento-action-card" @click="navigateToNutrition" tabindex="0" role="button">
            <div class="bento-action-icon bento-action-icon-amber">
              <Apple :size="22" stroke-width="2" />
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
import { LogOut, QrCode, ChevronRight, Dumbbell, Apple } from "lucide-vue-next";
import { useAuthStore } from "../../auth/store/auth";
import { useUserMembership } from "../composables/useUserMembership";
import { useActivityChart } from "../composables/useActivityChart";

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

const { activityChartData, updateChartDayHighlight } = useActivityChart();

const handleLogout = async () => {
  await auth.logout();
  router.push("/login");
};

const navigateToProfile = () => router.push("/perfil");
const navigateToMembership = () => router.push("/Planes");
const navigateToNutrition = () => router.push("/nutrition-plan");
const navigateToRutinas = () => router.push("/rutinas");
const navigateToQR = () => router.push({ path: "/qr", query: { fromHome: "1" } });

const handleImageError = (imageEvent: Event) => {
  const targetElement = imageEvent.target as HTMLImageElement;
  targetElement.src = "";
};

onIonViewWillEnter(() => auth.user?.userId && loadMemberships());
onMounted(() => {
  updateChartDayHighlight();
  if (auth.user?.userId) loadMemberships();
});
watch(() => auth.user?.userId, (id) => id && loadMemberships());
</script>

<style scoped src="../theme/HomePage.css"></style>
