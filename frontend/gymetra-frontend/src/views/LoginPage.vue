<template>
  <ion-page>
    <ion-content class="ion-padding login-page" color="primary">
      <!-- Toast de notificación personalizado -->
      <div v-if="notification.show" class="notification-toast" :class="notification.type">
        <div class="notification-content">
          <ion-icon :icon="notification.icon" class="notification-icon"></ion-icon>
          <div class="notification-text">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.message }}</p>
          </div>
          <ion-button fill="clear" size="small" @click="dismissNotification">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </div>
        <div class="notification-progress" :style="{ width: notification.progress + '%' }"></div>
      </div>

      <div class="login-container" role="main" aria-label="Inicio de sesión">
        <!-- Logo -->
        <div class="logo-container">
          <img src="/logo.png" alt="Gymetra Logo" class="logo" loading="lazy" />
        </div>

        <!-- Agrupa los campos en input-card -->
        <div class="input-card" aria-label="Formulario de inicio de sesión">
          <!-- Campo Usuario -->
          <ion-item :class="{ 'ion-invalid': emailError }" aria-invalid="true" aria-errormessage="email-error">
            <ion-icon slot="start" :icon="personOutline"></ion-icon>
            <ion-input
              v-model="email"
              type="email"
              label="Usuario"
              label-placement="floating"
              fill="outline"
              placeholder="Correo electrónico"
              @ionInput="onEmailInput"
              @ionFocus="showEmailSuggestions = true"
              @ionBlur="hideEmailSuggestions"
              :class="{ 'ion-valid': isEmailValid, 'ion-invalid': emailError }"
              aria-label="Correo electrónico"
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
          <!-- Error de email -->
          <div v-if="emailError" class="validation-error" id="email-error" role="alert" aria-live="assertive">
            {{ emailError }}
          </div>

          <!-- Campo Contraseña -->
          <ion-item :class="{ 'ion-invalid': passwordError }" aria-invalid="true" aria-errormessage="password-error">
            <ion-icon slot="start" :icon="keyOutline"></ion-icon>
            <ion-input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Contraseña"
              label-placement="floating"
              fill="outline"
              placeholder="Contraseña"
              @ionInput="onPasswordInput"
              :maxlength="15"
              :class="{ 'ion-valid': isPasswordValid, 'ion-invalid': passwordError }"
              aria-label="Contraseña"
              autocomplete="current-password"
              required
            ></ion-input>
            <ion-icon
              slot="end"
              :icon="showPassword ? eyeOffOutline : eyeOutline"
              @click="togglePassword"
              style="cursor: pointer"
              tabindex="0"
              role="button"
              aria-label="Mostrar/ocultar contraseña"
            ></ion-icon>
          </ion-item>
          <!-- Error de contraseña -->
          <div v-if="passwordError" class="validation-error" id="password-error" role="alert" aria-live="assertive">
            {{ passwordError }}
          </div>
        </div>

        <!-- Links -->
        <div class="links" aria-label="Enlaces de ayuda y registro">
          <a href="#" @click.prevent="openForgotModal" tabindex="0" aria-label="Recuperar contraseña">Olvidaste tu contraseña?</a>
          <p>
            Nuevo miembro? <router-link to="/register" aria-label="Ir a registro">Regístrate</router-link>
          </p>
        </div>

        <!-- Botón -->
        <div class="btn-container">
          <ion-button expand="block" class="login-btn" @click="handleLogin" :disabled="loading" :aria-disabled="loading" aria-label="Ingresar">
            <ion-spinner v-if="loading" name="crescent" aria-label="Cargando"></ion-spinner>
            <span v-else>Ingresar</span>
          </ion-button>
        </div>

      </div>

      <!-- Modal Recuperar Contraseña -->
      <ion-modal :is-open="showForgotModal" @did-dismiss="closeForgotModal" aria-modal="true" role="dialog">
        <div class="modal-content" aria-label="Recuperar Contraseña">
          <button class="modal-close-btn" @click="closeForgotModal" aria-label="Cerrar modal" style="position:sticky;top:0;z-index:10;float:right;background:none;border:none;font-size:1.5rem;">×</button>
          <h2>Recuperar Contraseña</h2>

          <!-- Paso 1: ingresar correo -->
          <div v-if="forgotStep === 1">
            <ion-item :class="{ 'ion-invalid': forgotEmailError }" aria-invalid="true" aria-errormessage="forgot-email-error">
              <ion-input
                v-model="forgotEmail"
                type="email"
                placeholder="Tu correo"
                required
                @ionInput="onForgotEmailInput"
                @ionFocus="showForgotEmailSuggestions = true"
                @ionBlur="hideForgotEmailSuggestions"
                :class="{ 'ion-valid': isForgotEmailValid, 'ion-invalid': forgotEmailError }"
                aria-label="Correo electrónico para recuperación"
                autocomplete="username"
              ></ion-input>
            </ion-item>
            <!-- Sugerencias de email para modal -->
            <div v-if="showForgotEmailSuggestions && filteredForgotEmailDomains.length" class="email-suggestions">
              <div
                v-for="suggestion in filteredForgotEmailDomains"
                :key="suggestion"
                class="email-suggestion"
                @click="selectForgotEmailSuggestion(suggestion)"
                tabindex="0"
                role="button"
                aria-label="Sugerencia de correo"
              >
                {{ suggestion }}
              </div>
            </div>
            <!-- Error de email -->
            <div v-if="forgotEmailError" class="validation-error" id="forgot-email-error" role="alert" aria-live="assertive">
              {{ forgotEmailError }}
            </div>
            <div class="btn-container">
              <ion-button @click="sendToken" :disabled="forgotLoading" :aria-disabled="forgotLoading" aria-label="Enviar código de recuperación">
                <ion-spinner v-if="forgotLoading" name="crescent" aria-label="Cargando"></ion-spinner>
                <span v-else>Enviar Código</span>
              </ion-button>
              <ion-button fill="clear" color="medium" @click="closeForgotModal" aria-label="Cancelar recuperación">Cancelar</ion-button>
            </div>
          </div>

          <!-- Paso 2: ingresar token -->
          <div v-else-if="forgotStep === 2">
            <ion-item aria-label="Código de recuperación">
              <ion-input
                v-model="forgotToken"
                type="text"
                placeholder="Código recibido"
                required
                aria-label="Código recibido"
                autocomplete="one-time-code"
              ></ion-input>
            </ion-item>
            <div class="btn-container">
              <ion-button @click="validateToken" :disabled="forgotLoading" :aria-disabled="forgotLoading" aria-label="Validar código">
                <ion-spinner v-if="forgotLoading" name="crescent" aria-label="Cargando"></ion-spinner>
                <span v-else>Validar Código</span>
              </ion-button>
              <ion-button fill="clear" color="medium" @click="closeForgotModal" aria-label="Cancelar">Cancelar</ion-button>
            </div>
          </div>

          <!-- Paso 3: nueva contraseña -->
          <div v-else-if="forgotStep === 3">
            <ion-item :class="{ 'ion-invalid': newPasswordError }" aria-invalid="true" aria-errormessage="new-password-error">
              <ion-input
                v-model="forgotNewPassword"
                type="password"
                placeholder="Nueva contraseña"
                required
                @ionInput="onNewPasswordInput"
                :maxlength="15"
                :class="{ 'ion-valid': isNewPasswordValid, 'ion-invalid': newPasswordError }"
                aria-label="Nueva contraseña"
                autocomplete="new-password"
              ></ion-input>
            </ion-item>
            <!-- Indicadores de validación de nueva contraseña -->
            <div v-if="forgotNewPassword" class="password-requirements" aria-label="Requisitos de contraseña">
              <div class="requirement" :class="{ 'valid': passwordValidation.length }">
                <ion-icon :icon="passwordValidation.length ? checkmarkCircle : closeCircle"></ion-icon>
                6-15 caracteres
              </div>
              <div class="requirement" :class="{ 'valid': passwordValidation.lowercase }">
                <ion-icon :icon="passwordValidation.lowercase ? checkmarkCircle : closeCircle"></ion-icon>
                Al menos una minúscula
              </div>
              <div class="requirement" :class="{ 'valid': passwordValidation.uppercase }">
                <ion-icon :icon="passwordValidation.uppercase ? checkmarkCircle : closeCircle"></ion-icon>
                Al menos una mayúscula
              </div>
              <div class="requirement" :class="{ 'valid': passwordValidation.number }">
                <ion-icon :icon="passwordValidation.number ? checkmarkCircle : closeCircle"></ion-icon>
                Al menos un número
              </div>
              <div class="requirement" :class="{ 'valid': passwordValidation.special }">
                <ion-icon :icon="passwordValidation.special ? checkmarkCircle : closeCircle"></ion-icon>
                Al menos un carácter especial
              </div>
              <div class="requirement" :class="{ 'valid': passwordValidation.noEmojis }">
                <ion-icon :icon="passwordValidation.noEmojis ? checkmarkCircle : closeCircle"></ion-icon>
                Sin emoticones ni caracteres raros
              </div>
            </div>
            <!-- Error de nueva contraseña -->
            <div v-if="newPasswordError" class="validation-error" id="new-password-error" role="alert" aria-live="assertive">
              {{ newPasswordError }}
            </div>
            <div class="btn-container">
              <ion-button @click="resetPassword" :disabled="forgotLoading" :aria-disabled="forgotLoading" aria-label="Restablecer contraseña">
                <ion-spinner v-if="forgotLoading" name="crescent" aria-label="Cargando"></ion-spinner>
                <span v-else>Restablecer Contraseña</span>
              </ion-button>
              <ion-button fill="clear" color="medium" @click="closeForgotModal" aria-label="Cancelar">Cancelar</ion-button>
            </div>
          </div>
        </div>
      </ion-modal>
  </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  IonPage,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonModal,
} from "@ionic/vue";
import {
  personOutline,
  keyOutline,
  eyeOutline,
  eyeOffOutline,
  checkmarkCircle,
  closeCircle,
  alertCircle,
  warningOutline,
  informationCircle,
  closeOutline,
} from "ionicons/icons";
import { login } from "../services/authService";
import { useAuthStore } from "@/stores/auth";
import { sendRecoveryToken, validateRecoveryToken, resetPassword as resetPasswordService } from "../services/passwordRecoveryService";
import '../theme/LoginPage.css';

