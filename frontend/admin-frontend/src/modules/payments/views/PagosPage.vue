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
        title="Gestión de Pagos" 
        message="Sincronizando transacciones y estados de membresía..." 
      />

      <div v-else class="dashboard-content">
        <!-- Header & Connection -->
        <div class="dashboard-header">
          <div class="header-main">
            <h1>Control Financiero</h1>
            <p class="last-update">Gestión de facturación, planes y renovaciones</p>
          </div>
          <div class="connection-status">
            <div class="status-indicator" :class="connectionStatus">
              <span class="status-dot"></span>
              <span class="status-text">{{ connectionStatus === 'connected' ? 'Centro de Pagos En Línea' : 'Sincronizando...' }}</span>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-cards">
          <div class="stat-card">
            <span class="stat-number">{{ totalPayments }}</span>
            <span class="stat-label">Transacciones Totales</span>
            <div style="font-size: 0.8rem; color: var(--admin-text-sub); margin-top: 5px;">Historial completo del sistema</div>
          </div>
          <div class="stat-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="stat-number">{{ pendingPayments }}</span>
                <span class="stat-label" style="display: block;">Por Procesar</span>
              </div>
              <ion-icon icon="refreshOutline" style="font-size: 24px; color: #f39c12;"></ion-icon>
            </div>
            <div style="font-size: 0.8rem; color: var(--admin-text-sub); margin-top: 5px;">Depósito en espera de validación</div>
          </div>
          <div class="stat-card">
            <span class="stat-number">${{ monthlyRevenue }}</span>
            <span class="stat-label">Ingresos Mensuales</span>
            <div class="month-selector">
              <input type="month" v-model="selectedMonthYear" @change="updateMonthlyRevenue" />
            </div>
          </div>
        </div>

        <!-- Payments Table Section -->
        <div class="payments-table-container" style="background: transparent; border: none; box-shadow: none;">
          <!-- Membresías Section -->
          <div class="memberships-section">
            <h3>Membresías Activas</h3>
            <table class="memberships-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Plan Actual</th>
                  <th>Vigencia</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="membership in paginatedActiveMemberships" :key="membership.id">
                  <td>
                    <div style="font-weight: 800; font-family: var(--app-font-brand);">{{ membership.userName }}</div>
                    <div style="font-size: 0.75rem; opacity: 0.6;">Relación #{{ membership.id }}</div>
                  </td>
                  <td>
                    <span style="color: var(--admin-accent); font-weight: 800;">
                      {{ membership.membership?.planName || 'Sin plan' }}
                    </span>
                  </td>
                  <td>
                    <div style="font-size: 0.85rem;">{{ formatDate(membership.startDate) }} → {{ formatDate(membership.endDate) }}</div>
                  </td>
                  <td>
                    <span :class="getMembershipStatusClass(membership.status)" class="status-badge">{{ membership.status }}</span>
                  </td>
                </tr>
                <tr v-if="userMemberships.length === 0">
                  <td colspan="4" class="no-data">No se detectaron suscripciones activas</td>
                </tr>
              </tbody>
            </table>

            <div style="padding: 20px 40px;">
              <Pagination
                :total-items="userMemberships.length"
                :current-page="activeMembershipsCurrentPage"
                :page-size="activeMembershipsPageSize"
                item-name="suscripciones"
                component-id="active-memberships"
                @update:current-page="activeMembershipsCurrentPage = $event"
                @update:page-size="activeMembershipsPageSize = $event"
              />
            </div>
          </div>

          <!-- Membresías Disponibles Section -->
          <div class="memberships-section">
            <div class="section-header-flex">
              <h3>Portafolio de Planes</h3>
              <button class="create-membership-btn" @click="openCreateModal">
                <ion-icon :icon="createOutline"></ion-icon>
                <span>Nuevo Plan</span>
              </button>
            </div>
            <table class="memberships-table">
              <thead>
                <tr>
                  <th>Identificador</th>
                  <th>Costo (COP)</th>
                  <th>Ciclo</th>
                  <th>Visibilidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="membership in paginatedAvailableMemberships" :key="membership.membershipId">
                  <td>
                    <div style="font-weight: 800; font-family: var(--app-font-brand);">{{ membership.planName }}</div>
                    <div style="font-size: 0.75rem; opacity: 0.6; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ membership.description || 'Sin descripción' }}</div>
                  </td>
                  <td style="color: var(--admin-accent); font-weight: 900; font-size: 1.1rem;">
                    ${{ formatPrice(membership.price) }}
                  </td>
                  <td>{{ membership.durationDays }} días</td>
                  <td>
                    <span :class="membership.status === 'available' ? 'status-available' : 'status-suspended'" class="status-badge">
                      {{ membership.status === 'available' ? 'En Catálogo' : 'Oculto' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button @click="openEditModal(membership)" class="action-btn edit-btn" title="Ajustar">
                        <ion-icon :icon="createOutline"></ion-icon>
                      </button>
                      
                      <label class="status-toggle" title="Alternar visibilidad">
                        <input
                          type="checkbox"
                          :checked="membership.status === 'available'"
                          @change="toggleMembershipStatus(membership)"
                          :disabled="statusUpdating"
                        />
                        <span class="toggle-slider"></span>
                      </label>

                      <button @click="deleteMembership(membership)" class="action-btn delete-btn" title="Eliminar">
                        <ion-icon :icon="trashOutline"></ion-icon>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="memberships.length === 0">
                  <td colspan="5" class="no-data">El portafolio de planes está vacío</td>
                </tr>
              </tbody>
            </table>

            <div style="padding: 20px 40px;">
              <Pagination
                :total-items="memberships.length"
                :current-page="availableMembershipsCurrentPage"
                :page-size="availableMembershipsPageSize"
                item-name="planes"
                component-id="available-memberships"
                @update:current-page="availableMembershipsCurrentPage = $event"
                @update:page-size="availableMembershipsPageSize = $event"
              />
            </div>
          </div>

          <!-- Payments Section -->
          <div class="payments-section">
            <h3>Historial de Transacciones Kinetic</h3>
            <table class="payments-table">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Usuario</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Registro</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in paginatedPayments" :key="payment.id">
                  <td style="font-family: monospace; opacity: 0.6;">{{ payment.idPago }}</td>
                  <td>
                    <div style="font-weight: 700;">{{ payment.identificacion }}</div>
                    <div style="font-size: 0.75rem; color: var(--admin-accent);">{{ payment.plan }}</div>
                  </td>
                  <td style="font-weight: 900; color: var(--admin-text-main);">${{ formatPrice(payment.costo) }}</td>
                  <td>
                    <span style="font-size: 0.8rem; font-weight: 800;">{{ payment.metodoPago === 'GATEWAY' ? 'TARJETA' : 'EFECTIVO' }}</span>
                  </td>
                  <td>{{ formatDate(payment.fechaPago) }}</td>
                  <td>
                    <span :class="getStatusClass(payment.estado)" class="status-badge">{{ payment.estado }}</span>
                  </td>
                </tr>
                <tr v-if="payments.length === 0">
                  <td colspan="6" class="no-data">No se registran transacciones en el periodo</td>
                </tr>
              </tbody>
            </table>

            <div style="padding: 20px 40px;">
              <Pagination
                :total-items="payments.length"
                :current-page="paymentsCurrentPage"
                :page-size="paymentsPageSize"
                item-name="transacciones"
                component-id="payments"
                @update:current-page="paymentsCurrentPage = $event"
                @update:page-size="paymentsPageSize = $event"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Membership Modal Kinetic -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal" style="display: flex; align-items: center; justify-content: center; position: fixed; inset: 0; z-index: 2100;">
      <div class="modal-content" @click.stop style="max-width: 600px; width: 95%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
          <h3 style="margin: 0;">{{ isEditing ? 'Ajustar Plan Kinetic' : 'Nuevo Plan Kinetic' }}</h3>
          <button @click="closeModal" style="background: none; border: none; font-size: 24px; color: var(--admin-text-sub); cursor: pointer;">
            <ion-icon icon="closeOutline"></ion-icon>
          </button>
        </div>

        <form @submit.prevent="saveMembership">
          <div class="form-group">
            <label class="form-label">Nombre Comercial del Plan</label>
            <input type="text" v-model="currentMembership.planName" placeholder="Ej. Plan Gold Kinetic" required>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
              <label class="form-label">Inversión (COP)</label>
              <input type="number" v-model.number="currentMembership.price" required>
            </div>
            <div class="form-group">
              <label class="form-label">Duración (Días Calendario)</label>
              <input type="number" v-model.number="currentMembership.durationDays" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Descripción de Beneficios</label>
            <textarea v-model="currentMembership.description" placeholder="Describa los accesos y ventajas de este plan..." style="min-height: 120px;"></textarea>
          </div>

          <!-- Permisos Dinámicos -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; padding: 15px; background: rgba(0, 188, 212, 0.05); border-radius: 12px; border: 1px dashed var(--admin-accent);">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--admin-text-main);">
                <input type="checkbox" v-model="currentMembership.training" style="width: 20px; height: 20px; accent-color: var(--admin-accent);">
                <span>Acceso Entrenamiento</span>
              </label>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--admin-text-main);">
                <input type="checkbox" v-model="currentMembership.nutrition" style="width: 20px; height: 20px; accent-color: var(--admin-accent);">
                <span>Acceso Nutrición</span>
              </label>
            </div>
          </div>
          
          <div style="display: flex; gap: 15px; margin-top: 40px; justify-content: flex-end;">
            <button type="button" @click="closeModal" class="back-btn">Cancelar</button>
            <button type="submit" :disabled="saving" class="submit-btn" style="min-width: 180px;">
              {{ saving ? 'Sincronizando...' : 'Confirmar Configuración' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout as authLogout } from '../../../modules/auth/services/authService'
import AdminSidebar from '../../../components/AdminSidebar.vue'
import KineticLoading from '../../../components/KineticLoading.vue'
import Pagination from '../../../components/Pagination.vue'
import { membershipService, type Payment as ApiPayment, type UserMembership as ApiUserMembership, type Membership } from '../services/membershipService'
import { userService } from '../../../modules/users/services/userService'
import type { Payment } from '../../../types/reports'
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
  status: 'available',
  training: false,
  nutrition: false
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
const updateMonthlyRevenue = () => {}

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

    // Ajuste: especificar el tipo de Map para evitar error de tipos
    const membershipsMap: Map<number, Membership> = new Map(
      apiMemberships.map((m: Membership) => [Number(m.membershipId), m])
    )
    const usersMap: Map<number, any> = new Map(
      apiUsers.map((u: any) => [Number(u.userId), u])
    )

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

    // Mapeo de membresías activas de los usuarios
    if (Array.isArray(apiUserMemberships)) {
      userMemberships.value = apiUserMemberships.map(userMembership => {
        const user = usersMap.get(userMembership.userId)
        const userName = user ? `${user.firstName} ${user.lastName}` : `Usuario ${userMembership.userId}`
        return {
          ...userMembership,
          userName,
        }
      })
    } else {
      userMemberships.value = []
    }

    memberships.value = Array.isArray(apiMemberships) ? apiMemberships : []
    connectionStatus.value = 'connected'
  } catch {
    connectionStatus.value = 'disconnected'
    alert('Error conectando con el backend.')
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
const navigateToReports = () => router.push('/adminreportes')
const navigateToCharts = () => router.push('/adminmetricas')
const navigateToPayments = () => router.push('/adminpagos')

// Modal methods
const openCreateModal = () => {
  isEditing.value = false
  currentMembership.value = {
    membershipId: 0,
    planName: '',
    price: 0,
    durationDays: 0,
    description: '',
    status: 'available',
    training: false,
    nutrition: false
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
        training: currentMembership.value.training,
        nutrition: currentMembership.value.nutrition,
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
  } catch {
    alert('Error al guardar la membresía.')
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

  } catch {
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

    } catch {
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

    } catch {
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

<style scoped src="../../../theme/PagosPage.css"></style>
