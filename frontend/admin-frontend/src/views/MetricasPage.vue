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
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando métricas del dashboard...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="loadMetrics">Reintentar</button>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="dashboard-content">
        <!-- Header con fecha y título -->
        <div class="dashboard-header">
          <h1>Dashboard de Métricas</h1>
          <p class="last-update">Última actualización: {{ formatDate(new Date()) }}</p>
        </div>

        <!-- KPIs Principales -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon">
              <ion-icon :icon="peopleOutline"></ion-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ formatNumber(metrics.totalUsers) }}</div>
              <div class="kpi-label">Usuarios Registrados</div>
              <div class="kpi-trend">
                <span class="trend-positive">+{{ metrics.newUsersThisWeek }}</span> esta semana
              </div>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon">
              <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ formatNumber(metrics.activeUsers) }}</div>
              <div class="kpi-label">Usuarios Activos</div>
              <div class="kpi-trend">
                <span class="trend-info">{{ formatNumber(metrics.suspendedUsers) }}</span> suspendidos
              </div>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon">
              <ion-icon :icon="banOutline"></ion-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ formatNumber(metrics.suspendedUsers) }}</div>
              <div class="kpi-label">Cuentas Suspendidas</div>
              <div class="kpi-trend">
                <span class="trend-neutral">{{ formatNumber(metrics.newUsersToday) }}</span> nuevos hoy
              </div>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon">
              <ion-icon :icon="cashOutline"></ion-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ formatCurrency(metrics.monthlyRevenue) }}</div>
              <div class="kpi-label">Ingresos del Mes</div>
              <div class="kpi-trend">
                <span class="trend-positive">{{ formatCurrency(metrics.totalRevenue) }}</span> totales
              </div>
            </div>
          </div>
        </div>

        <!-- Gráficos y Análisis -->
        <div class="charts-section">
          <!-- Estado de Membresías -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>Estado de Membresías</h3>
            </div>
            <div class="membership-status-chart">
              <div class="status-pie-container">
                <svg class="status-pie-chart" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="#f5f5f5" />
                  <circle
                    cx="100" cy="100" r="80"
                    :stroke-dasharray="getUserStatusCircleDashArray('total')"
                    :stroke-dashoffset="getUserStatusCircleDashOffset('total')"
                    stroke="#2196f3"
                    stroke-width="20"
                    fill="none"
                    transform="rotate(-90 100 100)"
                    v-if="metrics.totalUsers > 0"
                  />
                  <circle
                    cx="100" cy="100" r="80"
                    :stroke-dasharray="getUserStatusCircleDashArray('active')"
                    :stroke-dashoffset="getUserStatusCircleDashOffset('active')"
                    stroke="#4caf50"
                    stroke-width="20"
                    fill="none"
                    transform="rotate(-90 100 100)"
                    v-if="metrics.activeUsers > 0"
                  />
                  <circle
                    cx="100" cy="100" r="80"
                    :stroke-dasharray="getUserStatusCircleDashArray('suspended')"
                    :stroke-dashoffset="getUserStatusCircleDashOffset('suspended')"
                    stroke="#ff9800"
                    stroke-width="20"
                    fill="none"
                    transform="rotate(-90 100 100)"
                    v-if="metrics.suspendedUsers > 0"
                  />
                  <circle cx="100" cy="100" r="60" fill="white" />
                  <text x="100" y="95" text-anchor="middle" class="pie-center-text">
                    {{ formatNumber(metrics.totalMemberships) }}
                  </text>
                  <text x="100" y="110" text-anchor="middle" class="pie-center-label">
                    Total
                  </text>
                  <!-- Debug info -->
                  <text x="100" y="130" text-anchor="middle" class="pie-center-label" style="font-size: 8px; fill: #666;">
                    T:{{ metrics.totalUsers }} A:{{ metrics.activeUsers }} S:{{ metrics.suspendedUsers }}
                  </text>
                </svg>
              </div>
              <div class="status-legend">
                <div class="legend-item">
                  <div class="legend-color" style="background: #2196f3;"></div>
                  <div class="legend-text">
                    <span class="legend-label">Total Registrados</span>
                    <span class="legend-value">{{ formatNumber(metrics.totalUsers) }}</span>
                  </div>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: #4caf50;"></div>
                  <div class="legend-text">
                    <span class="legend-label">Usuarios Activos</span>
                    <span class="legend-value">{{ formatNumber(metrics.activeUsers) }}</span>
                  </div>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: #ff9800;"></div>
                  <div class="legend-text">
                    <span class="legend-label">Cuentas Suspendidas</span>
                    <span class="legend-value">{{ formatNumber(metrics.suspendedUsers) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ingresos Mensuales - Gráfico de Línea -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>Ingresos por Mes</h3>
            </div>
            <div class="revenue-line-chart">
              <svg class="line-chart-svg" viewBox="0 0 600 200">
                <!-- Ejes -->
                <line x1="50" y1="20" x2="50" y2="180" stroke="#ddd" stroke-width="1"/>
                <line x1="50" y1="180" x2="580" y2="180" stroke="#ddd" stroke-width="1"/>

                <!-- Etiquetas del eje Y dinámicas basadas en datos reales -->
                <text x="35" y="30" text-anchor="end" class="axis-label">{{ formatCurrency(getYAxisMaxValue() * 0.8) }}</text>
                <text x="35" y="80" text-anchor="end" class="axis-label">{{ formatCurrency(getYAxisMaxValue() * 0.4) }}</text>
                <text x="35" y="130" text-anchor="end" class="axis-label">$0</text>

                <!-- Etiquetas del eje X -->
                <text x="110" y="195" text-anchor="middle" class="axis-label">Jun</text>
                <text x="190" y="195" text-anchor="middle" class="axis-label">Jul</text>
                <text x="270" y="195" text-anchor="middle" class="axis-label">Ago</text>
                <text x="350" y="195" text-anchor="middle" class="axis-label">Sep</text>
                <text x="430" y="195" text-anchor="middle" class="axis-label">Oct</text>
                <text x="510" y="195" text-anchor="middle" class="axis-label">Nov</text>

                <!-- Área bajo la curva -->
                <path
                  :d="getRevenueAreaPath()"
                  fill="url(#revenueGradient)"
                  opacity="0.3"
                />

                <!-- Línea de ingresos -->
                <path
                  :d="getRevenueLinePath()"
                  fill="none"
                  stroke="#2196f3"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <!-- Puntos de datos -->
                <circle
                  v-for="(point, index) in getRevenueDataPoints()"
                  :key="index"
                  :cx="point.x"
                  :cy="point.y"
                  r="5"
                  fill="#2196f3"
                  stroke="white"
                  stroke-width="2"
                  :title="`${getLast6Months()[index]}: ${formatCurrency(point.value)}`"
                />

                <!-- Gradiente -->
                <defs>
                  <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#2196f3;stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:#2196f3;stop-opacity:0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <!-- Distribución por Planes -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>Popularidad de Planes</h3>
            </div>
            <div class="plan-popularity">
              <div
                v-for="plan in getPurchasedPlans()"
                :key="plan.planName"
                class="plan-popularity-item"
              >
                <div class="plan-name">{{ plan.planName }}</div>
                <div class="plan-stats">
                  <div class="plan-count">{{ plan.count }} compras</div>
                  <div class="plan-bar">
                    <div
                      class="plan-bar-fill"
                      :style="{ width: getPlanPopularityPercentage(plan.count) + '%' }"
                    ></div>
                  </div>
                  <div class="plan-percentage">{{ plan.count }}</div>
                </div>
              </div>
              <div v-if="getPurchasedPlans().length === 0" class="no-data-message">
                <p>No hay planes comprados aún</p>
              </div>
            </div>
          </div>

          <!-- Métricas de Rendimiento -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>Métricas Clave</h3>
            </div>
            <div class="performance-metrics">
              <div class="metric-item">
                <div class="metric-icon">🎯</div>
                <div class="metric-content">
                  <div class="metric-value">{{ getConversionRate() }}%</div>
                  <div class="metric-label">Tasa de Conversión</div>
                  <div class="metric-desc">Usuarios activos vs registrados</div>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-icon">💰</div>
                <div class="metric-content">
                  <div class="metric-value">{{ getAverageRevenuePerUser() }}</div>
                  <div class="metric-label">Ingreso por Usuario</div>
                  <div class="metric-desc">Promedio mensual</div>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-icon">📈</div>
                <div class="metric-content">
                  <div class="metric-value">{{ getGrowthRate() }}%</div>
                  <div class="metric-label">Crecimiento</div>
                  <div class="metric-desc">Usuarios nuevos este mes</div>
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-icon">⚡</div>
                <div class="metric-content">
                  <div class="metric-value">{{ getRetentionRate() }}%</div>
                  <div class="metric-label">Retención</div>
                  <div class="metric-desc">Membresías activas</div>
                </div>
              </div>
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
import { getMetricsData, formatNumber, formatCurrency, type MetricsData } from '@/services/metricsService'
import {
  peopleOutline,
  cardOutline,
  cashOutline,
  trendingUpOutline,
  barChartOutline,
  analyticsOutline,
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
const activeSection = ref('charts')

// Estado de métricas
const loading = ref(false)
const error = ref('')
const metrics = ref<MetricsData>({
  totalUsers: 0,
  activeUsers: 0,
  suspendedUsers: 0,
  newUsersToday: 0,
  newUsersThisWeek: 0,
  newUsersThisMonth: 0,
  totalMemberships: 0,
  activeMemberships: 0,
  expiredMemberships: 0,
  suspendedMemberships: 0,
  pendingMemberships: 0,
  membershipDistribution: [],
  totalPayments: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  weeklyRevenue: 0,
  dailyRevenue: 0,
  paymentMethods: [],
  revenueByPlan: [],
  userGrowth: [],
  revenueGrowth: [],
  membershipTrends: [],
  dailyActivity: []
})

// Estado del gráfico
const selectedChartType = ref<'userGrowth' | 'revenueGrowth' | 'membershipTrends'>('userGrowth')

// Cargar métricas
const loadMetrics = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = await getMetricsData()
    metrics.value = data
    console.log('✅ Métricas cargadas exitosamente:', data)
  } catch (err: any) {
    console.error('❌ Error cargando métricas:', err)
    error.value = err.message || 'Error al cargar las métricas. Verifica que los servicios backend estén ejecutándose.'
  } finally {
    loading.value = false
  }
}

// Funciones de formateo
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Funciones para gráficos
const getGrowthPoints = (data: any[]): string => {
  if (!data || data.length === 0) return ''

  const maxValue = Math.max(...data.map(d => d.value))
  const points: string[] = []

  data.forEach((item, index) => {
    const x = (index / (data.length - 1)) * 580 + 20
    const y = 180 - (item.value / maxValue) * 140
    points.push(`${x},${y}`)
  })

  return points.join(' ')
}

const getActivityHeight = (value: number, type: 'users' | 'payments'): number => {
  const maxUsers = Math.max(...metrics.value.dailyActivity.map(h => h.users))
  const maxPayments = Math.max(...metrics.value.dailyActivity.map(h => h.payments))

  const max = type === 'users' ? maxUsers : maxPayments
  return max > 0 ? (value / max) * 100 : 0
}

const toggleChartType = (type: 'userGrowth' | 'revenueGrowth' | 'membershipTrends') => {
  selectedChartType.value = type
}

const getStatusPercentage = (value: number): number => {
  const total = metrics.value.activeMemberships + metrics.value.pendingMemberships + metrics.value.expiredMemberships
  return total > 0 ? Math.round((value / total) * 100) : 0
}

const getUserStatusCircleDashArray = (status: 'active' | 'suspended' | 'total'): string => {
  const total = metrics.value.totalUsers
  if (total === 0) return '0 503'

  let value = 0
  switch (status) {
    case 'total': value = metrics.value.totalUsers; break
    case 'active': value = metrics.value.activeUsers; break
    case 'suspended': value = metrics.value.suspendedUsers; break
  }

  const percentage = value / total
  const circumference = 2 * Math.PI * 80 // radio = 80
  const dashLength = percentage * circumference
  const gapLength = circumference - dashLength
  return `${dashLength} ${gapLength}`
}

const getUserStatusCircleDashOffset = (status: 'active' | 'suspended' | 'total'): number => {
  const total = metrics.value.totalUsers
  if (total === 0) return 0

  let offset = 0
  switch (status) {
    case 'active':
      offset = 0 // Empieza desde el inicio
      break
    case 'suspended':
      offset = metrics.value.activeUsers / total // Después de los activos
      break
    case 'total':
      offset = (metrics.value.activeUsers + metrics.value.suspendedUsers) / total // Después de activos + suspendidos
      break
  }

  return -offset * 2 * Math.PI * 80
}

const getLast6Months = (): string[] => {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(date.toLocaleDateString('es-ES', { month: 'long', year: '2-digit' }))
  }
  return months
}

