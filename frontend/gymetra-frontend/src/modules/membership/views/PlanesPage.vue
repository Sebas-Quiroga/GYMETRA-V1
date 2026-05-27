<template>
  <ion-page>

    <div class="planes-header" role="banner">
      <div class="planes-header-left">
        <button class="planes-back-btn" @click="$router.push('/home')" aria-label="Volver">
          <ArrowLeft :size="22" stroke-width="2.5" />
        </button>
      </div>
      <router-link to="/home" class="planes-logo-link" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="header-logo-text">{{ APP_NAME }}</span>
      </router-link>
      <div class="planes-header-right">
        <div class="header-status-dot" aria-hidden="true"></div>
        <button class="planes-logout-btn" @click="logout" aria-label="Cerrar sesión">
          <LogOut :size="22" stroke-width="2" />
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
              <Award :size="80" stroke-width="1" />
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
                    <Check :size="14" stroke-width="3" />
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
            <ArrowRight :size="16" stroke-width="2.5" />
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
import { ArrowLeft, LogOut, Award, Check, ArrowRight } from '@lucide/vue'
import { useAuthStore } from '../../auth/store/auth'
import { APP_NAME } from '../../shared/config/branding'
import { closeCircle } from 'ionicons/icons'
import {
  formatPrice,
  formatDuration,
  getMembershipIcon,
  isMembershipAvailable
} from '../services/membershipService'
import { useNotification } from '../../shared/composables/useNotification'
import { useMembershipPlans } from '../composables/useMembershipPlans'
const auth = useAuthStore()
const router = useRouter()
const logout = () => { auth.clearToken(); router.push('/login') }

const { notification, dismissNotification } = useNotification()

const {
  memberships,
  loading,
  error,
  purchasing,
  selectedPlanName,
  isFeatured,
  loadMemberships,
  selectPlan
} = useMembershipPlans()

const getIconPath = (days: number): string => getMembershipIcon(days)
</script>
<style src="../theme/PlanesPage.css"></style>

