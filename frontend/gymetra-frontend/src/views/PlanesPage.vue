<template>
  <ion-page>
    <div class="planes-header-bar">
      <button class="planes-back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <span class="planes-header-title">Planes</span>
    </div>
    <ion-content class="planes-content">
      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando planes disponibles...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="loadMemberships">Reintentar</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="memberships.length === 0" class="empty-container">
        <p>No hay planes disponibles en este momento</p>
      </div>

      <!-- Memberships list -->
      <div v-else class="planes-list">
        <div 
          v-for="membership in memberships" 
          :key="membership.membershipId"
          class="plan-card"
        >
          <div class="plan-price">$ {{ formatPrice(membership.price) }}</div>
          <div class="plan-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="getIconPath(membership.durationDays)"/>
              <circle v-if="membership.durationDays > 186" cx="12" cy="8" r="7"/>
              <path v-if="membership.durationDays > 186" d="M8 21h8l-4-7z"/>
            </svg>
          </div>
          <div class="plan-name">{{ membership.planName }}</div>
          <div class="plan-duration">{{ formatDuration(membership.durationDays) }}</div>
          <p v-if="membership.description" class="plan-description">{{ membership.description }}</p>
          <button 
            class="plan-btn" 
            @click="selectPlan(membership)"
            :disabled="!isMembershipAvailable(membership) || purchasing"
            :class="{ 'processing': purchasing && selectedMembershipId === membership.membershipId }"
          >
            <span v-if="purchasing && selectedMembershipId === membership.membershipId">
              <div class="btn-spinner"></div>
              Procesando...
            </span>
            <span v-else>
              {{ isMembershipAvailable(membership) ? 'Pagar plan' : 'No disponible' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Loading overlay para compra -->
      <div v-if="purchasing" class="purchase-overlay">
        <div class="purchase-modal">
          <div class="spinner"></div>
          <p>Procesando tu compra...</p>
          <p class="purchase-details">{{ selectedPlanName }}</p>
        </div>
      </div>

      <!-- Modal de Pago con Stripe -->
      <div v-if="showPaymentModal" class="payment-modal-overlay" @click="closePaymentModal">
        <div class="payment-modal-content" @click.stop>
          <div class="payment-modal-header">
            <h3>Completar Compra</h3>
            <button class="close-btn" @click="closePaymentModal">&times;</button>
          </div>

          <!-- Resumen de compra -->
          <div v-if="selectedMembershipForPayment" class="purchase-summary">
            <h4>📋 Resumen de Compra</h4>
            <p><strong>Membresía:</strong> {{ selectedMembershipForPayment.planName }}</p>
            <p><strong>Duración:</strong> {{ formatDuration(selectedMembershipForPayment.durationDays) }}</p>
            <p class="total-price">
              <strong>Total:</strong> ${{ formatPrice(selectedMembershipForPayment.price) }} USD
            </p>
            <hr>
            <small>💡 La membresía se asociará a tu cuenta de usuario</small>
          </div>

          <!-- Formulario de pago -->
          <form @submit.prevent="processPayment" class="payment-form">
            <div class="form-group">
              <label for="userIdInput">ID de Usuario *</label>
              <input 
                type="number" 
                id="userIdInput" 
                v-model="paymentData.userId" 
                required 
                placeholder="Ej: 1, 2, 3..." 
                min="1"
              >
              <small>Ingresa tu ID de usuario para asociar la membresía</small>
            </div>

            <div class="form-group">
              <label for="billingZip">Código Postal *</label>
              <input 
                type="text" 
                id="billingZip" 
                v-model="paymentData.billingZip" 
                required 
                placeholder="12345" 
                maxlength="10"
              >
              <small>Requerido por Stripe para procesar el pago</small>
            </div>

            <div class="form-group">
              <label>Información de Pago</label>
              <div v-if="!stripeAvailable" class="test-mode-notice">
                🧪 Modo de Prueba - No se requiere tarjeta
              </div>
              <div v-else>
                <div id="stripe-card-element" class="stripe-element"></div>
                <div v-if="cardError" class="error-msg">{{ cardError }}</div>
              </div>
            </div>

            <button 
              type="submit" 
              class="pay-btn"
              :disabled="paymentProcessing"
              :class="{ 'processing': paymentProcessing }"
            >
              <span v-if="paymentProcessing">
                <div class="btn-spinner"></div>
                Procesando...
              </span>
              <span v-else>
                💳 Pagar Ahora
              </span>
            </button>
          </form>
        </div>
      </div>

      <!-- Modal de Éxito -->
      <div v-if="showSuccessModal" class="success-modal-overlay" @click="closeSuccessModal">
        <div class="success-modal-content" @click.stop>
          <h2>¡Pago Exitoso! ✅</h2>
          <div v-if="paymentResult">
            <p><strong>Usuario ID:</strong> {{ paymentResult.userId }}</p>
            <p><strong>Membresía:</strong> {{ paymentResult.membershipName }}</p>
            <p><strong>Duración:</strong> {{ paymentResult.duration }}</p>
            <p><strong>Monto:</strong> ${{ paymentResult.amount }} USD</p>
            <hr>
            <p class="success-note">La membresía ha sido asociada correctamente a tu cuenta.</p>
          </div>
          <button class="success-btn" @click="closeSuccessModal">
            Continuar
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent } from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';
import { 
  getAvailableMemberships, 
  purchaseMembership,
  checkBackendConnectivity,
  formatPrice, 
  formatDuration, 
  getMembershipIcon,
  isMembershipAvailable,
  type Membership 
} from '@/services/membershipService';

// Configuración de Stripe
const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_51S9c29RPJMMOJ1bv1BejUA5NyJ7gsg0rvFcEjdAa8JuyMI7Zs3S9aCklSsGvTfGE2rVa6fhbwug33zIqK7b1ni8M00SLlPxKFx', // Tu clave real de Stripe
  API_BASE_URL: 'http://localhost:8081/api'
};

