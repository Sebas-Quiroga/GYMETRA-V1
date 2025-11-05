<template>
  <div class="admin-dashboard">
    <!-- Sidebar Component -->
    <AdminSidebar
      :active-section="activeSection"
      @navigate-to-users="navigateToUsers"
      @navigate-to-reports="navigateToReports"
      @navigate-to-charts="navigateToCharts"
      @navigate-to-payments="navigateToPayments"
      @logout="logout"
    />

    <!-- Main Content -->
    <div class="main-content">
      <!-- Stats Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <ion-icon :icon="peopleOutline"></ion-icon>
          </div>
          <div class="stat-number">{{ users.length }}</div>
          <div class="stat-label">Usuarios Registrados</div>
          <div class="stat-subtitle">Total de miembros activos</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <ion-icon :icon="statsChartOutline"></ion-icon>
          </div>
          <div class="stat-number">{{ users.filter(u => u.estado === 'Activo').length }}</div>
          <div class="stat-label">Usuarios Activos</div>
          <div class="stat-subtitle">Miembros con acceso completo</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <ion-icon :icon="personAddOutline"></ion-icon>
          </div>
          <div class="stat-number">{{ users.filter(u => u.estado === 'Suspendido').length }}</div>
          <div class="stat-label">Cuentas Suspendidas</div>
          <div class="stat-subtitle">Usuarios con restricciones</div>
        </div>
      </div>

      <!-- Users Table Section -->
      <div class="users-table-container">
        <div class="table-header">
          <h2>
            <ion-icon :icon="peopleOutline" style="font-size: 28px; color: #00BCD4;"></ion-icon>
            Gestión de Usuarios
          </h2>
          <button @click="addNewUser" class="add-user-btn">
            <ion-icon :icon="addCircleOutline"></ion-icon>
            Agregar Usuario
          </button>
        </div>
        <table class="users-table">
          <thead>
            <tr>
              <th style="width: 12%;">Nombre</th>
              <th style="width: 12%;">Apellido</th>
              <th style="width: 18%;">Correo</th>
              <th style="width: 10%;">Teléfono</th>
              <th style="width: 11%;">Identificación</th>
              <th style="width: 8%;">Estado</th>
              <th style="width: 13%;">Fecha de Creación</th>
              <th style="width: 16%;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Aquí se conectará con la API/base de datos -->
            <tr v-for="user in users" :key="user.id || user.nombre">
              <td style="font-weight: 500;">{{ user.nombre }}</td>
              <td style="font-weight: 500;">{{ user.apellido }}</td>
              <td style="word-break: break-all;">{{ user.correo }}</td>
              <td>{{ user.telefono || 'N/A' }}</td>
              <td>{{ user.identificacion }}</td>
              <td :class="getStatusClass(user.estado)">
                <span class="status-badge">{{ user.estado }}</span>
              </td>
              <td>{{ formatDate(user.fechaCreacion) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="editUser(user)" class="action-btn edit-btn" title="Editar usuario">
                    <ion-icon :icon="createOutline"></ion-icon>
                  </button>
                  <button @click="deleteUser(user)" class="action-btn delete-btn" title="Eliminar usuario">
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </button>
                </div>
              </td>
            </tr>
            <!-- Mostrar mensaje si no hay datos -->
            <tr v-if="users.length === 0">
              <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                No hay usuarios registrados
              </td>
            </tr>
          </tbody>
        </table>
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
import AdminSidebar from '@/components/AdminSidebar.vue'
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
  checkmarkCircleOutline
} from 'ionicons/icons'

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

// Estado para modales
const showDeleteModal = ref(false)
const showSuccessModal = ref(false)
const selectedUser = ref<User | null>(null)
const deletedUserName = ref('')
const deleting = ref(false)


// Función para cargar usuarios desde la API
const loadUsers = async () => {
  try {
    loading.value = true
    const apiUsers = await userService.getAllUsers()
    users.value = apiUsers.map(mapApiUserToLocal)
    console.log('Usuarios cargados:', users.value)
  } catch (error) {
    console.error('Error cargando usuarios:', error)
  } finally {
    loading.value = false
  }
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
  // TODO: Implement logout logic
  router.push('/login')
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
    await loadUsers()
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

// Cargar usuarios al montar el componente
onMounted(() => {
  loadUsers()
})
</script>

<style>
@import '../theme/AdminPage.css';
</style>