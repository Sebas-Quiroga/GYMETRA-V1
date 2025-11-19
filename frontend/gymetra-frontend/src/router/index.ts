// src/router/index.ts
import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import { isAuthenticated } from '@/services/authService' // ✅ usamos la función del servicio

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/Pasarelapago',
    name: 'PasarelaPago',
    component: () => import('../views/PasarelaPago.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('../views/PerfilPage.vue')
    // meta: { requiresAuth: true } // Desactivado temporalmente para pruebas visuales
  },
  {
    path: '/Planes',
    name: 'Planes',
    component: () => import('../views/PlanesPage.vue')
  },
  {
    path: '/qr',
    name: 'Qr',
    component: () => import('../views/QrPage.vue')
  }
]

// Asegurar que BASE_URL tenga un valor por defecto para Android
const baseUrl = import.meta.env.BASE_URL || '/'

const router = createRouter({
  history: createWebHistory(baseUrl),
  routes
})

// ===============================
// Protección de rutas
// ===============================
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

export default router
