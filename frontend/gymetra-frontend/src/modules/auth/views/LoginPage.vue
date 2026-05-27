<template>
  <ion-page>
    <ion-content class="login-page">


      <div class="login-container" role="main">
        <div class="logo-container">
          <img src="/logo.png" alt="Logo de la aplicación" class="logo" loading="eager" />
          <h1 class="brand-name">GYMETRA</h1>
          <p class="brand-tagline">Tu transformación comienza aquí</p>
        </div>

        <div class="input-card">
          <ion-item lines="none">
            <ion-icon :icon="personOutline"></ion-icon>
            <ion-input
              v-model="userEmail"
              type="email"
              placeholder="Correo electrónico"
              @ionInput="handleEmailInput"
              @ionFocus="isEmailSuggestionsVisible = true"
              @ionBlur="handleEmailBlur"
              autocomplete="username"
              required
            ></ion-input>
          </ion-item>

          <div v-if="isEmailSuggestionsVisible && emailDomainSuggestions.length" class="email-suggestions">
            <div
              v-for="suggestion in emailDomainSuggestions"
              :key="suggestion"
              class="email-suggestion"
              @click="handleSelectSuggestion(suggestion)"
            >
              {{ suggestion }}
            </div>
          </div>
          <div v-if="emailValidationMessage" class="validation-error">
             <ion-icon :icon="alertCircle"></ion-icon> {{ emailValidationMessage }}
          </div>

          <ion-item lines="none">
            <ion-icon :icon="keyOutline"></ion-icon>
            <ion-input
              v-model="userPassword"
              :type="isPasswordVisible ? 'text' : 'password'"
              placeholder="Contraseña"
              @ionInput="handlePasswordInput"
              :maxlength="15"
              autocomplete="current-password"
              required
            ></ion-input>
            <ion-button fill="clear" @click="togglePasswordVisibility" slot="end" class="toggle-pass-btn">
              <ion-icon :icon="isPasswordVisible ? eyeOffOutline : eyeOutline"></ion-icon>
            </ion-button>
          </ion-item>
          <div v-if="passwordValidationMessage" class="validation-error">
            <ion-icon :icon="alertCircle"></ion-icon> {{ passwordValidationMessage }}
          </div>

          <div class="btn-container">
            <ion-button expand="block" class="login-btn" @click="performLogin" :disabled="isProcessLoading">
              <ion-spinner v-if="isProcessLoading" name="crescent"></ion-spinner>
              <span v-else>Iniciar Sesión</span>
            </ion-button>
          </div>

          <div class="links">
            <a href="#" @click.prevent="openForgotModal">¿Olvidaste tu contraseña?</a>
            <p>
              ¿Eres nuevo? <router-link to="/register">Regístrate aquí</router-link>
            </p>
          </div>
        </div>
      </div>

      <ion-modal :is-open="isForgotModalOpen" @did-dismiss="closeForgotModal">
        <div class="modal-content">
          <h2>Recuperar Contraseña</h2>
          
          <div v-if="forgotStepIndex === 1">
            <ion-item lines="none">
              <ion-input
                v-model="forgotProcessEmail"
                type="email"
                placeholder="Ingresa tu correo"
                @ionInput="handleForgotEmailInput"
              ></ion-input>
            </ion-item>
            <div v-if="forgotEmailErrorMessage" class="validation-error">
              {{ forgotEmailErrorMessage }}
            </div>
            <div class="btn-container">
              <ion-button expand="block" class="login-btn" @click="handleSendRecoveryToken" :disabled="isForgotProcessLoading">
                <ion-spinner v-if="isForgotProcessLoading" name="crescent"></ion-spinner>
                <span v-else>Enviar Código</span>
              </ion-button>
            </div>
          </div>

          <div v-else-if="forgotStepIndex === 2">
            <ion-item lines="none">
              <ion-input v-model="recoveryTokenValue" placeholder="Código de 6 dígitos"></ion-input>
            </ion-item>
            <div class="btn-container">
              <ion-button expand="block" class="login-btn" @click="handleValidateToken" :disabled="isForgotProcessLoading">
                <span v-if="!isForgotProcessLoading">Validar Código</span>
                <ion-spinner v-else name="crescent"></ion-spinner>
              </ion-button>
            </div>
          </div>

          <div v-else-if="forgotStepIndex === 3">
            <ion-item lines="none">
              <ion-input v-model="forgotNewPasswordValue" type="password" placeholder="Nueva contraseña"></ion-input>
            </ion-item>
            <div class="password-requirements">
              <div class="requirement" :class="{ 'valid': passwordCriteria.isLengthValid }">✔ 6-15 caracteres</div>
              <div class="requirement" :class="{ 'valid': passwordCriteria.hasUppercase }">✔ Al menos una mayúscula</div>
              <div class="requirement" :class="{ 'valid': passwordCriteria.hasNumber }">✔ Al menos un número</div>
            </div>
            <div class="btn-container">
              <ion-button expand="block" class="login-btn" @click="handleResetPassword" :disabled="isForgotProcessLoading">
                <span v-if="!isForgotProcessLoading">Actualizar Contraseña</span>
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
import { IonPage, IonContent, IonItem, IonInput, IonButton, IonIcon, IonSpinner, IonModal } from "@ionic/vue";
import { 
  personOutline, keyOutline, eyeOutline, eyeOffOutline, 
  alertCircle, closeOutline 
} from "ionicons/icons";
import { useAuthStore } from "../../auth/store/auth";
import { authService, sendRecoveryToken, validateRecoveryToken, resetPassword as resetPasswordService } from "..";
import { useNotification } from "../../shared/composables/useNotification";

