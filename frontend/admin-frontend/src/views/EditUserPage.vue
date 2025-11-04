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
    <div class="main-content">
      <!-- Edit User Form -->
      <div class="add-user-container">
        <div class="form-header">
          <button @click="goBack" class="back-btn">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
            Volver
          </button>
          <h2>
            <ion-icon :icon="createOutline" style="font-size: 28px; color: #00BCD4;"></ion-icon>
            Editar Usuario
          </h2>
        </div>

        <form @submit.prevent="handleSubmit" class="add-user-form" v-if="!loading">
          <div class="form-grid">
            <!-- Nombre -->
            <div class="form-group">
              <label for="firstName" class="form-label">Nombre *</label>
              <div class="input-group">
                <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  class="form-input"
                  placeholder="Ingrese el nombre"
                  required
                  :class="{ 'error': errors.firstName }"
                  @input="validateName"
                  @blur="validateName"
                />
              </div>
              <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
            </div>

            <!-- Apellido -->
            <div class="form-group">
              <label for="lastName" class="form-label">Apellido *</label>
              <div class="input-group">
                <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  class="form-input"
                  placeholder="Ingrese el apellido"
                  required
                  :class="{ 'error': errors.lastName }"
                  @input="validateLastName"
                  @blur="validateLastName"
                />
              </div>
              <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
            </div>

            <!-- Correo -->
            <div class="form-group">
              <label for="email" class="form-label">Correo Electrónico *</label>
              <div class="input-group">
                <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  placeholder="usuario@ejemplo.com"
                  required
                  :class="{ 'error': errors.email }"
                  @input="handleEmailInput"
                  @keydown="handleEmailKeydown"
                  @blur="handleEmailBlur"
                />
                <div v-if="showSuggestions && emailSuggestions.length > 0" class="email-suggestions-dropdown">
                  <div
                    v-for="(suggestion, index) in emailSuggestions"
                    :key="suggestion"
                    class="email-suggestion-item"
                    :class="{ 'selected': index === selectedSuggestionIndex }"
                    @click="selectEmailSuggestion(suggestion)"
                  >
                    {{ suggestion }}
                  </div>
                </div>
              </div>
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>

            <!-- Teléfono -->
            <div class="form-group">
              <label for="phone" class="form-label">Teléfono</label>
              <div class="input-group">
                <ion-icon :icon="callOutline" class="input-icon"></ion-icon>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="form-input"
                  placeholder="3001234567"
                  :class="{ 'error': errors.phone }"
                  @input="validatePhone"
                  @blur="validatePhone"
                />
              </div>
              <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
            </div>

            <!-- Identificación -->
            <div class="form-group">
              <label for="identification" class="form-label">Número de Identificación *</label>
              <div class="input-group">
                <ion-icon :icon="cardOutline" class="input-icon"></ion-icon>
                <input
                  id="identification"
                  v-model="form.identification"
                  type="number"
                  class="form-input"
                  placeholder="1234567890"
                  required
                  :class="{ 'error': errors.identification }"
                  @input="validateIdentification"
                  @blur="validateIdentification"
                />
              </div>
              <span v-if="errors.identification" class="error-message">{{ errors.identification }}</span>
            </div>

            <!-- Rol -->
            <div class="form-group">
              <label for="role" class="form-label">Rol *</label>
              <div class="input-group">
                <ion-icon :icon="shieldCheckmarkOutline" class="input-icon"></ion-icon>
                <select
                  id="role"
                  v-model="form.role"
                  class="form-input"
                  required
                  :class="{ 'error': errors.role }"
                  @change="validateRole"
                  @blur="validateRole"
                >
                  <option value="" disabled>Seleccione un rol</option>
                  <option
                    v-for="role in roles"
                    :key="role.roleId"
                    :value="role.roleName"
                  >
                    {{ role.roleName }}
                  </option>
                </select>
              </div>
              <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
            </div>

            <!-- Contraseña (opcional para editar) -->
            <div class="form-group">
              <label for="password" class="form-label">Nueva Contraseña <span class="optional">(opcional)</span></label>
              <div class="input-group">
                <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  class="form-input"
                  placeholder="•••••••• (dejar vacío para mantener actual)"
                  :class="{ 'error': errors.password }"
                  @input="validatePassword"
                  @blur="validatePassword"
                />
              </div>
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
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
                Actualizar Usuario
              </span>
            </button>
          </div>
        </form>

        <!-- Loading State -->
        <div v-else class="loading-state">
          <ion-icon :icon="refreshOutline" class="loading-icon"></ion-icon>
          <p>Cargando datos del usuario...</p>
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
import { userService, Role } from '@/services/userService'
import {
  personOutline,
  mailOutline,
  callOutline,
  cardOutline,
  lockClosedOutline,
  refreshOutline,
  checkmarkOutline,
  checkmarkCircleOutline,
  arrowBackOutline,
  createOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons'

const router = useRouter()
const route = useRoute()
const activeSection = ref('users')
const loading = ref(true)
const submitting = ref(false)
const successMessage = ref('')
const roles = ref<Role[]>([])

// Get user ID from route params
const userId = route.params.userId as string

// Email suggestions
const emailSuggestions = ref<string[]>([])
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)

