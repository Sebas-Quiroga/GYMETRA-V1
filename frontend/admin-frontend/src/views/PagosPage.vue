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
          <table class="memberships-table">
            <thead>
              <tr>
                <th>ID Plan</th>
                <th>Nombre del Plan</th>
                <th>Precio</th>
                <th>Duración (días)</th>
                <th>Descripción</th>
                <th>Estado</th>
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
              </tr>
              <tr v-if="memberships.length === 0">
                <td colspan="6" class="no-data">No hay membresías disponibles</td>
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
                <td>{{ payment.metodoPago || 'GATEWAY' }}</td>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout as authLogout } from '@/services/authService'
import AdminSidebar from '@/components/AdminSidebar.vue'
import { membershipService, type Payment as ApiPayment, type UserMembership as ApiUserMembership, type Membership } from '@/services/membershipService'
import { userService } from '@/services/userService'

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
</style>
