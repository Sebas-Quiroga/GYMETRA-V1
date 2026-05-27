import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import QrcodeVue from 'qrcode.vue'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './modules/auth/store/auth'
import { configureAmplify } from './modules/shared/config/cognito'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

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
import '@ionic/vue/css/palettes/dark.system.css'
import './modules/shared/theme/variables.css'

configureAmplify();

const app = createApp(App)
app.use(Vue3Toastify, {
  autoClose: 3500,
  position: 'top-right',
  theme: 'auto',
} as ToastContainerOptions)
const pinia = createPinia()

app.use(IonicVue)
app.use(pinia)
app.use(router)

app.component('qrcode-vue', QrcodeVue)

const bootstrap = async () => {
  try {
    const auth = useAuthStore()
    await auth.initialize()
    await router.isReady()
    app.mount('#app')
  } catch (error) {
    // Silent fail or custom crash screen
  }
}

if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}

bootstrap()