<template>
  <ion-page>
    <ion-content class="ion-padding login-page" color="primary">
      <div class="login-container">
        <!-- Logo -->
        <div class="logo-container">
          <img src="/logo.png" alt="Gymetra Logo" class="logo" />
        </div>

        <!-- Agrupa los campos en input-card -->
        <div class="input-card">
          <!-- Campo Usuario -->
          <ion-item :class="{ 'ion-invalid': emailError }">
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
          <div v-if="emailError" class="validation-error">
            {{ emailError }}
          </div>

          <!-- Campo Contraseña -->
          <ion-item :class="{ 'ion-invalid': passwordError }">
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
            ></ion-input>
            <ion-icon
              slot="end"
              :icon="showPassword ? eyeOffOutline : eyeOutline"
              @click="togglePassword"
              style="cursor: pointer"
            ></ion-icon>
          </ion-item>
          <!-- Error de contraseña -->
          <div v-if="passwordError" class="validation-error">
            {{ passwordError }}
          </div>
        </div>

        <!-- Links -->
        <div class="links">
          <a href="#" @click.prevent="openForgotModal">Olvidaste tu contraseña?</a>
          <p>
            Nuevo miembro? <router-link to="/register">Regístrate</router-link>
          </p>
        </div>

        <!-- Botón -->
        <div class="btn-container">
          <ion-button expand="block" class="login-btn" @click="handleLogin" :disabled="loading">
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Ingresar</span>
          </ion-button>
        </div>

        <!-- Error -->
        <div v-if="errorMessage" class="error-msg">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Modal Recuperar Contraseña -->
      <ion-modal :is-open="showForgotModal" @did-dismiss="closeForgotModal">
        <div class="modal-content">
          <h2>Recuperar Contraseña</h2>

          <!-- Paso 1: ingresar correo -->
          <div v-if="forgotStep === 1">
            <ion-item :class="{ 'ion-invalid': forgotEmailError }">
              <ion-input
                v-model="forgotEmail"
                type="email"
                placeholder="Tu correo"
                required
                @ionInput="onForgotEmailInput"
                @ionFocus="showForgotEmailSuggestions = true"
                @ionBlur="hideForgotEmailSuggestions"
                :class="{ 'ion-valid': isForgotEmailValid, 'ion-invalid': forgotEmailError }"
              ></ion-input>
            </ion-item>
            <!-- Sugerencias de email para modal -->
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
            <!-- Error de email -->
            <div v-if="forgotEmailError" class="validation-error">
              {{ forgotEmailError }}
            </div>
            <div class="btn-container">
              <ion-button @click="sendToken" :disabled="forgotLoading">
                <ion-spinner v-if="forgotLoading" name="crescent"></ion-spinner>
                <span v-else>Enviar Código</span>
              </ion-button>
              <ion-button fill="clear" color="medium" @click="closeForgotModal">Cancelar</ion-button>
            </div>
            <div class="message" v-if="forgotMessage">{{ forgotMessage }}</div>
          </div>

          <!-- Paso 2: ingresar token recibido -->
          <div v-else-if="forgotStep === 2">
            <ion-item>
              <ion-input
                v-model="forgotToken"
                type="text"
                placeholder="Código recibido"
                required
              ></ion-input>
            </ion-item>
            <div class="btn-container">
              <ion-button @click="validateToken" :disabled="forgotLoading">
                <ion-spinner v-if="forgotLoading" name="crescent"></ion-spinner>
                <span v-else>Validar Código</span>
              </ion-button>
              <ion-button fill="clear" color="medium" @click="closeForgotModal">Cancelar</ion-button>
            </div>
            <div class="message" v-if="forgotMessage">{{ forgotMessage }}</div>
          </div>

          <!-- Paso 3: nueva contraseña -->
          <div v-else-if="forgotStep === 3">
            <ion-item :class="{ 'ion-invalid': newPasswordError }">
              <ion-input
                v-model="forgotNewPassword"
                type="password"
                placeholder="Nueva contraseña"
                required
                @ionInput="onNewPasswordInput"
                :maxlength="15"
                :class="{ 'ion-valid': isNewPasswordValid, 'ion-invalid': newPasswordError }"
              ></ion-input>
            </ion-item>
            <!-- Indicadores de validación de nueva contraseña -->
            <div v-if="forgotNewPassword" class="password-requirements">
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
            <div v-if="newPasswordError" class="validation-error">
              {{ newPasswordError }}
            </div>
            <div class="btn-container">
              <ion-button @click="resetPassword" :disabled="forgotLoading">
                <ion-spinner v-if="forgotLoading" name="crescent"></ion-spinner>
                <span v-else>Restablecer Contraseña</span>
              </ion-button>
              <ion-button fill="clear" color="medium" @click="closeForgotModal">Cancelar</ion-button>
            </div>
            <div class="message" v-if="forgotMessage">{{ forgotMessage }}</div>
          </div>

          <!-- Mensaje final -->
          <div v-else-if="forgotStep === 4">
            <div class="message">{{ forgotMessage }}</div>
            <div class="btn-container">
              <ion-button @click="closeForgotModal">Cerrar</ion-button>
            </div>
          </div>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
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
    forgotMessage.value = msg;
  } catch (err: any) {
    forgotMessage.value = err.message || "Error enviando correo";
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
    forgotMessage.value = "Código válido";
  } catch (err: any) {
    forgotMessage.value = err.message || "Error validando código";
  } finally {
    forgotLoading.value = false;
  }
};

// Paso 3: enviar nueva contraseña
const resetPassword = async () => {
  forgotMessage.value = "";
  
  const passwordValidation = validateNewPassword(forgotNewPassword.value);
  if (passwordValidation) {
    newPasswordError.value = passwordValidation;
    return;
  }
  
  forgotLoading.value = true;
  try {
    const msg = await resetPasswordService(forgotToken.value, forgotNewPassword.value);
    forgotMessage.value = msg;
    forgotStep.value = 4;
  } catch (err: any) {
    forgotMessage.value = err.message || "Error restableciendo contraseña";
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
    errorMessage.value = err.message || "Error al iniciar sesión";
  } finally {
    loading.value = false;
  }
};
</script>