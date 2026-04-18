<template>
  <ion-page>

    <!-- Notificación toast -->
    <Transition name="slide-notif">
      <div
        v-if="notification.show"
        class="pago-toast"
        :class="'toast-' + notification.type"
        role="alert"
        aria-live="assertive"
      >
        <div class="pago-toast-body">
          <ion-icon :icon="notification.icon" class="toast-icon" aria-hidden="true"></ion-icon>
          <div class="toast-text">
            <strong>{{ notification.title }}</strong>
            <span>{{ notification.message }}</span>
          </div>
          <button class="toast-close" @click="dismissNotification" aria-label="Cerrar">
            <ion-icon :icon="closeCircle"></ion-icon>
          </button>
        </div>
        <div class="toast-bar">
          <div class="toast-bar-fill" :class="'bar-' + notification.type" :style="{ width: notification.progress + '%' }"></div>
        </div>
      </div>
    </Transition>

    <!-- Header KINETIC Dynamic -->
    <div class="pago-header" role="banner">
      <div class="header-side header-left">
        <button class="pago-back-btn" @click="$router.push('/planes')" aria-label="Volver">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      <router-link to="/home" class="pago-logo-link" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="header-logo-text">{{ APP_NAME }}</span>
      </router-link>

      <div class="header-side header-right">
        <span class="pago-header-step" aria-hidden="true">Pago Seguro</span>
      </div>
    </div>

    <ion-content class="pago-content">
      <div class="pago-container">

        <!-- Hero visual -->
        <section class="pago-hero" aria-label="Imagen de presentación">
          <div class="pago-hero-img-wrap">
            <div class="pago-hero-img-placeholder" aria-hidden="true">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
              </svg>
            </div>
            <div class="pago-hero-overlay">
              <span class="pago-hero-badge">Pago Seguro SSL</span>
              <h2 class="pago-hero-tagline">Estás a un paso de tu mejor versión</h2>
            </div>
          </div>
        </section>

        <!-- Resumen de compra -->
        <section class="pago-section" v-if="membership">
          <div class="pago-summary-card" aria-label="Resumen de compra">
            <div class="pago-summary-left">
              <p class="pago-summary-eyebrow">Membresía Seleccionada</p>
              <h3 class="pago-summary-name">{{ membership.planName }}</h3>
              <div class="pago-summary-meta">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>Acceso por {{ formatDuration(membership.durationDays) }}</span>
              </div>
            </div>
            <div class="pago-summary-right">
              <p class="pago-summary-total-label">Subtotal Final</p>
              <p class="pago-summary-total">${{ formatPrice(membership.price) }}</p>
              <p class="pago-summary-currency">Pesos Colombianos (COP)</p>
            </div>
          </div>
        </section>

        <!-- Formulario de pago -->
        <section v-if="membership" class="pago-section">
          <div class="pago-form-header">
            <div class="pago-form-header-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <h3 class="pago-form-title">Detalles de la Tarjeta</h3>
          </div>

          <form @submit.prevent="processPayment" class="pago-form" novalidate>
            <div class="pago-field-group">
              <label class="pago-label">Número, Expiración y CVC</label>
              <div id="stripe-card-element" class="pago-stripe-element" aria-label="Campo de tarjeta de crédito"></div>
              <p class="pago-help-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Tus datos están protegidos con cifrado de grado bancario.
              </p>
            </div>

            <!-- Trust badges -->
            <div class="pago-trust" aria-label="Garantía de seguridad">
              <div class="pago-trust-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <span class="pago-trust-label">Transacción procesada por Stripe®</span>
            </div>
          </form>
        </section>

      </div>

      <!-- Barra fija de acción -->
      <div class="pago-action-bar" v-if="membership">
        <button
          class="pago-pay-btn"
          :class="{ 'pago-pay-btn-processing': paymentProcessing }"
          :disabled="paymentProcessing || !stripeAvailable"
          @click="processPayment"
        >
          <div v-if="paymentProcessing" class="pago-btn-spinner"></div>
          <span v-else>Confirmar y Pagar</span>
        </button>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, reactive, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { formatPrice, formatDuration } from '@/services/membershipService'
import { useAuthStore } from '@/stores/auth'
import { apiAuthRequest, MEMBERSHIP_API_URL } from '@/services/apiService'
import { APP_NAME } from '@/config/branding'
import {
  checkmarkCircle, alertCircle, warningOutline,
  informationCircle, closeCircle
} from 'ionicons/icons'

