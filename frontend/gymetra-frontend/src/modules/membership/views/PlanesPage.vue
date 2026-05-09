<template>
  <ion-page>
    <Transition name="slide-notif">
      <div
        v-if="notification.show"
        class="notif-toast"
        :class="'notif-' + notification.type"
        role="alert"
        aria-live="assertive"
      >
        <div class="notif-body">
          <ion-icon :icon="notification.icon" class="notif-icon" aria-hidden="true"></ion-icon>
          <div class="notif-text">
            <strong>{{ notification.title }}</strong>
            <span>{{ notification.message }}</span>
          </div>
          <button class="notif-close" @click="dismissNotification" aria-label="Cerrar notificación">
            <ion-icon :icon="closeCircle"></ion-icon>
          </button>
        </div>
        <div class="notif-progress-bar">
          <div class="notif-progress-fill" :class="'fill-' + notification.type" :style="{ width: notification.progress + '%' }"></div>
        </div>
      </div>
    </Transition>
    <div class="planes-header" role="banner">
      <div class="planes-header-left">
        <button class="planes-back-btn" @click="$router.push('/home')" aria-label="Volver">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>
      <router-link to="/home" class="planes-logo-link" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="header-logo-text">{{ APP_NAME }}</span>
      </router-link>
      <div class="planes-header-right">
        <div class="header-status-dot" aria-hidden="true"></div>
        <button class="planes-logout-btn" @click="logout" aria-label="Cerrar sesión">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
    <ion-content class="planes-content" role="main" aria-label="Listado de planes">
      <div class="planes-container">
        <div class="planes-hero">
          <p class="planes-hero-eyebrow">Rendimiento de Élite</p>
          <h1 class="planes-hero-title">ELIGE TU <span class="planes-hero-accent">MOMENTO.</span></h1>
          <p class="planes-hero-sub">Diseñamos planes que se adaptan a tu disciplina. Sin contratos, sin límites, solo potencia pura para alcanzar tus objetivos.</p>
        </div>
        <div v-if="loading" class="planes-loading" role="status">
          <div class="planes-spinner" aria-label="Cargando"></div>
          <p>Cargando planes disponibles...</p>
        </div>
        <div v-else-if="error" class="planes-error" role="alert">
          <p>{{ error }}</p>
          <button class="planes-retry-btn" @click="loadMemberships" aria-label="Reintentar">Reintentar</button>
        </div>
        <div v-else-if="memberships.length === 0" class="planes-empty" role="status">
          <p>No hay planes disponibles en este momento.</p>
        </div>
        <div v-else class="planes-list" aria-label="Lista de planes disponibles">
          <div
            v-for="(membership, index) in memberships"
            :key="membership.membershipId"
            class="plan-card"
            :class="{
              'plan-card-featured': isFeatured(index),
              'plan-card-glass': !isFeatured(index)
            }"
            role="region"
            :aria-label="'Plan ' + membership.planName"
          >
            <div v-if="isFeatured(index)" class="plan-badge">MÁS POPULAR</div>
            <div class="plan-deco-icon" aria-hidden="true">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path :d="getIconPath(membership.durationDays)"/>
                <circle v-if="membership.durationDays > 186" cx="12" cy="8" r="7"/>
                <path v-if="membership.durationDays > 186" d="M8 21h8l-4-7z"/>
              </svg>
            </div>
            <div class="plan-content">
              <h3 class="plan-name" :class="isFeatured(index) ? 'plan-name-featured' : ''">
                {{ membership.planName }}
              </h3>
              <div class="plan-price-row">
                <span class="plan-price">${{ formatPrice(membership.price) }}</span>
                <span class="plan-period">/ {{ formatDuration(membership.durationDays) }}</span>
              </div>
              <p v-if="membership.description" class="plan-description">{{ membership.description }}</p>
              <ul class="plan-features" v-if="membership.features?.length" :aria-label="'Beneficios del plan ' + membership.planName">
                <li v-for="(feat, idx) in membership.features" :key="idx" class="plan-feature">
                  <span class="plan-check" :class="isFeatured(index) ? 'check-featured' : ''">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  {{ feat }}
                </li>
              </ul>
              <button
                class="plan-btn"
                :class="{
                  'plan-btn-featured': isFeatured(index),
                  'plan-btn-glass': !isFeatured(index)
                }"
                @click="selectPlan(membership)"
                :disabled="!isMembershipAvailable(membership) || purchasing"
              >
                <span v-if="!isMembershipAvailable(membership)">No disponible</span>
                <span v-else>Seleccionar Plan</span>
              </button>
            </div>
          </div>
        </div>
        <div v-if="!loading && memberships.length > 0" class="planes-compare">
          <button class="planes-compare-btn">
            Ver tabla comparativa detallada
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
      <div v-if="purchasing" class="purchase-overlay" role="alertdialog" aria-modal="true" aria-label="Procesando compra">
        <div class="purchase-modal-box">
          <div class="planes-spinner"></div>
          <p class="purchase-modal-title">Procesando tu compra...</p>
          <p class="purchase-modal-plan">{{ selectedPlanName }}</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { useAuthStore } from '../../auth/store/auth'
