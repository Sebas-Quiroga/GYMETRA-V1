import { ref, onMounted, nextTick, reactive, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../auth/store/auth'
import { apiAuthRequest, MEMBERSHIP_API_URL } from '../../shared/services/apiService'
import { checkmarkCircle, alertCircle, warningOutline, informationCircle } from 'ionicons/icons'

import { useNotification } from '../../shared/composables/useNotification'

const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  API_BASE_URL: MEMBERSHIP_API_URL
}

export function usePayment() {
  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()
  const { showNotification, notification, dismissNotification } = useNotification()

  const membership = ref<any>(null)
  const paymentProcessing = ref(false)
  const stripeAvailable = ref(false)

  let stripe: any = null
  let elements: any = null
  let cardElement: any = null

  const initializeStripe = async () => {
    try {
      if (!(window as any).Stripe) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.stripe.com/checkout.js';
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
      return false
    }
  }

  const setupStripeElements = async () => {
    if (!stripe || !elements) return
    await nextTick()
    const container = document.getElementById('stripe-card-element')
    if (container && container.childElementCount === 0) {

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


  return {
    membership,
    paymentProcessing,
    stripeAvailable,
    notification,
    processPayment,
    dismissNotification
  }
}