// Dominios de email comunes
const emailDomains = [
  '@gmail.com',
  '@corhuila.edu.co',
  '@hotmail.com',
  '@outlook.com',
  '@yahoo.com',
  '@estudiantecorhuila.edu.co',
  '@docente.corhuila.edu.co'
];

// Estado de notificaciones
const notification = reactive({
  show: false,
  type: 'info' as 'success' | 'error' | 'warning' | 'info',
  title: '',
  message: '',
  icon: informationCircle,
  progress: 0,
  duration: 5000,
});

// Variables para los timers de notificación
let notificationTimer: NodeJS.Timeout | null = null;
let notificationProgressTimer: NodeJS.Timeout | null = null;

// Funciones de notificación
const showNotification = (
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message: string,
  duration: number = 5000
) => {
  // Limpiar timers previos
  if (notificationTimer) clearTimeout(notificationTimer);
  if (notificationProgressTimer) clearInterval(notificationProgressTimer);

  // Configurar icono según el tipo
  const icons = {
    success: checkmarkCircle,
    error: alertCircle,
    warning: warningOutline,
    info: informationCircle,
  };

  // Configurar notificación
  notification.type = type;
  notification.title = title;
  notification.message = message;
  notification.icon = icons[type];
  notification.duration = duration;
  notification.progress = 0;
  notification.show = true;

  // Animar barra de progreso
  const progressInterval = 50; // 50ms
  const progressStep = (progressInterval / duration) * 100;
  
  notificationProgressTimer = setInterval(() => {
    notification.progress += progressStep;
    if (notification.progress >= 100) {
      dismissNotification();
    }
  }, progressInterval);

  // Auto-dismiss después del tiempo especificado
  notificationTimer = setTimeout(() => {
    dismissNotification();
  }, duration);
};

