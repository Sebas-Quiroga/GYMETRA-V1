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
    <div class="main-content" :class="{ 'main-content-mobile': isMobile }">
      <!-- Connection Status -->
      <div class="connection-status">
        <div class="status-indicator" :class="connectionStatus">
          <span class="status-dot"></span>
          <span class="status-text">{{ connectionStatus === 'connected' ? 'Conectado' : 'No conectado' }}</span>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">{{ totalPayments }}</div>
          <div class="stat-label">Total Pagos</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ pendingPayments }}</div>
          <div class="stat-label">Pagos Pendientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${{ monthlyRevenue }}</div>
          <div class="stat-label">Ingresos del Mes</div>
          <div class="month-selector">
            <input type="month" v-model="selectedMonthYear" @change="updateMonthlyRevenue" />
          </div>
        </div>
      </div>

      <!-- Payments Table Section -->
      <div class="payments-table-container">
        <h2>Pagos y Membresías</h2>

        <!-- Membresías Section -->
        <div class="memberships-section">
          <h3>Membresías Activas</h3>
          <table class="memberships-table">
            <thead>
              <tr>
                <th>ID Membresía</th>
                <th>Usuario ID</th>
                <th>Plan</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="membership in userMemberships" :key="membership.id">
                <td>{{ membership.id }}</td>
                <td>{{ membership.userName }}</td>
                <td>{{ membership.membership?.planName || 'Sin plan' }}</td>
                <td>{{ formatDate(membership.startDate) }}</td>
                <td>{{ formatDate(membership.endDate) }}</td>
                <td :class="getMembershipStatusClass(membership.status)">{{ membership.status }}</td>
              </tr>
              <tr v-if="userMemberships.length === 0">
                <td colspan="6" class="no-data">No hay membresías activas</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Membresías Disponibles Section -->
        <div class="memberships-section">
          <h3>Membresías Disponibles</h3>
          <button class="create-membership-btn" @click="openCreateModal">
            <ion-icon name="add"></ion-icon>
            Crear Nueva Membresía
          </button>
          <table class="memberships-table">
            <thead>
              <tr>
                <th>ID Plan</th>
                <th>Nombre del Plan</th>
                <th>Precio</th>
                <th>Duración (días)</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="membership in memberships" :key="membership.membershipId">
                <td>{{ membership.membershipId }}</td>
                <td>{{ membership.planName }}</td>
                <td>${{ formatPrice(membership.price) }}</td>
                <td>{{ membership.durationDays }}</td>
                <td>{{ membership.description || 'Sin descripción' }}</td>
                <td>{{ membership.status }}</td>
                <td>
                  <button class="edit-btn" @click="openEditModal(membership)">
                    <ion-icon name="create"></ion-icon>
                    Editar
                  </button>
                </td>
              </tr>
              <tr v-if="memberships.length === 0">
                <td colspan="7" class="no-data">No hay membresías disponibles</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Payments Section -->
        <div class="payments-section">
          <h3>Historial de Pagos</h3>
          <table class="payments-table">
            <thead>
              <tr>
                <th>ID Pago</th>
                <th>Usuario</th>
                <th>Fecha de Pago</th>
                <th>Monto</th>
                <th>Plan</th>
                <th>Método</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in payments" :key="payment.id">
                <td>{{ payment.idPago }}</td>
                <td>{{ payment.identificacion }}</td>
                <td>{{ formatDate(payment.fechaPago) }}</td>
                <td>${{ formatPrice(payment.costo) }}</td>
                <td>{{ payment.plan }}</td>
                <td>{{ payment.metodoPago === 'GATEWAY' ? 'TARGETA' : (payment.metodoPago || 'GATEWAY') }}</td>
                <td :class="getStatusClass(payment.estado)">{{ payment.estado }}</td>
              </tr>
              <tr v-if="payments.length === 0">
                <td colspan="7" class="no-data">No hay pagos registrados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Membership Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>{{ isEditing ? 'Editar Membresía' : 'Crear Nueva Membresía' }}</h3>
        <form @submit.prevent="saveMembership">
          <div class="form-group">
            <label for="planName">Nombre del Plan:</label>
            <input type="text" id="planName" v-model="currentMembership.planName" required>
          </div>
          <div class="form-group">
            <label for="price">Precio:</label>
            <input type="number" id="price" v-model.number="currentMembership.price" step="0.01" required>
          </div>
          <div class="form-group">
            <label for="durationDays">Duración (días):</label>
            <input type="number" id="durationDays" v-model.number="currentMembership.durationDays" required>
          </div>
          <div class="form-group">
            <label for="description">Descripción:</label>
            <textarea id="description" v-model="currentMembership.description"></textarea>
          </div>
          <div class="form-group">
            <label for="status">Estado:</label>
            <select id="status" v-model="currentMembership.status" required>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal">Cancelar</button>
            <button type="submit" :disabled="saving">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout as authLogout } from '@/services/authService'