const router = useRouter();
const { authenticated, userInfo, requireAuth, initAuth } = useAuth();

// Estados existentes
const memberships = ref<Membership[]>([]);
const loading = ref(false);
const error = ref('');
const purchasing = ref(false);
const selectedMembershipId = ref<number | null>(null);
const selectedPlanName = ref('');

// Nuevos estados para Stripe
const showPaymentModal = ref(false);
const showSuccessModal = ref(false);
const selectedMembershipForPayment = ref<Membership | null>(null);
const paymentProcessing = ref(false);
const stripeAvailable = ref(false);
const cardError = ref('');

// Variables de Stripe
let stripe: any = null;
let elements: any = null;
let cardElement: any = null;

// Datos del formulario de pago
const paymentData = ref({
  userId: userInfo.value?.userId || '',
  billingZip: ''
});

// Resultado del pago para mostrar en el modal de éxito
const paymentResult = ref<{
  userId: number;
  membershipName: string;
  duration: string;
  amount: number;
} | null>(null);

// ===============================
// Funciones de inicialización de Stripe
// ===============================
const initializeStripe = async () => {
  try {
    if (!window.Stripe) {
      console.warn('⚠️ Stripe no está disponible');
      return false;
    }

    if (STRIPE_CONFIG.PUBLISHABLE_KEY.startsWith('pk_test_') || STRIPE_CONFIG.PUBLISHABLE_KEY.startsWith('pk_live_')) {
      console.log('💳 Inicializando Stripe...');
      stripe = window.Stripe(STRIPE_CONFIG.PUBLISHABLE_KEY);
      elements = stripe.elements();
      
      console.log('✅ Stripe inicializado correctamente');
      stripeAvailable.value = true;
      return true;
    } else {
      console.log('🧪 Modo simulación - Stripe no configurado');
      return false;
    }
  } catch (error) {
    console.error('❌ Error al inicializar Stripe:', error);
    return false;
  }
};

const setupStripeElements = async () => {
  if (!stripe || !elements) return;
  
  try {
    await nextTick();
    const cardElementContainer = document.getElementById('stripe-card-element');
    
    if (cardElementContainer && !cardElement) {
      cardElement = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
        },
      });
      
      cardElement.mount('#stripe-card-element');
      
      cardElement.on('change', (event: any) => {
        cardError.value = event.error ? event.error.message : '';
      });
      
      console.log('✅ Stripe Elements configurado');
    }
  } catch (error) {
    console.error('❌ Error configurando Stripe Elements:', error);
  }
};

