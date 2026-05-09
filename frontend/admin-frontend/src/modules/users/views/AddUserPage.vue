<template>
  <div class="admin-dashboard">
    <AdminSidebar :active-section="activeSection" @logout="handleAdminLogout" />

    <div class="main-content" :class="{ 'main-content-mobile': isMobileLayout }">
      <div class="add-user-container">
        <div class="kinetic-card">
          <div class="form-header">
            <h2>
              <ion-icon :icon="personAddOutline"></ion-icon>
              Registrar Nuevo Usuario
            </h2>
            <button @click="navigateBackToDirectory" class="back-btn">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
              <span>Volver</span>
            </button>
          </div>

          <form @submit.prevent="handleRegistrationSubmit" class="add-user-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="firstName" class="form-label">Nombre</label>
                <div class="input-wrapper-kinetic" :class="{ 'error': validationErrors.firstName }">
                  <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
                  <input
                    id="firstName"
                    v-model="registrationForm.firstName"
                    type="text"
                    class="form-input"
                    placeholder="Ej. Juan"
                    required
                    @input="validateFirstNameField"
                  />
                </div>
                <span v-if="validationErrors.firstName" class="error-message">{{ validationErrors.firstName }}</span>
              </div>

              <div class="form-group">
                <label for="lastName" class="form-label">Apellido</label>
                <div class="input-wrapper-kinetic" :class="{ 'error': validationErrors.lastName }">
                  <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
                  <input
                    id="lastName"
                    v-model="registrationForm.lastName"
                    type="text"
                    class="form-input"
                    placeholder="Ej. Pérez"
                    required
                    @input="validateLastNameField"
                  />
                </div>
                <span v-if="validationErrors.lastName" class="error-message">{{ validationErrors.lastName }}</span>
              </div>

              <div class="form-group">
                <label for="email" class="form-label">Email Corporativo</label>
                <div class="input-wrapper-kinetic" :class="{ 'error': validationErrors.email }">
                  <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
                  <input
                    id="email"
                    v-model="registrationForm.email"
                    type="email"
                    class="form-input"
                    placeholder="juan@gymetra.com"
                    required
                    @input="processEmailInput"
                    @keydown="handleSuggestionNavigation"
                    @blur="closeSuggestionsWithDelay"
                  />
                  <div v-if="isSuggestionsVisible && emailSuggestionsList.length > 0" class="email-suggestions-dropdown">
                    <div
                      v-for="(suggestion, index) in emailSuggestionsList"
                      :key="suggestion"
                      class="email-suggestion-item"
                      :class="{ 'selected': index === suggestionHighlightIndex }"
                      @click="selectSuggestedEmail(suggestion)"
                    >
                      {{ suggestion }}
                    </div>
                  </div>
                </div>
                <span v-if="validationErrors.email" class="error-message">{{ validationErrors.email }}</span>
              </div>

              <div class="form-group">
                <label for="identification" class="form-label">ID / Cédula</label>
                <div class="input-wrapper-kinetic" :class="{ 'error': validationErrors.identification }">
                  <ion-icon :icon="cardOutline" class="input-icon"></ion-icon>
                  <input
                    id="identification"
                    v-model="registrationForm.identification"
                    type="number"
                    class="form-input"
                    placeholder="Número de documento"
                    required
                    @input="validateIdentificationField"
                  />
                </div>
                <span v-if="validationErrors.identification" class="error-message">{{ validationErrors.identification }}</span>
              </div>

              <div class="form-group">
                <label for="phone" class="form-label">Teléfono</label>
                <div class="input-wrapper-kinetic" :class="{ 'error': validationErrors.phone }">
                  <ion-icon :icon="callOutline" class="input-icon"></ion-icon>
                  <input
                    id="phone"
                    v-model="registrationForm.phone"
                    type="tel"
                    class="form-input"
                    placeholder="300..."
                    @input="validatePhoneField"
                  />
                </div>
                <span v-if="validationErrors.phone" class="error-message">{{ validationErrors.phone }}</span>
              </div>

              <div class="form-group">
                <label for="password" class="form-label">Contraseña Temporal</label>
                <div class="input-wrapper-kinetic" :class="{ 'error': validationErrors.password }">
                  <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                  <input
                    id="password"
                    v-model="registrationForm.password"
                    type="password"
                    class="form-input"
                    placeholder="••••••••"
                    required
                    @input="validatePasswordField"
                  />
                </div>
                <span v-if="validationErrors.password" class="error-message">{{ validationErrors.password }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn" :disabled="isRegistrationLoading">
                <span v-if="isRegistrationLoading">Registrando...</span>
                <span v-else>Confirmar Registro</span>
              </button>
            </div>
          </form>
        </div>

        <div v-if="userCreationFeedback" class="success-bubble">
          <ion-icon :icon="checkmarkCircleOutline" style="font-size: 24px;"></ion-icon>
          <span>{{ userCreationFeedback }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { logout as performAdminLogout } from "../../auth/services/authService";
import { userService } from "../services/userService";
import AdminSidebar from '@/components/AdminSidebar.vue';
import {
  personOutline, mailOutline, callOutline, cardOutline, lockClosedOutline,
  checkmarkCircleOutline, arrowBackOutline, personAddOutline
} from 'ionicons/icons';

const router = useRouter();
const isMobileLayout = ref(false);
const isRegistrationLoading = ref(false);
const userCreationFeedback = ref('');
const activeSection = ref('users');

const registrationForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  identification: '',
  password: ''
});

const validationErrors = reactive<Record<string, string>>({
  firstName: '', lastName: '', email: '', phone: '', identification: '', password: ''
});

