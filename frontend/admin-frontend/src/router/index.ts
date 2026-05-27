import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../modules/auth/views/LoginAdminPage.vue')
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '/adminpanel',
        name: 'AdminPanel',
        component: () => import('../modules/users/views/AdminPage.vue')
      },
      {
        path: '/adminmetricas',
        name: 'MetricasPage',
        component: () => import('../modules/metrics/views/MetricasPage.vue')
      },
      {
        path: '/adminpagos',
        name: 'PagosPage',
        component: () => import('../modules/payments/views/PagosPage.vue')
      },
      {
        path: '/adminadduser',
        name: 'AddUserPage',
        component: () => import('../modules/users/views/AddUserPage.vue')
      },
      {
        path: '/adminedituser/:userId',
        name: 'EditUserPage',
        component: () => import('../modules/users/views/EditUserPage.vue'),
        props: true
      },
      {
        path: '/adminreportes',
        name: 'ReportesPage',
        component: () => import('../modules/reports/views/ReportesPage.vue')
      },
      {
        path: '/adminroles',
        name: 'RolesPage',
        component: () => import('../modules/roles/views/RolesPage.vue')
      },
      {
        path: '/adminaddrole',
        name: 'AddRolePage',
        component: () => import('../modules/roles/views/AddRolePage.vue')
      },
      {
        path: '/admineditrole/:roleId',
        name: 'EditRolePage',
        component: () => import('../modules/roles/views/EditRolePage.vue'),
        props: true
      }
    ]
  },
  {
    path: '/:pathMatch*',
    redirect: '/login'
  }
]

export default routes