const dismissNotification = () => {
  if (notificationTimer) clearTimeout(notificationTimer);
  if (notificationProgressTimer) clearInterval(notificationProgressTimer);
  notification.show = false;
  notification.progress = 0;
};

// Estado local para login
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");

// Estados de validación para email
const emailError = ref("");
const showEmailSuggestions = ref(false);

// Estados de validación para contraseña
const passwordError = ref("");

// Modal recuperar contraseña
const showForgotModal = ref(false);
const forgotEmail = ref("");
const forgotLoading = ref(false);
const forgotMessage = ref("");
const forgotStep = ref(1);
const forgotToken = ref("");
const forgotNewPassword = ref("");

// Estados de validación para modal
const forgotEmailError = ref("");
const showForgotEmailSuggestions = ref(false);
const newPasswordError = ref("");

// Validación de nueva contraseña
const passwordValidation = ref({
  length: false,
  lowercase: false,
  uppercase: false,
  number: false,
  special: false,
  noEmojis: false
});

// Router y store
const router = useRouter();
const auth = useAuthStore();

// Computed properties para validaciones
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value) && !emailError.value;
});

const isForgotEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(forgotEmail.value) && !forgotEmailError.value;
});

const isPasswordValid = computed(() => {
  return password.value.length >= 6 && password.value.length <= 15 && !passwordError.value;
});

