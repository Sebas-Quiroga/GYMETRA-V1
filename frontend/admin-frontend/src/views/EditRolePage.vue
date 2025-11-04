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
      <!-- Edit Role Form -->
      <div class="edit-role-container">
        <div class="form-header">
          <button @click="goBack" class="back-btn">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
            Volver
          </button>
          <h2>
            <ion-icon :icon="createOutline" style="font-size: 28px; color: #FF9800;"></ion-icon>
            Editar Rol
          </h2>
        </div>

        <form @submit.prevent="handleSubmit" class="edit-role-form" v-if="!loading">
          <div class="form-grid">
            <!-- Role Name -->
            <div class="form-group">
              <label for="roleName" class="form-label">Nombre del Rol *</label>
              <div class="input-group">
                <ion-icon :icon="shieldCheckmarkOutline" class="input-icon"></ion-icon>
                <input
                  id="roleName"
                  v-model="form.roleName"
                  type="text"
                  class="form-input"
                  placeholder="Ingrese el nombre del rol"
                  required
                  :class="{ 'error': errors.roleName }"
                  @input="validateRoleName"
                  @blur="validateRoleName"
                />
              </div>
              <span v-if="errors.roleName" class="error-message">{{ errors.roleName }}</span>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="submitting">
              <span v-if="submitting" class="loading-spinner">
                <ion-icon :icon="refreshOutline" class="spinner-icon"></ion-icon>
              </span>
              <span v-else>
                <ion-icon :icon="checkmarkOutline"></ion-icon>
                Actualizar Rol
              </span>
            </button>
          </div>
        </form>

        <!-- Loading State -->
        <div v-else class="loading-state">
          <ion-icon :icon="refreshOutline" class="loading-icon"></ion-icon>
          <p>Cargando datos del rol...</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-message">
          <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import { userService, RoleRequest, RoleResponse } from '@/services/userService'
import {
  createOutline,
  shieldCheckmarkOutline,
  refreshOutline,
  checkmarkOutline,
  checkmarkCircleOutline,
  arrowBackOutline
} from 'ionicons/icons'

// Mobile responsive state
const isMobile = ref(false)

// Check if mobile on mount
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

const router = useRouter()
const route = useRoute()
const activeSection = ref('roles')
const loading = ref(true)
const submitting = ref(false)
const successMessage = ref('')

// Get role ID from route params
const roleId = route.params.roleId as string

// Form state
const form = reactive({
  roleName: ''
})

// Original role data for comparison
const originalRole = reactive({
  roleName: ''
})

// Error state
const errors = reactive({
  roleName: ''
})

// Load role data on mount
onMounted(async () => {
  await loadRoleData()
})

// Load role data from API
const loadRoleData = async () => {
  try {
    loading.value = true

    // Get role by ID
    const role = await userService.getRoleById(parseInt(roleId))

    if (role) {
      form.roleName = role.roleName
      originalRole.roleName = role.roleName
    } else {
      throw new Error('Rol no encontrado')
    }
  } catch (error) {
    console.error('Error loading role data:', error)
    // Redirect back if role not found
    router.push('/admin/roles')
  } finally {
    loading.value = false
  }
}

// Validation functions
const validateRoleName = () => {
  const roleName = form.roleName.trim()

  if (!roleName) {
    errors.roleName = 'El nombre del rol es requerido'
    return false
  }

  if (roleName.length < 2) {
    errors.roleName = 'El nombre del rol debe tener al menos 2 caracteres'
    return false
  }

  if (roleName.length > 50) {
    errors.roleName = 'El nombre del rol no puede exceder 50 caracteres'
    return false
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(roleName)) {
    errors.roleName = 'El nombre del rol solo puede contener letras y espacios'
    return false
  }

  errors.roleName = ''
  return true
}

// Handle form submission
const handleSubmit = async () => {
  // Reset errors and success message
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  successMessage.value = ''

  // Validation
  if (!validateRoleName()) return

  // Check if anything changed
  if (form.roleName.trim() === originalRole.roleName) {
    successMessage.value = 'No se detectaron cambios'
    return
  }

  try {
    submitting.value = true

    // Prepare data for API
    const roleData: RoleRequest = {
      roleName: form.roleName.trim()
    }

    // Call API to update role
    const response = await userService.updateRole(parseInt(roleId), roleData)

    if (response) {
      successMessage.value = 'Rol actualizado exitosamente'

      // Update original data
      originalRole.roleName = form.roleName.trim()

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/roles')
      }, 2000)
    }

  } catch (error: any) {
    console.error('Error updating role:', error)
    if (error.response?.status === 400) {
      errors.roleName = 'El nombre del rol ya existe'
    } else {
      errors.roleName = 'Error al actualizar el rol. Inténtalo de nuevo.'
    }
  } finally {
    submitting.value = false
  }
}

// Navigation functions
const goBack = () => {
  router.push('/admin/roles')
}

const logout = () => {
  router.push('/loginadmin')
}

const navigateToUsers = () => {
  activeSection.value = 'users'
  router.push('/adminpanel')
}

const navigateToReports = () => {
  activeSection.value = 'reports'
  console.log('Navegando a reportes')
}

const navigateToCharts = () => {
  activeSection.value = 'charts'
  router.push('/adminmetricas')
}

const navigateToPayments = () => {
  activeSection.value = 'payments'
  router.push('/adminpagos')
}

const navigateToRoles = () => {
  activeSection.value = 'roles'
  router.push('/admin/roles')
}
</script>

<style>
@import '../theme/AddUserPage.css';

.edit-role-container h2 ion-icon {
  color: #FF9800;
}

.submit-btn {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #F57C00 0%, #EF6C00 100%);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 600px;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.loading-icon {
  font-size: 48px;
  color: #00BCD4;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>