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
  },
  {
    path: '/adminpagos',
    name: 'PagosPage',
    component: () => import('@/views/PagosPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/adminadduser',
    name: 'AddUserPage',
    component: () => import('@/views/AddUserPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/adminedituser/:userId',
    name: 'EditUserPage',
    component: () => import('@/views/EditUserPage.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/admin/roles',
    name: 'RolesPage',
    component: () => import('@/views/RolesPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/roles/add',
    name: 'AddRolePage',
    component: () => import('@/views/AddRolePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/roles/edit/:roleId',
    name: 'EditRolePage',
    component: () => import('@/views/EditRolePage.vue'),
    meta: { requiresAuth: true },
    props: true
  }
]

export default routes