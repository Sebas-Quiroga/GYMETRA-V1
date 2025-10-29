<template>
  <div class="admin-dashboard">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="user-info">
          <ion-icon :icon="personCircleOutline" class="user-avatar"></ion-icon>
          <span class="user-name">Juan</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-item" @click="navigateToUsers" :class="{ active: activeSection === 'users' }">
          <ion-icon :icon="peopleOutline"></ion-icon>
          <span>Usuarios</span>
        </div>
        <div class="nav-item" @click="navigateToReports" :class="{ active: activeSection === 'reports' }">
          <ion-icon :icon="documentOutline"></ion-icon>
          <span>Reporte</span>
        </div>
        <div class="nav-item" @click="navigateToCharts" :class="{ active: activeSection === 'charts' }">
          <ion-icon :icon="barChartOutline"></ion-icon>
          <span>Métricas</span>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <ion-icon :icon="logOutOutline"></ion-icon>
          <span>Log out</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Stats Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">24</div>
          <div class="stat-label">Usuarios</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">4</div>
          <div class="stat-label">Membresías vencidas</div>
        </div>
      </div>

      <!-- Users Table Section -->
      <div class="users-table-container">
        <h2>Usuarios</h2>
        <table class="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Contraseña</th>
              <th>Fecha Nacimiento</th>
              <th>Plan</th>
              <th>Estado</th>
              <th>Fecha de vencimiento</th>
            </tr>
          </thead>
          <tbody>
            <!-- Aquí se conectará con la API/base de datos -->
            <tr v-for="user in users" :key="user.id || user.nombre">
              <td>{{ user.nombre }}</td>
              <td>{{ user.correo }}</td>
              <td>{{ user.contraseña ? '••••••••' : '' }}</td>
              <td>{{ formatDate(user.fechaNacimiento) }}</td>
              <td>{{ user.plan }}</td>
              <td :class="getStatusClass(user.estado)">{{ user.estado }}</td>
              <td>{{ formatDate(user.fechaVencimiento) }}</td>
            </tr>
            <!-- Mostrar filas vacías si no hay datos -->
            <tr v-if="users.length === 0" v-for="n in 7" :key="'empty-' + n">
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  logOutOutline,
  peopleOutline,
  barChartOutline,
  personCircleOutline,
  documentOutline
} from 'ionicons/icons'

// Interface para definir la estructura de datos de usuario
interface User {
  id?: number
  nombre: string
  correo: string
  contraseña: string
  fechaNacimiento: Date | string
  plan: string
  estado: 'Activo' | 'Vencido' | 'Suspendido'
  fechaVencimiento: Date | string
}

const router = useRouter()
const activeSection = ref('users')
const loading = ref(false)

// Estado para los usuarios - preparado para datos dinámicos
const users = ref<User[]>([])

// Aquí se conectará con la API/base de datos
// const loadUsers = async () => {
//   try {
//     loading.value = true
//     // const response = await fetch('/api/users')
//     // users.value = await response.json()
//     console.log('Cargando usuarios desde API...')
//   } catch (error) {
//     console.error('Error cargando usuarios:', error)
//   } finally {
//     loading.value = false
//   }
// }

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

const logout = () => {
  // TODO: Implement logout logic
  router.push('/login')
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

// Datos de ejemplo comentados para referencia futura
// const exampleUsers: User[] = [
//   {
//     id: 1,
//     nombre: 'Juan Pérez',
//     correo: 'juan@example.com',
//     contraseña: 'password123',
//     fechaNacimiento: '1990-05-15',
//     plan: 'Premium',
//     estado: 'Activo',
//     fechaVencimiento: '2024-12-31'
//   },
//   // ... más usuarios
// ]
</script>

<style>
@import '../theme/AdminPage.css';
</style>