// ===============================
// Funciones de manejo de modales
// ===============================
const openPaymentModal = (membership: Membership) => {
  selectedMembershipForPayment.value = membership;
  showPaymentModal.value = true;
  
  // Configurar userId si está disponible
  if (userInfo.value?.userId) {
    paymentData.value.userId = userInfo.value.userId.toString();
  }
  
  // Configurar Stripe Elements después de que el modal esté visible
  if (stripeAvailable.value) {
    setTimeout(() => {
      setupStripeElements();
    }, 100);
  }
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  selectedMembershipForPayment.value = null;
  cardError.value = '';
  
  // Limpiar Stripe Elements
  if (cardElement) {
    try {
      cardElement.unmount();
      cardElement = null;
    } catch (error) {
      console.log('Stripe Elements ya desmontado');
    }
  }
  
  // Reset form
  paymentData.value.billingZip = '';
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  paymentResult.value = null;
};

// ===============================
// Funciones de procesamiento de pago
// ===============================
const processPayment = async () => {
  if (!selectedMembershipForPayment.value) return;
  
  // Validaciones
  if (!paymentData.value.userId || parseInt(paymentData.value.userId) < 1) {
    alert('Por favor ingresa un ID de usuario válido');
    return;
  }
  
  if (!paymentData.value.billingZip || paymentData.value.billingZip.length < 3) {
    alert('Por favor ingresa un código postal válido');
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
    console.error('❌ Error en el pago:', error);
    alert('Error en el pago: ' + error.message);
  } finally {
    paymentProcessing.value = false;
  }
};

const processStripePayment = async () => {
  if (!selectedMembershipForPayment.value || !stripe || !cardElement) return;
  
  try {
    console.log('🔄 Procesando pago con Stripe...');
    
    // 1. Crear PaymentIntent
    const response = await fetch(`${STRIPE_CONFIG.API_BASE_URL}/payments/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membershipId: selectedMembershipForPayment.value.membershipId,
        userId: parseInt(paymentData.value.userId)
      })
    });

    if (!response.ok) throw new Error('Error al crear PaymentIntent');

    const { clientSecret } = await response.json();

    // 2. Confirmar pago
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          address: {
            postal_code: paymentData.value.billingZip
          }
        }
      }
    });

    if (error) throw error;

    // 3. Confirmar en backend
    const confirmResponse = await fetch(`${STRIPE_CONFIG.API_BASE_URL}/payments/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId: paymentIntent.id,
        membershipId: selectedMembershipForPayment.value.membershipId,
        userId: parseInt(paymentData.value.userId)
      })
    });

    if (!confirmResponse.ok) {
      throw new Error('Error al confirmar en backend');
    }

    console.log('✅ Pago procesado exitosamente con Stripe');
    showPaymentSuccess();

  } catch (error: any) {
    throw new Error('Error en Stripe: ' + error.message);
  }
};

const simulatePayment = async () => {
  if (!selectedMembershipForPayment.value) return;
  
  console.log('🧪 Simulando pago...');
  
  // Simular delay de procesamiento
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('✅ Pago simulado exitosamente');
  showPaymentSuccess();
};

const showPaymentSuccess = () => {
  if (!selectedMembershipForPayment.value) return;
  
  paymentResult.value = {
    userId: parseInt(paymentData.value.userId),
    membershipName: selectedMembershipForPayment.value.planName,
    duration: formatDuration(selectedMembershipForPayment.value.durationDays),
    amount: selectedMembershipForPayment.value.price
  };
  
  closePaymentModal();
  showSuccessModal.value = true;
};

// ===============================
// Función existente actualizada
// ===============================

// Función para cargar las membresías disponibles
const loadMemberships = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Verificar autenticación antes de hacer la petición
    if (!requireAuth()) {
      return;
    }

    const data = await getAvailableMemberships();
    memberships.value = data;
    console.log('✅ Membresías cargadas exitosamente:', data.length, 'planes disponibles');
  } catch (err: any) {
    error.value = err.message;
    console.error('❌ Error loading memberships:', err);
    
    // Si es un error de autenticación, redirigir al login
    if (err.message.includes('autenticado') || err.message.includes('Sesión expirada')) {
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  } finally {
    loading.value = false;
  }
};

