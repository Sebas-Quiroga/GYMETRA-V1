<template>
  <ion-page>
    <!-- Header estilo KINETIC -->
    <div class="home-header" role="banner">
      <div class="home-header-left">
        <div class="home-avatar-wrap" @click="navigateToProfile" tabindex="0" role="button" aria-label="Ir al perfil">
          <img
            v-if="profilePhoto"
            :src="profilePhoto"
            alt="Foto de perfil"
            class="home-avatar-img"
            @error="handleImageError"
            loading="lazy"
          />
          <div v-else class="home-avatar-fallback">
            {{ firstName.charAt(0) }}
          </div>
        </div>
      </div>

      <router-link to="/home" class="home-logo-link" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="header-logo-text">{{ APP_NAME }}</span>
      </router-link>

      <div class="home-header-right">
        <button class="home-logout-btn" @click="logout" aria-label="Cerrar sesión">
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

        <!-- Welcome -->
        <section class="home-welcome">
          <h1 class="home-welcome-name">Hola, {{ firstName }}</h1>
          <p class="home-welcome-sub">{{ greeting }}</p>
        </section>

        <!-- Bento grid -->
        <div class="home-bento">

          <!-- Card hero: membresía -->
          <div class="bento-membership" :class="getMembershipCardClass" aria-label="Días restantes de membresía">
            <span class="membership-badge">Membresía Activa</span>
            <div class="membership-days-row">
              <span class="membership-days" aria-live="polite">{{ daysRemaining }}</span>
              <span class="membership-days-label">{{ daysRemainingLabel }}</span>
            </div>
            <!-- Barra de progreso -->
            <div class="membership-bar-bg">
              <div class="membership-bar-fill" :style="{ width: membershipProgress + '%' }"></div>
            </div>
            <!-- Decorativo -->
            <div class="membership-glow" aria-hidden="true"></div>
          </div>

          <!-- Botón QR -->
          <button
            class="bento-qr"
            @click="navigateToQR"
            aria-label="Check-in QR"
          >
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

          <!-- Banner CTA Premium: Adquirir Plan -->
          <div
            class="bento-cta"
            @click="navigateToMembership"
            tabindex="0"
            role="button"
            aria-label="Adquirir plan de entrenamiento"
          >
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

          <!-- Gráfica semanal -->
          <div class="bento-chart" aria-label="Tiempo entrenado semanal">
            <div class="bento-chart-header">
              <div>
                <h3 class="bento-chart-title">Tiempo Entrenado</h3>
                <p class="bento-chart-sub">Actividad semanal</p>
              </div>
              <div class="bento-chart-total">
                <span class="bento-chart-total-num">12.4h</span>
                <span class="bento-chart-total-label">Total Semanal</span>
              </div>
            </div>
            <div class="bento-chart-bars" role="img" aria-label="Gráfica de barras semanal">
              <div
                v-for="(bar, index) in chartData"
                :key="index"
                class="chart-col"
              >
                <div
                  class="chart-bar"
                  :class="bar.isActive ? 'chart-bar-active' : 'chart-bar-inactive'"
                  :style="{ height: (bar.height / 100) * 160 + 'px' }"
                  :aria-label="bar.day + ': ' + bar.height + '%'"
                  role="presentation"
                ></div>
                <span class="chart-day" :class="bar.isActive ? 'chart-day-active' : ''">{{ bar.day }}</span>
              </div>
            </div>
          </div>

          <!-- Card ejercicios: redirige a RutinasView -->
          <div
            class="bento-action-card"
            @click="navigateToRutinas"
            tabindex="0"
            role="button"
            aria-label="Ver mis planes de entrenamiento"
          >
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

          <!-- Card nutrición / info extra -->
          <div class="bento-action-card" @click="navigateToNutrition" tabindex="0" role="button" aria-label="Plan nutricional">
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
import { ref, computed, onMounted, watch } from "vue"
import { IonPage, IonContent, onIonViewWillEnter } from "@ionic/vue"
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "vue-router"
import { apiAuthRequest, MEMBERSHIP_API_URL } from "@/services/apiService"
import { APP_NAME } from "@/config/branding"

const auth = useAuthStore()
const router = useRouter()

