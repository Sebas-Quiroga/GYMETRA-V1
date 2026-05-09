<template>
  <!-- Sidebar Overlay for Mobile -->
  <div v-if="(isMobile && showSidebar) || (!isMobile && !uiStore.isSidebarCollapsed)" class="sidebar-overlay" @click="closeSidebarAction"></div>

  <!-- Sidebar -->
  <div 
    class="sidebar" 
    :class="{ 
      'sidebar-mobile': isMobile, 
      'sidebar-open': (isMobile && showSidebar),
      'sidebar-collapsed': !isMobile && uiStore.isSidebarCollapsed 
    }"
  >
    <div class="sidebar-header">
      <div class="logo-container" @click="router.push('/adminpanel')">
        <img src="/logo.png" alt="Logo Gymetra" class="brand-logo" />
        <div class="brand-text" v-if="!uiStore.isSidebarCollapsed || isMobile">
          <span class="brand-name">GYMETRA</span>
          <span class="brand-badge">AERO ATHLETIC</span>
        </div>
      </div>
      <!-- Toggle button for desktop -->
      <button v-if="!isMobile" class="collapse-btn" @click="uiStore.toggleSidebar">
        <ion-icon :icon="uiStore.isSidebarCollapsed ? chevronForwardOutline : chevronBackOutline"></ion-icon>
      </button>
      <!-- Close button for mobile -->
      <button v-if="isMobile" class="close-sidebar-btn" @click="closeSidebar">
        <ion-icon :icon="closeOutline"></ion-icon>
      </button>
    </div>

    <div class="user-profile" :class="{ 'profile-collapsed': uiStore.isSidebarCollapsed && !isMobile }">
      <div class="avatar-wrapper">
        <img v-if="userProfile.avatar" :src="userProfile.avatar" class="user-avatar-img" />
        <ion-icon v-else :icon="personCircleOutline" class="user-avatar"></ion-icon>
      </div>
      <div class="user-details" v-if="!uiStore.isSidebarCollapsed || isMobile">
        <p class="user-name">{{ userProfile.name }}</p>
        <p class="user-role">{{ userProfile.role }}</p>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-group">
        <p class="group-label" v-if="!uiStore.isSidebarCollapsed || isMobile">GESTIÓN KINETIC</p>
        <div class="nav-item" @click="handleNavigation('/adminpanel')" :class="{ active: activeSection === 'users' }" :title="uiStore.isSidebarCollapsed ? 'Usuarios' : ''">
          <div class="item-inner">
            <ion-icon :icon="peopleOutline"></ion-icon>
            <span v-if="!uiStore.isSidebarCollapsed || isMobile">Usuarios</span>
            <div class="active-indicator"></div>
          </div>
        </div>
        <div class="nav-item" @click="handleNavigation('/adminpagos')" :class="{ active: activeSection === 'payments' }" :title="uiStore.isSidebarCollapsed ? 'Pagos' : ''">
          <div class="item-inner">
            <ion-icon :icon="cardOutline"></ion-icon>
            <span v-if="!uiStore.isSidebarCollapsed || isMobile">Pagos</span>
            <div class="active-indicator"></div>
          </div>
        </div>
        <div class="nav-item" @click="handleNavigation('/adminroles')" :class="{ active: activeSection === 'roles' }" :title="uiStore.isSidebarCollapsed ? 'Roles y Seguridad' : ''">
          <div class="item-inner">
            <ion-icon :icon="shieldCheckmarkOutline"></ion-icon>
            <span v-if="!uiStore.isSidebarCollapsed || isMobile">Roles y Seguridad</span>
            <div class="active-indicator"></div>
          </div>
        </div>
      </div>

      <div class="nav-group">
        <p class="group-label" v-if="!uiStore.isSidebarCollapsed || isMobile">CENTRO ANALÍTICO</p>
        <div class="nav-item" @click="handleNavigation('/adminreportes')" :class="{ active: activeSection === 'reports' }" :title="uiStore.isSidebarCollapsed ? 'Reportes' : ''">
          <div class="item-inner">
            <ion-icon :icon="documentTextOutline"></ion-icon>
            <span v-if="!uiStore.isSidebarCollapsed || isMobile">Reportes</span>
            <div class="active-indicator"></div>
          </div>
        </div>
        <div class="nav-item" @click="handleNavigation('/adminmetricas')" :class="{ active: activeSection === 'charts' }" :title="uiStore.isSidebarCollapsed ? 'Métricas' : ''">
          <div class="item-inner">
            <ion-icon :icon="barChartOutline"></ion-icon>
            <span v-if="!uiStore.isSidebarCollapsed || isMobile">Métricas</span>
            <div class="active-indicator"></div>
          </div>
        </div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" @click="handleLogout">
        <div class="logout-content">
          <ion-icon :icon="logOutOutline"></ion-icon>
          <span v-if="!uiStore.isSidebarCollapsed || isMobile">Cerrar Sesión</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUIStore } from '@/stores/ui'