// Email domains
const commonEmailDomains = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'icloud.com',
  'live.com',
  'me.com',
  'aol.com',
  'protonmail.com'
]

// Form state
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  identification: '',
  role: '',
  password: ''
})

// Original user data for comparison
const originalUser = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  identification: '',
  role: '',
  roleId: 0,
  password: ''
})

// Error state
const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  identification: '',
  role: '',
  password: ''
})

// Load user data on mount
onMounted(async () => {
  await loadRoles()
  await loadUserData()
  setUserRole()
})

// Load user data from API
const loadUserData = async () => {
  try {
    loading.value = true

    // Get all users and find the specific user
    const users = await userService.getAllUsers()
    const user = users.find(u => u.userId === parseInt(userId))

    if (user) {
      form.firstName = user.firstName
      form.lastName = user.lastName
      form.email = user.email
      form.phone = user.phone || ''
      form.identification = user.identification.toString()
      form.role = user.role || 'user'
      form.password = '' // Don't load password

      // Store original values for comparison
      originalUser.firstName = user.firstName
      originalUser.lastName = user.lastName
      originalUser.email = user.email
      originalUser.phone = user.phone || ''
      originalUser.identification = user.identification.toString()
      originalUser.role = user.role || 'user'
      // Find and store original roleId
      const originalRole = roles.value.find(r => r.roleName === (user.role || 'user'))
      originalUser.roleId = originalRole ? originalRole.roleId : 0
      originalUser.password = ''
    } else {
      throw new Error('Usuario no encontrado')
    }
  } catch (error) {
    console.error('Error loading user data:', error)
    // Redirect back if user not found
    router.push('/adminpanel')
  } finally {
    loading.value = false
  }
}

// Load roles from API
const loadRoles = async () => {
  try {
    roles.value = await userService.getRoles()
  } catch (error) {
    console.error('Error loading roles:', error)
  }
}

// Set user role after roles are loaded
const setUserRole = () => {
  if (roles.value.length > 0 && originalUser.role) {
    // Find the role that matches the user's current role
    const userRole = roles.value.find(r => r.roleName === originalUser.role)
    if (userRole) {
      form.role = userRole.roleName
    } else {
      // If no match found, set to first available role or default
      form.role = roles.value[0]?.roleName || ''
    }
  }
}

// Email handling functions
const handleEmailInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Reset suggestions
  emailSuggestions.value = []
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1

  // Generate suggestions when user types @
  if (value.includes('@')) {
    const [localPart, domainPart] = value.split('@')

    if (localPart && domainPart === '') {
      // Show all common domains
      emailSuggestions.value = commonEmailDomains.map(domain => `${localPart}@${domain}`)
      showSuggestions.value = true
    } else if (localPart && domainPart) {
      // Filter domains based on what user is typing
      const filteredDomains = commonEmailDomains.filter(domain =>
        domain.toLowerCase().startsWith(domainPart.toLowerCase())
      )
      emailSuggestions.value = filteredDomains.map(domain => `${localPart}@${domain}`)
      showSuggestions.value = emailSuggestions.value.length > 0
    }
  }

  // Clear error when user starts typing
  if (errors.email) {
    errors.email = ''
  }
}

const handleEmailKeydown = (event: KeyboardEvent) => {
  if (!showSuggestions.value || emailSuggestions.value.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.min(
        selectedSuggestionIndex.value + 1,
        emailSuggestions.value.length - 1
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedSuggestionIndex.value >= 0) {
        selectEmailSuggestion(emailSuggestions.value[selectedSuggestionIndex.value])
      }
      break
    case 'Escape':
      showSuggestions.value = false
      selectedSuggestionIndex.value = -1
      break
  }
}

const handleEmailBlur = () => {
  // Delay hiding suggestions to allow click events
  setTimeout(() => {
    showSuggestions.value = false
    selectedSuggestionIndex.value = -1
  }, 150)

  validateEmail()
}

const selectEmailSuggestion = (suggestion: string) => {
  form.email = suggestion
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1
  validateEmail()
}

