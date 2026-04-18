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

        <form @submit.prevent="processPayment" class="payment-form">
          <div class="form-group">
            <label>Información de Pago</label>
            <div id="stripe-card-element" class="stripe-element"></div>
            <small class="help-text">El código postal se ingresa directamente en la pasarela de pago.</small>
          </div>

          <button type="submit" class="pay-btn" :disabled="paymentProcessing || !stripeAvailable" :class="{ 'processing': paymentProcessing }">
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
import { useAuthStore } from '@/stores/auth';
import { apiAuthRequest } from '@/services/apiService';
import { checkmarkCircle, alertCircle, warningOutline, informationCircle, closeOutline } from 'ionicons/icons';
import "@/theme/PasarelaPago.css";
import { HOST_URL } from"../services/hots";

const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_51S9c29RPJMMOJ1bv1BejUA5NyJ7gsg0rvFcEjdAa8JuyMI7Zs3S9aCklSsGvTfGE2rVa6fhbwug33zIqK7b1ni8M00SLlPxKFx',
  API_BASE_URL: `${HOST_URL}:8081/api`
};

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const membership = ref<any>(null);

const paymentProcessing = ref(false);
const stripeAvailable = ref(false);

const notification = reactive({
  show: false,
  type: 'info' as 'success' | 'error' | 'warning' | 'info',
  title: '',
  message: '',
  icon: informationCircle,
  progress: 0,
  duration: 5000,
});

let notificationTimer: any = null;
let notificationProgressTimer: any = null;

let stripe: any = null;
let elements: any = null;
let cardElement: any = null;

const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration: number = 5000) => {
  if (notificationTimer) clearTimeout(notificationTimer);
  if (notificationProgressTimer) clearInterval(notificationProgressTimer);
  notification.type = type;
  notification.title = title;
  notification.message = message;
  notification.icon = { success: checkmarkCircle, error: alertCircle, warning: warningOutline, info: informationCircle }[type];
  notification.duration = duration;
  notification.progress = 0;
  notification.show = true;
  const progressInterval = 50;
  const progressStep = (progressInterval / duration) * 100;
  notificationProgressTimer = setInterval(() => {
    notification.progress += progressStep;
    if (notification.progress >= 100) dismissNotification();
  }, progressInterval);
  notificationTimer = setTimeout(() => dismissNotification(), duration);
};

const dismissNotification = () => {
  if (notificationTimer) clearTimeout(notificationTimer);
  if (notificationProgressTimer) clearInterval(notificationProgressTimer);
  notification.show = false;
};

onMounted(async () => {
  const planParam = route.query.plan as string;
  if (planParam) {
    try {
      membership.value = JSON.parse(decodeURIComponent(planParam));
    } catch {
      showNotification('warning', 'Plan no encontrado', 'No se encontró información del plan', 5000);
      router.push('/planes');
      return;
    }
  }

  if (!auth.user?.userId) {
    showNotification('error', 'Sesión requerida', 'Debes iniciar sesión para realizar un pago', 5000);
    router.push('/login');
    return;
  }

  await initializeStripe();
  if (stripeAvailable.value) {
    // Intentar montar con reintentos si es necesario
    let retries = 0;
    const tryMount = () => {
      if (retries > 10) return;
      setupStripeElements();
      const container = document.getElementById('stripe-card-element');
      if (!container || container.childElementCount === 0) {
        retries++;
        setTimeout(tryMount, 500);
      }
    };
    setTimeout(tryMount, 300);
  }
});

const initializeStripe = async () => {
  try {
    // 1. Asegurar que el script de Stripe esté cargado
    if (!(window as any).Stripe) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const stripeScript = (window as any).Stripe;
    if (!stripeScript) return false;
    
    stripe = stripeScript(STRIPE_CONFIG.PUBLISHABLE_KEY);
    elements = stripe.elements();
    stripeAvailable.value = true;
    return true;
  } catch (e) {
    console.error('❌ Error initializing Stripe:', e);
    return false;
  }
};

const setupStripeElements = async () => {
  if (!stripe || !elements) return;
  await nextTick();
  
  const container = document.getElementById('stripe-card-element');
  if (container && container.childElementCount === 0) {
    try {
      cardElement = elements.create('card', {
        hidePostalCode: false,
        style: { 
          base: { 
            fontSize: '16px', 
            color: '#ffffff', // Texto Blanco
            fontFamily: '"Nunito", sans-serif',
            '::placeholder': { color: '#aab7c4' } 
          },
          invalid: {
            color: '#e74c3c',
          }
        },
      });
      cardElement.mount('#stripe-card-element');
      console.log('✅ Stripe Card Element montado');
    } catch (err) {
      console.error('❌ Error mounting Stripe Card:', err);
    }
  }
};

const processPayment = async () => {
  if (!membership.value || !auth.user?.userId) return;
  if (!stripeAvailable.value) {
    showNotification('error', 'Error', 'La pasarela no está disponible', 5000);
    return;
  }
  paymentProcessing.value = true;
  try {
    const response = await apiAuthRequest(`${STRIPE_CONFIG.API_BASE_URL}/payments/create-payment-intent`, {
      method: 'POST',
      body: JSON.stringify({ membershipId: membership.value.membershipId, userId: auth.user?.userId })
    });
    if (!response.success) throw new Error(response.message);
    
    const { clientSecret } = response.data;
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } });
    if (error) throw error;

    const confirmRes = await apiAuthRequest(`${STRIPE_CONFIG.API_BASE_URL}/payments/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId: paymentIntent.id, membershipId: membership.value.membershipId, userId: auth.user?.userId })
    });
    if (!confirmRes.success) throw new Error('Error al confirmar en el servidor');

    showNotification('success', '¡Pago exitoso!', 'Membresía activada', 5000);
    setTimeout(() => router.push('/'), 2000);
  } catch (error: any) {
    showNotification('error', 'Error en el pago', error?.message || 'Error desconocido', 5000);
  } finally {
    paymentProcessing.value = false;
  }
};

onUnmounted(() => {
  if (notificationTimer) clearTimeout(notificationTimer);
  if (notificationProgressTimer) clearInterval(notificationProgressTimer);
});
</script>

<style scoped>
@import '../theme/PasarelaPago.css';
</style>
