import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { IonicVue } from '@ionic/vue'

import App from './App.vue'
import routes from './router'
import { isAuthenticatedAsync } from './services/authService'
import { configureAmplify } from './config/cognito'

// Configurar AWS Cognito para Admin
configureAmplify();

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
router.beforeEach(async (to, from, next) => {
  // Si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    // Verificar si el usuario está autenticado como administrador de forma asíncrona
    const isAuth = await isAuthenticatedAsync();
    
    if (isAuth) {
      // Usuario autenticado, permitir acceso
      next()
    } else {
      // Usuario no autenticado, redirigir al login de admin
      console.warn('🚫 Acceso denegado: usuario no autenticado o no es administrador. Redirigiendo...')
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

// Inicialización asíncrona para asegurar la sesión antes de montar
const initApp = async () => {
  try {
    // Configurar Amplify ya se hizo arriba
    // Esperar a que el router esté listo
    await router.isReady();
    
    // El router guard se encarga de llamar a isAuthenticatedAsync()
    // pero podemos forzar una verificación aquí si fuera necesario poblado de un store
    
    app.mount('#app');
    console.log('🚀 Admin App montada exitosamente');
  } catch (error) {
    console.error('❌ Error fatal al iniciar Admin App:', error);
  }
};

initApp();