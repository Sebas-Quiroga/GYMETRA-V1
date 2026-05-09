<template>
  <div class="admin-dashboard">
    <!-- Sidebar Component -->
    <AdminSidebar
      :active-section="activeSection"
      @logout="logout"
    />

    <!-- Main Content -->
    <div class="main-content" :class="{ 'main-content-mobile': isMobile }">
      <KineticLoading 
        v-if="loading" 
        title="Gestión de Usuarios" 
        message="Sincronizando el directorio maestro con el núcleo Kinetic..." 
      />
      
      <div v-else class="dashboard-content">
        <!-- Stats Cards -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon">
              <ion-icon :icon="peopleOutline"></ion-icon>
            </div>
            <div class="stat-number">{{ users.length }}</div>
            <div class="stat-label">Usuarios Totales</div>
            <div class="stat-subtitle">Historial de registros</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(39, 174, 96, 0.1);">
              <ion-icon :icon="checkmarkCircleOutline" style="color: #27ae60;"></ion-icon>
            </div>
            <div class="stat-number">{{ users.filter(u => u.estado === 'Activo').length }}</div>
            <div class="stat-label">Miembros Activos</div>
            <div class="stat-subtitle">Acceso total habilitado</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(186, 26, 26, 0.1);">
              <ion-icon :icon="banOutline" style="color: #ba1a1a;"></ion-icon>
            </div>
            <div class="stat-number">{{ users.filter(u => u.estado === 'Suspendido').length }}</div>
            <div class="stat-label">Suspendidos</div>
            <div class="stat-subtitle">Cuentas con restricciones</div>
          </div>
        </div>

        <!-- Users Table Section -->
        <div class="users-table-container">
          <div class="table-header">
            <h2>
              <ion-icon :icon="peopleOutline"></ion-icon>
              Directorio de Usuarios
            </h2>
            <div class="header-actions">
              <button @click="syncUsers" class="sync-users-btn" :disabled="syncing">
                <ion-icon :icon="syncOutline" :class="{ 'spin': syncing }"></ion-icon>
                <span>{{ syncing ? 'Sincronizando...' : 'Sincronizar Cognito' }}</span>
              </button>
              <button @click="addNewUser" class="add-user-btn">
                <ion-icon :icon="personAddOutline"></ion-icon>
                <span>Agregar Usuario</span>
              </button>
            </div>
          </div>
          
          <table class="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Identificación</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.id || user.correo">
                <td>
                  <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 800; font-family: var(--app-font-brand);">{{ user.nombre }} {{ user.apellido }}</span>
                    <span style="font-size: 0.8rem; color: var(--admin-text-sub);">{{ user.correo }}</span>
                  </div>
                </td>
                <td>
                  <span style="font-size: 0.9rem;">{{ user.telefono || 'Sin teléfono' }}</span>
                </td>
                <td>
                  <span style="font-family: monospace; font-weight: 700;">{{ user.identificacion }}</span>
                </td>
                <td :class="getStatusClass(user.estado)">
                  <span class="status-badge">{{ user.estado }}</span>
                </td>
                <td>
                  <span style="font-size: 0.8rem; color: var(--admin-text-sub);">{{ formatDate(user.fechaCreacion) }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <!-- Toggle Switch Kinetic -->
                    <label class="kinetic-toggle" :title="getStatusButtonTitle(user.estado)">
                      <input 
                        type="checkbox" 
                        :checked="user.estado === 'Activo'"
                        @change="toggleUserStatus(user)"
                        :disabled="statusUpdating"
                      />
                      <span class="toggle-slider-kinetic"></span>
                    </label>

                    <button @click="editUser(user)" class="action-btn edit-btn" title="Editar">
                      <ion-icon :icon="createOutline"></ion-icon>
                    </button>
                    
                    <button @click="deleteUser(user)" class="action-btn delete-btn" title="Eliminar">
                      <ion-icon :icon="trashOutline"></ion-icon>
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr v-if="users.length === 0">
                <td colspan="6" style="text-align: center; padding: 60px;">
                  <ion-icon :icon="peopleOutline" style="font-size: 48px; color: var(--admin-accent-soft);"></ion-icon>
                  <div style="margin-top: 15px; font-weight: 700; color: var(--admin-text-sub);">No se encontraron usuarios</div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination Controls -->
          <div v-if="users.length > 0" class="pagination-container">
            <div class="pagination-info">
              Mostrando <strong>{{ startItem }} - {{ endItem }}</strong> de {{ totalUsers }}
            </div>

            <div class="pagination-controls">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="pagination-btn"
              >
                Anterior
              </button>

              <div class="pagination-numbers">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="['pagination-btn', { active: page === currentPage }]"
                >
                  {{ page }}
                </button>
              </div>

              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="pagination-btn"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
        </div>
        <div class="modal-body">
          <p>¿Está seguro de que desea eliminar al usuario <strong>{{ selectedUser?.nombre }} {{ selectedUser?.apellido }}</strong>?</p>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn-secondary">Cancelar</button>
          <button @click="confirmDelete" class="btn-danger" :disabled="deleting">
            <span v-if="deleting">Eliminando...</span>
            <span v-else>Eliminar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content success-modal" @click.stop>
        <div class="modal-header success">
          <ion-icon :icon="checkmarkCircleOutline" class="success-icon"></ion-icon>
          <h3>Usuario eliminado</h3>
        </div>
        <div class="modal-body">
          <p>El usuario <strong>{{ deletedUserName }}</strong> ha sido eliminado correctamente del sistema.</p>
        </div>
        <div class="modal-footer">
          <button @click="closeSuccessModal" class="btn-primary">Aceptar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout as authLogout } from '@/services/authService'