const getMonthlyRevenue = (monthName: string): number => {
  // SOLO MOSTRAR DATOS REALES - SI NO HAY DATOS PARA UN MES, MOSTRAR 0
  const monthIndex = getLast6Months().indexOf(monthName)
  const now = new Date()

  // Para el mes actual (noviembre), usar datos reales del backend
  if (monthIndex === 5) {
    const currentMonth = now.toLocaleDateString('es-ES', { month: 'long', year: '2-digit' })
    if (monthName === currentMonth) {
      console.log('📊 Ingresos reales de noviembre:', metrics.value.monthlyRevenue)
      return metrics.value.monthlyRevenue || 0
    }
  }

  // Para meses anteriores, SI NO HAY DATOS REALES, MOSTRAR 0
  // Esto refleja que solo noviembre tiene datos reales
  console.log(`📊 ${monthName}: Sin datos históricos disponibles`)
  return 0
}

// Funciones para el gráfico de línea
const getRevenueDataPoints = (): {x: number, y: number, value: number}[] => {
  const months = getLast6Months()
  const points: {x: number, y: number, value: number}[] = []

  months.forEach((month, index) => {
    const revenue = getMonthlyRevenue(month)
    const x = 110 + (index * 80) // Espaciado horizontal
    const maxRevenue = Math.max(...months.map(m => getMonthlyRevenue(m)))
    const y = 180 - (revenue / maxRevenue) * 140 // Escala vertical

    points.push({ x, y, value: revenue })
  })

  return points
}

