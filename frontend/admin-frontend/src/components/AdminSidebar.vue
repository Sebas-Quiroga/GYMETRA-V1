<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="user-info">
        <ion-icon :icon="personCircleOutline" class="user-avatar"></ion-icon>
        <span class="user-name">Administrador</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-item" @click="navigateToUsers" :class="{ active: activeSection === 'users' }">
        <ion-icon :icon="peopleOutline"></ion-icon>
        <span>Usuarios</span>
      </div>
      <div class="nav-item" @click="navigateToPayments" :class="{ active: activeSection === 'payments' }">
        <ion-icon :icon="cardOutline"></ion-icon>
        <span>Pagos</span>
      </div>
      <div class="nav-item" @click="navigateToReports" :class="{ active: activeSection === 'reports' }">
        <ion-icon :icon="documentOutline"></ion-icon>
        <span>Reporte</span>
      </div>
      <div class="nav-item" @click="navigateToCharts" :class="{ active: activeSection === 'charts' }">
        <ion-icon :icon="barChartOutline"></ion-icon>
        <span>Métricas</span>
      </div>
      <div class="nav-item" @click="navigateToRoles" :class="{ active: activeSection === 'roles' }">
        <ion-icon :icon="shieldCheckmarkOutline"></ion-icon>
        <span>Roles</span>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" @click="logout">
        <ion-icon :icon="logOutOutline"></ion-icon>
        <span>Log out</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  logOutOutline,
  peopleOutline,
  barChartOutline,
  personCircleOutline,
  documentOutline,
  cardOutline,
  shieldCheckmarkOutline
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

const navigateToUsers = () => {
  emit('navigateToUsers')
}

const navigateToReports = () => {
  emit('navigateToReports')
}

const navigateToCharts = () => {
  emit('navigateToCharts')
}

const navigateToPayments = () => {
  emit('navigateToPayments')
}

const navigateToRoles = () => {
  emit('navigateToRoles')
}

const logout = () => {
  emit('logout')
}
</script>

<style scoped>
/* Sidebar */
.sidebar {
  width: 240px;
  background-color: #00BCD4;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
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
</style>