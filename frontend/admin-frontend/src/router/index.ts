import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/loginadmin'
  },
  {
    path: '/loginadmin',
    name: 'LoginAdminPage',
    component: () => import('../modules/auth/views/LoginAdminPage.vue')
  },
  {
    path: '/adminpanel',
    name: 'AdminPanel',
    component: () => import('../modules/users/views/AdminPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/adminmetricas',
    name: 'MetricasPage',
    component: () => import('../modules/metrics/views/MetricasPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/adminpagos',
    name: 'PagosPage',
    component: () => import('../modules/payments/views/PagosPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/adminadduser',
    name: 'AddUserPage',
    component: () => import('../modules/users/views/AddUserPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/adminedituser/:userId',
    name: 'EditUserPage',
    component: () => import('../modules/users/views/EditUserPage.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/adminreportes',
    name: 'ReportesPage',
    component: () => import('../modules/reports/views/ReportesPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/adminroles',
    name: 'RolesPage',
    component: () => import('../modules/roles/views/RolesPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/adminaddrole',
    name: 'AddRolePage',
    component: () => import('../modules/roles/views/AddRolePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admineditrole/:roleId',
    name: 'EditRolePage',
    component: () => import('../modules/roles/views/EditRolePage.vue'),
    meta: { requiresAuth: true },
    props: true
  }
]

export default routes