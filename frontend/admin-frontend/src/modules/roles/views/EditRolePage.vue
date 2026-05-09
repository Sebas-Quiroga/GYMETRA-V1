<template>
  <div class="admin-dashboard">
    <AdminSidebar
      :active-section="activeSection"
      @navigate-to-users="navigateToUsers"
      @navigate-to-reports="navigateToReports"
      @navigate-to-charts="navigateToCharts"
      @navigate-to-payments="navigateToPayments"
      @navigate-to-roles="navigateToRoles"
      @logout="logout"
    />

    <div class="main-content" :class="{ 'main-content-mobile': isMobile }">
      <div class="add-user-container">
        <div class="kinetic-card">
          <div class="form-header">
            <h2>
              <ion-icon :icon="createOutline"></ion-icon>
              Editar Rol Kinetic
            </h2>
            <button @click="goBack" class="back-btn">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
              <span>Volver</span>
            </button>
          </div>

          <KineticLoading
            v-if="loading"
            title="Cargando rol"
            message="Consultando la configuracion del rol..."
          />

          <form v-else @submit.prevent="handleSubmit" class="add-user-form">
            <div class="form-grid">
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label">Identificador del Rol</label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="shieldCheckmarkOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="form.roleName"
                    type="text"
                    class="form-input"
                    placeholder="Ej: admin"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn" :disabled="submitting">
                <ion-icon
                  :icon="submitting ? refreshOutline : checkmarkCircleOutline"
                  :class="{ 'spin-kinetic': submitting }"
                  style="margin-right: 10px;"
                ></ion-icon>
                {{ submitting ? 'Guardando...' : 'Actualizar Rol' }}
              </button>
            </div>
          </form>
        </div>

        <div v-if="successMessage" class="success-bubble">
          <ion-icon :icon="checkmarkCircleOutline" style="font-size: 24px;"></ion-icon>
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import KineticLoading from '@/components/KineticLoading.vue'
import { userService } from '../../users/services/userService'
import { logout as authLogout } from '../../auth/services/authService'
import {
  arrowBackOutline,
  checkmarkCircleOutline,
  createOutline,
  refreshOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons'

const router = useRouter()
const route = useRoute()

const activeSection = ref('roles')
const isMobile = ref(false)
const loading = ref(true)
const submitting = ref(false)
const successMessage = ref('')
const form = reactive({ roleName: '' })

const roleId = Number(route.params.roleId)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 1024
}

const loadRole = async () => {
  try {
    loading.value = true
    const role = await userService.getRoleById(roleId)
    form.roleName = role.roleName
  } catch (error) {
    console.error('Error loading role:', error)
    router.push('/adminroles')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.roleName.trim()) return

  try {
    submitting.value = true
    await userService.updateRole(roleId, { roleName: form.roleName.trim() })
    successMessage.value = 'Rol actualizado exitosamente'
    setTimeout(() => router.push('/adminroles'), 1200)
  } catch (error) {
    console.error('Error updating role:', error)
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

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadRole()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
@import '../../../theme/AddUserPage.css';
</style>