const isNewPasswordValid = computed(() => {
  return Object.values(passwordValidation.value).every(Boolean);
});

// Sugerencias de email filtradas
const filteredEmailDomains = computed(() => {
  if (!email.value || !email.value.includes('@')) return [];
  
  const [localPart, domainPart] = email.value.split('@');
  if (!domainPart) return emailDomains.map(domain => localPart + domain);
  
  return emailDomains
    .filter(domain => domain.toLowerCase().startsWith('@' + domainPart.toLowerCase()))
    .map(domain => localPart + domain);
});

const filteredForgotEmailDomains = computed(() => {
  if (!forgotEmail.value || !forgotEmail.value.includes('@')) return [];
  
  const [localPart, domainPart] = forgotEmail.value.split('@');
  if (!domainPart) return emailDomains.map(domain => localPart + domain);
  
  return emailDomains
    .filter(domain => domain.toLowerCase().startsWith('@' + domainPart.toLowerCase()))
    .map(domain => localPart + domain);
});

// Función para validar email
const validateEmail = (emailValue: string): string => {
  if (!emailValue) return "El correo es requerido";
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailValue)) {
    return "Ingresa un formato de correo válido";
  }
  
  return "";
};

// Función para validar contraseña básica
const validatePassword = (passwordValue: string): string => {
  if (!passwordValue) return "La contraseña es requerida";
  
  if (passwordValue.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  if (passwordValue.length > 15) return "La contraseña no puede tener más de 15 caracteres";
  
  // Verificar que no tenga emoticones o caracteres raros
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  if (emojiRegex.test(passwordValue)) {
    return "La contraseña no puede contener emoticones";
  }
  
  return "";
};

// Función para validar nueva contraseña avanzada
const validateNewPassword = (passwordValue: string) => {
  const validation = {
    length: passwordValue.length >= 6 && passwordValue.length <= 15,
    lowercase: /[a-z]/.test(passwordValue),
    uppercase: /[A-Z]/.test(passwordValue),
    number: /\d/.test(passwordValue),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue),
    noEmojis: !/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(passwordValue)
  };
  
  passwordValidation.value = validation;
  
  if (!passwordValue) return "La contraseña es requerida";
  
  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    return "La contraseña no cumple con todos los requisitos";
  }
  
  return "";
};

// Manejadores de input
const onEmailInput = (event: any) => {
  const value = event.target.value;
  email.value = value;
  emailError.value = validateEmail(value);
};

const onPasswordInput = (event: any) => {
  const value = event.target.value;
  // Limitar longitud sin emoticones
  const cleanValue = value.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  if (cleanValue.length <= 15) {
    password.value = cleanValue;
    passwordError.value = validatePassword(cleanValue);
  }
};

const onForgotEmailInput = (event: any) => {
  const value = event.target.value;
  forgotEmail.value = value;
  forgotEmailError.value = validateEmail(value);
};

const onNewPasswordInput = (event: any) => {
  const value = event.target.value;
  // Limitar longitud sin emoticones
  const cleanValue = value.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  if (cleanValue.length <= 15) {
    forgotNewPassword.value = cleanValue;
    newPasswordError.value = validateNewPassword(cleanValue);
  }
};

// Manejadores de sugerencias
const selectEmailSuggestion = (suggestion: string) => {
  email.value = suggestion;
  emailError.value = validateEmail(suggestion);
  showEmailSuggestions.value = false;
};

const selectForgotEmailSuggestion = (suggestion: string) => {
  forgotEmail.value = suggestion;
  forgotEmailError.value = validateEmail(suggestion);
  showForgotEmailSuggestions.value = false;
};

const hideEmailSuggestions = () => {
  setTimeout(() => {
    showEmailSuggestions.value = false;
  }, 200);
};

