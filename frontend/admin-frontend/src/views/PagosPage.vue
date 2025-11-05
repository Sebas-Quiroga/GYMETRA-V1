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
                <td>{{ membership.userId }}</td>
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

        <!-- Payments Section -->
        <div class="payments-section">
          <h3>Historial de Pagos</h3>
          <table class="payments-table">
            <thead>
              <tr>
                <th>ID Pago</th>
                <th>Usuario ID</th>
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
import AdminSidebar from '@/components/AdminSidebar.vue'
import { membershipService, type Payment as ApiPayment, type UserMembership as ApiUserMembership } from '@/services/membershipService'
import {
  logOutOutline,
  peopleOutline,
  barChartOutline,
  personCircleOutline,
  documentOutline,
  cardOutline
} from 'ionicons/icons'

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

// Función para mapear datos de la API a la interfaz local
const mapApiPaymentToLocal = (apiPayment: ApiPayment): Payment => {
  console.log('🔄 Mapeando pago:', apiPayment)

  // Verificar si userMembership existe
  if (!apiPayment.userMembership) {
    console.error('❌ userMembership no existe en apiPayment:', apiPayment)
    return {
      id: apiPayment.id,
      idPago: `PAY-${apiPayment.id}`,
      identificacion: 'N/A',
      persona: 'Usuario desconocido',
      fechaPago: apiPayment.paymentDate,
      costo: apiPayment.amount || 0,
      plan: 'Sin plan',
      estado: 'Fallido' as const,
      metodoPago: apiPayment.paymentMethod || 'N/A'
    }
  }

  // Verificar si membership existe dentro de userMembership
  if (!apiPayment.userMembership.membership) {
    console.error('❌ membership no existe en userMembership:', apiPayment.userMembership)
    return {
      id: apiPayment.id,
      idPago: `PAY-${apiPayment.id}`,
      identificacion: apiPayment.userMembership.userId?.toString() || 'N/A',
      persona: `Usuario ${apiPayment.userMembership.userId || 'desconocido'}`,
      fechaPago: apiPayment.paymentDate,
      costo: apiPayment.amount || 0,
      plan: 'Sin plan',
      estado: apiPayment.paymentStatus === 'CONFIRMED' ? 'Completado' :
              apiPayment.paymentStatus === 'PENDING' ? 'Pendiente' : 'Fallido',
      metodoPago: apiPayment.paymentMethod || 'N/A'
    }
  }

  return {
    id: apiPayment.id,
    idPago: `PAY-${apiPayment.id}`,
    identificacion: apiPayment.userMembership.userId.toString(),
    persona: `Usuario ${apiPayment.userMembership.userId}`,
    fechaPago: apiPayment.paymentDate,
    costo: apiPayment.amount || 0,
    plan: apiPayment.userMembership.membership.planName || 'Sin nombre',
    estado: apiPayment.paymentStatus === 'CONFIRMED' ? 'Completado' :
            apiPayment.paymentStatus === 'PENDING' ? 'Pendiente' : 'Fallido',
    metodoPago: apiPayment.paymentMethod || 'N/A'
  }
}

const router = useRouter()
const activeSection = ref('payments')
const loading = ref(false)
const connectionStatus = ref<'connected' | 'disconnected'>('disconnected')

// Stats data - ahora calculados dinámicamente
const totalPayments = computed(() => payments.value.length)
const pendingPayments = computed(() => payments.value.filter(p => p.estado === 'Pendiente').length)
const monthlyRevenue = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyPayments = payments.value.filter(p => {
    const paymentDate = new Date(p.fechaPago)
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear && p.estado === 'Completado'
  })
  const total = monthlyPayments.reduce((sum, p) => sum + p.costo, 0)
  return total.toLocaleString()
})

// Estado para los pagos y membresías - preparado para datos dinámicos
const payments = ref<Payment[]>([])
const userMemberships = ref<ApiUserMembership[]>([])