import AdminSidebar from '@/components/AdminSidebar.vue'
import KineticLoading from '@/components/KineticLoading.vue'
import { userService, type User as ApiUser } from '@/services/userService'
import {
  logOutOutline,
  peopleOutline,
  barChartOutline,
  personCircleOutline,
  documentOutline,
  statsChartOutline,
  personAddOutline,
  createOutline,
  trashOutline,
  addCircleOutline,
  checkmarkCircleOutline,
  banOutline,
  chevronBackOutline,
  chevronForwardOutline,
  syncOutline
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

// Interface para definir la estructura de datos de usuario
interface User {
  id?: number
  nombre: string
  apellido: string
  correo: string
  telefono: string
  identificacion: number
  estado: 'Activo' | 'Vencido' | 'Suspendido'
  fechaCreacion: Date | string
}

// Función para mapear datos de la API a la interfaz local
const mapApiUserToLocal = (apiUser: ApiUser): User => ({
  id: apiUser.userId,
  nombre: apiUser.firstName,
  apellido: apiUser.lastName,
  correo: apiUser.email,
  telefono: apiUser.phone || '',
  identificacion: apiUser.identification,
  estado: apiUser.status === 'active' ? 'Activo' : 'Suspendido',
  fechaCreacion: apiUser.createdAt || ''
})

const router = useRouter()
const activeSection = ref('users')
const loading = ref(false)

// Estado para los usuarios - preparado para datos dinámicos
const users = ref<User[]>([])

// Estado de paginación
const currentPage = ref(1)
const pageSize = ref(10)

// Computed para paginación
const totalUsers = computed(() => users.value.length)
const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value))
const startItem = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endItem = computed(() => Math.min(currentPage.value * pageSize.value, totalUsers.value))

// Usuarios paginados
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return users.value.slice(start, end)
})

// Páginas visibles en la paginación
const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  // Ajustar si estamos cerca del final
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Estado para modales
const showDeleteModal = ref(false)
const showSuccessModal = ref(false)
const selectedUser = ref<User | null>(null)
const deletedUserName = ref('')
const deleting = ref(false)
const statusUpdating = ref(false)
const syncing = ref(false)

