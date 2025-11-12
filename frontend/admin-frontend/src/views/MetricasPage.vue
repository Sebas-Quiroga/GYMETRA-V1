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
      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- Counter Card - Top Left -->
        <div class="chart-card counter-card">
          <div class="counter-number">54</div>
        </div>

        <!-- Pie Chart Card - Top Right -->
        <div class="chart-card pie-chart-card">
          <div class="pie-chart-container">
            <div class="pie-chart">
              <div class="pie-segment pie-segment-1"></div>
              <div class="pie-segment pie-segment-2"></div>
            </div>
            <div class="pie-center"></div>
          </div>
        </div>

        <!-- Bar Chart Card - Bottom Full Width -->
        <div class="chart-card bar-chart-card">
          <div class="bar-chart-container">
            <svg class="bar-chart-svg" viewBox="0 0 600 250">
              <!-- Bars -->
              <rect class="bar" x="20" y="180" width="30" height="40" rx="4"></rect>
              <rect class="bar" x="60" y="160" width="30" height="60" rx="4"></rect>
              <rect class="bar" x="100" y="140" width="30" height="80" rx="4"></rect>
              <rect class="bar" x="140" y="120" width="30" height="100" rx="4"></rect>
              <rect class="bar" x="180" y="100" width="30" height="120" rx="4"></rect>
              <rect class="bar" x="220" y="80" width="30" height="140" rx="4"></rect>
              <rect class="bar" x="260" y="60" width="30" height="160" rx="4"></rect>
              <rect class="bar" x="300" y="40" width="30" height="180" rx="4"></rect>
              <rect class="bar" x="340" y="50" width="30" height="170" rx="4"></rect>
              <rect class="bar" x="380" y="70" width="30" height="150" rx="4"></rect>
              <rect class="bar" x="420" y="90" width="30" height="130" rx="4"></rect>
              <rect class="bar" x="460" y="110" width="30" height="110" rx="4"></rect>
              <rect class="bar" x="500" y="130" width="30" height="90" rx="4"></rect>
              <rect class="bar" x="540" y="150" width="30" height="70" rx="4"></rect>

              <!-- Trend Line -->
              <polyline class="trend-line"
                points="35,200 75,190 115,170 155,160 195,140 235,120 275,100 315,80 355,90 395,110 435,130 475,150 515,170 555,190"
                fill="none" stroke="#00695C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              </polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout as authLogout } from '@/services/authService'
import AdminSidebar from '@/components/AdminSidebar.vue'
import {
  logOutOutline,
  peopleOutline,
  barChartOutline,
  personCircleOutline,
  documentOutline,
  cardOutline,
  timeOutline,
  trendingUpOutline,
  personAddOutline,
  checkmarkCircleOutline
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
const activeSection = ref('charts')

// Metrics data
const totalUsers = ref(247)
const activeMemberships = ref(189)
const avgSessionTime = ref(45)
const monthlyRevenue = ref('$12,450')

// Weekly usage data
const weeklyData = ref([
  { day: 'L', value: 65, percentage: 65 },
  { day: 'M', value: 45, percentage: 45 },
  { day: 'X', value: 80, percentage: 80 },
  { day: 'J', value: 95, percentage: 95 },
  { day: 'V', value: 70, percentage: 70 },
  { day: 'S', value: 85, percentage: 85 },
  { day: 'D', value: 55, percentage: 55 }
])

// Plan distribution data
const planDistribution = ref([
  { name: 'Básico', percentage: 35, color: '#00BCD4' },
  { name: 'Premium', percentage: 45, color: '#2196F3' },
  { name: 'VIP', percentage: 20, color: '#9C27B0' }
])

// Recent activities
const recentActivities = ref([
  {
    id: 1,
    text: 'Nuevo usuario registrado: María González',
    time: 'Hace 5 min',
    icon: personAddOutline
  },
  {
    id: 2,
    text: 'Pago confirmado - Plan Premium',
    time: 'Hace 12 min',
    icon: checkmarkCircleOutline
  },
  {
    id: 3,
    text: 'Usuario renovó membresía',
    time: 'Hace 1 hora',
    icon: cardOutline
  },
  {
    id: 4,
    text: 'Nuevo usuario registrado: Carlos Rodríguez',
    time: 'Hace 2 horas',
    icon: personAddOutline
  }
])

const logout = () => {
  // Use centralized authService logout to clear token and redirect
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
</script>

<style>
@import '../theme/MetricasPage.css';
</style>