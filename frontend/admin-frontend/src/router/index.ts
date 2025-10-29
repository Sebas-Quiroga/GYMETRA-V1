import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/loginadmin'
  },
  {
    path: '/loginadmin',
    name: 'LoginAdminPage',
    component: () => import('@/views/LoginAdminPage.vue')
  },
  {
    path: '/adminpanel',
    name: 'AdminPanel',
    component: () => import('@/views/AdminPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/adminmetricas',
    name: 'MetricasPage',
    component: () => import('@/views/MetricasPage.vue'),
    meta: { requiresAuth: true }
  }
]

export default routes