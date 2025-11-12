<template>
  <ion-page>
    <!-- 🔹 Encabezado superior -->
    <div class="qr-header-bar" role="banner" aria-label="Encabezado de QR">
      <button class="qr-back-btn" @click="$router.back()" aria-label="Volver" tabindex="0">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <span class="qr-header-title" aria-label="Escanear QR">Escanear QR</span>
    </div>

    <!-- 🔹 Contenido principal -->
    <ion-content role="main" aria-label="QR de acceso" class="qr-content">
      <div class="qr-container">
        <div class="qr-card" aria-label="Tarjeta QR de acceso">
          <div class="qr-title">QR de acceso</div>

          <!-- Código QR o placeholder -->
          <div class="qr-image">
            <qrcode-vue
              v-if="qrCode"
              :value="qrCode"
              :size="180"
              level="M"
              aria-label="Código QR de acceso"
            />
            <div v-else class="qr-placeholder">No hay QR disponible</div>
          </div>

          <!-- Estado -->
          <div
            class="qr-status"
            :class="{
              'status-active': qrStatus.includes('activa'),
              'status-inactive': qrStatus.includes('inactiva')
            }"
            role="status"
            aria-live="polite"
          >
            {{ qrStatus }}
            <div v-if="qrEndDate" class="qr-date">hasta el {{ qrEndDate }}</div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { useAuthStore } from '@/stores/auth'
import { HOST_URL } from"../services/hots";

// 📦 Store de autenticación
const auth = useAuthStore()

// 🧩 Estados reactivos
const qrCode = ref<string | null>(null)
const qrStatus = ref('Cargando...')
const qrEndDate = ref<string | null>(null)

// 🧠 Función para formatear la fecha
function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return ''
  }
}

// 🚀 Cargar QR desde el backend
onMounted(async () => {
  try {
    const token = auth.token
    const decoded = token ? decodeJWT(token) : null
    const userId = decoded?.userId || localStorage.getItem('userId')

    if (!userId) {
      qrStatus.value = 'Usuario no autenticado'
      return
    }

    const response = await fetch(`${HOST_URL}:8090/api/qr-access/user/${userId}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    const data = await response.json()

    if (data && data.qrCode) {
      qrCode.value = data.qrCode
      qrEndDate.value = data.endDate ? formatDate(data.endDate) : null

      // 🔍 Validar estado real del backend
      const status = data.status?.toLowerCase()
      if (status === 'active') {
        qrStatus.value = 'Membresía activa ✅'
      } else if (status === 'inactive') {
        qrStatus.value = 'Membresía inactiva ❌'
      } else {
        qrStatus.value = `Estado desconocido (${data.status || 'sin datos'})`
      }

      // Guardar para próximos accesos
      ;(window as any).qrCodeData = data.qrCode
      localStorage.setItem('qrCodeData', data.qrCode)
    } else {
      qrCode.value = null
      qrStatus.value = 'No hay QR disponible'
    }
  } catch (error) {
    console.error('❌ Error cargando QR:', error)
    qrStatus.value = 'Error al cargar el código'
  }
})

// 🧩 Decodificador JWT (para obtener userId del token)
function decodeJWT(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('Token inválido')
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payload)
  } catch {
    return null
  }
}
</script>

<style src="../theme/QrPage.css"></style>