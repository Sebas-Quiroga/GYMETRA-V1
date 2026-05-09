<template>
  <div class="admin-dashboard">
    <!-- Sidebar Component -->
    <AdminSidebar
      :active-section="activeSection"
      @navigate-to-users="navigateToUsers"
      @navigate-to-reports="navigateToReports"
      @navigate-to-charts="navigateToCharts"
      @navigate-to-payments="navigateToPayments"
      @navigate-to-roles="navigateToRoles"
      @logout="logout"
    />

    <!-- Main Content -->
    <div class="main-content" :class="{ 'main-content-mobile': isMobile }">
      <div class="add-user-container">
        <div class="kinetic-card">
          <div class="form-header">
            <h2>
              <ion-icon :icon="shieldCheckmarkOutline"></ion-icon>
              Nuevo Rol Kinetic
            </h2>
            <button @click="goBack" class="back-btn">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
              <span>Volver</span>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="add-user-form">
            <div class="form-grid">
              <!-- Role Name -->
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label">Identificador del Rol</label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="shieldCheckmarkOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="form.roleName"
                    type="text"
                    class="form-input"
                    placeholder="Ej: Editor de Contenido"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn" :disabled="submitting">
                <ion-icon :icon="submitting ? refreshOutline : addOutline" :class="{ 'spin-kinetic': submitting }" style="margin-right: 10px;"></ion-icon>
                {{ submitting ? 'Procesando...' : 'Crear Rol Kinetic' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-bubble">
          <ion-icon :icon="checkmarkCircleOutline" style="font-size: 24px;"></ion-icon>
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import { userService } from '../../users/services/userService'
import { logout as authLogout } from '../../auth/services/authService'
import {
  addOutline,
  shieldCheckmarkOutline,
  refreshOutline,
  checkmarkCircleOutline,
  arrowBackOutline
} from 'ionicons/icons'

const isMobile = ref(false)
const checkMobile = () => { isMobile.value = window.innerWidth <= 1024 }

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const router = useRouter()
const activeSection = ref('roles')
const submitting = ref(false)
const successMessage = ref('')

const form = reactive({ roleName: '' })

const handleSubmit = async () => {
  if (!form.roleName.trim()) return
  try {
    submitting.value = true
    const success = await userService.createRole({ roleName: form.roleName.trim() })
    if (success) {
      successMessage.value = 'Rol creado exitosamente'
      setTimeout(() => router.push('/adminroles'), 2000)
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const goBack = () => router.push('/adminroles')
const logout = () => authLogout()
const navigateToUsers = () => router.push('/adminpanel')
const navigateToReports = () => router.push('/adminreportes')
const navigateToCharts = () => router.push('/adminmetricas')
const navigateToPayments = () => router.push('/adminpagos')
const navigateToRoles = () => router.push('/adminroles')
</script>

<style scoped>
@import '../../../theme/AddUserPage.css';

.back-btn-kinetic {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: white;
  border: 1px solid var(--admin-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: var(--admin-transition);
}

.back-btn-kinetic:hover {
  background: #f8fbff;
  border-color: var(--ion-color-primary);
  color: var(--ion-color-primary);
}

.success-message-kinetic {
  padding: 16px;
  border-radius: 12px;
  background: #e7f9f7;
  color: #27ae60;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.spin-kinetic {
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