const router = useRouter();
const auth = useAuthStore();
const { notification, showNotification, dismissNotification } = useNotification();

const userEmail = ref("");
const userPassword = ref("");
const isPasswordVisible = ref(false);
const isProcessLoading = ref(false);
const emailValidationMessage = ref("");
const passwordValidationMessage = ref("");
const isEmailSuggestionsVisible = ref(false);

const emailDomainList = ['@gmail.com', '@corhuila.edu.co', '@hotmail.com', '@outlook.com'];

const emailDomainSuggestions = computed(() => {
  if (!userEmail.value.includes('@')) return [];
  const [localPart, domainPart] = userEmail.value.split('@');
  return emailDomainList
    .filter(domain => domain.startsWith('@' + domainPart))
    .map(domain => localPart + domain);
});

const handleEmailInput = (event: any) => {
  userEmail.value = event.target.value;
  emailValidationMessage.value = userEmail.value.includes('@') ? "" : "Ingresa un correo válido";
};

const handlePasswordInput = (event: any) => {
  userPassword.value = event.target.value.substring(0, 15);
  passwordValidationMessage.value = userPassword.value.length >= 6 ? "" : "Mínimo 6 caracteres";
};

const togglePasswordVisibility = () => { isPasswordVisible.value = !isPasswordVisible.value; };

const performLogin = async () => {
  if (!userEmail.value || !userPassword.value) return;
  isProcessLoading.value = true;
  try {
    const response = await authService.login(userEmail.value, userPassword.value);
    if (response.token) {
      auth.setToken(response.token);
      router.push("/home");
    }
  } catch (error: any) {
    showNotification('error', 'Error de acceso', error.message || 'Credenciales incorrectas');
  } finally {
    isProcessLoading.value = false;
  }
};

const isForgotModalOpen = ref(false);
const forgotProcessEmail = ref("");
const forgotStepIndex = ref(1);
const recoveryTokenValue = ref("");
const forgotNewPasswordValue = ref("");
const isForgotProcessLoading = ref(false);
const forgotEmailErrorMessage = ref("");

const openForgotModal = () => {
  isForgotModalOpen.value = true;
  forgotStepIndex.value = 1;
};

const closeForgotModal = () => { isForgotModalOpen.value = false; };

const handleForgotEmailInput = (event: any) => { forgotProcessEmail.value = event.target.value; };

const handleSelectSuggestion = (suggestion: string) => {
  userEmail.value = suggestion;
  isEmailSuggestionsVisible.value = false;
};

const handleEmailBlur = () => setTimeout(() => isEmailSuggestionsVisible.value = false, 200);

const passwordCriteria = computed(() => ({
  isLengthValid: forgotNewPasswordValue.value.length >= 6,
  hasUppercase: /[A-Z]/.test(forgotNewPasswordValue.value),
  hasNumber: /\d/.test(forgotNewPasswordValue.value)
}));

const handleSendRecoveryToken = async () => {
  isForgotProcessLoading.value = true;
  try {
    await sendRecoveryToken(forgotProcessEmail.value);
    forgotStepIndex.value = 2;
    showNotification('success', 'Enviado', 'Revisa tu bandeja de entrada');
  } catch (error: any) {
    showNotification('error', 'Error', error.message);
  } finally {
    isForgotProcessLoading.value = false;
  }
};

const handleValidateToken = async () => {
  isForgotProcessLoading.value = true;
  try {
    await validateRecoveryToken(recoveryTokenValue.value);
    forgotStepIndex.value = 3;
  } catch (error: any) {
    showNotification('error', 'Error', 'Código inválido');
  } finally {
    isForgotProcessLoading.value = false;
  }
};

const handleResetPassword = async () => {
  isForgotProcessLoading.value = true;
  try {
    await resetPasswordService(forgotProcessEmail.value, recoveryTokenValue.value, forgotNewPasswordValue.value);
    closeForgotModal();
    showNotification('success', 'Éxito', 'Contraseña actualizada');
  } catch (error: any) {
    showNotification('error', 'Error', error.message);
  } finally {
    isForgotProcessLoading.value = false;
  }
};

onUnmounted(() => {
  dismissNotification();
});
</script>

<style scoped src="../theme/LoginPage.css"></style>