// --- Usuario ---
const firstName = computed(() => auth.user?.firstName || "Usuario")
const lastName = computed(() => auth.user?.lastName || "")
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

const profilePhoto = computed(() => {
  const url = auth.user?.photoUrl
  if (!url) return null
  return url.startsWith("data:") || url.startsWith("http")
    ? url
    : `data:image/jpeg;base64,${url}`
})

const greeting = computed(() => {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  return `${days[new Date().getDay()]} activo · Tu progreso hoy es excepcional.`
})

// --- Navegación ---
const logout = async () => { await auth.logout(); router.push("/login") }
const navigateToProfile = () => router.push("/perfil")
const navigateToMembership = () => router.push("/Planes")
const navigateToNutrition = () => router.push("/nutrition-plan")
const navigateToRutinas = () => router.push("/rutinas")
const navigateToQR = () => router.push({ path: "/qr", query: { fromHome: "1" } })
const handleImageError = (e: any) => { e.target.src = "" }

// --- Membresías ---
const userMemberships = ref<any[]>([])
const loadingMemberships = ref(false)

const loadUserMemberships = async () => {
  if (!auth.user?.userId) return
  loadingMemberships.value = true
  try {
    const response = await apiAuthRequest(
      `${MEMBERSHIP_API_URL}/user-memberships/user/${auth.user.userId}`
    )
    if (response.success && response.data) {
      userMemberships.value = (Array.isArray(response.data) ? response.data : [])
        .filter((m: any) => m.status?.toUpperCase() === "ACTIVE")
        .sort((a: any, b: any) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
    }
  } catch (e) {
    console.error("Error cargando membresías:", e)
  } finally {
    loadingMemberships.value = false
  }
}

const daysRemaining = computed(() => {
  if (loadingMemberships.value) return "--"
  if (!userMemberships.value.length) return "0"
  const m = userMemberships.value[0]
  if (!m?.endDate) return "0"
  const end = new Date(m.endDate)
  const today = new Date()
  end.setHours(23, 59, 59, 999); today.setHours(0, 0, 0, 0)
  const diff = end.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diff / 86400000)).toString()
})

const daysRemainingLabel = computed(() => {
  if (loadingMemberships.value) return "Cargando..."
  const d = parseInt(daysRemaining.value)
  if (isNaN(d) || d === 0) return "Sin membresía activa"
  return d === 1 ? "Día restante" : "Días restantes"
})

const membershipProgress = computed(() => {
  const d = parseInt(daysRemaining.value)
  if (isNaN(d) || d === 0) return 0
  return Math.min(100, Math.round((d / 365) * 100))
})

const isDaysCritical = computed(() => {
  const d = parseInt(daysRemaining.value); return !isNaN(d) && d > 0 && d <= 3
})
const isDaysWarning = computed(() => {
  const d = parseInt(daysRemaining.value); return !isNaN(d) && d > 3 && d <= 7
})

const getMembershipCardClass = computed(() => {
  const d = parseInt(daysRemaining.value)
  if (loadingMemberships.value) return "state-loading"
  if (isNaN(d) || d === 0) return "state-none"
  if (d <= 3) return "state-critical"
  if (d <= 7) return "state-warning"
  return "state-active"
})

// --- Gráfica ---
const chartData = ref([
  { day: "L", height: 60, isActive: false },
  { day: "M", height: 80, isActive: false },
  { day: "X", height: 50, isActive: false },
  { day: "J", height: 100, isActive: false },
  { day: "V", height: 70, isActive: false },
  { day: "S", height: 90, isActive: false },
  { day: "D", height: 30, isActive: false },
])

const updateChartForCurrentDay = () => {
  const names = ["D", "L", "M", "X", "J", "V", "S"]
  const today = names[new Date().getDay()]
  chartData.value = chartData.value.map(b => ({ ...b, isActive: b.day === today }))
}

// --- Ciclo de vida ---
onIonViewWillEnter(async () => { if (auth.user?.userId) await loadUserMemberships() })
onMounted(() => { updateChartForCurrentDay() })
watch(() => auth.user?.userId, (id) => { if (id) loadUserMemberships() })
</script>

<style scoped>
@import '../theme/HomePage.css';
</style>