import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { IonicVue } from '@ionic/vue'

import App from './App.vue'
import routes from './router'
import { isAuthenticatedAsync } from './modules/auth/services/authService'
import { configureAmplify } from './modules/shared/config/cognito'

configureAmplify();

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
import './theme/variables.css'

const app = createApp(App)
const pinia = createPinia()
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const isAuth = await isAuthenticatedAsync();
    
    if (isAuth) {
      next();
    } else {
      next('/loginadmin');
    }
  } else {
    next();
  }
})

app.use(IonicVue)
app.use(pinia)
app.use(router)

const initApp = async () => {
  try {
    await router.isReady();
    app.mount('#app');
  } catch (error) {
    console.error('Error fatal al iniciar Admin App:', error);
  }
};

initApp();