// Manejar selección y compra de plan - ACTUALIZADA PARA STRIPE
const selectPlan = async (membership: Membership) => {
  // Verificar autenticación antes de proceder
  if (!requireAuth()) {
    return;
  }

  if (!isMembershipAvailable(membership)) {
    console.warn('Plan no disponible:', membership.planName);
    return;
  }

  console.log('🎯 Plan seleccionado para pago:', membership);
  
  // Abrir modal de pago con Stripe
  openPaymentModal(membership);
};

// Obtener el path del ícono SVG según la duración
const getIconPath = (days: number): string => {
  return getMembershipIcon(days);
};

// Función para mostrar confirmación antes de comprar
const confirmPurchase = (membership: Membership): boolean => {
  const message = `¿Estás seguro de que quieres comprar el plan ${membership.planName}?\n\nPrecio: $${formatPrice(membership.price)}\nDuración: ${formatDuration(membership.durationDays)}`;
  return confirm(message);
};

// Verificar autenticación y cargar membresías al montar el componente
onMounted(async () => {
  if (initAuth({ requireAuth: true })) {
    // Inicializar Stripe primero
    console.log('🔄 Inicializando Stripe...');
    await initializeStripe();
    
    // Verificar conectividad antes de cargar datos
    console.log('🔍 Verificando conectividad con el backend...');
    const isBackendConnected = await checkBackendConnectivity();
    
    if (!isBackendConnected) {
      console.warn('⚠️ Backend no disponible, modo offline o error de CORS');
      error.value = 'El servidor no está disponible. Algunas funciones pueden no funcionar correctamente.';
    }
    
    loadMemberships();
  }
});
</script>

<style>
.planes-header-bar {
  background: #07B7E0;
  min-height: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 22px;
  box-shadow: none;
}
.planes-back-btn {
  background: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  cursor: pointer;
  padding: 0;
}
.planes-header-title {
  color: #fff;
  font-size: 1.45rem;
  font-weight: 800;
  font-family: 'Nunito', sans-serif;
  display: flex;
  align-items: center;
}
.planes-content {
  --background: #fff !important;
  background: #fff !important;
  min-height: 100vh;
  padding: 0;
}

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #07B7E0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 20px;
  text-align: center;
}

.error-message {
  color: #d32f2f;
  font-size: 1.1rem;
  margin-bottom: 20px;
  font-family: 'Nunito', sans-serif;
}

.retry-btn {
  background: #07B7E0;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: 'Nunito', sans-serif;
}

.retry-btn:hover {
  background: #0696c7;
}

/* Empty state */
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #666;
  font-size: 1.1rem;
  font-family: 'Nunito', sans-serif;
}