import AdminSidebar from '@/components/AdminSidebar.vue'
import { membershipService, type Payment as ApiPayment, type UserMembership as ApiUserMembership, type Membership } from '@/services/membershipService'
import { userService } from '@/services/userService'

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

// Interface para definir la estructura de datos de pago
interface Payment {
  id?: number
  idPago: string
  identificacion: string
  persona: string
  fechaPago: Date | string
  costo: number
  plan: string
  estado: 'Completado' | 'Pendiente' | 'Fallido'
  metodoPago?: string
}

// ✅ Mapeo corregido para que muestre nombre completo y plan por membershipId
const mapApiPaymentToLocal = (apiPayment: ApiPayment, usersMap: Map<number, any>): Payment => {
  const userId = (apiPayment as any).userId || (apiPayment as any).identificacion
  const user = usersMap.get(Number(userId))
  const userName = user ? `${user.firstName} ${user.lastName}` : (userId ? `Usuario ${userId}` : 'Usuario desconocido')

  const membershipId = (apiPayment as any).membershipId || (apiPayment as any).planId || (apiPayment as any).plan

  return {
    id: apiPayment.id,
    idPago: `PAY-${apiPayment.id}`,
    identificacion: userName,
    persona: userName,
    fechaPago: (apiPayment as any).paymentDate || (apiPayment as any).fechaPago,
    costo: (apiPayment as any).amount || (apiPayment as any).monto || 0,
    plan: membershipId ? membershipId.toString() : 'Sin plan',
    estado: (() => {
      const status = (apiPayment as any).paymentStatus?.toUpperCase()
      if (status === 'CONFIRMED' || status === 'COMPLETED' || status === 'SUCCESS') return 'Completado'
      if (status === 'PENDING') return 'Pendiente'
      return 'Fallido'
    })(),
    metodoPago: (apiPayment as any).paymentMethod || (apiPayment as any).metodoPago || 'N/A'
  }
}

const router = useRouter()
const activeSection = ref('payments')
const loading = ref(false)
const connectionStatus = ref<'connected' | 'disconnected'>('disconnected')

const payments = ref<Payment[]>([])
const userMemberships = ref<(ApiUserMembership & { userName?: string; membership?: Membership })[]>([])
const memberships = ref<Membership[]>([])
const users = ref<any[]>([])

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const currentMembership = ref<Membership>({
  membershipId: 0,
  planName: '',
  price: 0,
  durationDays: 0,
  description: '',
  status: 'ACTIVE'
})
const originalMembership = ref<Membership | null>(null)

