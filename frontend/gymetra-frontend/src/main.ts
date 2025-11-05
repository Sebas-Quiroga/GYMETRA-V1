import QrcodeVue from 'qrcode.vue';
import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router';
import { useAuthStore } from '@/stores/auth';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';


import {
  IonPage,
  IonContent,
  IonModal,
  IonIcon,
  IonList,
  IonItem,
  IonButton,
  IonLabel,
  IonInput,
  IonSpinner
} from '@ionic/vue';

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(createPinia());


// Registrar componentes de Ionic globalmente
app.component('ion-page', IonPage);
app.component('ion-content', IonContent);
app.component('ion-modal', IonModal);
app.component('ion-icon', IonIcon);
app.component('ion-list', IonList);
app.component('ion-item', IonItem);
app.component('ion-button', IonButton);
app.component('ion-label', IonLabel);
app.component('ion-input', IonInput);
app.component('ion-spinner', IonSpinner);

// Registrar QRCode globalmente
app.component('qrcode-vue', QrcodeVue);

useAuthStore().initializeToken(); // <-- Sincroniza el token al iniciar

router.isReady().then(() => {
  app.mount('#app');
});
