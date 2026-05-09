<template>
  <div class="admin-login-page">
    <div class="login-card">
      <div class="logo-section">
        <img src="/logo.png" alt="GYMETRA Logo" class="logo-kinetic" />
        <h1 class="brand-name-card">GYMETRA</h1>
        <p class="brand-tagline">AERO ATHLETIC EXPERIENCE</p>
        <div class="admin-badge">Gestión Administrativa</div>
      </div>

      <form @submit.prevent="handleLoginSubmit" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Identidad Administrativa</label>
          <div class="input-wrapper-kinetic">
            <ion-icon :icon="mailOutline"></ion-icon>
            <input
              id="email"
              v-model="loginFormData.email"
              type="email"
              class="form-input"
              placeholder="admin@gymetra.com"
              required
              :class="{ error: validationErrors.email }"
            />
          </div>
          <span v-if="validationErrors.email" class="error-message">{{ validationErrors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Llave de Acceso</label>
          <div class="input-wrapper-kinetic">
            <ion-icon :icon="lockClosedOutline"></ion-icon>
            <input
              id="password"
              v-model="loginFormData.password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
              :class="{ error: validationErrors.password }"
            />
          </div>
          <span v-if="validationErrors.password" class="error-message">{{ validationErrors.password }}</span>
        </div>

        <div class="forgot-link">
          <a href="#" class="forgot-password-link" @click.prevent="requestCredentialReset">
            ¿Restablecer credenciales?
          </a>
        </div>

        <div class="login-btn-container">
          <button type="submit" class="login-btn" :disabled="isRequestLoading">
            <span v-if="isRequestLoading" class="spin-kinetic">
              <ion-icon :icon="refreshOutline"></ion-icon>
            </span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </div>
      </form>

      <div class="login-footer">
        <p>¿Problemas técnicos? <a href="#" class="contact-link" @click.prevent="navigateToSupport">Soporte Técnico</a></p>
      </div>

      <div class="back-link">
        <button class="back-btn" @click="returnToUserPortal">
          <ion-icon :icon="arrowBackOutline"></ion-icon>
          Volver al Portal de Usuarios
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { mailOutline, lockClosedOutline, refreshOutline, arrowBackOutline } from "ionicons/icons";
import { login as performLogin } from "../services/authService";

const router = useRouter();

const loginFormData = reactive({
  email: "",
  password: "",
});

const validationErrors = reactive({
  email: "",
  password: "",
});

const isRequestLoading = ref(false);

const handleLoginSubmit = async () => {
  validationErrors.email = "";
  validationErrors.password = "";

  if (!loginFormData.email) {
    validationErrors.email = "El correo electrónico es requerido";
    return;
  }
  
  if (!loginFormData.password) {
    validationErrors.password = "La contraseña es requerida";
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(loginFormData.email)) {
    validationErrors.email = "Ingresa un correo electrónico válido";
    return;
  }

  try {
    isRequestLoading.value = true;
    await performLogin(loginFormData.email, loginFormData.password);
    router.push("/adminpanel");
  } catch (error: any) {
    validationErrors.password = error.message || "Credenciales incorrectas";
  } finally {
    isRequestLoading.value = false;
  }
};

const requestCredentialReset = () => {
  // Logic to be implemented
};

const navigateToSupport = () => {
  // Logic to be implemented
};

const returnToUserPortal = () => {
  window.location.href = "http://localhost:3000/login";
};
</script>

<style>
@import "../../../theme/LoginAdminPage.css";
</style>
