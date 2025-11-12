import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { IonicVue } from '@ionic/vue'

import App from './App.vue'
import routes from './router'
import { isAuthenticated } from './services/authService'

/* Core CSS required for Ionic components to work properly */


/* COMANDO PARA CORRER EL PROYECTO: npm run dev*/


/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Theme variables */
import './theme/variables.css'

const app = createApp(App)
const pinia = createPinia()
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ===============================
// 🔒 Router Guard - Protección de Rutas Administrativas
// ===============================
router.beforeEach((to, from, next) => {
  // Si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    // Verificar si el usuario está autenticado como administrador
    if (isAuthenticated()) {
      // Usuario autenticado, permitir acceso
      next()
    } else {
      // Usuario no autenticado, redirigir al login de admin
      console.warn('🚫 Acceso denegado: usuario no autenticado. Redirigiendo al login...')
      next('/loginadmin')
    }
  } else {
    // Ruta pública, permitir acceso
    next()
  }
})

app.use(IonicVue)
app.use(pinia)
app.use(router)

app.mount('#app')