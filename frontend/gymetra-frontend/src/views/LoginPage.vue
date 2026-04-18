<template>
  <ion-page>
    <ion-content class="login-page">
      
      <!-- Notificación Toast KINETIC -->
      <Transition name="fade-notif">
        <div v-if="notification.show" class="notification-toast" :class="notification.type" role="alert">
          <div class="notification-content">
            <ion-icon :icon="notification.icon" class="notification-icon"></ion-icon>
            <div class="notification-text">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.message }}</p>
            </div>
            <ion-button fill="clear" size="small" @click="dismissNotification" aria-label="Cerrar">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </div>
          <div class="notification-progress" :style="{ width: notification.progress + '%' }"></div>
        </div>
      </Transition>

      <div class="login-container" role="main">
        <!-- Logo Principal -->
        <div class="logo-container">
          <img src="/logo.png" alt="Logo de la aplicación" class="logo" loading="eager" />
          <h1 class="logo-text">{{ APP_NAME }}</h1>
        </div>

        <div class="input-card">
          <!-- Campo Usuario -->
          <ion-item lines="none">
            <ion-icon :icon="personOutline"></ion-icon>
            <ion-input
              v-model="email"
              type="email"
              placeholder="Correo electrónico"
              @ionInput="onEmailInput"
              @ionFocus="showEmailSuggestions = true"
              @ionBlur="hideEmailSuggestions"
              autocomplete="username"
              required
            ></ion-input>
          </ion-item>
          
          <!-- Sugerencias de email -->
          <div v-if="showEmailSuggestions && filteredEmailDomains.length" class="email-suggestions">
            <div
              v-for="suggestion in filteredEmailDomains"
              :key="suggestion"
              class="email-suggestion"
              @click="selectEmailSuggestion(suggestion)"
            >
              {{ suggestion }}
            </div>
          </div>
          
          <div v-if="emailError" class="validation-error">
             <ion-icon :icon="alertCircle"></ion-icon> {{ emailError }}
          </div>

          <!-- Campo Contraseña -->
          <ion-item lines="none">
            <ion-icon :icon="keyOutline"></ion-icon>
            <ion-input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Contraseña"
              @ionInput="onPasswordInput"
              :maxlength="15"
              autocomplete="current-password"
              required
            ></ion-input>
            <ion-button fill="clear" @click="togglePassword" slot="end" class="toggle-pass-btn">
              <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline"></ion-icon>
            </ion-button>
          </ion-item>
          
          <div v-if="passwordError" class="validation-error">
            <ion-icon :icon="alertCircle"></ion-icon> {{ passwordError }}
          </div>

          <!-- Botón de Acción -->
          <div class="btn-container">
            <ion-button expand="block" class="login-btn" @click="handleLogin" :disabled="loading">
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>Iniciar Sesión</span>
            </ion-button>
          </div>

          <!-- Enlaces de soporte -->
          <div class="links">
            <a href="#" @click.prevent="openForgotModal">¿Olvidaste tu contraseña?</a>
            <p>
              ¿Eres nuevo? <router-link to="/register">Regístrate aquí</router-link>
            </p>
          </div>
        </div>
      </div>

      <!-- Modal Recuperar Contraseña -->
      <ion-modal :is-open="showForgotModal" @did-dismiss="closeForgotModal" part="modal-kinetic">
        <div class="modal-content">
          <h2>Recuperar Contraseña</h2>

          <!-- Paso 1: Correo -->
          <div v-if="forgotStep === 1">
            <ion-item lines="none">
              <ion-input
                v-model="forgotEmail"
                type="email"
                placeholder="Ingresa tu correo"
                @ionInput="onForgotEmailInput"
                @ionFocus="showForgotEmailSuggestions = true"
                @ionBlur="hideForgotEmailSuggestions"
              ></ion-input>
            </ion-item>
            
            <div v-if="showForgotEmailSuggestions && filteredForgotEmailDomains.length" class="email-suggestions">
              <div
                v-for="suggestion in filteredForgotEmailDomains"
                :key="suggestion"
                class="email-suggestion"
                @click="selectForgotEmailSuggestion(suggestion)"
              >
                {{ suggestion }}
              </div>
            </div>

            <div v-if="forgotEmailError" class="validation-error">
              {{ forgotEmailError }}
            </div>

            <div class="btn-container">
              <ion-button expand="block" class="login-btn" @click="sendToken" :disabled="forgotLoading">
                <ion-spinner v-if="forgotLoading" name="crescent"></ion-spinner>
                <span v-else>Enviar Código</span>
              </ion-button>
            </div>
          </div>

          <!-- Paso 2: Token -->
          <div v-else-if="forgotStep === 2">
            <ion-item lines="none">
              <ion-input v-model="forgotToken" placeholder="Código de 6 dígitos"></ion-input>
            </ion-item>
            <div class="btn-container">
              <ion-button expand="block" class="login-btn" @click="validateToken" :disabled="forgotLoading">
                <span v-if="!forgotLoading">Validar Código</span>
                <ion-spinner v-else name="crescent"></ion-spinner>
              </ion-button>
            </div>
          </div>

          <!-- Paso 3: Nueva Clave -->
          <div v-else-if="forgotStep === 3">
            <ion-item lines="none">
              <ion-input v-model="forgotNewPassword" type="password" placeholder="Nueva contraseña"></ion-input>
            </ion-item>
            <div class="password-requirements">
              <div class="requirement" :class="{ 'valid': passwordValidation.length }">✔ 6-15 caracteres</div>
              <div class="requirement" :class="{ 'valid': passwordValidation.uppercase }">✔ Al menos una mayúscula</div>
              <div class="requirement" :class="{ 'valid': passwordValidation.number }">✔ Al menos un número</div>
            </div>
            <div class="btn-container">
              <ion-button expand="block" class="login-btn" @click="resetPassword" :disabled="forgotLoading">
                <span v-if="!forgotLoading">Actualizar Contraseña</span>
                <ion-spinner v-else name="crescent"></ion-spinner>
              </ion-button>
            </div>
          </div>

          <ion-button fill="clear" expand="block" color="medium" @click="closeForgotModal">Cancelar</ion-button>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  IonPage, IonContent, IonItem, IonInput, IonButton,
  IonIcon, IonSpinner, IonModal
} from "@ionic/vue";
import {
  personOutline, keyOutline, eyeOutline, eyeOffOutline,
  alertCircle, checkmarkCircle, warningOutline,
  informationCircle, closeOutline
} from "ionicons/icons";
import { login } from "../services/authService";
import { useAuthStore } from "@/stores/auth";
import { 
  sendRecoveryToken, validateRecoveryToken, 
  resetPassword as resetPasswordService 
} from "../services/passwordRecoveryService";

