<template>
  <ion-page>
    <!-- Componente de notificación -->
    <Transition name="fade">
      <div v-if="notification.show" 
           class="notification-container"
           :class="notification.type"
           role="alert"
           aria-live="assertive">
        <div class="notification-content">
          <ion-icon :icon="notification.icon" class="notification-icon" aria-hidden="true"></ion-icon>
          <div class="notification-text">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.message }}</p>
          </div>
          <ion-icon 
            :icon="closeCircle" 
            class="close-icon"
            @click="dismissNotification"
            tabindex="0"
            role="button"
            aria-label="Cerrar notificación">
          </ion-icon>
        </div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: notification.progress + '%' }"></div>
        </div>
      </div>
    </Transition>

    <div class="planes-header-bar" role="banner" aria-label="Encabezado de planes">
      <button class="planes-back-btn" @click="$router.back()" aria-label="Volver" tabindex="0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <span class="planes-header-title" aria-label="Planes">Planes</span>
    </div>
    <ion-content class="planes-content" role="main" aria-label="Listado de planes">
      <!-- Loading state -->
      <div v-if="loading" class="loading-container" role="status" aria-live="polite">
        <div class="spinner" aria-label="Cargando"></div>
        <p>Cargando planes disponibles...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-container" role="alert" aria-live="assertive">
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="loadMemberships" aria-label="Reintentar cargar planes">Reintentar</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="memberships.length === 0" class="empty-container" role="status" aria-live="polite">
        <p>No hay planes disponibles en este momento</p>
      </div>

      <!-- Memberships list -->
      <div v-else class="planes-list" aria-label="Lista de planes disponibles">
        <div 
          v-for="membership in memberships" 
          :key="membership.membershipId"
          class="plan-card"
          role="region"
          :aria-label="'Plan ' + membership.planName"
        >
          <div class="plan-price">$ {{ formatPrice(membership.price) }}</div>
          <div class="plan-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
            :aria-disabled="!isMembershipAvailable(membership) || purchasing"
            :class="{ 'processing': purchasing && selectedMembershipId === membership.membershipId }"
            :aria-label="isMembershipAvailable(membership) ? 'Pagar plan ' + membership.planName : 'Plan no disponible'"
          >
            <span v-if="purchasing && selectedMembershipId === membership.membershipId">
              <div class="btn-spinner" aria-label="Cargando"></div>
              Procesando...
            </span>
            <span v-else>
              {{ isMembershipAvailable(membership) ? 'Pagar plan' : 'No disponible' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Loading overlay para compra -->
      <div v-if="purchasing" class="purchase-overlay" role="alertdialog" aria-modal="true" aria-label="Procesando compra">
        <div class="purchase-modal">
          <div class="spinner" aria-label="Cargando"></div>
          <p>Procesando tu compra...</p>
          <p class="purchase-details">{{ selectedPlanName }}</p>
        </div>
      </div>

      <!-- El pago ahora se realiza en una vista separada -->
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, reactive, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon, IonButton } from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';
import { checkmarkCircle, alertCircle, warningOutline, informationCircle, closeCircle } from 'ionicons/icons';
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
import { HOST_URL } from"../services/hots";

// Configuración de Stripe
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

const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_51S9c29RPJMMOJ1bv1BejUA5NyJ7gsg0rvFcEjdAa8JuyMI7Zs3S9aCklSsGvTfGE2rVa6fhbwug33zIqK7b1ni8M00SLlPxKFx', // Tu clave real de Stripe
  API_BASE_URL: `${HOST_URL}:8081/api`
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
      showNotification('error', 'Error de autenticación', 'Por favor inicia sesión para ver los planes disponibles.');
      return;
    }

    const data = await getAvailableMemberships();
    memberships.value = data;
  // Solo mostrar errores en consola
    if (data.length > 0) {
      showNotification('success', '¡Planes cargados!', `${data.length} planes disponibles`);
    }
  } catch (err: any) {
    error.value = '';
    console.error('❌ Error loading memberships:', err);
    
    // Si es un error de autenticación, redirigir al login
    if (err.message.includes('autenticado') || err.message.includes('Sesión expirada')) {
      showNotification('error', 'Sesión expirada', 'Por favor inicia sesión nuevamente.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      showNotification('error', 'Error al cargar planes', err.message);
    }
  } finally {
    loading.value = false;
  }
};

// Manejar selección y compra de plan - Redirigir a la vista de pago
const selectPlan = async (membership: Membership) => {
  if (!requireAuth()) {
    showNotification('error', 'Error de autenticación', 'Por favor inicia sesión para seleccionar un plan.');
    return;
  }
  if (!isMembershipAvailable(membership)) {
  // Solo mostrar errores en consola
    showNotification('warning', 'Plan no disponible', 'Este plan no se encuentra disponible en este momento.');
    return;
  }
  showNotification('info', 'Procesando...', `Preparando el plan ${membership.planName} para el pago.`);
  // Redirigir a la vista de pago y pasar el plan por query param
  router.push({
    path: '/Pasarelapago',
    query: { plan: encodeURIComponent(JSON.stringify(membership)) }
  });
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
    // Verificar conectividad antes de cargar datos
  // Solo mostrar errores en consola
    const isBackendConnected = await checkBackendConnectivity();
    if (!isBackendConnected) {
      console.warn('⚠️ Backend no disponible, modo offline o error de CORS');
      showNotification('warning', 'Problemas de conexión', 'El servidor no está disponible. Algunas funciones pueden no funcionar correctamente.');
    }
    loadMemberships();
  }
});

// Limpiar timers al desmontar el componente
onUnmounted(() => {
  if (notificationTimer) clearTimeout(notificationTimer);
  if (notificationProgressTimer) clearInterval(notificationProgressTimer);
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
/* Estilos de notificación */
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  overflow: hidden;
}

.notification-container.error {
  border-left: 4px solid #dc3545;
}

.notification-container.success {
  border-left: 4px solid #28a745;
}

.notification-container.warning {
  border-left: 4px solid #ffc107;
}

.notification-container.info {
  border-left: 4px solid #17a2b8;
}

.notification-content {
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notification-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.error .notification-icon {
  color: #dc3545;
}

.success .notification-icon {
  color: #28a745;
}

.warning .notification-icon {
  color: #ffc107;
}

.info .notification-icon {
  color: #17a2b8;
}

.notification-text {
  flex-grow: 1;
}

.notification-text h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.notification-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.close-icon {
  font-size: 20px;
  color: #999;
  cursor: pointer;
  flex-shrink: 0;
}

.close-icon:hover {
  color: #666;
}

.progress-bar {
  height: 4px;
  background: #f0f0f0;
  width: 100%;
}

.progress {
  height: 100%;
  transition: width 0.05s linear;
}

.error .progress {
  background: #dc3545;
}

.success .progress {
  background: #28a745;
}

.warning .progress {
  background: #ffc107;
}

.info .progress {
  background: #17a2b8;
}

/* Animación de fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

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