// Función para sincronizar usuarios desde Cognito
const syncUsers = async () => {
  try {
    syncing.value = true
    const message = await userService.syncUsersFromCognito()
    alert(message)
    await loadUsers() // Recargar la tabla
  } catch (error) {
    console.error('Error sincronizando usuarios:', error)
    alert('Error al sincronizar con Cognito. Verifica los logs del servidor.')
  } finally {
    syncing.value = false
  }
}


// Función para cargar usuarios desde la API
const loadUsers = async () => {
  try {
    loading.value = true
    const apiUsers = await userService.getAllUsers()
    users.value = apiUsers.map(mapApiUserToLocal)
    console.log('Usuarios cargados:', users.value)

    // Resetear paginación cuando se cargan nuevos usuarios
    currentPage.value = 1
  } catch (error) {
    console.error('Error cargando usuarios:', error)
  } finally {
    loading.value = false
  }
}

// Funciones de paginación
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const changePageSize = () => {
  // Resetear a la primera página cuando cambia el tamaño
  currentPage.value = 1
}

// Función para formatear fechas
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  try {
    const d = new Date(date)
    return d.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return ''
  }
}

// Función para obtener clase CSS según el estado
const getStatusClass = (status: string): string => {
  switch (status) {
    case 'Activo':
      return 'status-active'
    case 'Vencido':
      return 'status-expired'
    case 'Suspendido':
      return 'status-suspended'
    default:
      return ''
  }
}

const logout = () => {
  // Use centralized authService logout to clear token and redirect
  authLogout()
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

// Funciones para manejar usuarios
const addNewUser = () => {
  router.push('/adminadduser')
}

const editUser = (user: User) => {
  router.push(`/adminedituser/${user.id}`)
}

const deleteUser = (user: User) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedUser.value = null
  deleting.value = false
}

const confirmDelete = async () => {
  if (!selectedUser.value) return

  try {
    deleting.value = true
    await userService.deleteUser(selectedUser.value.id!)
    deletedUserName.value = `${selectedUser.value.nombre} ${selectedUser.value.apellido}`
    showDeleteModal.value = false
    showSuccessModal.value = true

    // Recargar usuarios
    await loadUsers()

    // Ajustar paginación si es necesario
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    alert('Error: No se pudo eliminar el usuario.')
  } finally {
    deleting.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  deletedUserName.value = ''
  selectedUser.value = null
}

// Funciones para manejar el estado del usuario
const toggleUserStatus = async (user: User) => {
  if (!user.id) return

  try {
    statusUpdating.value = true
    const newStatus = user.estado === 'Activo' ? 'suspended' : 'active'

    const success = await userService.updateUserStatus(user.id, newStatus)

    if (success) {
      // Update local user status
      user.estado = newStatus === 'active' ? 'Activo' : 'Suspendido'
    } else {
      alert('Error al actualizar el estado del usuario')
    }
  } catch (error) {
    console.error('Error updating user status:', error)
    alert('Error al actualizar el estado del usuario')
  } finally {
    statusUpdating.value = false
  }
}

const getStatusButtonTitle = (status: string): string => {
  return status === 'Activo' ? 'Suspender usuario' : 'Activar usuario'
}

// Cargar usuarios al montar el componente
onMounted(() => {
  loadUsers()
})
</script>

<style>
@import '../theme/AdminPage.css';

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.sync-users-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  color: var(--ion-color-primary);
  border: 2px solid var(--ion-color-primary);
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sync-users-btn:hover:not(:disabled) {
  background: var(--admin-accent-soft);
  transform: translateY(-2px);
}

.sync-users-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ============================================
   TOGGLE SWITCH MODERNO Y ELEGANTE
   ============================================ */

.status-toggle-wrapper {
  display: inline-flex;
  align-items: center;
}

.status-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.status-toggle.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.status-toggle input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* Toggle Slider Container */
.toggle-slider {
  position: relative;
  width: 56px;
  height: 28px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border-radius: 34px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(231, 76, 60, 0.3);
  overflow: hidden;
}

/* Toggle Slider - Estado Activo */
.status-toggle input:checked + .toggle-slider {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(39, 174, 96, 0.4);
}

/* Toggle Slider - Before (el círculo que se desliza) */
.toggle-slider::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  left: 3px;
  top: 3px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.25),
    0 1px 3px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.status-toggle input:checked + .toggle-slider::before {
  transform: translateX(28px);
}