// Función para cargar pagos y membresías desde la API
const loadPayments = async () => {
  try {
    loading.value = true
    console.log('🔄 Iniciando carga de datos...')

    const [apiPayments, apiUserMemberships] = await Promise.all([
      membershipService.getAllPayments(),
      membershipService.getAllUserMemberships()
    ])

    console.log('📊 Datos recibidos del backend:')
    console.log('   - apiPayments:', apiPayments)
    console.log('   - apiUserMemberships:', apiUserMemberships)

    // Verificar si los datos son arrays
    if (Array.isArray(apiPayments)) {
      payments.value = apiPayments.map(mapApiPaymentToLocal)
      console.log('✅ Pagos procesados correctamente:', payments.value)
    } else {
      console.error('❌ apiPayments no es un array:', apiPayments)
      console.error('   - Tipo de dato:', typeof apiPayments)
      console.error('   - Es array?', Array.isArray(apiPayments))
      console.error('   - Contenido completo:', JSON.stringify(apiPayments, null, 2))
      payments.value = []
    }

    if (Array.isArray(apiUserMemberships)) {
      userMemberships.value = apiUserMemberships
      console.log('✅ Membresías procesadas correctamente:', userMemberships.value)
    } else {
      console.error('❌ apiUserMemberships no es un array:', apiUserMemberships)
      console.error('   - Tipo de dato:', typeof apiUserMemberships)
      console.error('   - Es array?', Array.isArray(apiUserMemberships))

      // Intentar parsear si es un string JSON
      if (typeof apiUserMemberships === 'string') {
        try {
          // Truncar el string si es muy largo para evitar problemas de memoria
          const truncatedString = apiUserMemberships.length > 10000 ?
            apiUserMemberships.substring(0, 10000) + '...' : apiUserMemberships

          console.log('🔍 Intentando parsear string JSON (truncado):', truncatedString)

          const parsed = JSON.parse(apiUserMemberships)
          if (Array.isArray(parsed)) {
            userMemberships.value = parsed
            console.log('✅ Membresías parseadas desde string JSON:', userMemberships.value)
          } else {
            console.error('❌ El string parseado no es un array:', parsed)
            userMemberships.value = []
          }
        } catch (parseError) {
          console.error('❌ Error parseando string JSON:', parseError.message)
          console.error('   - Longitud del string:', apiUserMemberships.length)
          console.error('   - Primeros 500 caracteres:', apiUserMemberships.substring(0, 500))
          console.error('   - Últimos 500 caracteres:', apiUserMemberships.substring(apiUserMemberships.length - 500))
          userMemberships.value = []
        }
      } else {
        console.error('   - Contenido completo:', JSON.stringify(apiUserMemberships, null, 2))
        userMemberships.value = []
      }
    }

    console.log('🎉 Carga de datos completada exitosamente')
    connectionStatus.value = 'connected'
  } catch (error) {
    console.error('❌ Error cargando datos:', error)
    connectionStatus.value = 'disconnected'
    // Mostrar mensaje de error en la UI
    alert('Error conectando con el backend. Revisa la consola para más detalles.')
  } finally {
    loading.value = false
  }
}

// Función para formatear fechas
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  try {
    const d = new Date(date)
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return ''
  }
}

// Función para obtener clase CSS según el estado
const getStatusClass = (status: string): string => {
  switch (status) {
    case 'Completado':
      return 'status-completed'
    case 'Pendiente':
      return 'status-pending'
    case 'Fallido':
      return 'status-failed'
    default:
      return ''
  }
}

// Función para obtener clase CSS según el estado de membresía
const getMembershipStatusClass = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'status-active'
    case 'SUSPENDED':
      return 'status-suspended'
    case 'CANCELED':
      return 'status-canceled'
    case 'EXPIRED':
      return 'status-expired'
    case 'PENDING':
      return 'status-pending'
    default:
      return ''
  }
}

// Función para formatear precios
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const logout = () => {
  // TODO: Implement logout logic
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
  console.log('Navegando a pagos')
}

// Cargar pagos al montar el componente
onMounted(() => {
  loadPayments()
})
</script>

<style>
@import '../theme/PagosPage.css';

/* Estilos adicionales para mensajes de no data */
.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
}
</style>