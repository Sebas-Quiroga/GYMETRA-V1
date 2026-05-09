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
        title="Reportes de Auditoría" 
        message="Compilando auditorías y exportaciones masivas de datos..." 
      />

      <!-- Error State -->
      <div v-else-if="error" class="error-container" style="text-align: center; padding: 100px;">
        <ion-icon :icon="banOutline" style="font-size: 60px; color: #ba1a1a;"></ion-icon>
        <p class="error-message" style="margin: 20px 0; font-weight: 700;">{{ error }}</p>
        <button class="add-user-btn" @click="loadReports" style="margin: 0 auto;">Reintentar Sincronización</button>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="dashboard-content">
        <!-- Header -->
        <div class="dashboard-header">
          <div class="header-main">
            <h1>Reportes de Auditoría</h1>
            <p class="last-update">Exportación masiva de datos → {{ formatDate(new Date()) }}</p>
          </div>
          <div class="header-actions" style="display: flex; gap: 10px;">
             <!-- Future filters could go here -->
          </div>
        </div>

        <!-- Tablas de Datos -->
        <div class="reports-tables-section">
          <!-- Tabla de Usuarios -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>
                <ion-icon :icon="peopleOutline" style="color: var(--admin-accent); vertical-align: middle; margin-right: 8px;"></ion-icon>
                Explorador de Usuarios
              </h3>
              <ReportesButtons
                type="users"
                :users="users"
                :payments="payments"
                :loading="loading"
              />
            </div>
            
            <table class="payments-history-table">
              <thead>
                <tr>
                  <th style="width: 80px;">ID</th>
                  <th>Usuario</th>
                  <th>Contacto</th>
                  <th>Identificación</th>
                  <th>Estado</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id || user.correo">
                  <td style="font-family: monospace; opacity: 0.6;">#{{ user.id }}</td>
                  <td>
                    <div style="font-weight: 800; font-family: var(--app-font-brand);">{{ user.nombre }} {{ user.apellido }}</div>
                    <div style="font-size: 0.75rem; color: var(--admin-text-sub);">{{ user.correo }}</div>
                  </td>
                  <td style="font-size: 0.85rem;">{{ user.telefono || 'N/A' }}</td>
                  <td style="font-family: monospace; font-weight: 700;">{{ user.identificacion }}</td>
                  <td>
                    <span :class="getStatusClass(user.estado)" class="status-badge">{{ user.estado }}</span>
                  </td>
                  <td style="font-size: 0.8rem; color: var(--admin-text-sub);">{{ formatDate(user.fechaCreacion) }}</td>
                </tr>
                
                <tr v-if="users.length === 0">
                  <td colspan="6" style="text-align: center; padding: 60px;">
                    <ion-icon :icon="peopleOutline" style="font-size: 48px; color: var(--admin-accent-soft);"></ion-icon>
                    <div style="margin-top: 15px; font-weight: 700; color: var(--admin-text-sub);">No hay registros de usuarios exportables</div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style="padding: 20px 35px;">
              <Pagination
                :total-items="users.length"
                :current-page="usersCurrentPage"
                :page-size="usersPageSize"
                item-name="usuarios"
                component-id="users"
                @update:current-page="usersCurrentPage = $event"
                @update:page-size="usersPageSize = $event"
              />
            </div>
          </div>

          <!-- Historial de Pagos -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>
                <ion-icon :icon="cashOutline" style="color: var(--admin-accent); vertical-align: middle; margin-right: 8px;"></ion-icon>
                Historial de Transacciones
              </h3>
              <ReportesButtons
                type="payments"
                :users="users"
                :payments="payments"
                :loading="loading"
              />
            </div>
            
            <table class="payments-history-table">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Titular</th>
                  <th>Inversión</th>
                  <th>Plan</th>
                  <th>Vía</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in paginatedPayments" :key="payment.id">
                  <td style="font-family: monospace; opacity: 0.6;">{{ payment.idPago }}</td>
                  <td>
                    <div style="font-weight: 700;">{{ payment.identificacion }}</div>
                  </td>
                  <td style="font-weight: 900; color: var(--admin-text-main);">${{ payment.costo.toLocaleString() }}</td>
                  <td style="font-size: 0.8rem; font-weight: 800; color: var(--admin-accent);">{{ payment.plan }}</td>
                  <td>
                    <span style="font-size: 0.75rem; font-weight: 800;">{{ payment.metodoPago === 'GATEWAY' ? 'TARJETA' : 'EFECTIVO' }}</span>
                  </td>
                  <td style="font-size: 0.8rem;">{{ formatDate(payment.fechaPago) }}</td>
                  <td>
                    <span :class="getStatusClass(payment.estado)" class="status-badge">{{ payment.estado }}</span>
                  </td>
                </tr>
                <tr v-if="payments.length === 0">
                  <td colspan="7" style="text-align: center; padding: 60px;">
                    <ion-icon :icon="cardOutline" style="font-size: 48px; color: var(--admin-accent-soft);"></ion-icon>
                    <div style="margin-top: 15px; font-weight: 700; color: var(--admin-text-sub);">No hay transacciones procesadas aún</div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style="padding: 20px 35px;">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { logout as authLogout } from '@/services/authService'
