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
      <!-- Add Role Form -->
      <div class="add-role-container">
        <div class="form-header">
          <button @click="goBack" class="back-btn">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
            Volver
          </button>
          <h2>
            <ion-icon :icon="addOutline" style="font-size: 28px; color: #00BCD4;"></ion-icon>
            Agregar Rol
          </h2>
        </div>

        <form @submit.prevent="handleSubmit" class="add-role-form">
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
                Crear Rol
              </span>
            </button>
          </div>
        </form>

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
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import { userService, RoleRequest } from '@/services/userService'
import {
  addOutline,
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
const activeSection = ref('roles')
const submitting = ref(false)
const successMessage = ref('')

// Form state
const form = reactive({
  roleName: ''
})

// Error state
const errors = reactive({
  roleName: ''
})

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

  try {
    submitting.value = true

    // Prepare data for API
    const roleData: RoleRequest = {
      roleName: form.roleName.trim()
    }

    // Call API to create role
    const response = await userService.createRole(roleData)

    if (response) {
      successMessage.value = 'Rol creado exitosamente'

      // Reset form
      form.roleName = ''

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/roles')
      }, 2000)
    }

  } catch (error: any) {
    console.error('Error creating role:', error)
    if (error.response?.status === 400) {
      errors.roleName = 'El nombre del rol ya existe'
    } else {
      errors.roleName = 'Error al crear el rol. Inténtalo de nuevo.'
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

.add-role-container h2 ion-icon {
  color: #00BCD4;
}

.submit-btn {
  background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0097A7 0%, #00838F 100%);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 600px;
}
</style>