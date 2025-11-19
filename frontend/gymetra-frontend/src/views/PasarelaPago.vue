<template>
  <ion-page>
    <!-- Toast de notificación personalizado - Usando Teleport para renderizar fuera del árbol de Ionic -->
    <Teleport to="body">
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
    </Teleport>

    <!-- Header con navegación -->
    <ion-header>
      <ion-toolbar color="primary" class="custom-toolbar" role="banner" aria-label="Encabezado principal">
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="$router.back()" aria-label="Volver">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="page-title" aria-label="Pago de Membresía">Pago de Membresía</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="payment-content">

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
import { useAuthStore } from '@/stores/auth'
import { checkmarkCircle, alertCircle, warningOutline, informationCircle, closeOutline, arrowBackOutline } from 'ionicons/icons';
import "@/theme/PasarelaPago.css";
import { getBackendUrl } from"../services/hots";

const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_51S9c29RPJMMOJ1bv1BejUA5NyJ7gsg0rvFcEjdAa8JuyMI7Zs3S9aCklSsGvTfGE2rVa6fhbwug33zIqK7b1ni8M00SLlPxKFx',
  API_BASE_URL: `${getBackendUrl(8081)}/api`
};

const route = useRoute();
const router = useRouter();
const auth = useAuthStore()

const membership = ref<any>(null);