import AdminSidebar from '@/components/AdminSidebar.vue'
import ReportesButtons from '@/components/ReportesButtons.vue'
import Pagination from '@/components/Pagination.vue'
import KineticLoading from '@/components/KineticLoading.vue'
import { formatNumber, formatCurrency } from '@/services/metricsService'
import { reportsService, type Report, type ReportFilters, type ReportStats, type ReportTypeStats } from '@/services/reportsService'
import { userService, type User as ApiUser } from '@/services/userService'
import { membershipService, type Membership } from '@/services/membershipService'
import {
  refreshOutline,
  trashOutline,
  peopleOutline,
  cardOutline,
  cashOutline,
  eyeOutline,
  createOutline,
  checkmarkCircleOutline,
  banOutline
} from 'ionicons/icons'

// Mobile responsive state
const isMobile = ref(false)

// Check if mobile on mount
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const router = useRouter()
const activeSection = ref('reports')

// Estado de reportes
const loading = ref(false)
const error = ref('')
const dateRange = ref('month')
const reportType = ref('all')

// Estado de datos reales
const reports = ref<ReportStats>({
  totalReports: 0,
  reportsThisWeek: 0,
  pendingReports: 0,
  processingReports: 0,
  avgGenerationTime: '2.3s',
  fastestReport: '0.8s',
  exportedReports: 0,
  exportsThisMonth: 0,
  successRate: 98,
  totalSize: '2.4 MB',
  autoCleanup: '15 reportes'
})

// Estado de reportes recientes (vacío inicialmente)
const recentReports = ref<Report[]>([])

// Estado de tipos populares
const popularReportTypes = ref<ReportTypeStats[]>([])

// Estado de configuración
const settings = ref({
  notifications: true,
  autoReports: false,
  retentionDays: 30
})

// Estado para pagos
const payments = ref<Payment[]>([])

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

// Estado para usuarios
const users = ref<User[]>([])

// Estado de paginación para usuarios
const usersCurrentPage = ref(1)
const usersPageSize = ref(10)

// Estado de paginación para pagos
const paymentsCurrentPage = ref(1)
const paymentsPageSize = ref(10)

// Computed para datos paginados
const paginatedUsers = computed(() => {
  const start = (usersCurrentPage.value - 1) * usersPageSize.value
  const end = start + usersPageSize.value
  return users.value.slice(start, end)
})

const paginatedPayments = computed(() => {
  const start = (paymentsCurrentPage.value - 1) * paymentsPageSize.value
  const end = start + paymentsPageSize.value
  return payments.value.slice(start, end)
})

