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
      <!-- Roles Management -->
      <div class="roles-container">
        <div class="header-section">
          <h2>
            <ion-icon :icon="shieldCheckmarkOutline"></ion-icon>
            Gestión de Roles
          </h2>
          <button @click="navigateToAddRole" class="add-role-btn">
            <ion-icon :icon="addOutline"></ion-icon>
            Agregar Rol
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <ion-icon :icon="refreshOutline" class="loading-icon"></ion-icon>
          <p>Cargando roles...</p>
        </div>

        <!-- Roles Table -->
        <div v-else class="roles-table-container">
          <table class="roles-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in roles" :key="role.roleId">
                <td>{{ role.roleId }}</td>
                <td>{{ role.roleName }}</td>
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
          <div v-if="roles.length === 0" class="empty-state">
            <ion-icon :icon="shieldCheckmarkOutline" class="empty-icon"></ion-icon>
            <h3>No hay roles registrados</h3>
            <p>Crea tu primer rol para comenzar</p>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Confirmar Eliminación</h3>
              <button @click="closeDeleteModal" class="close-btn">
                <ion-icon :icon="closeOutline"></ion-icon>
              </button>
            </div>
            <div class="modal-body">
              <p>¿Estás seguro de que deseas eliminar el rol <strong>{{ roleToDelete?.roleName }}</strong>?</p>
              <p class="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer">
              <button @click="closeDeleteModal" class="cancel-btn">Cancelar</button>
              <button @click="deleteRole" class="confirm-delete-btn" :disabled="deleting">
                <span v-if="deleting" class="loading-spinner">
                  <ion-icon :icon="refreshOutline" class="spinner-icon"></ion-icon>
                </span>
                <span v-else>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import { userService, RoleResponse } from '@/services/userService'
import {
  shieldCheckmarkOutline,
  addOutline,
  createOutline,
  trashOutline,
  refreshOutline,
  closeOutline
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
const loading = ref(true)
const roles = ref<RoleResponse[]>([])
const showDeleteModal = ref(false)
const deleting = ref(false)
const roleToDelete = ref<RoleResponse | null>(null)

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
  // Already on roles page
}

const navigateToAddRole = () => {
  router.push('/admin/roles/add')
}

const editRole = (role: RoleResponse) => {
  router.push(`/admin/roles/edit/${role.roleId}`)
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
      // Remove from local array
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
  router.push('/loginadmin')
}
</script>

<style>
@import '../theme/AddUserPage.css';

.roles-container {
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-section h2 {
  color: #00BCD4;
  font-size: 28px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-role-btn {
  background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.add-role-btn:hover {
  background: linear-gradient(135deg, #0097A7 0%, #00838F 100%);
  transform: translateY(-2px);
}

.roles-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.roles-table {
  width: 100%;
  border-collapse: collapse;
}

.roles-table thead {
  background: #f8f9fa;
}

.roles-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
}

.roles-table td {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  color: #495057;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #ffc107;
  color: white;
}

.edit-btn:hover {
  background: #e0a800;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 64px;
  color: #dee2e6;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #495057;
}

.empty-state p {
  margin: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #495057;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 4px;
}

.modal-body {
  padding: 24px;
}

.warning-text {
  color: #dc3545;
  font-weight: 500;
  margin-top: 10px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.confirm-delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: #c82333;
}

.confirm-delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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