const emailSuggestionsList = ref<string[]>([]);
const isSuggestionsVisible = ref(false);
const suggestionHighlightIndex = ref(-1);

const commonEmailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'corhuila.edu.co'];

const checkResponsiveView = () => { isMobileLayout.value = window.innerWidth <= 768; };

const handleRegistrationSubmit = async () => {
  if (!performFullValidation()) return;

  try {
    isRegistrationLoading.value = true;
    const userData = {
      ...registrationForm,
      firstName: registrationForm.firstName.trim(),
      lastName: registrationForm.lastName.trim(),
      email: registrationForm.email.trim().toLowerCase(),
      identification: parseInt(registrationForm.identification)
    };

    const response = await userService.createUser(userData);
    
    if (response.success) {
      userCreationFeedback.value = 'Usuario creado exitosamente';
      resetRegistrationForm();
      setTimeout(() => router.push('/adminpanel'), 2000);
    } else {
      handleRegistrationError(response.message);
    }
  } catch (error) {
    validationErrors.email = 'Error de conexión. Inténtalo de nuevo.';
  } finally {
    isRegistrationLoading.value = false;
  }
};

const performFullValidation = () => {
  const isFirstNameValid = validateFirstNameField();
  const isLastNameValid = validateLastNameField();
  const isEmailValid = validateEmailField();
  const isIdValid = validateIdentificationField();
  const isPhoneValid = validatePhoneField();
  const isPassValid = validatePasswordField();
  return isFirstNameValid && isLastNameValid && isEmailValid && isIdValid && isPhoneValid && isPassValid;
};

const handleRegistrationError = (message: string) => {
  const lowerMsg = message?.toLowerCase() || '';
  if (lowerMsg.includes('email')) validationErrors.email = 'El correo ya está registrado';
  else if (lowerMsg.includes('identificación')) validationErrors.identification = 'La identificación ya existe';
  else validationErrors.email = message || 'Error al crear el usuario';
};

const resetRegistrationForm = () => {
  Object.keys(registrationForm).forEach(key => (registrationForm as any)[key] = '');
  Object.keys(validationErrors).forEach(key => validationErrors[key] = '');
};

const processEmailInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  emailSuggestionsList.value = [];
  isSuggestionsVisible.value = false;
  suggestionHighlightIndex.value = -1;

  if (value.includes('@')) {
    const [local, domain] = value.split('@');
    if (local) {
      emailSuggestionsList.value = commonEmailDomains
        .filter(d => d.startsWith(domain))
        .map(d => `${local}@${d}`);
      isSuggestionsVisible.value = emailSuggestionsList.value.length > 0;
    }
  }
  if (validationErrors.email) validationErrors.email = '';
};

const handleSuggestionNavigation = (event: KeyboardEvent) => {
  if (!isSuggestionsVisible.value) return;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    suggestionHighlightIndex.value = Math.min(suggestionHighlightIndex.value + 1, emailSuggestionsList.value.length - 1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    suggestionHighlightIndex.value = Math.max(suggestionHighlightIndex.value - 1, -1);
  } else if (event.key === 'Enter' && suggestionHighlightIndex.value >= 0) {
    event.preventDefault();
    selectSuggestedEmail(emailSuggestionsList.value[suggestionHighlightIndex.value]);
  } else if (event.key === 'Escape') {
    isSuggestionsVisible.value = false;
  }
};

const closeSuggestionsWithDelay = () => {
  setTimeout(() => { isSuggestionsVisible.value = false; suggestionHighlightIndex.value = -1; }, 150);
  validateEmailField();
};

const selectSuggestedEmail = (suggestion: string) => {
  registrationForm.email = suggestion;
  isSuggestionsVisible.value = false;
  validateEmailField();
};

const validateEmailField = () => {
  const email = registrationForm.email.trim();
  if (!email) return (validationErrors.email = 'El correo es requerido') && false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return (validationErrors.email = 'Correo inválido') && false;
  return (validationErrors.email = '') || true;
};

const validateFirstNameField = () => {
  const name = registrationForm.firstName.trim();
  if (!name || name.length < 2) return (validationErrors.firstName = 'Mínimo 2 caracteres') && false;
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) return (validationErrors.firstName = 'Solo letras') && false;
  return (validationErrors.firstName = '') || true;
};

const validateLastNameField = () => {
  const lastName = registrationForm.lastName.trim();
  if (!lastName || lastName.length < 2) return (validationErrors.lastName = 'Mínimo 2 caracteres') && false;
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastName)) return (validationErrors.lastName = 'Solo letras') && false;
  return (validationErrors.lastName = '') || true;
};

const validatePhoneField = () => {
  const phone = registrationForm.phone.trim();
  if (phone && !/^3\d{9}$/.test(phone)) return (validationErrors.phone = 'Debe ser un celular válido') && false;
  return (validationErrors.phone = '') || true;
};

const validatePasswordField = () => {
  if (registrationForm.password.length < 6) return (validationErrors.password = 'Mínimo 6 caracteres') && false;
  return (validationErrors.password = '') || true;
};

const validateIdentificationField = () => {
  const idStr = registrationForm.identification.toString();
  if (!idStr || idStr.length < 6 || idStr.length > 12) return (validationErrors.identification = 'Entre 6 y 12 dígitos') && false;
  return (validationErrors.identification = '') || true;
};

const navigateBackToDirectory = () => router.push('/adminpanel');
const handleAdminLogout = () => performAdminLogout();

onMounted(() => {
  checkResponsiveView();
  window.addEventListener('resize', checkResponsiveView);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkResponsiveView);
});
</script>

<style>
@import '../../../theme/AddUserPage.css';
</style>