import { APP_NAME } from '../../shared/config/branding'
import {
  checkmarkCircle, alertCircle, warningOutline,
  informationCircle, closeCircle
} from 'ionicons/icons'
import {
  getAvailableMemberships,
  formatPrice,
  formatDuration,
  getMembershipIcon,
  isMembershipAvailable,
  type Membership
} from '../services/membershipService'
const auth = useAuthStore()
const router = useRouter()
const logout = () => { auth.clearToken(); router.push('/login') }
const notification = reactive({
  show: false,
  type: 'info' as 'success' | 'error' | 'warning' | 'info',
  title: '',
  message: '',
  icon: informationCircle,
  progress: 0,
  duration: 5000,
})
let notifTimer: any = null
let notifProgressTimer: any = null
const showNotification = (
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message: string,
  duration = 5000
) => {
  if (notifTimer) clearTimeout(notifTimer)
  if (notifProgressTimer) clearInterval(notifProgressTimer)
  const icons = { success: checkmarkCircle, error: alertCircle, warning: warningOutline, info: informationCircle }
  Object.assign(notification, { show: true, type, title, message, icon: icons[type], duration, progress: 0 })
  const step = (50 / duration) * 100
  notifProgressTimer = setInterval(() => {
    notification.progress += step
    if (notification.progress >= 100) dismissNotification()
  }, 50)
  notifTimer = setTimeout(dismissNotification, duration)
}
const dismissNotification = () => {
  if (notifTimer) clearTimeout(notifTimer)
  if (notifProgressTimer) clearInterval(notifProgressTimer)
  notification.show = false
}
const memberships = ref<Membership[]>([])
const loading = ref(false)
const error = ref('')
const purchasing = ref(false)
const selectedMembershipId = ref<number | null>(null)
const selectedPlanName = ref('')
const isFeatured = (index: number) => {
  if (memberships.value.length === 1) return true
  if (memberships.value.length === 2) return index === 0
  return index === 1
}
const beautifyMembership = (m: Membership): Membership => {
  const name = m.planName.toLowerCase()
  let newName = m.planName
  let newDesc = m.description || ''
  let newFeatures: string[] = ['Acceso a piso de gimnasio', 'App móvil incluida']
  if (name.includes('mensual')) {
    newName = 'Membresía Impulse'
    newDesc = 'La flexibilidad que necesitas para tu primer paso hacia la élite. Acceso total a todas nuestras áreas de entrenamiento.'
    newFeatures = [
      'Acceso total a piso de gimnasio',
      'Casillero diario incluido',
      'App KINETIC básica'
    ]
  } else if (name.includes('semestral')) {
    newName = 'Plan Discipline'
    newDesc = 'Consolida tu rendimiento. Seis meses de compromiso real con tu mejor versión, incluyendo seguimiento personalizado.'
    newFeatures = [
      'Todo lo de Impulse',
      '1 Sesión de Entrenamiento Personal',
      'Plan Nutricional Digital',
      'Evaluación física bimensual'
    ]
  } else if (name.includes('anual')) {
    newName = 'Acceso Legend'
    newDesc = 'Nuestra experiencia definitiva. Un año de transformación total con acceso VIP a servicios exclusivos y soporte prioritario.'
    newFeatures = [
      'Todo lo de Discipline',
      'Acceso a Spa & Sauna ilimitado',
      'Kit de bienvenida Legend',
      'Soporte prioritario 24/7'
    ]
  }
  return { ...m, planName: newName, description: newDesc, features: newFeatures }
}
const loadMemberships = async () => {
  if (!auth.token) { router.push('/login'); return }
  loading.value = true
  error.value = ''
  try {
    const data = await getAvailableMemberships()
    memberships.value = data.map(beautifyMembership)
  } catch (err: any) {
    error.value = err.message
    showNotification('error', 'Error al cargar planes', err.message)
  } finally {
    loading.value = false
  }
}
const selectPlan = (membership: Membership) => {
  if (!auth.token) { router.push('/login'); return }
  if (!isMembershipAvailable(membership)) {
    showNotification('warning', 'Plan no disponible', 'Intenta con otro plan.')
    return
  }
  selectedMembershipId.value = membership.membershipId
  selectedPlanName.value = membership.planName
  router.push({
    path: '/Pasarelapago',
    query: { plan: encodeURIComponent(JSON.stringify(membership)) }
  })
}
const getIconPath = (days: number): string => getMembershipIcon(days)
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
onMounted(loadMemberships)
onUnmounted(() => {
  if (notifTimer) clearTimeout(notifTimer)
  if (notifProgressTimer) clearInterval(notifProgressTimer)
})
</script>
<style src="../theme/PlanesPage.css"></style>