const getRevenueLinePath = (): string => {
  const points = getRevenueDataPoints()
  if (points.length === 0) return ''

  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`
  }
  return path
}

const getRevenueAreaPath = (): string => {
  const points = getRevenueDataPoints()
  if (points.length === 0) return ''

  let path = `M ${points[0].x} 180` // Comenzar desde el eje X
  for (let i = 0; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`
  }
  path += ` L ${points[points.length - 1].x} 180 Z` // Cerrar el área
  return path
}

const getYAxisMaxValue = (): number => {
  // Calcular el valor máximo real de ingresos para escalar el eje Y
  const months = getLast6Months()
  const maxRevenue = Math.max(...months.map(m => getMonthlyRevenue(m)))
  // Redondear hacia arriba al siguiente múltiplo de 1000 para mejor visualización
  return Math.ceil((maxRevenue || 1000) / 1000) * 1000
}

const getPurchasedPlans = () => {
  // Obtener planes que realmente han sido comprados desde el backend
  // Por ahora, devolver datos simulados basados en membresías activas
  // En el futuro, esto debería venir de una API específica de compras/ventas
  const purchasedPlans = [
    { planName: 'Plan Básico', count: 2 },
    { planName: 'Plan Premium', count: 1 },
    { planName: 'Plan VIP', count: 0 }
  ].filter(plan => plan.count > 0) // Solo mostrar planes con compras

  console.log('📊 Planes comprados:', purchasedPlans)
  return purchasedPlans
}