// Estado para modales
const showDeleteModal = ref(false)
const selectedUser = ref<User | null>(null)
const deletedUserName = ref('')
const deleting = ref(false)
const statusUpdating = ref(false)

// Función para mapear datos de la API a la interfaz local (igual que AdminPage.vue)
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

// Interface para definir la estructura de datos de usuario (igual que AdminPage.vue)
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

// Cargar reportes
const loadReports = async () => {
  loading.value = true
  error.value = ''

  try {
    // Cargar datos reales del backend
    const [reportStats, popularTypes, apiPayments, apiUsers, apiMemberships] = await Promise.all([
      reportsService.getReportStats(),
      reportsService.getPopularReportTypes(),
      membershipService.getAllPayments(),
      userService.getAllUsers(),
      membershipService.getAllMemberships()
    ])

    reports.value = reportStats
    popularReportTypes.value = popularTypes

    // Procesar pagos para reportes
    const usersMap = new Map(apiUsers.map((u: any) => [u.userId, u]))
    const membershipsMap = new Map(apiMemberships.map((m: Membership) => [m.membershipId, m]))

    if (Array.isArray(apiPayments)) {
      payments.value = apiPayments.map(apiPayment => {
        const userId = (apiPayment as any).userId || (apiPayment as any).identificacion
        const user = usersMap.get(Number(userId))
        const userName = user ? `${(user as any).firstName} ${(user as any).lastName}` : (userId ? `Usuario ${userId}` : 'Usuario desconocido')

        const membershipId = (apiPayment as any).membershipId || (apiPayment as any).planId || (apiPayment as any).plan

        return {
          id: apiPayment.id,
          idPago: `PAY-${apiPayment.id}`,
          identificacion: userName,
          persona: userName,
          fechaPago: (apiPayment as any).paymentDate || (apiPayment as any).fechaPago,
          costo: (apiPayment as any).amount || (apiPayment as any).monto || 0,
          plan: membershipId ? membershipsMap.get(Number(membershipId))?.planName || 'Sin plan' : 'Sin plan',
          estado: (() => {
            const status = (apiPayment as any).paymentStatus?.toUpperCase()
            if (status === 'CONFIRMED' || status === 'COMPLETED' || status === 'SUCCESS') return 'Completado'
            if (status === 'PENDING') return 'Pendiente'
            return 'Fallido'
          })(),
          metodoPago: (apiPayment as any).paymentMethod || (apiPayment as any).metodoPago || 'N/A'
        }
      })
    } else {
      payments.value = []
    }

    console.log('✅ Reportes y pagos cargados exitosamente:', { stats: reportStats, popular: popularTypes, payments: payments.value.length })
  } catch (err: any) {
    console.error('❌ Error cargando reportes:', err)
    error.value = err.message || 'Error al cargar los reportes.'
  } finally {
    loading.value = false
  }
}

// Función para cargar usuarios desde la API (igual que AdminPage.vue)
const loadUsers = async () => {
  try {
    console.log('👥 Cargando usuarios desde la API...')
    const apiUsers = await userService.getAllUsers()
    users.value = apiUsers.map(mapApiUserToLocal)
    console.log('✅ Usuarios cargados:', users.value.length)
  } catch (error) {
    console.error('❌ Error cargando usuarios:', error)
    // No mostrar error al usuario, solo log
  }
}

// Generar reporte
const generateReport = async () => {
  const filters: ReportFilters = {
    dateRange: dateRange.value as any,
    reportType: reportType.value as any
  }

  console.log(`📊 Generando reporte: ${reportType.value} para rango: ${dateRange.value}`)

  try {
    const newReport = await reportsService.generateReport(filters)

    // Agregar a la lista de reportes recientes
    recentReports.value.unshift(newReport)

    // Simular procesamiento y actualización de estado
    setTimeout(() => {
      const report = recentReports.value.find(r => r.id === newReport.id)
      if (report) {
        report.status = 'completed'
        console.log('✅ Reporte generado exitosamente:', report.name)
      }
    }, 2000 + Math.random() * 3000) // 2-5 segundos

    alert(`Generando reporte de ${getReportTypeLabel(reportType.value)}...`)
  } catch (error) {
    console.error('Error generando reporte:', error)
    alert('Error al generar el reporte. Intente nuevamente.')
  }
}