const hideForgotEmailSuggestions = () => {
  setTimeout(() => {
    showForgotEmailSuggestions.value = false;
  }, 200);
};

// Alternar visibilidad de la contraseña
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Abrir/Cerrar modal
const openForgotModal = () => {
  showForgotModal.value = true;
  forgotEmail.value = "";
  forgotEmailError.value = "";
  forgotMessage.value = "";
  forgotStep.value = 1;
  forgotToken.value = "";
  forgotNewPassword.value = "";
  newPasswordError.value = "";
  showForgotEmailSuggestions.value = false;
  passwordValidation.value = {
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
    noEmojis: false
  };
};

const closeForgotModal = () => {
  showForgotModal.value = false;
  forgotEmail.value = "";
  forgotEmailError.value = "";
  forgotMessage.value = "";
  forgotStep.value = 1;
  forgotToken.value = "";
  forgotNewPassword.value = "";
  newPasswordError.value = "";
  showForgotEmailSuggestions.value = false;
  passwordValidation.value = {
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
    noEmojis: false
  };
};

// Paso 1: enviar correo para generar token
const sendToken = async () => {
  forgotMessage.value = "";
  
  const emailValidation = validateEmail(forgotEmail.value);
  if (emailValidation) {
    forgotEmailError.value = emailValidation;
    return;
  }
  
  forgotLoading.value = true;
  try {
    const msg = await sendRecoveryToken(forgotEmail.value);
    forgotStep.value = 2;
    showNotification('success', 'Código enviado', msg, 5000);
  } catch (err: any) {
    const errorMsg = err.message || "Error enviando correo";
    showNotification('error', 'Error', errorMsg, 5000);
  } finally {
    forgotLoading.value = false;
  }
};

// Paso 2: validar token ingresado por usuario
const validateToken = async () => {
  forgotMessage.value = "";
  if (!forgotToken.value) {
    forgotMessage.value = "Por favor ingresa el código recibido.";
    return;
  }
  forgotLoading.value = true;
  try {
    await validateRecoveryToken(forgotToken.value);
    forgotStep.value = 3;
    showNotification('success', 'Código válido', 'El código ha sido validado correctamente', 5000);
  } catch (err: any) {
    const errorMsg = err.message || "Error validando código";
    showNotification('error', 'Error de validación', errorMsg, 5000);
  } finally {
    forgotLoading.value = false;
  }
};

// Paso 3: enviar nueva contraseña
const resetPassword = async () => {
  forgotMessage.value = "";
  
  const passwordValidationError = validateNewPassword(forgotNewPassword.value);
  if (passwordValidationError) {
    newPasswordError.value = passwordValidationError;
    return;
  }
  
  forgotLoading.value = true;
  try {
    const msg = await resetPasswordService(forgotToken.value, forgotNewPassword.value);
    
    // ⭐ Primero cerrar el modal
    closeForgotModal();
    
    // ⭐ Luego mostrar la notificación de éxito
    setTimeout(() => {
      showNotification('success', '¡Contraseña restablecida!', msg, 5000);
    }, 300); // Pequeño delay para que el modal se cierre primero
    
  } catch (err: any) {
    const errorMsg = err.message || "Error restableciendo contraseña";
    showNotification('error', 'Error', errorMsg, 5000);
  } finally {
    forgotLoading.value = false;
  }
};

// Manejar login
const handleLogin = async () => {
  errorMessage.value = "";
  
  // Validar campos antes de enviar
  const emailValidation = validateEmail(email.value);
  const passwordValidation = validatePassword(password.value);
  
  if (emailValidation) {
    emailError.value = emailValidation;
    return;
  }
  
  if (passwordValidation) {
    passwordError.value = passwordValidation;
    return;
  }
  
  loading.value = true;

  try {
    const res = await login(email.value, password.value);
    if (res.token) {
      auth.setToken(res.token);
      router.push("/home");
    }
  } catch (err: any) {
    const errorMsg = err.message || "Error al iniciar sesión";
    showNotification('error', 'Error de acceso', errorMsg, 5000);
  } finally {
    loading.value = false;
  }
};

// Limpieza al desmontar el componente
onUnmounted(() => {
  if (notificationTimer) clearTimeout(notificationTimer);
  if (notificationProgressTimer) clearInterval(notificationProgressTimer);
});
</script>

<style>
@import '../theme/LoginPage.css';
</style>