const getPlanPopularityPercentage = (count: number): number => {
  // Calcular porcentaje basado en el total de compras
  const totalPurchases = getPurchasedPlans().reduce((sum, plan) => sum + plan.count, 0)
  return totalPurchases > 0 ? Math.round((count / totalPurchases) * 100) : 0
}

const getRevenueBarHeight = (revenue: number): number => {
  const maxRevenue = Math.max(...getLast6Months().map(m => getMonthlyRevenue(m)))
  return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
}

const getConversionRate = (): string => {
  if (metrics.value.totalUsers === 0) return '0.0'
  const rate = (metrics.value.activeUsers / metrics.value.totalUsers) * 100
  return rate.toFixed(1)
}

const getAverageRevenuePerUser = (): string => {
  if (metrics.value.activeUsers === 0) return '$0'
  const avg = metrics.value.monthlyRevenue / metrics.value.activeUsers
  return formatCurrency(avg)
}

const getGrowthRate = (): string => {
  if (metrics.value.newUsersThisMonth === 0) return '0.0'
  const rate = (metrics.value.newUsersThisMonth / Math.max(metrics.value.totalUsers - metrics.value.newUsersThisMonth, 1)) * 100
  return rate.toFixed(1)
}

const getRetentionRate = (): string => {
  if (metrics.value.totalMemberships === 0) return '0.0'
  const active = metrics.value.activeMemberships + metrics.value.pendingMemberships
  const rate = (active / metrics.value.totalMemberships) * 100
  return rate.toFixed(1)
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
  activeSection.value = 'charts'
  console.log('Navegando a gráficas')
}

const navigateToPayments = () => {
  activeSection.value = 'payments'
  router.push('/adminpagos')
}

// Inicializar
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadMetrics()
})
</script>

<style>
@import '../theme/MetricasPage.css';
</style>