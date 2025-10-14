<template>
  <ion-page>
    <ion-content class="payment-content">
      <!-- Toast de notificación personalizado -->
      <div v-if="notification.show" class="notification-toast" :class="notification.type">
        <div class="notification-content">
          <ion-icon :icon="notification.icon" class="notification-icon"></ion-icon>
          <div class="notification-text">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.message }}</p>
          </div>
          <ion-button fill="clear" size="small" @click="dismissNotification">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </div>
        <div class="notification-progress" :style="{ width: notification.progress + '%' }"></div>
      </div>

      <div class="payment-header">
        <button class="back-btn" @click="$router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#07B7E0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span class="payment-title">Pago de Membresía</span>
      </div>

      <div class="payment-form-container" v-if="membership">
        <div class="purchase-summary">
          <h4>Resumen de Compra</h4>
          <p><strong>Membresía:</strong> {{ membership.planName }}</p>
          <p><strong>Duración:</strong> {{ formatDuration(membership.durationDays) }}</p>
          <p class="total-price"><strong>Total:</strong> ${{ formatPrice(membership.price) }} USD</p>
        </div>

        <!-- NOTA: Ya no se muestra el campo de ID ni el de Código Postal -->
        <form @submit.prevent="processPayment" class="payment-form">
          <div class="form-group">
            <label>Información de Pago</label>
            <div v-if="!stripeAvailable" class="test-mode-notice">
              🧪 Modo de Prueba - No se requiere tarjeta
            </div>
            <div v-else>
              <div id="stripe-card-element" class="stripe-element"></div>
              <small class="help-text">El código postal se ingresa directamente en la pasarela de pago.</small>
            </div>
          </div>

          <button type="submit" class="pay-btn" :disabled="paymentProcessing" :class="{ 'processing': paymentProcessing }">
            <span v-if="paymentProcessing"><div class="btn-spinner"></div>Procesando...</span>
            <span v-else>💳 Pagar Ahora</span>
          </button>
        </form>


      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, reactive, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon, IonButton } from '@ionic/vue';
import { formatPrice, formatDuration } from '@/services/membershipService';
import { useAuth } from '@/composables/useAuth';
import { checkmarkCircle, alertCircle, warningOutline, informationCircle, closeOutline } from 'ionicons/icons';
import "@/theme/PasarelaPago.css";

const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_51S9c29RPJMMOJ1bv1BejUA5NyJ7gsg0rvFcEjdAa8JuyMI7Zs3S9aCklSsGvTfGE2rVa6fhbwug33zIqK7b1ni8M00SLlPxKFx',
  API_BASE_URL: 'http://localhost:8081/api'
};

const route = useRoute();
const router = useRouter();
const { userInfo } = useAuth();

const membership = ref<any>(null);

// Ya no se piden por UI; userId va oculto (sesión), ZIP se toma de Stripe Element
const paymentData = ref({
  userId: userInfo.value?.userId || null
});

const paymentProcessing = ref(false);
const stripeAvailable = ref(false);
const cardError = ref('');

// Estado de notificaciones
const notification = reactive({
  show: false,
  type: 'info' as 'success' | 'error' | 'warning' | 'info',
  title: '',
  message: '',
  icon: informationCircle,
  progress: 0,
  duration: 5000,
});

// Variables para los timers de notificación
let notificationTimer: NodeJS.Timeout | null = null;
let notificationProgressTimer: NodeJS.Timeout | null = null;

let stripe: any = null;
let elements: any = null;
let cardElement: any = null;

// Funciones de notificación
const showNotification = (
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message: string,
  duration: number = 5000
) => {
  // Limpiar timers previos
  if (notificationTimer) clearTimeout(notificationTimer);
  if (notificationProgressTimer) clearInterval(notificationProgressTimer);

  // Configurar icono según el tipo
  const icons = {
    success: checkmarkCircle,
    error: alertCircle,
    warning: warningOutline,
    info: informationCircle,
  };

  // Configurar notificación
  notification.type = type;
  notification.title = title;
  notification.message = message;
  notification.icon = icons[type];
  notification.duration = duration;
  notification.progress = 0;
  notification.show = true;

  // Animar barra de progreso
  const progressInterval = 50; // 50ms
  const progressStep = (progressInterval / duration) * 100;
  
  notificationProgressTimer = setInterval(() => {
    notification.progress += progressStep;
    if (notification.progress >= 100) {
      dismissNotification();
    }
  }, progressInterval);

  // Auto-dismiss después del tiempo especificado
  notificationTimer = setTimeout(() => {
    dismissNotification();
  }, duration);
};

