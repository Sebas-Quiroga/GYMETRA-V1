<template>
  <ion-page>

    <div class="pago-header" role="banner">
      <div class="header-side header-left">
        <button class="pago-back-btn" @click="$router.push('/planes')" aria-label="Volver">
          <ArrowLeft :size="22" stroke-width="2.5" />
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
        <section class="pago-hero" aria-label="Imagen de presentación">
          <div class="pago-hero-img-wrap">
            <div class="pago-hero-img-placeholder" aria-hidden="true">
              <Lock :size="64" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" />
            </div>
            <div class="pago-hero-overlay">
              <span class="pago-hero-badge">Pago Seguro SSL</span>
              <h2 class="pago-hero-tagline">Estás a un paso de tu mejor versión</h2>
            </div>
          </div>
        </section>
        <section class="pago-section" v-if="membership">
          <div class="pago-summary-card" aria-label="Resumen de compra">
            <div class="pago-summary-left">
              <p class="pago-summary-eyebrow">Membresía Seleccionada</p>
              <h3 class="pago-summary-name">{{ membership.planName }}</h3>
              <div class="pago-summary-meta">
                <Clock :size="18" stroke-width="2.5" />
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
        <section v-if="membership" class="pago-section">
          <div class="pago-form-header">
            <div class="pago-form-header-icon" aria-hidden="true">
              <CreditCard :size="20" stroke-width="2.5" />
            </div>
            <h3 class="pago-form-title">Detalles de la Tarjeta</h3>
          </div>
          <form @submit.prevent="processPayment" class="pago-form" novalidate>
            <div class="pago-field-group">
              <label class="pago-label">Número, Expiración y CVC</label>
              <div id="stripe-card-element" class="pago-stripe-element" aria-label="Campo de tarjeta de crédito"></div>
              <p class="pago-help-text">
                <Shield :size="16" stroke-width="2.5" />
                Tus datos están protegidos con cifrado de grado bancario.
              </p>
            </div>
            <div class="pago-trust" aria-label="Garantía de seguridad">
              <div class="pago-trust-item">
                <Lock :size="20" stroke-width="2" />
              </div>
              <span class="pago-trust-label">Transacción procesada por Stripe®</span>
            </div>
          </form>
        </section>
      </div>
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
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { ArrowLeft, Lock, Clock, CreditCard, Shield } from '@lucide/vue'
import { formatPrice, formatDuration } from '../services/membershipService'
import { usePayment } from '../composables/usePayment'
import { APP_NAME } from '../../shared/config/branding'
import { closeCircle } from 'ionicons/icons'

const {
  membership,
  paymentProcessing,
  stripeAvailable,
  notification,
  processPayment,
  dismissNotification
} = usePayment()
</script>
<style src="../theme/PasarelaPago.css"></style>

