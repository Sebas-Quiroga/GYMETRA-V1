<template>
  <div class="admin-login-page">
    <div class="login-card">
      <div class="logo-section">
        <img src="/logo.png" alt="GYMETRA Logo" class="logo-kinetic" />
        <h1 class="brand-name-card">GYMETRA</h1>
        <p class="brand-tagline">AERO ATHLETIC EXPERIENCE</p>
        <div class="admin-badge">Gestión Administrativa</div>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Identidad Administrativa</label>
          <div class="input-wrapper-kinetic">
            <ion-icon :icon="mailOutline"></ion-icon>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="admin@gymetra.com"
              required
              :class="{ error: errors.email }"
            />
          </div>
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Llave de Acceso</label>
          <div class="input-wrapper-kinetic">
            <ion-icon :icon="lockClosedOutline"></ion-icon>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
              :class="{ error: errors.password }"
            />
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="forgot-link">
          <a href="#" class="forgot-password-link" @click.prevent="handleForgotPassword">
            ¿Restablecer credenciales?
          </a>
        </div>

        <div class="login-btn-container">
          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="loading" class="spin-kinetic">
              <ion-icon :icon="refreshOutline"></ion-icon>
            </span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </div>
      </form>

      <div class="login-footer">
        <p>¿Problemas técnicos? <a href="#" class="contact-link" @click.prevent="handleContactSupport">Soporte Técnico</a></p>
      </div>

      <div class="back-link">
        <button class="back-btn" @click="goToUserLogin">
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
import {
  fitnessOutline,
  mailOutline,
  lockClosedOutline,
  refreshOutline,
  arrowBackOutline,
} from "ionicons/icons";

// 🔗 Importa el servicio de autenticación (solo para admin)
import { login } from "@/services/authService";

const router = useRouter();

// Estado del formulario
const form = reactive({
  email: "",
  password: "",
});

// Estado de errores
const errors = reactive({
  email: "",
  password: "",
});

// Estado de carga
const loading = ref(false);

// ===========================================
// 🔐 Manejar inicio de sesión de administrador
// ===========================================
const handleLogin = async () => {
  errors.email = "";
  errors.password = "";

  if (!form.email) {
    errors.email = "El correo electrónico es requerido";
    return;
  }
  if (!form.password) {
    errors.password = "La contraseña es requerida";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    errors.email = "Ingresa un correo electrónico válido";
    return;
  }

  try {
    loading.value = true;

    await login(form.email, form.password);

    console.log("✅ Bienvenido administrador");
    router.push("/adminpanel"); // tu ruta al panel de administración

  } catch (error: any) {
    console.error("❌ Error en login:", error);
    errors.password = error.message || "Credenciales incorrectas";
  } finally {
    loading.value = false;
  }
};

// ===========================================
// 🔁 Funciones auxiliares
// ===========================================
const handleForgotPassword = () => {
  console.log("Recuperar contraseña de admin (pendiente implementar)");
};

const handleContactSupport = () => {
  console.log("Contactar soporte (pendiente implementar)");
};

const goToUserLogin = () => {
  // 🔄 Cambia esta URL por la de tu frontend de cliente (por ejemplo puerto 3000)
  window.location.href = "http://localhost:3000/login";
};
</script>

<style>
@import "../theme/LoginAdminPage.css";
</style>
