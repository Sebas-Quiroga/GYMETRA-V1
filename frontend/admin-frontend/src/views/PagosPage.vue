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
              <tr v-for="membership in paginatedActiveMemberships" :key="membership.id">
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

          <!-- Pagination for Active Memberships -->
          <Pagination
            :total-items="userMemberships.length"
            :current-page="activeMembershipsCurrentPage"
            :page-size="activeMembershipsPageSize"
            item-name="membresías activas"
            component-id="active-memberships"
            @update:current-page="activeMembershipsCurrentPage = $event"
            @update:page-size="activeMembershipsPageSize = $event"
          />
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
              <tr v-for="membership in paginatedAvailableMemberships" :key="membership.membershipId">
                <td>{{ membership.membershipId }}</td>
                <td>{{ membership.planName }}</td>
                <td>${{ formatPrice(membership.price) }}</td>
                <td>{{ membership.durationDays }}</td>
                <td>{{ membership.description || 'Sin descripción' }}</td>
                <td>{{ membership.status }}</td>
                <td>
                  <div class="action-buttons">
                    <button @click="openEditModal(membership)" class="action-btn edit-btn" title="Editar membresía">
                      <ion-icon :icon="createOutline"></ion-icon>
                    </button>

                    <!-- Toggle Switch Mejorado -->
                    <div class="status-toggle-wrapper">
                      <label
                        class="status-toggle"
                        :class="{ 'disabled': statusUpdating }"
                        :title="getToggleTitle(membership.status)"
                      >
                        <input
                          type="checkbox"
                          :checked="membership.status === 'available'"
                          @change="toggleMembershipStatus(membership)"
                          :disabled="statusUpdating"
                        />
                        <span class="toggle-slider">
                          <span class="toggle-icon icon-active">
                            <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                          </span>
                          <span class="toggle-icon icon-suspended">
                            <ion-icon :icon="banOutline"></ion-icon>
                          </span>
                        </span>
                        <span class="toggle-label">
                          {{ membership.status === 'available' ? 'Disponible' : 'Inactivo' }}
                        </span>
                      </label>
                    </div>

                    <button @click="deleteMembership(membership)" class="action-btn delete-btn" title="Eliminar membresía">
                      <ion-icon :icon="trashOutline"></ion-icon>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="memberships.length === 0">
                <td colspan="7" class="no-data">No hay membresías disponibles</td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination for Available Memberships -->
          <Pagination
            :total-items="memberships.length"
            :current-page="availableMembershipsCurrentPage"
            :page-size="availableMembershipsPageSize"
            item-name="membresías disponibles"
            component-id="available-memberships"
            @update:current-page="availableMembershipsCurrentPage = $event"
            @update:page-size="availableMembershipsPageSize = $event"
          />
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
              <tr v-for="payment in paginatedPayments" :key="payment.id">
                <td>{{ payment.idPago }}</td>
                <td>{{ payment.identificacion }}</td>
                <td>{{ formatDate(payment.fechaPago) }}</td>
                <td>${{ formatPrice(payment.costo) }}</td>
                <td>{{ payment.plan }}</td>
                <td>{{ payment.metodoPago === 'GATEWAY' ? 'TARJETA' : (payment.metodoPago || 'GATEWAY') }}</td>
                <td :class="getStatusClass(payment.estado)">{{ payment.estado }}</td>
              </tr>
              <tr v-if="payments.length === 0">
                <td colspan="7" class="no-data">No hay pagos registrados</td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination for Payments Table -->
          <Pagination
            :total-items="payments.length"
            :current-page="paymentsCurrentPage"
            :page-size="paymentsPageSize"
            item-name="pagos"
            component-id="payments"
            @update:current-page="paymentsCurrentPage = $event"
            @update:page-size="paymentsPageSize = $event"
          />
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
import Pagination from '@/components/Pagination.vue'
import { membershipService, type Payment as ApiPayment, type UserMembership as ApiUserMembership, type Membership } from '@/services/membershipService'
import { userService } from '@/services/userService'
import {
  createOutline,
  trashOutline,
  checkmarkCircleOutline,
  banOutline
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

// Estado de paginación para membresías activas
const activeMembershipsCurrentPage = ref(1)
const activeMembershipsPageSize = ref(10)

// Estado de paginación para membresías disponibles
const availableMembershipsCurrentPage = ref(1)
const availableMembershipsPageSize = ref(10)

// Estado de paginación para pagos
const paymentsCurrentPage = ref(1)
const paymentsPageSize = ref(10)

// Computed para datos paginados
const paginatedActiveMemberships = computed(() => {
  const start = (activeMembershipsCurrentPage.value - 1) * activeMembershipsPageSize.value
  const end = start + activeMembershipsPageSize.value
  return userMemberships.value.slice(start, end)
})

const paginatedAvailableMemberships = computed(() => {
  const start = (availableMembershipsCurrentPage.value - 1) * availableMembershipsPageSize.value
  const end = start + availableMembershipsPageSize.value
  return memberships.value.slice(start, end)
})

const paginatedPayments = computed(() => {
  const start = (paymentsCurrentPage.value - 1) * paymentsPageSize.value
  const end = start + paymentsPageSize.value
  return payments.value.slice(start, end)
})

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const statusUpdating = ref(false)
const currentMembership = ref<Membership>({
  membershipId: 0,
  planName: '',
  price: 0,
  durationDays: 0,
  description: '',
  status: 'available'
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
      membershipService.getAllMemberships(), // Carga TODAS las membresías para admin
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
    status: 'available'
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

// Toggle membership status (available/inactive)
const toggleMembershipStatus = async (membership: Membership) => {
  if (!membership.membershipId) return

  try {
    statusUpdating.value = true
    const newStatus = membership.status === 'available' ? 'INACTIVE' : 'available'

    const updateData = {
      membershipId: membership.membershipId,
      planName: membership.planName,
      durationDays: membership.durationDays,
      price: membership.price,
      status: newStatus,
      description: membership.description,
      userMemberships: membership.userMemberships || []
    }

    await membershipService.updateMembership(membership.membershipId, updateData)

    // Update local state immediately
    membership.status = newStatus

    // No need to reload all memberships - just update the local one
    // The table will reflect the change immediately

  } catch (error) {
    console.error('Error toggling membership status:', error)
    alert('Error al cambiar el estado de la membresía.')
  } finally {
    statusUpdating.value = false
  }
}

// Hide membership from user view (set to INACTIVE)
const hideMembership = async (membership: Membership) => {
  if (confirm(`¿Estás seguro de ocultar "${membership.planName}" de la vista de usuarios?`)) {
    try {
      const updateData = {
        membershipId: membership.membershipId,
        planName: membership.planName,
        durationDays: membership.durationDays,
        price: membership.price,
        status: 'INACTIVE',
        description: membership.description,
        userMemberships: membership.userMemberships || []
      }

      await membershipService.updateMembership(membership.membershipId, updateData)

      // Update local state
      membership.status = 'INACTIVE'

      // Reload memberships to reflect changes
      const updatedMemberships = await membershipService.getAllMemberships()
      memberships.value = Array.isArray(updatedMemberships) ? updatedMemberships : []

      alert('Membresía ocultada de la vista de usuarios.')

    } catch (error) {
      console.error('Error hiding membership:', error)
      alert('Error al ocultar la membresía.')
    }
  }
}

// Delete membership permanently
const deleteMembership = async (membership: Membership) => {
  if (confirm(`¿Estás seguro de eliminar permanentemente "${membership.planName}"? Esta acción no se puede deshacer.`)) {
    try {
      await membershipService.deleteMembership(membership.membershipId)

      // Remove from local state
      memberships.value = memberships.value.filter(m => m.membershipId !== membership.membershipId)

      alert('Membresía eliminada permanentemente.')

    } catch (error) {
      console.error('Error deleting membership:', error)
      alert('Error al eliminar la membresía.')
    }
  }
}

// Helper functions for button states
const getToggleTitle = (status: string): string => {
  return status === 'available' ? 'Hacer inactiva' : 'Hacer disponible'
}

const getToggleIcon = (status: string): string => {
  return status === 'available' ? 'eye-off' : 'eye'
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

.status-toggle input:checked + .toggle-slider {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(39, 174, 96, 0.4);
}

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

.status-toggle:active:not(.disabled) .toggle-slider {
  transform: scale(0.98);
}

.status-toggle input:focus + .toggle-slider {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

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

/* Botones de acción mejorados */
.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.edit-btn:hover {
  background-color: #1976D2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.delete-btn {
  background-color: #F44336;
  color: white;
}

.delete-btn:hover {
  background-color: #D32F2F;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

/* Eliminado - ya no se usa */

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

/* Responsive para botones */
@media (max-width: 1200px) {
  .action-buttons {
    gap: 6px;
  }

  .action-btn {
    width: 35px;
    height: 35px;
  }

  .action-btn ion-icon {
    font-size: 14px;
  }
}
</style>
