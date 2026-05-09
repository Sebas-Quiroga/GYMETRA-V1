import QrcodeVue from 'qrcode.vue';
import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router';
import { useAuthStore } from './modules/auth/store/auth';
import { configureAmplify } from './modules/shared/config/cognito';
configureAmplify();
import { IonicVue } from '@ionic/vue';
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
import '@ionic/vue/css/palettes/dark.system.css';
import './modules/shared/theme/variables.css';
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
app.component('qrcode-vue', QrcodeVue);
const auth = useAuthStore();
auth.initialize().then(() => {
  router.isReady().then(() => {
    app.mount('#app');
    console.log('🚀 Aplicación montada con sesión inicializada');
  });
});