// Validation functions
const validateName = () => {
  const name = form.firstName.trim()

  if (!name) {
    errors.firstName = 'El nombre es requerido'
    return false
  }

  if (name.length < 2) {
    errors.firstName = 'El nombre debe tener al menos 2 caracteres'
    return false
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
    errors.firstName = 'El nombre solo puede contener letras y espacios'
    return false
  }

  errors.firstName = ''
  return true
}

const validateLastName = () => {
  const lastName = form.lastName.trim()

  if (!lastName) {
    errors.lastName = 'El apellido es requerido'
    return false
  }

  if (lastName.length < 2) {
    errors.lastName = 'El apellido debe tener al menos 2 caracteres'
    return false
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastName)) {
    errors.lastName = 'El apellido solo puede contener letras y espacios'
    return false
  }

  errors.lastName = ''
  return true
}

const validateEmail = () => {
  const email = form.email.trim()

  if (!email) {
    errors.email = 'El correo electrónico es requerido'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.email = 'Ingresa un correo electrónico válido'
    return false
  }

  errors.email = ''
  return true
}

const validatePhone = () => {
  const phone = form.phone.trim()

  if (phone && !/^3\d{9}$/.test(phone)) {
    errors.phone = 'El teléfono debe comenzar con 3 y tener 10 dígitos'
    return false
  }

  errors.phone = ''
  return true
}

const validatePassword = () => {
  const password = form.password

  if (password && password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
    return false
  }

  errors.password = ''
  return true
}

const validateRole = () => {
  const role = form.role

  if (!role) {
    errors.role = 'El rol es requerido'
    return false
  }

  // Check if the selected role exists in the loaded roles
  const roleExists = roles.value.some(r => r.roleName === role)
  if (!roleExists) {
    errors.role = 'Selecciona un rol válido'
    return false
  }

  errors.role = ''
  return true
}

const validateIdentification = () => {
  const identification = form.identification

  if (!identification) {
    errors.identification = 'El número de identificación es requerido'
    return false
  }

  const idStr = identification.toString()
  if (idStr.length < 6 || idStr.length > 12) {
    errors.identification = 'La identificación debe tener entre 6 y 12 dígitos'
    return false
  }

  errors.identification = ''
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
  if (!validateName()) return
  if (!validateLastName()) return
  if (!validateEmail()) return
  if (!validateIdentification()) return
  if (!validatePhone()) return
  if (!validateRole()) return
  if (!validatePassword()) return

  try {
    submitting.value = true

    // Prepare data for API - only include changed fields
    const updateData: any = {}

    if (form.firstName.trim() !== originalUser.firstName) {
      updateData.firstName = form.firstName.trim()
    }
    if (form.lastName.trim() !== originalUser.lastName) {
      updateData.lastName = form.lastName.trim()
    }
    if (form.email.trim().toLowerCase() !== originalUser.email.toLowerCase()) {
      updateData.email = form.email.trim().toLowerCase()
    }
    if (form.phone.trim() !== originalUser.phone) {
      updateData.phone = form.phone.trim() || null
    }
    if (form.identification !== originalUser.identification) {
      updateData.identification = parseInt(form.identification)
    }

    // Find roleId from selected role name
    const selectedRole = roles.value.find(r => r.roleName === form.role)
    if (selectedRole && selectedRole.roleId !== originalUser.roleId) {
      updateData.roleId = selectedRole.roleId
    }

    // Only include password if it's provided
    if (form.password) {
      updateData.password = form.password
    }

    // Call API to update user
    const response = await fetch(`/api/auth/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    const result = await response.json()

    if (response.ok && result.success) {
      successMessage.value = 'Usuario actualizado exitosamente'

      // Reset password field
      form.password = ''

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/adminpanel')
      }, 2000)
    } else {
      // Handle API errors
      if (result.message?.includes('email')) {
        errors.email = 'El correo electrónico ya está registrado'
      } else if (result.message?.includes('identificación')) {
        errors.identification = 'El número de identificación ya está registrado'
      } else {
        errors.email = result.message || 'Error al actualizar el usuario'
      }
    }

  } catch (error) {
    console.error('Error updating user:', error)
    errors.email = 'Error de conexión. Inténtalo de nuevo.'
  } finally {
    submitting.value = false
  }
}

// Navigation functions
const goBack = () => {
  router.push('/adminpanel')
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

/* Override some styles for edit mode */
.add-user-container h2 ion-icon {
  color: #FF9800; /* Orange color for edit */
}

.submit-btn {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #F57C00 0%, #EF6C00 100%);
}

.optional {
  font-weight: normal;
  color: #6c757d;
  font-size: 12px;
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

.loading-state p {
  margin-top: 20px;
  font-size: 16px;
}
</style>