import {
  logOutOutline,
  peopleOutline,
  barChartOutline,
  personCircleOutline,
  documentTextOutline,
  cardOutline,
  menuOutline,
  closeOutline,
  shieldCheckmarkOutline,
  chevronBackOutline,
  chevronForwardOutline
} from 'ionicons/icons'

const uiStore = useUIStore()

// Props
interface Props {
  activeSection?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeSection: 'users'
})

// Emits
const emit = defineEmits<{
  logout: []
}>()

const router = useRouter()

// Mobile responsive state
const isMobile = ref(false)
const showSidebar = ref(false)
const userProfile = ref({
  name: 'Cargando...',
  role: 'Administrador',
  avatar: ''
})

// Fetch user profile from /api/me
const fetchUserProfile = async () => {
  try {
    const response = await axios.get('/api/me')
    const { localProfile, cognitoClaims } = response.data
    userProfile.value = {
      name: `${localProfile.firstName} ${localProfile.lastName}`,
      role: cognitoClaims['cognito:groups']?.includes('Admin') ? 'Súper Usuario' : 'Gestor de Sistema',
      avatar: localProfile.photoUrl || ''
    }
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    userProfile.value = {
      name: 'Admin User',
      role: 'Súper Usuario',
      avatar: ''
    }
  }
}

// Check if mobile on mount and resize
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 1024
  if (!isMobile.value) {
    showSidebar.value = true // Always show on desktop
  } else {
    showSidebar.value = false // Hide by default on mobile
  }
}

