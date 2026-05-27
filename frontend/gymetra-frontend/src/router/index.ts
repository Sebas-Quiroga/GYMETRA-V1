import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../modules/auth/store/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../modules/home/views/HomePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/Pasarelapago',
    name: 'PasarelaPago',
    component: () => import('../modules/membership/views/PasarelaPago.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../modules/auth/views/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../modules/auth/views/RegisterPage.vue')
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('../modules/profile/views/PerfilPage.vue')
  },
  {
    path: '/Planes',
    name: 'Planes',
    component: () => import('../modules/membership/views/PlanesPage.vue')
  },
  {
    path: '/qr',
    name: 'Qr',
    component: () => import('../modules/qr/views/QrPage.vue')
  },
  {
    path: '/nutrition-plan',
    name: 'NutritionPlan',
    component: () => import('../modules/nutrition/views/NutritionPlanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rutinas',
    name: 'Rutinas',
    component: () => import('../modules/training/views/RutinasView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router