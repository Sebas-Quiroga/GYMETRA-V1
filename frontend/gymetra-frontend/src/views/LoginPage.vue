<template>
  <ion-page>
    <ion-content class="ion-padding login-page" color="primary">
      <!-- Logo -->
      <div class="logo-container">
        <img src="/logo.png" alt="Gymetra Logo" class="logo" />
      </div>

      <!-- Campo Usuario -->
      <ion-item>
        <ion-icon slot="start" :icon="personOutline"></ion-icon>
        <ion-input
          v-model="email"
          label="Usuario"
          label-placement="floating"
          fill="outline"
          placeholder="Correo electrónico"
        ></ion-input>
      </ion-item>

      <!-- Campo Contraseña -->
      <ion-item>
        <ion-icon slot="start" :icon="keyOutline"></ion-icon>
        <ion-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Contraseña"
          label-placement="floating"
          fill="outline"
          placeholder="Contraseña"
        ></ion-input>
        <ion-icon
          slot="end"
          :icon="showPassword ? eyeOffOutline : eyeOutline"
          @click="togglePassword"
          style="cursor: pointer"
        ></ion-icon>
      </ion-item>

      <!-- Links -->
      <div class="links">
        <a href="#" @click.prevent="openForgotModal">Olvidaste tu contraseña?</a>
        <p>
          Nuevo miembro? <a href="#">Regístrate</a>
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

      <!-- Modal Recuperar Contraseña -->
      <ion-modal :is-open="showForgotModal" @did-dismiss="closeForgotModal">
        <div class="modal-content">
          <h2>Recuperar Contraseña</h2>

          <!-- Paso 1: ingresar correo -->
          <div v-if="forgotStep === 1">
            <ion-item>
              <ion-input
                v-model="forgotEmail"
                type="email"
                placeholder="Tu correo"
                required
              ></ion-input>
            </ion-item>
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
            <ion-item>
              <ion-input
                v-model="forgotNewPassword"
                type="password"
                placeholder="Nueva contraseña"
                required
              ></ion-input>
            </ion-item>
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
import { ref } from "vue";
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
} from "ionicons/icons";
import { login } from "../services/authService";
import { useAuthStore } from "@/stores/auth";
import { sendRecoveryToken, validateRecoveryToken, resetPassword as resetPasswordService } from "../services/passwordRecoveryService";
import '../theme/LoginPage.css';
// Estado local
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");

// Modal recuperar contraseña
const showForgotModal = ref(false);
const forgotEmail = ref("");
const forgotLoading = ref(false);
const forgotMessage = ref("");
const forgotStep = ref(1);
const forgotToken = ref("");
const forgotNewPassword = ref("");

// Router y store
const router = useRouter();
const auth = useAuthStore();

// Alternar visibilidad de la contraseña
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Abrir/Cerrar modal
const openForgotModal = () => {
  showForgotModal.value = true;
  forgotEmail.value = "";
  forgotMessage.value = "";
  forgotStep.value = 1;
  forgotToken.value = "";
  forgotNewPassword.value = "";
};
const closeForgotModal = () => {
  showForgotModal.value = false;
  forgotEmail.value = "";
  forgotMessage.value = "";
  forgotStep.value = 1;
  forgotToken.value = "";
  forgotNewPassword.value = "";
};

// Paso 1: enviar correo para generar token
const sendToken = async () => {
  forgotMessage.value = "";
  if (!forgotEmail.value) {
    forgotMessage.value = "Por favor ingresa tu correo.";
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
  if (!forgotNewPassword.value) {
    forgotMessage.value = "Por favor ingresa una nueva contraseña.";
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