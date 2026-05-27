<template>
  <!-- Sidebar Overlay for Mobile -->
  <div v-if="isMobile && showSidebar" class="sidebar-overlay" @click="closeSidebarAction"></div>

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
  } catch {
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

.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-sidebar) - 1);
  background: rgba(15, 23, 42, 0.32);
  backdrop-filter: blur(2px);
}

.close-sidebar-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: var(--admin-bg-subtle);
  color: var(--brand-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--admin-transition);
}

.close-sidebar-btn:hover {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
}

/* Sidebar Core */
.sidebar {
  width: var(--admin-sidebar-width);
  background: var(--admin-bg-card);
  color: var(--admin-text-main);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: var(--z-sidebar);
  transition: var(--admin-transition);
  border-right: 1px solid var(--admin-border);
  box-shadow: 12px 0 28px rgba(38, 50, 56, 0.08);
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
  padding: 30px 22px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 104px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: var(--admin-transition);
}

.logo-container:hover {
  transform: scale(1.02);
}

.brand-logo {
  height: 24px;
  width: auto;
  object-fit: contain;
  padding: 0;
  border-radius: 0;
  background: transparent;
  filter: var(--logo-filter) drop-shadow(0 8px 18px rgba(0, 172, 193, 0.24));
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-family: var(--app-font-brand);
  font-weight: 900;
  font-size: 1.18rem;
  letter-spacing: 0;
  line-height: 1;
  color: var(--admin-text-main);
}

.brand-badge {
  font-size: 0.56rem;
  font-weight: 800;
  color: var(--admin-accent);
  letter-spacing: 1.4px;
  margin-top: 4px;
  opacity: 0.8;
}

/* Profile Section */
.user-profile {
  margin: 0 16px 24px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--admin-bg-subtle);
  border: 1px solid var(--admin-border);
  border-radius: 18px;
  transition: var(--admin-transition);
}

.profile-collapsed {
  padding: 10px;
  justify-content: center;
}

.avatar-wrapper {
  width: 40px;
  height: 40px;
  background: var(--brand-primary-fade);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: 1px solid var(--admin-border);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.user-avatar {
  font-size: 28px;
  color: var(--brand-primary);
}

.user-name {
  font-weight: 800;
  font-size: 0.88rem;
  color: var(--admin-text-main);
  margin: 0;
  font-family: var(--app-font-brand);
}

.user-role {
  font-size: 0.7rem;
  color: var(--admin-text-sub);
  margin: 2px 0 0;
  font-weight: 600;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 0 14px;
  overflow-y: auto;
}

.nav-group {
  margin-bottom: 32px;
}

.group-label {
  font-size: 0.64rem;
  font-weight: 900;
  color: var(--admin-text-muted);
  letter-spacing: 1.2px;
  padding: 0 14px;
  margin: 0 0 12px;
}

.nav-item {
  position: relative;
  padding: 3px 0;
  margin-bottom: 5px;
  cursor: pointer;
}

.item-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 11px;
  border-radius: 12px;
  transition: var(--admin-transition);
  color: var(--admin-text-sub);
  border: 1px solid transparent;
}

.nav-item:hover .item-inner {
  background-color: var(--admin-accent-soft);
  border-color: rgba(0, 172, 193, 0.18);
  color: var(--brand-secondary);
  transform: translateX(2px);
}

.nav-item ion-icon {
  width: 24px;
  height: 24px;
  padding: 4px;
  border-radius: 8px;
  color: var(--admin-text-sub);
  background: var(--admin-bg-subtle);
  transition: var(--admin-transition);
}

.nav-item:hover ion-icon {
  color: var(--brand-primary);
}

.nav-item span {
  font-size: 0.88rem;
  font-weight: 700;
  font-family: var(--app-font-family);
}

.nav-item.active .item-inner {
  background: rgba(0, 172, 193, 0.14);
  color: var(--brand-secondary);
  border-color: rgba(0, 172, 193, 0.28);
  box-shadow: inset 0 0 0 1px rgba(0, 172, 193, 0.08);
}

.nav-item.active ion-icon {
  background: rgba(0, 172, 193, 0.2);
  color: var(--brand-primary);
}

.sidebar-collapsed .item-inner {
  justify-content: center;
  padding: 14px 0;
  gap: 0;
}

.active-indicator {
  position: absolute;
  left: -2px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: var(--brand-primary);
  border-radius: 0 4px 4px 0;
  transition: var(--admin-transition);
  box-shadow: 0 0 15px rgba(0, 172, 193, 0.45);
}

.nav-item.active .active-indicator {
  height: 24px;
}

/* Footer & Logout */
.sidebar-footer {
  padding: 24px;
}

.logout-btn {
  width: 100%;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.16);
  border-radius: 16px;
  padding: 14px 16px;
  transition: var(--admin-transition);
  cursor: pointer;
}

.logout-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #dc2626;
  font-weight: 800;
  font-size: 0.92rem;
  font-family: var(--app-font-brand);
}

.logout-content ion-icon {
  color: currentColor;
}

.logout-btn:hover {
  background: #ef4444;
  transform: translateY(-1px);
}

.logout-btn:hover .logout-content {
  color: #fff;
}

.sidebar-collapsed .logout-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-collapsed .logout-content {
  gap: 0;
}

.sidebar-collapsed .logout-content ion-icon {
  width: 24px;
  height: 24px;
}

/* Collapse Button */
.collapse-btn {
  background: var(--admin-bg-subtle);
  border: none;
  color: var(--brand-primary);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--admin-transition);
}

.collapse-btn:hover {
  background: var(--brand-primary);
  color: #fff;
}

@media (prefers-color-scheme: dark) {
  .sidebar {
    background:
      radial-gradient(circle at top left, rgba(0, 172, 193, 0.16), transparent 32%),
      linear-gradient(180deg, #111827 0%, #0f172a 100%);
    color: #fff;
    border-right-color: rgba(255, 255, 255, 0.08);
    box-shadow: 18px 0 45px rgba(15, 23, 42, 0.16);
  }

  .brand-name,
  .user-name {
    color: #fff;
  }

  .user-profile,
  .nav-item ion-icon,
  .collapse-btn,
  .close-sidebar-btn {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .user-role,
  .item-inner {
    color: #cbd5e1;
  }

  .group-label {
    color: #94a3b8;
  }

  .nav-item:hover .item-inner {
    background-color: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  .nav-item.active .item-inner {
    color: #fff;
  }

  .collapse-btn,
  .close-sidebar-btn {
    color: #fff;
  }

  .logout-content {
    color: #fecaca;
  }
}

/* Desktop styles */
@media (min-width: 1025px) {
  .mobile-menu-btn { display: none; }
  .sidebar { position: fixed; transform: none !important; }
}
</style>