const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_51S9c29RPJMMOJ1bv1BejUA5NyJ7gsg0rvFcEjdAa8JuyMI7Zs3S9aCklSsGvTfGE2rVa6fhbwug33zIqK7b1ni8M00SLlPxKFx',
  API_BASE_URL: MEMBERSHIP_API_URL
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const membership = ref<any>(null)
const paymentProcessing = ref(false)
const stripeAvailable = ref(false)

// ─── Notificaciones ───
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

// ─── Stripe ───
let stripe: any = null
let elements: any = null
let cardElement: any = null

const initializeStripe = async () => {
  try {
    if (!(window as any).Stripe) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://js.stripe.com/v3/'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }
    const stripeScript = (window as any).Stripe
    if (!stripeScript) return false
    stripe = stripeScript(STRIPE_CONFIG.PUBLISHABLE_KEY)
    elements = stripe.elements()
    stripeAvailable.value = true
    return true
  } catch (e) {
    console.error('Error initializing Stripe:', e)
    return false
  }
}

const setupStripeElements = async () => {
  if (!stripe || !elements) return
  await nextTick()
  const container = document.getElementById('stripe-card-element')
  if (container && container.childElementCount === 0) {
    try {
      // Detectar si el sistema prefiere modo oscuro
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      cardElement = elements.create('card', {
        hidePostalCode: false,
        style: {
          base: {
            fontSize: '16px',
            color: isDarkMode ? '#f8fafc' : '#191c1d',
            fontFamily: '"Outfit", "Inter", sans-serif',
            '::placeholder': { color: isDarkMode ? '#94a3b8' : '#6d797c' },
            iconColor: isDarkMode ? '#22d3ee' : '#006876',
          },
          invalid: { color: '#ba1a1a' },
        },
      })
      cardElement.mount('#stripe-card-element')
    } catch (err) {
      console.error('Error mounting Stripe Card:', err)
    }
  }
}

const processPayment = async () => {
  if (!membership.value || !auth.user?.userId) return
  if (!stripeAvailable.value) {
    showNotification('error', 'Error', 'La pasarela no está disponible')
    return
  }
  paymentProcessing.value = true
  try {
    const response = await apiAuthRequest(`${STRIPE_CONFIG.API_BASE_URL}/payments/create-payment-intent`, {
      method: 'POST',
      body: JSON.stringify({
        membershipId: membership.value.membershipId,
        userId: auth.user?.userId
      })
    })
    if (!response.success) throw new Error(response.message)

    const { clientSecret } = response.data
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    })
    if (error) throw error

    const confirmRes = await apiAuthRequest(`${STRIPE_CONFIG.API_BASE_URL}/payments/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify({
        paymentIntentId: paymentIntent.id,
        membershipId: membership.value.membershipId,
        userId: auth.user?.userId
      })
    })
    if (!confirmRes.success) throw new Error('Error al confirmar en el servidor')

    showNotification('success', '¡Pago exitoso!', 'Membresía activada correctamente', 5000)
    setTimeout(() => router.push('/home'), 2000)
  } catch (error: any) {
    showNotification('error', 'Error en el pago', error?.message || 'Error desconocido')
  } finally {
    paymentProcessing.value = false
  }
}

// ─── Ciclo de vida ───
onMounted(async () => {
  const planParam = route.query.plan as string
  if (planParam) {
    try {
      membership.value = JSON.parse(decodeURIComponent(planParam))
    } catch {
      showNotification('warning', 'Plan no encontrado', 'No se encontró información del plan')
      router.push('/planes')
      return
    }
  }

  if (!auth.user?.userId) {
    showNotification('error', 'Sesión requerida', 'Debes iniciar sesión para realizar un pago')
    router.push('/login')
    return
  }

  await initializeStripe()
  if (stripeAvailable.value) {
    let retries = 0
    const tryMount = () => {
      if (retries > 10) return
      setupStripeElements()
      const container = document.getElementById('stripe-card-element')
      if (!container || container.childElementCount === 0) {
        retries++
        setTimeout(tryMount, 500)
      }
    }
    setTimeout(tryMount, 300)
  }
})

onUnmounted(() => {
  if (notifTimer) clearTimeout(notifTimer)
  if (notifProgressTimer) clearInterval(notifProgressTimer)
})
</script>

<style src="../theme/PasarelaPago.css"></style>