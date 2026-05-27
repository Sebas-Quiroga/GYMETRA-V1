<template>
  <ion-page>
    <div class="qr-header-bar" role="banner" aria-label="Encabezado de QR">
      <div class="header-side header-left">
        <div class="qr-avatar-wrap" @click="navigateToProfile" tabindex="0" role="button" aria-label="Ir al perfil">
          <img
            v-if="profilePhoto"
            :src="profilePhoto"
            alt="Foto de perfil"
            class="qr-avatar-img"
            @error="handleImageError"
            loading="lazy"
          />
          <div v-else class="qr-avatar-fallback">
            {{ firstName.charAt(0) }}
          </div>
        </div>
      </div>
      <router-link to="/home" class="header-logo-link" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="header-logo-text">{{ APP_NAME }}</span>
      </router-link>
      <div class="header-side header-right">
        <button class="qr-back-btn" @click="$router.back()" aria-label="Volver" tabindex="0">
          <ArrowLeft :size="24" stroke-width="2.5" />
        </button>
      </div>
    </div>
    <ion-content role="main" aria-label="QR de acceso" class="qr-content">
      <div class="qr-outer">
        <div class="qr-hero">
          <h2 class="qr-hero-title">Pase de Acceso</h2>
          <p class="qr-hero-sub">Escanea en el terminal para ingresar</p>
        </div>
        <div class="qr-card-wrapper">
          <div class="qr-card-glow"></div>
          <div class="qr-card" aria-label="Tarjeta QR de acceso">
            <div class="qr-badge">
              <span
                class="qr-badge-dot"
                :class="{ 'dot-active': isActive, 'dot-inactive': !isActive }"
              ></span>
              <span class="qr-badge-text">
                {{ isActive ? 'Membresía Activa' : 'Membresía Inactiva' }}
              </span>
            </div>
            <div class="qr-image-wrap">
              <div class="qr-image-inner">
                <qrcode-vue
                  v-if="qrCode"
                  :value="qrCode"
                  :size="180"
                  level="M"
                  aria-label="Código QR de acceso"
                />
                <div v-else class="qr-placeholder">
                  <span v-if="loading">Cargando QR...</span>
                  <span v-else>No hay QR disponible</span>
                </div>
              </div>
            </div>
            <div class="qr-meta">
              <p class="qr-meta-label">Válido para hoy</p>
              <p class="qr-meta-id">ID: #{{ auth.user?.userId }}</p>
            </div>
          </div>
        </div>
        <div class="qr-bento">
          <div class="bento-card bento-full">
            <div class="bento-left">
              <p class="bento-label">Nombre completo</p>
              <p class="bento-value bento-name">{{ auth.userName }}</p>
            </div>
            <div class="bento-icon">
              <ShieldCheck :size="20" fill="white" stroke="currentColor" />
            </div>
          </div>
          <div class="bento-card bento-half">
            <p class="bento-label">Miembro desde</p>
            <p class="bento-value">{{ memberSince }}</p>
          </div>
          <div class="bento-card bento-half">
            <p class="bento-label">Plan</p>
            <p class="bento-value bento-plan">{{ planName }}</p>
          </div>
          <div v-if="qrEndDate" class="bento-card bento-full">
            <p class="bento-label">Vence el</p>
            <p class="bento-value">{{ qrEndDate }}</p>
          </div>
        </div>
        <div class="qr-actions">
          <button class="btn-secondary">
            <LifeBuoy :size="18" stroke-width="2" />
            Contactar soporte
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import QrcodeVue from 'qrcode.vue'
import { ArrowLeft, ShieldCheck, LifeBuoy } from '@lucide/vue'
import { useAuthStore } from '../../auth/store/auth'
import { useRouter } from 'vue-router'
import { APP_NAME } from '../../shared/config/branding'
import { useQrAccess } from '../composables/useQrAccess'
const auth = useAuthStore()
const router = useRouter()

const {
  qrCode,
  qrStatus,
  qrEndDate,
  loading,
  isActive,
  memberSince,
  planName
} = useQrAccess(auth.user?.userId)

const firstName = computed(() => auth.user?.firstName || "Usuario")

const profilePhoto = computed(() => {
  const url = auth.user?.photoUrl
  if (!url) return null
  return url.startsWith("data:") || url.startsWith("http")
    ? url
    : `data:image/jpeg;base64,${url}`
})

const navigateToProfile = () => router.push("/perfil")

const handleImageError = (imageEvent: Event) => {
  const targetElement = imageEvent.target as HTMLImageElement;
  targetElement.src = "";
}
</script>
<style src="../theme/QrPage.css"></style>

