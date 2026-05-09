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
      <KineticLoading 
        v-if="loading" 
        title="Seguridad y Roles" 
        message="Consultando políticas de acceso y jerarquías..." 
      />

      <div v-else class="dashboard-content">
        <!-- Header -->
        <div class="dashboard-header">
          <h1>Roles y Seguridad</h1>
          <p class="last-update">Configuración de accesos y permisos del sistema</p>
        </div>

        <!-- Actions -->
        <div class="roles-actions-section">
          <button @click="navigateToAddRole" class="add-user-btn">
            <ion-icon :icon="addCircleOutline"></ion-icon>
            <span>Crear Nuevo Rol</span>
          </button>
        </div>

        <!-- Table Container -->
        <div class="roles-table-container">
          <!-- Roles Table -->
          <table class="roles-table" v-if="roles.length > 0">
            <thead>
              <tr>
                <th style="width: 100px;">ID</th>
                <th>Identificador del Rol</th>
                <th>Categoría</th>
                <th>Operaciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in paginatedRoles" :key="role.roleId">
                <td style="font-family: monospace; opacity: 0.6;">#{{ role.roleId }}</td>
                <td>
                  <span style="font-weight: 800; color: var(--admin-text-main); font-family: var(--app-font-brand);">{{ role.roleName }}</span>
                </td>
                <td>
                  <span class="status-badge" :style="{ background: role.roleName === 'admin' ? 'var(--admin-accent-soft)' : 'var(--admin-bg-subtle)', color: role.roleName === 'admin' ? 'var(--admin-accent)' : 'var(--admin-text-sub)' }">
                    {{ role.roleName === 'admin' ? 'Prioridad Alta' : 'Estándar' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button @click="editRole(role)" class="edit-btn" title="Editar">
                    <ion-icon :icon="createOutline"></ion-icon>
                  </button>
                  <button @click="confirmDeleteRole(role)" class="delete-btn" title="Eliminar">
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <ion-icon :icon="shieldCheckmarkOutline" class="empty-icon"></ion-icon>
            <h3>Sin registros de seguridad</h3>
            <p>Es necesario configurar al menos un rol administrativo para el sistema</p>
          </div>

          <!-- Pagination for Roles Table -->
          <div style="padding: 20px 40px;">
            <Pagination
              :total-items="roles.length"
              :current-page="rolesCurrentPage"
              :page-size="rolesPageSize"
              item-name="roles"
              component-id="roles"
              @update:current-page="rolesCurrentPage = $event"
              @update:page-size="rolesPageSize = $event"
            />
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal" style="display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); position: fixed; inset: 0; z-index: 2000;">
          <div class="kinetic-card" @click.stop style="max-width: 450px; width: 90%; background: var(--admin-bg-card);">
            <div class="form-header" style="background: rgba(186, 26, 26, 0.05);">
              <h2 style="font-size: 1.4rem;">
                <ion-icon :icon="trashOutline" style="color: #ba1a1a;"></ion-icon>
                Eliminar Rol
              </h2>
            </div>
            <div style="padding: 30px;">
              <p style="font-weight: 600; font-size: 1.1rem;">¿Confirmas la baja definitiva del rol <strong>{{ roleToDelete?.roleName }}</strong>?</p>
              <p style="margin-top: 15px; color: var(--admin-text-sub); font-size: 0.9rem;">Esta acción revocará accesos de forma instantánea a todos los usuarios vinculados.</p>
              
              <div style="display: flex; gap: 15px; margin-top: 30px; justify-content: flex-end;">
                <button @click="closeDeleteModal" class="back-btn">Cancelar</button>
                <button @click="deleteRole" class="submit-btn" style="background: #ba1a1a; min-width: 140px;" :disabled="deleting">
                  <span v-if="deleting">Eliminando...</span>
                  <span v-else>Confirmar Baja</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import Pagination from '@/components/Pagination.vue'
import KineticLoading from '@/components/KineticLoading.vue'
import { userService, type RoleResponse } from '../../users/services/userService'
import { logout as authLogout } from '../../auth/services/authService'
import {
  shieldCheckmarkOutline,
  addCircleOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons'

// Mobile responsive state
const isMobile = ref(false)

// Check if mobile on mount
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 1024
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const router = useRouter()
const activeSection = ref('roles')
const loading = ref(true)
const roles = ref<RoleResponse[]>([])
const showDeleteModal = ref(false)
const deleting = ref(false)
const roleToDelete = ref<RoleResponse | null>(null)

// Estado de paginación para roles
const rolesCurrentPage = ref(1)
const rolesPageSize = ref(10)

// Computed para datos paginados
const paginatedRoles = computed(() => {
  const start = (rolesCurrentPage.value - 1) * rolesPageSize.value
  const end = start + rolesPageSize.value
  return roles.value.slice(start, end)
})

// Load roles on mount
onMounted(async () => {
  await loadRoles()
})

// Load roles from API
const loadRoles = async () => {
  try {
    loading.value = true
    roles.value = await userService.getRoles()
  } catch (error) {
    console.error('Error loading roles:', error)
  } finally {
    loading.value = false
  }
}

// Navigation functions
const navigateToUsers = () => router.push('/adminpanel')
const navigateToReports = () => router.push('/adminreportes')
const navigateToCharts = () => router.push('/adminmetricas')
const navigateToPayments = () => router.push('/adminpagos')
const navigateToRoles = () => router.push('/adminroles')

const navigateToAddRole = () => {
  router.push('/adminaddrole')
}

const editRole = (role: RoleResponse) => {
  router.push(`/admineditrole/${role.roleId}`)
}

const confirmDeleteRole = (role: RoleResponse) => {
  roleToDelete.value = role
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  roleToDelete.value = null
}

const deleteRole = async () => {
  if (!roleToDelete.value) return

  try {
    deleting.value = true
    const success = await userService.deleteRole(roleToDelete.value.roleId)
    if (success) {
      roles.value = roles.value.filter(r => r.roleId !== roleToDelete.value!.roleId)
      closeDeleteModal()
    }
  } catch (error) {
    console.error('Error deleting role:', error)
  } finally {
    deleting.value = false
  }
}

const logout = () => {
  authLogout()
}
</script>

<style scoped>
@import '../../../theme/RolesPage.css';
</style>
