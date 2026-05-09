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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            Contactar soporte
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import QrcodeVue from 'qrcode.vue'
import { useAuthStore } from '../../auth/store/auth'
import { apiAuthRequest, QR_API_URL, MEMBERSHIP_API_URL } from '../../shared/services/apiService'
import { useRouter } from 'vue-router'
import { APP_NAME } from '../../shared/config/branding'
const auth = useAuthStore()
const router = useRouter()
const qrCode = ref<string | null>(null)
const qrStatus = ref('')
const qrEndDate = ref<string | null>(null)
const loading = ref(true)
const activeMembership = ref<any>(null)
const firstName = computed(() => auth.user?.firstName || "Usuario")
const profilePhoto = computed(() => {
  const url = auth.user?.photoUrl
  if (!url) return null
  return url.startsWith("data:") || url.startsWith("http")
    ? url
    : `data:image/jpeg;base64,${url}`
})
const isActive = computed(() => qrStatus.value.toLowerCase().includes('activa'))
const memberSince = computed(() => {
  if (!activeMembership.value?.startDate) return '---'
  return new Date(activeMembership.value.startDate).toLocaleDateString('es-CO', {
    month: 'short',
    year: 'numeric'
  })
})
const planName = computed(() => activeMembership.value?.membershipName || 'Sin Plan')
const navigateToProfile = () => router.push("/perfil")
const handleImageError = (e: any) => { e.target.src = "" }
function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return ''
  }
}
onMounted(async () => {
  if (!auth.user?.userId) {
    qrStatus.value = 'Usuario no autenticado'
    loading.value = false
    return
  }
  try {
    const qrResponse = await apiAuthRequest(`${QR_API_URL}/qr-access/user/${auth.user.userId}`)
    if (qrResponse.success && qrResponse.data) {
      const data = qrResponse.data
      qrCode.value = data.qrCode
      qrEndDate.value = data.endDate ? formatDate(data.endDate) : null
      const status = data.status?.toLowerCase()
      if (status === 'active') {
        qrStatus.value = 'Membresía activa'
      } else if (status === 'inactive') {
        qrStatus.value = 'Membresía inactiva'
      } else {
        qrStatus.value = data.status || 'sin datos'
      }
      localStorage.setItem('qrCodeData', data.qrCode)
    }
    const membershipResponse = await apiAuthRequest(`${MEMBERSHIP_API_URL}/user-memberships/user/${auth.user.userId}`)
    if (membershipResponse.success && membershipResponse.data) {
      const memberships = Array.isArray(membershipResponse.data) ? membershipResponse.data : []
      activeMembership.value = memberships
        .filter((m: any) => m.status?.toUpperCase() === 'ACTIVE')
        .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0] || null
    }
  } catch (error) {
    console.error('Error cargando datos de acceso:', error)
    qrStatus.value = 'Error de conexión'
  } finally {
    loading.value = false
  }
})
</script>
<style src="../theme/QrPage.css"></style>