onMounted(() => {
  checkMobile()
  fetchUserProfile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Mobile sidebar functions
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const closeSidebarAction = () => {
  if (isMobile.value) {
    showSidebar.value = false
  }
}

const closeSidebar = () => {
  showSidebar.value = false
}

// Handle navigation directly
const handleNavigation = (path: string) => {
  router.push(path)
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
</script>

<style scoped>
/* Mobile Menu Button */
.mobile-menu-btn {
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1001;
  background: var(--admin-bg-card);
  color: var(--admin-text-main);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  box-shadow: var(--admin-shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--admin-transition);
}

.mobile-menu-btn:hover {
  transform: translateY(-2px);
  border-color: var(--admin-accent);
}

/* Sidebar Core */
.sidebar {
  width: var(--admin-sidebar-width);
  background-color: #0c0e12;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: var(--z-sidebar);
  transition: var(--admin-transition);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 20px 0 60px rgba(0, 0, 0, 0.15);
}

.sidebar-collapsed {
  width: var(--admin-sidebar-collapsed-width);
  align-items: center;
}

.sidebar-collapsed .sidebar-header {
  justify-content: center;
  padding: 40px 0;
}

.sidebar-collapsed .logo-container {
  gap: 0;
  justify-content: center;
}

.sidebar-mobile {
  transform: translateX(-100%);
  z-index: calc(var(--z-modal) + 100);
}

.sidebar-open {
  transform: translateX(0);
}

/* Header & Brand */
.sidebar-header {
  padding: 40px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 122px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: var(--admin-transition);
}

.logo-container:hover {
  transform: scale(1.02);
}

.brand-logo {
  height: 42px;
  width: auto;
  filter: drop-shadow(0 0 8px rgba(4, 184, 229, 0.4));
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-family: var(--app-font-brand);
  font-weight: 900;
  font-size: 1.3rem;
  letter-spacing: -0.5px;
  line-height: 1;
  color: #fff;
}

.brand-badge {
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--admin-accent);
  letter-spacing: 2px;
  margin-top: 4px;
  opacity: 0.8;
}

/* Profile Section */
.user-profile {
  padding: 0 24px 32px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  margin-bottom: 24px;
  transition: var(--admin-transition);
}

.profile-collapsed {
  padding: 0;
  justify-content: center;
}

.avatar-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.user-avatar {
  font-size: 36px;
  color: #555;
}

.user-name {
  font-weight: 800;
  font-size: 0.95rem;
  color: #fff;
  margin: 0;
  font-family: var(--app-font-brand);
}

.user-role {
  font-size: 0.75rem;
  color: #8892b0;
  margin: 2px 0 0;
  font-weight: 600;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 0 16px;
  overflow-y: auto;
}

.nav-group {
  margin-bottom: 32px;
}

.group-label {
  font-size: 0.7rem;
  font-weight: 900;
  color: #444a5b;
  letter-spacing: 1.8px;
  padding: 0 14px;
  margin-bottom: 16px;
}

.nav-item {
  position: relative;
  padding: 4px 0;
  margin-bottom: 6px;
  cursor: pointer;
}

.item-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-radius: 18px;
  transition: var(--admin-transition);
  color: #8892b0;
}

.nav-item:hover .item-inner {
  background-color: rgba(255, 255, 255, 0.03);
  color: #fff;
  transform: translateX(4px);
}

.nav-item ion-icon {
  font-size: 22px;
}

.nav-item span {
  font-size: 0.95rem;
  font-weight: 700;
  font-family: var(--app-font-family);
}

.nav-item.active .item-inner {
  background: linear-gradient(135deg, rgba(4, 184, 229, 0.12), rgba(4, 184, 229, 0.02));
  color: var(--admin-accent);
}

.sidebar-collapsed .item-inner {
  justify-content: center;
  padding: 14px 0;
  gap: 0;
}

.active-indicator {
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: var(--admin-accent);
  border-radius: 0 4px 4px 0;
  transition: var(--admin-transition);
  box-shadow: 0 0 15px var(--admin-accent);
}

.nav-item.active .active-indicator {
  height: 24px;
}

/* Footer & Logout */
.sidebar-footer {
  padding: 32px 24px;
}

.logout-btn {
  width: 100%;
  background: rgba(186, 26, 26, 0.05);
  border: 1px solid rgba(186, 26, 26, 0.1);
  border-radius: 18px;
  padding: 16px;
  transition: var(--admin-transition);
  cursor: pointer;
}

.logout-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #f13e3e;
  font-weight: 800;
  font-size: 0.9rem;
  font-family: var(--app-font-brand);
}

.logout-btn:hover {
  background: #f13e3e;
  transform: scale(0.98);
}

.logout-btn:hover .logout-content {
  color: #fff;
}

.sidebar-collapsed .logout-btn {
  padding: 16px 0;
}

.sidebar-collapsed .logout-content {
  gap: 0;
}

/* Collapse Button */
.collapse-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--admin-transition);
}

.collapse-btn:hover {
  background: var(--admin-accent);
  border-color: var(--admin-accent);
}

/* Desktop styles */
@media (min-width: 1025px) {
  .mobile-menu-btn { display: none; }
  .sidebar { position: fixed; transform: none !important; }
}
</style>
>