// Descargar reporte
const downloadReport = async (report: Report) => {
  try {
    console.log('📥 Descargando reporte:', report.name)

    const blob = await reportsService.downloadReport(report.id)

    // Crear URL para descarga
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    alert(`Descargando: ${report.name}`)
  } catch (error) {
    console.error('Error descargando reporte:', error)
    alert('Error al descargar el reporte.')
  }
}





// Eliminar reporte
const deleteReport = async (report: Report) => {
  if (confirm(`¿Eliminar el reporte "${report.name}"?`)) {
    try {
      await reportsService.deleteReport(report.id)
      recentReports.value = recentReports.value.filter(r => r.id !== report.id)
      console.log('🗑️ Reporte eliminado:', report.name)
    } catch (error) {
      console.error('Error eliminando reporte:', error)
      alert('Error al eliminar el reporte.')
    }
  }
}

// Funciones auxiliares
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

const getReportIcon = (type: string) => {
  switch (type) {
    case 'users': return peopleOutline
    case 'payments': return cashOutline
    case 'memberships': return cardOutline
    default: return createOutline
  }
}

const getReportTypeLabel = (type: string): string => {
  switch (type) {
    case 'users': return 'Usuarios'
    case 'payments': return 'Pagos'
    case 'memberships': return 'Membresías'
    case 'revenue': return 'Ingresos'
    case 'all': return 'Todos'
    default: return type
  }
}

const getReportStatusLabel = (status: string): string => {
  switch (status) {
    case 'completed': return 'Completado'
    case 'processing': return 'Procesando'
    case 'pending': return 'Pendiente'
    case 'failed': return 'Fallido'
    default: return status
  }
}

const getReportPopularityPercentage = (count: number): number => {
  const total = popularReportTypes.value.reduce((sum, r) => sum + r.count, 0)
  return total > 0 ? Math.round((count / total) * 100) : 0
}

// Funciones de navegación
const logout = () => {
  authLogout()
}

const navigateToUsers = () => {
  router.push('/adminpanel')
}

const navigateToReports = () => {
  activeSection.value = 'reports'
  console.log('Navegando a reportes')
}

const navigateToCharts = () => {
  router.push('/adminmetricas')
}

const navigateToPayments = () => {
  router.push('/adminpagos')
}

// Funciones para manejar usuarios (igual que AdminPage.vue)
const viewUser = (user: User) => {
  console.log('👁️ Ver usuario:', user.nombre)
  // Por ahora solo log, se puede implementar navegación
}

const editUser = (user: User) => {
  console.log('✏️ Editar usuario:', user.nombre)
  // Por ahora solo log, se puede implementar navegación
}

const deleteUser = (user: User) => {
  if (confirm(`¿Eliminar al usuario ${user.nombre} ${user.apellido}?`)) {
    console.log('🗑️ Eliminar usuario:', user.nombre)
    // Implementar eliminación
  }
}

const toggleUserStatus = async (user: User) => {
  if (!user.id) return

  try {
    statusUpdating.value = true
    const newStatus = user.estado === 'Activo' ? 'suspended' : 'active'

    const success = await userService.updateUserStatus(user.id, newStatus)

    if (success) {
      user.estado = newStatus === 'active' ? 'Activo' : 'Suspendido'
      console.log('✅ Estado de usuario actualizado:', user.nombre)
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

// Inicializar
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadReports()
  loadUsers()
})
</script>

<style>
@import '../theme/ReportesPage.css';
@import '../theme/AdminPage.css';
</style>