/* Iconos dentro del toggle */
.toggle-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  transition: all 0.3s ease;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-suspended {
  left: 6px;
  color: #fff;
  opacity: 1;
}

.icon-active {
  right: 6px;
  color: #fff;
  opacity: 0;
}

.status-toggle input:checked ~ .toggle-slider .icon-suspended {
  opacity: 0;
}

.status-toggle input:checked ~ .toggle-slider .icon-active {
  opacity: 1;
}

/* Label del estado */
.toggle-label {
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
  transition: color 0.3s ease;
  min-width: 75px;
}

.status-toggle input:checked ~ .toggle-label {
  color: #27ae60;
}

.status-toggle input:not(:checked) ~ .toggle-label {
  color: #e74c3c;
}

/* Hover Effects */
.status-toggle:hover:not(.disabled) .toggle-slider {
  transform: scale(1.05);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.2);
}

.status-toggle:hover:not(.disabled) input:checked + .toggle-slider {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(39, 174, 96, 0.5);
}

.status-toggle:hover:not(.disabled) input:not(:checked) + .toggle-slider {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(231, 76, 60, 0.5);
}

/* Active/Click Effect */
.status-toggle:active:not(.disabled) .toggle-slider {
  transform: scale(0.98);
}

/* Focus for accessibility */
.status-toggle input:focus + .toggle-slider {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Animación de pulso cuando está actualizando */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.status-toggle.disabled .toggle-slider {
  animation: pulse 1.5s ease-in-out infinite;
}

/* ============================================
   PAGINATION STYLES
   ============================================ */

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pagination-page-indicator {
  display: block;
  font-size: 12px;
  color: #adb5bd;
  margin-top: 2px;
  font-weight: 400;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 40px;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination-btn.active {
  background: #00BCD4;
  color: white;
  border-color: #00BCD4;
  font-weight: 600;
}

.pagination-prev,
.pagination-next {
  font-weight: 600;
}

.pagination-numbers {
  display: flex;
  gap: 4px;
  margin: 0 12px;
}

.page-size-select {
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
  margin-left: 8px;
}

.page-size-select:focus {
  outline: none;
  border-color: #00BCD4;
  box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.25);
}

.pagination-page-size {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6c757d;
}

.pagination-page-size label {
  margin-right: 8px;
  font-weight: 500;
}

.pagination-page-size span {
  margin-left: 4px;
}

/* Responsive pagination */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-numbers {
    order: 2;
    width: 100%;
    justify-content: center;
    margin: 8px 0;
  }

  .pagination-info {
    order: 1;
    text-align: center;
  }

  .pagination-page-indicator {
    font-size: 11px;
  }

  .pagination-page-size {
    order: 3;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .pagination-btn {
    padding: 6px 8px;
    font-size: 12px;
    min-width: 32px;
  }

  .pagination-numbers {
    gap: 2px;
  }

  .pagination-prev ion-icon,
  .pagination-next ion-icon {
    display: none;
  }

  .pagination-prev::before {
    content: "‹";
    font-size: 16px;
  }

  .pagination-next::after {
    content: "›";
    font-size: 16px;
  }
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .toggle-slider {
    width: 48px;
    height: 24px;
  }

  .toggle-slider::before {
    width: 18px;
    height: 18px;
  }

  .status-toggle input:checked + .toggle-slider::before {
    transform: translateX(24px);
  }

  .toggle-label {
    font-size: 11px;
    min-width: 70px;
  }

  .toggle-icon {
    font-size: 12px;
  }
}
</style>