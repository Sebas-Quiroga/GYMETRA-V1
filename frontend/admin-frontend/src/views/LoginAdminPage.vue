<template>
  <div class="admin-login-page">
    <div class="login-card">
      <div class="logo-section">
        <ion-icon :icon="fitnessOutline" class="logo-icon"></ion-icon>
        <h1>GYMETRA</h1>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Correo Electrónico</label>
          <div class="input-group">
            <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="admin@gymetra.com"
              required
              :class="{ 'error': errors.email }"
            />
          </div>
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <div class="input-group">
            <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
              :class="{ 'error': errors.password }"
            />
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="forgot-link">
          <a href="#" class="forgot-password-link" @click.prevent="handleForgotPassword">¿Olvidaste tu contraseña?</a>
        </div>

        <div class="login-btn-container">
          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="loading" class="loading-spinner">
              <ion-icon :icon="refreshOutline" class="spinner-icon"></ion-icon>
            </span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </div>
      </form>

      <div class="login-footer">
        <p>¿No tienes cuenta de administrador?</p>
        <a href="#" class="contact-link" @click.prevent="handleContactSupport">Contactar soporte</a>
      </div>

      <div class="back-link">
        <button class="back-btn" @click="goToUserLogin">
          <ion-icon :icon="arrowBackOutline"></ion-icon>
          Volver al login de usuario
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  fitnessOutline,
  mailOutline,
  lockClosedOutline,
  refreshOutline,
  arrowBackOutline,
  shieldCheckmarkOutline,
  barChartOutline,
  settingsOutline
} from 'ionicons/icons'

const router = useRouter()

// Form state
const form = reactive({
  email: '',
  password: ''
})

// Error state
const errors = reactive({
  email: '',
  password: ''
})

// Loading state
const loading = ref(false)

// Handle login
const handleLogin = async () => {
  // Reset errors
  errors.email = ''
  errors.password = ''

  // Basic validation
  if (!form.email) {
    errors.email = 'El correo electrónico es requerido'
    return
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    return
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    errors.email = 'Ingresa un correo electrónico válido'
    return
  }

  try {
    loading.value = true

    // TODO: Implementar autenticación de admin
    console.log('Iniciando sesión como admin:', {
      email: form.email
    })

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500))

    // TODO: Aquí irá la lógica de autenticación real
    // Por ahora, redirigir al panel de admin
    router.push('/adminpanel')

  } catch (error) {
    console.error('Error en login:', error)
    errors.password = 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}

// Handle forgot password
const handleForgotPassword = () => {
  // TODO: Implementar recuperación de contraseña para admin
  console.log('Recuperar contraseña de admin')
}

// Handle contact support
const handleContactSupport = () => {
  // TODO: Implementar contacto con soporte
  console.log('Contactar soporte')
}

// Go to user login
const goToUserLogin = () => {
  // TODO: Redirigir al frontend de usuario (puerto 3000)
  console.log('Redirigir al login de usuario')
}
</script>

<style>
@import '../theme/LoginAdminPage.css';
</style>