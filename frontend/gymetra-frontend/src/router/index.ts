import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import HomePage from '../modules/home/views/HomePage.vue'
import LoginPage from '../modules/auth/views/LoginPage.vue'
import RegisterPage from '../modules/auth/views/RegisterPage.vue'
import { isAuthenticated } from '../modules/auth/services/authService'
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
    component: () => import('../modules/membership/views/PasarelaPago.vue')
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
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
export default router