.planes-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: center;
  margin: 40px 0;
}
.plan-card {
  background: #07B7E0;
  border-radius: 28px;
  width: 90vw;
  max-width: 320px;
  min-height: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 16px rgba(0,0,0,0.10);
  padding: 18px 0 18px 0;
}
.plan-price {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  font-family: 'Nunito', sans-serif;
}
.plan-icon {
  margin-bottom: 8px;
}
.plan-name {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  font-family: 'Nunito', sans-serif;
  margin-bottom: 4px;
  text-align: center;
}
.plan-duration {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 400;
  font-family: 'Nunito', sans-serif;
  margin-bottom: 16px;
}
.plan-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-family: 'Nunito', sans-serif;
  text-align: center;
  margin: 0 16px 16px;
  line-height: 1.4;
}
.plan-btn {
  width: 85%;
  padding: 14px 0;
  background: #fff;
  color: #07B7E0;
  border: none;
  border-radius: 32px;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  letter-spacing: 0.5px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.plan-btn:disabled {
  background: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
}
.plan-btn:hover:not(:disabled) {
  background: #07B7E0;
  color: #fff;
}

.plan-btn.processing {
  background: #0696c7;
  color: #fff;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}

/* Purchase overlay */
.purchase-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.purchase-modal {
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  text-align: center;
  max-width: 300px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.purchase-modal p {
  color: #333;
  font-family: 'Nunito', sans-serif;
  margin: 16px 0 8px;
  font-size: 1.1rem;
  font-weight: 600;
}

.purchase-details {
  color: #07B7E0 !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  margin-top: 8px !important;
}

/* Responsive mejoras */
@media (max-width: 480px) {
  .purchase-modal {
    padding: 30px 20px;
    max-width: 280px;
  }
  
  .btn-spinner {
    width: 14px;
    height: 14px;
    margin-right: 6px;
  }
}

/* ===============================
   NUEVOS ESTILOS PARA STRIPE
   =============================== */

/* Variables CSS adicionales */
:root {
  --modal-bg: rgba(0, 0, 0, 0.7);
  --modal-content-bg: #ffffff;
  --primary-color: #07B7E0;
  --error-color: #e74c3c;
  --success-color: #27ae60;
  --text-dark: #2c3e50;
  --text-light: #7f8c8d;
  --border-light: #e0e0e0;
  --shadow-light: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Modal de Pago */
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.payment-modal-content {
  background: var(--modal-content-bg);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-light);
  position: relative;
}

.payment-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-light);
}

.payment-modal-header h3 {
  color: var(--text-dark);
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: var(--text-light);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: var(--error-color);
}

/* Resumen de compra */
.purchase-summary {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-light);
}

.purchase-summary h4 {
  color: var(--text-dark);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  font-family: 'Nunito', sans-serif;
}

.purchase-summary p {
  margin: 0.5rem 0;
  color: var(--text-dark);
  font-family: 'Nunito', sans-serif;
}

.total-price {
  color: var(--primary-color) !important;
  font-weight: 700 !important;
  font-size: 1.2rem !important;
  margin: 1rem 0 !important;
}

.purchase-summary hr {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 1rem 0;
}

.purchase-summary small {
  color: var(--text-light);
  font-size: 0.85rem;
  line-height: 1.4;
}

/* Formulario de pago */
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: var(--text-dark);
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-family: 'Nunito', sans-serif;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid var(--border-light);
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Nunito', sans-serif;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-group small {
  color: var(--text-light);
  font-size: 0.85rem;
  margin-top: 0.25rem;
  line-height: 1.3;
}

/* Stripe Elements */
.stripe-element {
  padding: 1rem;
  border: 2px solid var(--border-light);
  border-radius: 8px;
  background: white;
  transition: border-color 0.3s;
}

.stripe-element:focus-within {
  border-color: var(--primary-color);
}

.test-mode-notice {
  background: #f39c12;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  font-family: 'Nunito', sans-serif;
}

.error-msg {
  color: var(--error-color);
  font-size: 0.9rem;
  margin-top: 0.5rem;
  font-family: 'Nunito', sans-serif;
}

/* Botón de pago */
.pay-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.pay-btn:hover:not(:disabled) {
  background: #0696c7;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(7, 183, 224, 0.3);
}

.pay-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.pay-btn.processing {
  background: #0696c7;
}

/* Modal de Éxito */
.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  backdrop-filter: blur(5px);
}

.success-modal-content {
  background: var(--modal-content-bg);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: var(--shadow-light);
}

.success-modal-content h2 {
  color: var(--success-color);
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  font-family: 'Nunito', sans-serif;
}

.success-modal-content p {
  color: var(--text-dark);
  margin: 0.5rem 0;
  font-family: 'Nunito', sans-serif;
}

.success-modal-content hr {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 1.5rem 0;
}

.success-note {
  color: var(--text-light) !important;
  font-size: 0.9rem !important;
  line-height: 1.4 !important;
}

.success-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.success-btn:hover {
  background: #0696c7;
  transform: translateY(-2px);
}

/* Responsive para modales */
@media (max-width: 480px) {
  .payment-modal-content,
  .success-modal-content {
    padding: 1.5rem;
    width: 95%;
  }
  
  .payment-modal-header h3 {
    font-size: 1.3rem;
  }
  
  .success-modal-content h2 {
    font-size: 1.5rem;
  }
  
  .pay-btn,
  .success-btn {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