const emailDomains = ['@gmail.com', '@corhuila.edu.co', '@hotmail.com', '@outlook.com'];

// --- Notificaciones ---
const notification = reactive({
  show: false,
  type: 'info' as 'success' | 'error' | 'warning' | 'info',
  title: '',
  message: '',
  icon: informationCircle,
  progress: 0,
  duration: 5000,
});

let notifTimer: any = null;
let progressTimer: any = null;

const showNotification = (type: any, title: string, message: string) => {
  if (notifTimer) clearTimeout(notifTimer);
  if (progressTimer) clearInterval(progressTimer);
  
  const icons = { success: checkmarkCircle, error: alertCircle, warning: warningOutline, info: informationCircle };
  Object.assign(notification, { show: true, type, title, message, icon: icons[type], progress: 0 });
  
  const step = (50 / 5000) * 100;
  progressTimer = setInterval(() => {
    notification.progress += step;
    if (notification.progress >= 100) dismissNotification();
  }, 50);
  notifTimer = setTimeout(dismissNotification, 5000);
};

const dismissNotification = () => {
  notification.show = false;
  if (progressTimer) clearInterval(progressTimer);
};

// --- Estado Local ---
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const emailError = ref("");
const passwordError = ref("");
const showEmailSuggestions = ref(false);

const router = useRouter();
const auth = useAuthStore();

// --- Sugerencias ---
const filteredEmailDomains = computed(() => {
  if (!email.value.includes('@')) return [];
  const [local, domain] = email.value.split('@');
  return emailDomains.filter(d => d.startsWith('@' + domain)).map(d => local + d);
});

const onEmailInput = (e: any) => {
  email.value = e.target.value;
  emailError.value = email.value.includes('@') ? "" : "Ingresa un correo válido";
};

const onPasswordInput = (e: any) => {
  password.value = e.target.value.substring(0, 15);
  passwordError.value = password.value.length >= 6 ? "" : "Mínimo 6 caracteres";
};

const togglePassword = () => { showPassword.value = !showPassword.value; };

const handleLogin = async () => {
  if (!email.value || !password.value) return;
  loading.value = true;
  try {
    const res = await login(email.value, password.value);
    if (res.token) {
      auth.setToken(res.token);
      router.push("/home");
    }
  } catch (err: any) {
    showNotification('error', 'Error de acceso', err.message || 'Credenciales incorrectas');
  } finally {
    loading.value = false;
  }
};

// --- Recuperación (Simplificado para brevedad, manteniendo lógica base) ---
const showForgotModal = ref(false);
const forgotEmail = ref("");
const forgotStep = ref(1);
const forgotToken = ref("");
const forgotNewPassword = ref("");
const forgotLoading = ref(false);
const forgotEmailError = ref("");
const showForgotEmailSuggestions = ref(false);

const openForgotModal = () => { showForgotModal.value = true; forgotStep.value = 1; };
const closeForgotModal = () => { showForgotModal.value = false; };

const onForgotEmailInput = (e: any) => { forgotEmail.value = e.target.value; };
const selectEmailSuggestion = (s: string) => { email.value = s; showEmailSuggestions.value = false; };
const hideEmailSuggestions = () => setTimeout(() => showEmailSuggestions.value = false, 200);

// --- Validación Contraseña Modular ---
const passwordValidation = computed(() => ({
  length: forgotNewPassword.value.length >= 6,
  uppercase: /[A-Z]/.test(forgotNewPassword.value),
  number: /\d/.test(forgotNewPassword.value)
}));

const sendToken = async () => {
  forgotLoading.value = true;
  try {
    await sendRecoveryToken(forgotEmail.value);
    forgotStep.value = 2;
    showNotification('success', 'Enviado', 'Revisa tu bandeja de entrada');
  } catch (err: any) {
    showNotification('error', 'Error', err.message);
  } finally {
    forgotLoading.value = false;
  }
};

const validateToken = async () => {
  forgotLoading.value = true;
  try {
    await validateRecoveryToken(forgotToken.value);
    forgotStep.value = 3;
  } catch (err: any) {
    showNotification('error', 'Error', 'Código inválido');
  } finally {
    forgotLoading.value = false;
  }
};

const resetPassword = async () => {
  forgotLoading.value = true;
  try {
    await resetPasswordService(forgotEmail.value, forgotToken.value, forgotNewPassword.value);
    closeForgotModal();
    showNotification('success', 'Éxito', 'Contraseña actualizada');
  } catch (err: any) {
    showNotification('error', 'Error', err.message);
  } finally {
    forgotLoading.value = false;
  }
};

onUnmounted(() => {
  if (notifTimer) clearTimeout(notifTimer);
  if (progressTimer) clearInterval(progressTimer);
});
</script>

<style scoped>
@import '../theme/LoginPage.css';
</style>