// Stats
const totalPayments = computed(() => payments.value.length)
const pendingPayments = computed(() => payments.value.filter(p => p.estado === 'Pendiente').length)
const currentDate = new Date()
const selectedMonthYear = ref(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`)
const monthlyRevenue = computed(() => {
  const [year, month] = selectedMonthYear.value.split('-').map(Number)
  const monthlyPayments = payments.value.filter(p => {
    const paymentDate = new Date(p.fechaPago)
    return paymentDate.getMonth() === (month - 1) &&
           paymentDate.getFullYear() === year &&
           p.estado === 'Completado'
  })
  return monthlyPayments.reduce((sum, p) => sum + p.costo, 0).toLocaleString()
})
const updateMonthlyRevenue = () => { console.log('Actualizando ingresos mensuales:', selectedMonthYear.value) }

// ✅ Ajuste de carga de datos
const loadPayments = async () => {
  try {
    loading.value = true
    const [apiPayments, apiUserMemberships, apiMemberships, apiUsers] = await Promise.all([
      membershipService.getAllPayments(),
      membershipService.getAllUserMemberships(),
      membershipService.getAllMemberships(),
      userService.getAllUsers()
    ])

    const membershipsMap = new Map(apiMemberships.map(m => [m.membershipId, m]))
    const usersMap = new Map(apiUsers.map(u => [u.userId, u]))

    // Mapeo corregido de pagos y reemplazo de plan ID por nombre del plan
    if (Array.isArray(apiPayments)) {
      payments.value = apiPayments.map(apiPayment => mapApiPaymentToLocal(apiPayment, usersMap))
      payments.value = payments.value.map(payment => {
        const membershipId = Number(payment.plan)
        const planName = membershipsMap.get(membershipId)?.planName || 'Sin plan'
        return { ...payment, plan: planName }
      })
    } else {
      payments.value = []
    }

    // Resto de mapeos (membresías, usuarios)
    if (Array.isArray(apiUserMemberships)) {
      userMemberships.value = apiUserMemberships.map(userMembership => {
        const user = usersMap.get(userMembership.userId)
        const userName = user ? `${user.firstName} ${user.lastName}` : `Usuario ${userMembership.userId}`
        const membership = apiMemberships.find(m => m.userMemberships?.some(um => um.id === userMembership.id))
        return {
          ...userMembership,
          userName,
          membership: membership || {
            membershipId: 0,
            planName: 'Sin plan',
            price: 0,
            durationDays: 0,
            status: 'unknown'
          }
        }
      })
    }

    memberships.value = Array.isArray(apiMemberships) ? apiMemberships : []
    connectionStatus.value = 'connected'
  } catch (error) {
    console.error('❌ Error cargando datos:', error)
    connectionStatus.value = 'disconnected'
    alert('Error conectando con el backend. Revisa la consola para más detalles.')
  } finally {
    loading.value = false
  }
}

// Utilidades
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  try {
    const d = new Date(date)
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return ''
  }
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'Completado': return 'status-completed'
    case 'Pendiente': return 'status-pending'
    case 'Fallido': return 'status-failed'
    default: return ''
  }
}

const getMembershipStatusClass = (status: string): string => {
  switch (status) {
    case 'ACTIVE': return 'status-active'
    case 'SUSPENDED': return 'status-suspended'
    case 'CANCELED': return 'status-canceled'
    case 'EXPIRED': return 'status-expired'
    case 'PENDING': return 'status-pending'
    default: return ''
  }
}

const formatPrice = (price: number): string => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

const logout = () => authLogout()
const navigateToUsers = () => router.push('/adminpanel')
const navigateToReports = () => console.log('Navegando a reportes')
const navigateToCharts = () => router.push('/adminmetricas')
const navigateToPayments = () => console.log('Navegando a pagos')

// Modal methods
const openCreateModal = () => {
  isEditing.value = false
  currentMembership.value = {
    membershipId: 0,
    planName: '',
    price: 0,
    durationDays: 0,
    description: '',
    status: 'ACTIVE'
  }
  originalMembership.value = null
  showModal.value = true
}

const openEditModal = (membership: Membership) => {
  isEditing.value = true
  currentMembership.value = { ...membership }
  originalMembership.value = { ...membership }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  saving.value = false
}

const saveMembership = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      // Send full object for update as per API schema
      const updateData = {
        membershipId: currentMembership.value.membershipId,
        planName: currentMembership.value.planName,
        durationDays: currentMembership.value.durationDays,
        price: currentMembership.value.price,
        status: currentMembership.value.status,
        description: currentMembership.value.description,
        userMemberships: currentMembership.value.userMemberships || []
      }
      await membershipService.updateMembership(currentMembership.value.membershipId, updateData)
    } else {
      // Send all fields for create
      const { membershipId, ...newMembership } = currentMembership.value
      await membershipService.createMembership(newMembership)
    }

    // Reload memberships
    const updatedMemberships = await membershipService.getAllMemberships()
    memberships.value = Array.isArray(updatedMemberships) ? updatedMemberships : []

    closeModal()
  } catch (error) {
    console.error('Error saving membership:', error)
    alert('Error al guardar la membresía. Revisa la consola para más detalles.')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadPayments())
</script>

<style>
@import '../theme/PagosPage.css';

.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
}

.month-selector {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 10;
}

.month-selector input[type="month"] {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  min-width: 160px;
  font-family: 'Nunito', sans-serif;
  color: #333;
}

.month-selector input[type="month"]:focus {
  outline: none;
  border-color: #00BCD4;
  box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.25);
}

.month-selector input[type="month"]:hover {
  border-color: #00BCD4;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Nunito', sans-serif;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-family: 'Nunito', sans-serif;
}

.modal-actions button[type="button"] {
  background-color: #f5f5f5;
  color: #333;
}

.modal-actions button[type="submit"] {
  background-color: #00BCD4;
  color: white;
}

.modal-actions button[type="submit"]:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.create-membership-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 10px;
  font-family: 'Nunito', sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-membership-btn ion-icon {
  font-size: 16px;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-family: 'Nunito', sans-serif;
}
</style>
