<template>
  <!-- Mobile Menu Button -->
  <button class="mobile-menu-btn" @click="toggleSidebar" v-if="isMobile">
    <ion-icon :icon="menuOutline"></ion-icon>
  </button>

  <!-- Sidebar Overlay for Mobile -->
  <div v-if="isMobile && showSidebar" class="sidebar-overlay" @click="closeSidebar"></div>

  <!-- Sidebar -->
  <div class="sidebar" :class="{ 'sidebar-mobile': isMobile, 'sidebar-open': showSidebar }">
    <div class="sidebar-header">
      <div class="user-info">
        <ion-icon :icon="personCircleOutline" class="user-avatar"></ion-icon>
        <span class="user-name">Administrador</span>
      </div>
      <!-- Close button for mobile -->
      <button v-if="isMobile" class="close-sidebar-btn" @click="closeSidebar">
        <ion-icon :icon="closeOutline"></ion-icon>
      </button>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-item" @click="handleNavigation(navigateToUsers)" :class="{ active: activeSection === 'users' }">
        <ion-icon :icon="peopleOutline"></ion-icon>
        <span>Usuarios</span>
      </div>
      <div class="nav-item" @click="handleNavigation(navigateToPayments)" :class="{ active: activeSection === 'payments' }">
        <ion-icon :icon="cardOutline"></ion-icon>
        <span>Pagos</span>
      </div>
      <div class="nav-item" @click="handleNavigation(navigateToReports)" :class="{ active: activeSection === 'reports' }">
        <ion-icon :icon="documentOutline"></ion-icon>
        <span>Reporte</span>
      </div>
      <div class="nav-item" @click="handleNavigation(navigateToCharts)" :class="{ active: activeSection === 'charts' }">
        <ion-icon :icon="barChartOutline"></ion-icon>
        <span>Métricas</span>
      </div>
      <div class="nav-item" @click="handleNavigation(navigateToRoles)" :class="{ active: activeSection === 'roles' }">
        <ion-icon :icon="shieldCheckmarkOutline"></ion-icon>
        <span>Roles</span>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" @click="handleLogout">
        <ion-icon :icon="logOutOutline"></ion-icon>
        <span>Log out</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  logOutOutline,
  peopleOutline,
  barChartOutline,
  personCircleOutline,
  documentOutline,
  cardOutline,
  menuOutline,
  closeOutline
} from 'ionicons/icons'

// Props
interface Props {
  activeSection?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeSection: 'users'
})

// Emits
const emit = defineEmits<{
  navigateToUsers: []
  navigateToReports: []
  navigateToCharts: []
  navigateToPayments: []
  navigateToRoles: []
  logout: []
}>()

const router = useRouter()

// Mobile responsive state
const isMobile = ref(false)
const showSidebar = ref(false)

// Check if mobile on mount and resize
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    showSidebar.value = true // Always show on desktop
  } else {
    showSidebar.value = false // Hide by default on mobile
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Mobile sidebar functions
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const closeSidebar = () => {
  if (isMobile.value) {
    showSidebar.value = false
  }
}

// Handle navigation with mobile close
const handleNavigation = (navigateFn: () => void) => {
  navigateFn()
  if (isMobile.value) {
    closeSidebar()
  }
}

const handleLogout = () => {
  emit('logout')
  if (isMobile.value) {
    closeSidebar()
  }
}

// Navigation functions
const navigateToUsers = () => {
  emit('navigateToUsers')
}

const navigateToReports = () => {
  router.push('/adminreportes')
}

const navigateToCharts = () => {
  emit('navigateToCharts')
}

const navigateToPayments = () => {
  emit('navigateToPayments')
}


const logout = () => {
  emit('logout')
}
</script>

<style scoped>
/* Mobile Menu Button */
.mobile-menu-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: #00BCD4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background: #0097A7;
  transform: scale(1.05);
}

.mobile-menu-btn ion-icon {
  font-size: 24px;
}

/* Sidebar Overlay for Mobile */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Sidebar */
.sidebar {
  width: 240px;
  background-color: #00BCD4;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.sidebar-mobile {
  transform: translateX(-100%);
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  font-size: 40px;
  color: rgb(0, 0, 0);
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  color: rgb(0, 0, 0);
}

.close-sidebar-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.close-sidebar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-item ion-icon {
  font-size: 20px;
}

.nav-item span {
  font-size: 16px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.logout-btn ion-icon {
  font-size: 20px;
}

/* Desktop styles */
@media (min-width: 769px) {
  .mobile-menu-btn {
    display: none;
  }

  .sidebar-overlay {
    display: none;
  }

  .sidebar {
    position: relative;
    transform: none !important;
  }

  .close-sidebar-btn {
    display: none;
  }
}
</style>