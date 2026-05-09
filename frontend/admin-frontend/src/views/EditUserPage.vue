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
              <ion-icon :icon="createOutline"></ion-icon>
              Editar Perfil Kinetic
            </h2>
            <button @click="goBack" class="back-btn">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
              <span>Volver</span>
            </button>
          </div>

          <!-- Membership Status Banner -->
          <div v-if="activeMembership" class="membership-status-banner" :class="activeMembership.status.toLowerCase()">
            <div class="status-info">
              <ion-icon :icon="checkmarkCircleOutline" class="status-icon"></ion-icon>
              <div>
                <span class="status-label">Membresía {{ activeMembership.status }}</span>
                <p class="status-detail">Vencimiento: {{ new Date(activeMembership.endDate).toLocaleDateString() }}</p>
              </div>
            </div>
            <div class="membership-badge">
              KIN-{{ activeMembership.id }}
            </div>
          </div>
          <div v-else-if="!loading && !membershipLoading" class="membership-status-banner inactive">
            <div class="status-info">
              <ion-icon :icon="refreshOutline" class="status-icon"></ion-icon>
              <div>
                <span class="status-label">Sin Membresía Activa</span>
                <p class="status-detail">Este usuario no cuenta con una suscripción vigente.</p>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="add-user-form" v-if="!loading">
            <div class="form-grid">
              <!-- Nombre -->
              <div class="form-group">
                <label class="form-label">Nombre</label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="form.firstName"
                    type="text"
                    class="form-input"
                    placeholder="Ingrese el nombre"
                    required
                  />
                </div>
              </div>

              <!-- Apellido -->
              <div class="form-group">
                <label class="form-label">Apellido</label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="form.lastName"
                    type="text"
                    class="form-input"
                    placeholder="Ingrese el apellido"
                    required
                  />
                </div>
              </div>

              <!-- Correo -->
              <div class="form-group">
                <label class="form-label">Correo Electrónico</label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="form.email"
                    type="email"
                    class="form-input"
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <!-- Teléfono -->
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="callOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="form-input"
                    placeholder="300 000 0000"
                  />
                </div>
              </div>

              <!-- Identificación -->
              <div class="form-group">
                <label class="form-label">Número de Identificación</label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="cardOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="form.identification"
                    type="number"
                    class="form-input"
                    placeholder="1234567890"
                    required
                  />
                </div>
              </div>

              <!-- Rol -->
              <div class="form-group">
                <label class="form-label">Rol Asignado</label>
                <div class="input-wrapper-kinetic" style="padding-left: 52px;">
                  <ion-icon :icon="shieldCheckmarkOutline" class="input-icon"></ion-icon>
                  <select v-model="form.role" class="form-input" style="padding-left: 0;" required>
                    <option value="" disabled>Seleccione un rol</option>
                    <option v-for="role in roles" :key="role.roleId" :value="role.roleName">
                      {{ role.roleName }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Contraseña -->
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label">Nueva Contraseña <span style="font-size: 0.8rem; font-weight: 500; opacity: 0.6;">(Opcional)</span></label>
                <div class="input-wrapper-kinetic">
                  <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="form.password"
                    type="password"
                    class="form-input"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn" :disabled="submitting">
                <ion-icon :icon="submitting ? refreshOutline : checkmarkOutline" :class="{ 'spin-kinetic': submitting }" style="margin-right: 10px;"></ion-icon>
                {{ submitting ? 'Guardando...' : 'Actualizar Perfil' }}
              </button>
            </div>
          </form>

          <!-- Loading State -->
          <KineticLoading 
            v-else
            title="Sincronización de Perfil"
            message="Actualizando los registros del sistema..."
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import KineticLoading from '@/components/KineticLoading.vue'
import { userService, Role } from '@/services/userService'
import { membershipService, UserMembership } from '@/services/membershipService'
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

const isMobile = ref(false)
const checkMobile = () => { isMobile.value = window.innerWidth <= 768 }

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

const router = useRouter()
const route = useRoute()
const activeSection = ref('users')
const loading = ref(true)
const submitting = ref(false)
const roles = ref<Role[]>([])
const activeMembership = ref<UserMembership | null>(null)
const membershipLoading = ref(false)

const userId = route.params.userId as string

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  identification: '',
  role: '',
  password: ''
})

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

onMounted(async () => {
  await loadRoles()
  await loadUserData()
  await loadUserMembership()
  setUserRole()
})