// Ya no se piden por UI; userId va oculto (sesión), ZIP se toma de Stripe Element
const paymentData = ref({
  userId: auth.user?.userId || null
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
  console.log('🔔 showNotification llamado:', { type, title, message, duration });
  
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

  console.log('✅ Notificación configurada:', notification);
  console.log('✅ notification.show =', notification.show);

  // Forzar actualización del DOM
  nextTick(() => {
    console.log('✅ DOM actualizado, notification.show =', notification.show);
    const toastElement = document.querySelector('.notification-toast');
    console.log('✅ Elemento toast encontrado:', toastElement);
    if (toastElement) {
      console.log('✅ Estilos del toast:', window.getComputedStyle(toastElement));
    }
  });

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
  if (!auth.user?.userId) {
    // si no hay sesión, envía a login
    router.push('/login');
    return;
  } else {
    paymentData.value.userId = auth.user.userId;
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
    console.error('❌ Error en processPayment:', error);
    
    // Solo mostrar notificación si no se mostró una antes
    if (!notification.show) {
      // Verificar si es un error de red/CORS
      if (error?.message?.includes('CORS') || error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
        showNotification('error', 'Error de conexión', 'No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.', 7000);
      } else if (error?.message?.includes('timeout') || error?.message?.includes('504')) {
        showNotification('error', 'Tiempo de espera agotado', 'El servidor está tardando demasiado en responder. Intenta nuevamente.', 7000);
      } else if (!error?.code && !error?.decline_code) {
        // Solo mostrar si no es un error de Stripe (que ya tiene su notificación)
        showNotification('error', 'Error en el pago', error?.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.', 5000);
      }
    }
  } finally {
    paymentProcessing.value = false;
  }
};

const processStripePayment = async () => {
  if (!membership.value || !stripe || !cardElement) {
    showNotification('error', 'Error de configuración', 'No se pudo inicializar el sistema de pago', 5000);
    return;
  }

  try {
    // 1. Crear PaymentIntent en backend
    console.log('🔄 Creando PaymentIntent...');
    console.log('📍 URL:', `${STRIPE_CONFIG.API_BASE_URL}/payments/create-payment-intent`);
    console.log('📦 Datos:', {
      membershipId: membership.value.membershipId,
      userId: paymentData.value.userId
    });

    const response = await fetch(`${STRIPE_CONFIG.API_BASE_URL}/payments/create-payment-intent`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        membershipId: membership.value.membershipId,
        userId: parseInt(String(paymentData.value.userId))
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error desconocido');
      console.error('❌ Error al crear PaymentIntent:', response.status, errorText);
      
      if (response.status === 0 || response.status === 504) {
        showNotification('error', 'Error de conexión', 'El servidor no está respondiendo. Verifica que el backend esté corriendo.', 7000);
      } else if (response.status === 400) {
        showNotification('error', 'Error en la solicitud', errorText || 'Datos inválidos', 5000);
      } else {
        showNotification('error', 'Error al crear pago', `Error ${response.status}: ${errorText}`, 5000);
      }
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    const { clientSecret } = responseData;
    
    if (!clientSecret) {
      showNotification('error', 'Error en la respuesta', 'No se recibió el clientSecret del servidor', 5000);
      throw new Error('No se recibió clientSecret');
    }

    console.log('✅ PaymentIntent creado exitosamente');

    // 2. Confirmar pago con Stripe
    console.log('🔄 Confirmando pago con Stripe...');
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement
      }
    });

    if (error) {
      console.error('❌ Error de Stripe:', error);
      
      // Mensajes específicos según el tipo de error
      let errorMessage = error.message || 'Ocurrió un error al procesar el pago';
      let errorTitle = 'Error en el pago';
      
      // Verificar decline_code primero (más específico)
      const declineCode = error.decline_code || error.code;
      
      if (declineCode === 'insufficient_funds') {
        errorTitle = 'Fondos insuficientes';
        errorMessage = 'No hay fondos suficientes en la tarjeta. Por favor, usa otra tarjeta o verifica tu saldo.';
      } else if (error.code === 'card_declined') {
        errorTitle = 'Tarjeta rechazada';
        if (declineCode === 'generic_decline') {
          errorMessage = 'Tu tarjeta fue rechazada. Por favor, verifica los datos o contacta a tu banco.';
        } else if (declineCode === 'lost_card') {
          errorMessage = 'La tarjeta fue reportada como perdida. Usa otra tarjeta.';
        } else if (declineCode === 'stolen_card') {
          errorMessage = 'La tarjeta fue reportada como robada. Usa otra tarjeta.';
        } else {
          errorMessage = 'Tu tarjeta fue rechazada. Por favor, verifica los datos o usa otra tarjeta.';
        }
      } else if (error.code === 'expired_card') {
        errorTitle = 'Tarjeta expirada';
        errorMessage = 'La tarjeta ha expirado. Por favor, usa otra tarjeta.';
      } else if (error.code === 'incorrect_cvc' || error.code === 'incorrect_cvc') {
        errorTitle = 'Código de seguridad incorrecto';
        errorMessage = 'El código de seguridad (CVC) es incorrecto. Verifica e intenta nuevamente.';
      } else if (error.code === 'processing_error') {
        errorTitle = 'Error de procesamiento';
        errorMessage = 'Ocurrió un error al procesar el pago. Intenta nuevamente.';
      } else if (error.code === 'card_not_supported') {
        errorTitle = 'Tarjeta no soportada';
        errorMessage = 'Este tipo de tarjeta no es aceptada. Usa otra tarjeta.';
      }
      
      // Mostrar notificación inmediatamente
      console.log('📢 Mostrando notificación:', errorTitle, errorMessage);
      showNotification('error', errorTitle, errorMessage, 7000);
      
      // Esperar un momento para que la notificación se renderice antes de lanzar el error
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // No lanzar el error aquí, dejar que el catch lo maneje
      return;
    }

    if (!paymentIntent) {
      showNotification('error', 'Error en el pago', 'No se recibió confirmación del pago', 5000);
      throw new Error('No se recibió paymentIntent');
    }

    console.log('✅ Pago confirmado en Stripe:', paymentIntent.id);

    // 3. Confirmar en backend (asociar membresía al usuario)
    console.log('🔄 Confirmando pago en el backend...');
    const confirmResponse = await fetch(`${STRIPE_CONFIG.API_BASE_URL}/payments/confirm-payment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        paymentIntentId: paymentIntent.id,
        membershipId: membership.value.membershipId,
        userId: parseInt(String(paymentData.value.userId))
      })
    });

    if (!confirmResponse.ok) {
      const errorText = await confirmResponse.text().catch(() => 'Error desconocido');
      console.error('❌ Error al confirmar en backend:', confirmResponse.status, errorText);
      
      showNotification('error', 'Error en la confirmación', errorText || 'No se pudo confirmar el pago en el servidor', 7000);
      throw new Error(`Error al confirmar: ${errorText}`);
    }

    const confirmData = await confirmResponse.json();
    console.log('✅ Pago confirmado en backend:', confirmData);

    // Éxito
    showNotification('success', '¡Pago exitoso!', 'La membresía ha sido activada correctamente', 5000);
    setTimeout(() => {
      router.push('/');
    }, 2000);

  } catch (error: any) {
    console.error('💥 Error completo en processStripePayment:', error);
    
    // Si es un error de Stripe con código, ya se mostró la notificación arriba
    // Solo mostrar notificación genérica si no es un error de Stripe y no hay notificación visible
    if (error?.code || error?.decline_code) {
      // Es un error de Stripe, la notificación ya se mostró arriba
      // No hacer nada más, solo retornar
      return;
    }
    
    // Si no hay notificación visible, mostrar una genérica
    if (!notification.show) {
      showNotification('error', 'Error en el pago', error?.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.', 7000);
    }
    
    // No lanzar el error para evitar que se propague
  }
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