const dismissNotification = () => {
  if (notificationTimer) clearTimeout(notificationTimer);
  if (notificationProgressTimer) clearInterval(notificationProgressTimer);
  notification.show = false;
  notification.progress = 0;
};

onMounted(async () => {
  // Recibe el plan por query params (como JSON string)
  const planParam = route.query.plan as string;
  if (planParam) {
    try {
      membership.value = JSON.parse(decodeURIComponent(planParam));
    } catch {
      membership.value = null;
      showNotification('warning', 'Plan no encontrado', 'No se encontró información del plan seleccionado', 5000);
      router.push('/planes');
      return;
    }
  }

  // Validar sesión para tener userId
  if (!userInfo.value?.userId) {
    // si no hay sesión, envía a login
    router.push('/login');
    return;
  } else {
    paymentData.value.userId = userInfo.value.userId;
  }

  await initializeStripe();
  if (stripeAvailable.value) {
    setTimeout(() => {
      setupStripeElements();
    }, 100);
  }
});

const initializeStripe = async () => {
  try {
    if (!window.Stripe) return false;
    if (STRIPE_CONFIG.PUBLISHABLE_KEY.startsWith('pk_test_') || STRIPE_CONFIG.PUBLISHABLE_KEY.startsWith('pk_live_')) {
      stripe = window.Stripe(STRIPE_CONFIG.PUBLISHABLE_KEY);
      elements = stripe.elements();
      stripeAvailable.value = true;
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
};

const setupStripeElements = async () => {
  if (!stripe || !elements) return;
  await nextTick();
  const cardElementContainer = document.getElementById('stripe-card-element');
  if (cardElementContainer && !cardElement) {
    cardElement = elements.create('card', {
      // Aseguramos que el ZIP se pida dentro del widget de Stripe
      hidePostalCode: false,
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': { color: '#aab7c4' },
        },
      },
    });
    cardElement.mount('#stripe-card-element');
    cardElement.on('change', (event: any) => {
      if (event.error) {
        showNotification('warning', 'Error en la tarjeta', event.error.message, 5000);
      }
    });
  }
};

const processPayment = async () => {
  if (!membership.value) return;

  // Validar que tengamos userId desde la sesión
  if (!paymentData.value.userId || parseInt(String(paymentData.value.userId)) < 1) {
    showNotification('warning', 'Sesión requerida', 'Debes iniciar sesión para continuar con el pago', 5000);
    router.push('/login');
    return;
  }

  paymentProcessing.value = true;
  try {
    if (stripeAvailable.value && cardElement) {
      await processStripePayment();
    } else {
      await simulatePayment();
    }
  } catch (error: any) {
    showNotification('error', 'Error en el pago', error?.message || 'Error desconocido', 5000);
  } finally {
    paymentProcessing.value = false;
  }
};

const processStripePayment = async () => {
  if (!membership.value || !stripe || !cardElement) return;

  // 1. Crear PaymentIntent en backend
  const response = await fetch(`${STRIPE_CONFIG.API_BASE_URL}/payments/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      membershipId: membership.value.membershipId,
      userId: parseInt(String(paymentData.value.userId))
    })
  });
  if (!response.ok) throw new Error('Error al crear PaymentIntent');
  const { clientSecret } = await response.json();

  // 2. Confirmar pago con Stripe
  // IMPORTANTE: no pasamos postal_code; Stripe utiliza el que el usuario ingresó en el Card Element
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement
      // billing_details opcional; si no ponemos address.postal_code, Stripe toma el del widget
    }
  });
  if (error) {
    showNotification('error', 'Error en el pago', error.message, 5000);
    throw error;
  }

  // 3. Confirmar en backend (asociar membresía al usuario)
  const confirmResponse = await fetch(`${STRIPE_CONFIG.API_BASE_URL}/payments/confirm-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentIntentId: paymentIntent.id,
      membershipId: membership.value.membershipId,
      userId: parseInt(String(paymentData.value.userId))
    })
  });
  if (!confirmResponse.ok) {
    showNotification('error', 'Error en la confirmación', 'No se pudo confirmar el pago en el servidor', 5000);
    throw new Error('Error al confirmar en backend');
  }

  showNotification('success', '¡Pago exitoso!', 'La membresía ha sido activada correctamente', 5000);
  setTimeout(() => {
    router.push('/');
  }, 2000);
};

const simulatePayment = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  showNotification('success', '¡Pago exitoso!', 'La membresía ha sido activada correctamente', 5000);
  setTimeout(() => {
    router.push('/');
  }, 2000);
};

const goToHome = () => {
  router.push('/');
};

onUnmounted(() => {
  if (notificationTimer) clearTimeout(notificationTimer);
  if (notificationProgressTimer) clearInterval(notificationProgressTimer);
});
</script>