const loadUserData = async () => {
  try {
    loading.value = true
    const users = await userService.getAllUsers()
    const user = users.find(u => u.userId === parseInt(userId))
    if (user) {
      form.firstName = user.firstName
      form.lastName = user.lastName
      form.email = user.email
      form.phone = user.phone || ''
      form.identification = user.identification.toString()
      form.role = user.role || 'user'
      originalUser.firstName = user.firstName
      originalUser.lastName = user.lastName
      originalUser.email = user.email
      originalUser.phone = user.phone || ''
      originalUser.identification = user.identification.toString()
      originalUser.role = user.role || 'user'
      const originalRole = roles.value.find(r => r.roleName === (user.role || 'user'))
      originalUser.roleId = originalRole ? originalRole.roleId : 0
    }
  } catch (error) {
    console.error(error)
    router.push('/adminpanel')
  } finally {
    loading.value = false
  }
}

const loadUserMembership = async () => {
  try {
    membershipLoading.value = true
    const allUserMemberships = await membershipService.getAllUserMemberships()
    // Encontrar la membresía activa más reciente para este usuario
    const userMemberships = allUserMemberships
      .filter(m => m.userId === parseInt(userId))
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    
    activeMembership.value = userMemberships.find(m => m.status === 'ACTIVE') || userMemberships[0] || null
  } catch (error) {
    console.error('Error al cargar membresía:', error)
  } finally {
    membershipLoading.value = false
  }
}

const loadRoles = async () => {
  try { roles.value = await userService.getRoles() } catch (error) {}
}

const setUserRole = () => {
  if (roles.value.length > 0 && originalUser.role) {
    const userRole = roles.value.find(r => r.roleName === originalUser.role)
    if (userRole) form.role = userRole.roleName
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    const updateData: any = {}
    if (form.firstName !== originalUser.firstName) updateData.firstName = form.firstName.trim()
    if (form.lastName !== originalUser.lastName) updateData.lastName = form.lastName.trim()
    if (form.email !== originalUser.email) updateData.email = form.email.trim().toLowerCase()
    if (form.phone !== originalUser.phone) updateData.phone = form.phone.trim() || null
    if (form.identification !== originalUser.identification) updateData.identification = parseInt(form.identification)
    const selectedRole = roles.value.find(r => r.roleName === form.role)
    if (selectedRole && selectedRole.roleId !== originalUser.roleId) updateData.roleId = selectedRole.roleId
    if (form.password) updateData.password = form.password

    const response = await fetch(`/api/auth/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    if (response.ok) router.push('/adminpanel')
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const goBack = () => router.push('/adminpanel')
const logout = () => router.push('/loginadmin')
const navigateToUsers = () => router.push('/adminpanel')
const navigateToReports = () => router.push('/adminreportes')
const navigateToCharts = () => router.push('/adminmetricas')
const navigateToPayments = () => router.push('/adminpagos')
const navigateToRoles = () => router.push('/admin/roles')

const handleEmailInput = (e: any) => {}
const handleEmailKeydown = (e: any) => {}
const handleEmailBlur = () => {}
</script>

<style>
@import '../theme/AddUserPage.css';

.membership-status-banner {
  margin: 0 40px;
  padding: 20px 30px;
  border-radius: var(--admin-radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: var(--admin-transition);
  border-left: 6px solid transparent;
}

.membership-status-banner.active {
  background: rgba(39, 174, 96, 0.1);
  border-left-color: #27ae60;
}

.membership-status-banner.pending {
  background: rgba(255, 152, 0, 0.1);
  border-left-color: #ff9800;
}

.membership-status-banner.inactive, .membership-status-banner.expired {
  background: rgba(186, 26, 26, 0.1);
  border-left-color: #ba1a1a;
  margin-bottom: 20px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-icon {
  font-size: 2rem;
  color: inherit;
}

.status-label {
  display: block;
  font-family: var(--app-font-brand);
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--admin-text-main);
  text-transform: uppercase;
}

.status-detail {
  margin: 0;
  font-size: 0.9rem;
  color: var(--admin-text-sub);
  font-weight: 600;
}

.membership-badge {
  background: var(--admin-bg-card);
  padding: 8px 16px;
  border-radius: 100px;
  font-weight: 800;
  font-size: 0.8rem;
  border: 1px solid var(--admin-border);
  color: var(--admin-text-sub);
}

.back-btn {
  background: var(--admin-bg-subtle) !important;
  color: var(--admin-text-sub) !important;
}

.back-btn:hover {
  background: var(--admin-accent) !important;
  color: white !important;
}

.input-wrapper-kinetic {
  background: var(--admin-bg-subtle) !important;
}

.form-input {
  color: var(--admin-text-main) !important;
}

.form-label {
  color: var(--admin-text-sub) !important;
}

.optional-text {
  color: var(--admin-text-sub);
  opacity: 0.6;
}

/* Kinetic Loading Fixes */
.loading-state-kinetic {
  text-align: center;
  padding: 80px;
  color: var(--admin-text-sub);
}

.spin-kinetic {
  animation: spin 1s linear infinite;
  font-size: 2.2rem;
  color: var(--admin-accent);
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .membership-status-banner {
    margin: 0 20px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>