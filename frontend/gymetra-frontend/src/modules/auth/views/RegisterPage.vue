<template>
  <ion-page>
    <div class="register-header" role="banner">
      <div class="header-side header-left">
        <button class="register-back-btn" @click="goBack" aria-label="Volver">
          <ArrowLeft :size="22" stroke-width="2.5" />
        </button>
      </div>
      <router-link to="/home" class="header-logo-link" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="brand-name-header">GYMETRA</span>
      </router-link>
      <div class="header-side header-right">
      </div>
    </div>
    <ion-content class="register-page-content">
      <ion-modal :is-open="isVerifying" class="kinetic-modal">
        <div class="modal-content verification-modal">
          <h2>Verifica tu cuenta</h2>
          <p class="verification-sub">Hemos enviado un código de 6 dígitos a <strong>{{ formData.email }}</strong></p>
          <div class="code-container">
            <ion-item lines="none" class="verification-item">
              <ion-input
                v-model="verificationCode"
                type="text"
                placeholder="000000"
                :maxlength="6"
                class="code-input"
                text-center
              ></ion-input>
            </ion-item>
          </div>
          <div class="btn-container">
            <ion-button expand="block" class="register-btn" @click="handleVerification" :disabled="confirmLoading">
              <ion-spinner v-if="confirmLoading" name="crescent"></ion-spinner>
              <span v-else>Confirmar Código</span>
            </ion-button>
            <ion-button fill="clear" class="resend-btn" @click="handleResendCode" :disabled="confirmLoading">
              Reenviar código
            </ion-button>
          </div>
        </div>
      </ion-modal>



      <div class="register-container">
        <div class="register-card">
          <div class="card-header">
            <img src="/logo.png" alt="Logo" class="card-logo" />
            <h1 class="brand-name-card">GYMETRA</h1>
            <p class="brand-tagline">Únete a la revolución fitness</p>
          </div>

          <form @submit.prevent="handleRegister">
          <ion-item lines="none">
            <ion-icon :icon="cardOutline" slot="start"></ion-icon>
            <ion-input
              v-model="formData.identification"
              type="text"
              placeholder="Número de identificación"
              :maxlength="12"
              :class="{ 'ion-invalid': errors.identification }"
              @ion-blur="validateField('identification')"
              @keydown="preventInvalidChars"
              inputmode="numeric"
              autocomplete="off"
              :disabled="registerLoading"
            ></ion-input>
          </ion-item>
          <div v-if="errors.identification" class="field-error">{{ errors.identification }}</div>

          <div class="name-row">
            <ion-item class="name-item" lines="none">
              <ion-icon :icon="personOutline" slot="start"></ion-icon>
              <ion-input
                v-model="formData.firstName"
                placeholder="Nombre"
                :class="{ 'ion-invalid': errors.firstName }"
                @ion-blur="validateField('firstName')"
                autocomplete="given-name"
                :maxlength="50"
                :disabled="registerLoading"
              ></ion-input>
            </ion-item>
            <div v-if="errors.firstName" class="field-error">{{ errors.firstName }}</div>

            <ion-item class="name-item" lines="none">
              <ion-icon :icon="personOutline" slot="start"></ion-icon>
              <ion-input
                v-model="formData.lastName"
                placeholder="Apellido"
                :class="{ 'ion-invalid': errors.lastName }"
                @ion-blur="validateField('lastName')"
                autocomplete="family-name"
                :maxlength="50"
                :disabled="registerLoading"
              ></ion-input>
            </ion-item>
            <div v-if="errors.lastName" class="field-error">{{ errors.lastName }}</div>
          </div>

          <ion-item lines="none">
            <ion-icon :icon="mailOutline" slot="start"></ion-icon>
            <ion-input
              v-model="formData.email"
              type="email"
              placeholder="Correo electrónico"
              :class="{ 'ion-invalid': errors.email }"
              @ion-blur="validateField('email')"
              autocomplete="email"
              :maxlength="100"
              :disabled="registerLoading"
            ></ion-input>
          </ion-item>
          <div v-if="errors.email" class="field-error">{{ errors.email }}</div>

          <ion-item lines="none">
            <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
            <ion-input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Contraseña (Mín. 8 caracteres)"
              :class="{ 'ion-invalid': errors.password }"
              @ion-blur="validateField('password')"
              autocomplete="new-password"
              :maxlength="100"
              :disabled="registerLoading"
            ></ion-input>
            <ion-icon
              slot="end"
              :icon="showPassword ? eyeOffOutline : eyeOutline"
              @click="togglePassword"
              class="password-toggle"
            ></ion-icon>
          </ion-item>
          <div v-if="errors.password" class="field-error">{{ errors.password }}</div>

          <div v-if="formData.password" class="password-strength">
            <div class="strength-bar">
              <div
                class="strength-fill"
                :class="passwordStrengthInfo.class"
                :style="{ width: passwordStrengthInfo.percentage + '%' }"
              ></div>
            </div>
            <span :class="passwordStrengthInfo.class" class="strength-text">{{ passwordStrengthInfo.text }}</span>
          </div>

          <ion-item lines="none">
            <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
            <ion-input
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirmar contraseña"
              :class="{ 'ion-invalid': errors.confirmPassword }"
              @ion-blur="validateField('confirmPassword')"
              autocomplete="new-password"
              :maxlength="100"
              :disabled="registerLoading"
            ></ion-input>
            <ion-icon
              slot="end"
              :icon="showConfirmPassword ? eyeOffOutline : eyeOutline"
              @click="toggleConfirmPassword"
              class="password-toggle"
            ></ion-icon>
          </ion-item>
          <div v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</div>

          <ion-item lines="none">
            <ion-icon :icon="callOutline" slot="start"></ion-icon>
            <ion-input
              v-model="formData.phone"
              type="tel"
              placeholder="Teléfono (Opcional)"
              :class="{ 'ion-invalid': errors.phone }"
              @ion-blur="validateField('phone')"
              @ion-input="formatPhone"
              autocomplete="tel"
              :maxlength="15"
              :disabled="registerLoading"
            ></ion-input>
          </ion-item>
          <div v-if="errors.phone" class="field-error">{{ errors.phone }}</div>

          <ion-item button @click="triggerFileInput" class="photo-item" :disabled="registerLoading" lines="none">
            <ion-icon :icon="cameraOutline" slot="start"></ion-icon>
            <ion-label>Foto de Perfil (Opcional)</ion-label>
            <div slot="end" class="photo-preview">
              <img v-if="photoPreview" :src="photoPreview" alt="Vista previa" class="preview-image" />
              <ion-icon v-else :icon="addOutline" class="camera-icon"></ion-icon>
            </div>
          </ion-item>

          <div class="checkbox-container">
            <ion-checkbox
              v-model="formData.acceptData"
              class="custom-checkbox"
              :disabled="registerLoading"
              @ionChange="validateField('acceptData')"
            ></ion-checkbox>
            <div class="checkbox-content" @click="toggleAcceptData">
              <span class="checkbox-text">
                Acepto los
                <span @click.stop="showTerms" class="terms-link">términos y condiciones</span>
                y el
                <span @click.stop="showPrivacy" class="terms-link">tratamiento de datos personales</span>
              </span>
            </div>
          </div>
          <div v-if="errors.acceptData" class="field-error">{{ errors.acceptData }}</div>

          <div class="form-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: formProgressValue + '%' }"></div>
            </div>
            <span class="progress-text">{{ Math.round(formProgressValue) }}% completado</span>
          </div>

          <div class="btn-container">
            <ion-button
              expand="block"
              class="register-btn"
              :class="{ loading: registerLoading }"
              @click="handleRegister"
              :disabled="registerLoading || !isFormFullyValid"
              type="submit"
            >
              <ion-spinner v-if="registerLoading" name="crescent"></ion-spinner>
              <span v-else>
                <ion-icon :icon="checkmarkCircleOutline" class="btn-icon"></ion-icon>
                Crear Mi Cuenta
              </span>
            </ion-button>
          </div>
        </form>

        <div class="card-footer">
          <p>¿Ya tienes cuenta?
            <a @click="goToLogin" class="login-link">Inicia sesión aquí</a>
          </p>
        </div>
        </div>
      </div>

      <ion-modal :is-open="showTermsModal" @did-dismiss="closeTermsModal">
        <div class="modal-content">
          <h2>Términos y Condiciones</h2>
          <div class="modal-scroll-content">
            <p><strong>1. Aceptación:</strong> Al crear tu cuenta en GYMETRA, aceptas estos términos de uso.</p>
            <p><strong>2. Uso del servicio:</strong> Destinado a mayores de 18 años para mejorar su condición física.</p>
            <p><strong>3. Tus responsabilidades:</strong><br>
            • Proporcionar información precisa<br>
            • Mantener la confidencialidad de tu cuenta<br>
            • No compartir contenido inapropiado<br>
            • Seguir las recomendaciones de seguridad</p>
            <p><strong>4. Limitación de responsabilidad:</strong> GYMETRA no se hace responsable por lesiones durante el ejercicio. Consulta a un médico antes de comenzar.</p>
            <p><strong>5. Modificaciones:</strong> Nos reservamos el derecho de modificar estos términos. Te notificaremos los cambios.</p>
            <p><strong>6. Terminación:</strong> Podemos suspender tu cuenta si violas estos términos.</p>
            <p>Al continuar, aceptas estos términos.</p>
          </div>
          <div class="btn-container">
            <ion-button @click="closeTermsModal" fill="solid">Cerrar</ion-button>
          </div>
        </div>
      </ion-modal>

      <ion-modal :is-open="showPrivacyModal" @did-dismiss="closePrivacyModal">
        <div class="modal-content">
          <h2>Política de Privacidad</h2>
          <div class="modal-scroll-content">
            <p><strong>1. Responsable:</strong> GYMETRA es responsable del tratamiento de tus datos personales.</p>
            <p><strong>2. Datos que recopilamos:</strong><br>
            • Información de identificación (nombre, documento, email)<br>
            • Datos de contacto (teléfono)<br>
            • Información de salud y fitness (opcional)<br>
            • Fotografía de perfil (opcional)</p>
            <p><strong>3. Finalidad:</strong><br>
            • Crear y gestionar tu cuenta<br>
            • Personalizar tu experiencia<br>
            • Enviar notificaciones relevantes<br>
            • Mejorar nuestros servicios</p>
            <p><strong>4. Base legal:</strong> El tratamiento se basa en tu consentimiento y la ejecución del contrato.</p>
            <p><strong>5. Conservación:</strong> Tus datos se conservarán mientras mantengas tu cuenta activa y hasta 5 años después.</p>
            <p><strong>6. Tus derechos:</strong><br>
            • Acceder a tus datos<br>
            • Rectificar información incorrecta<br>
            • Solicitar la eliminación<br>
            • Revocar el consentimiento</p>
            <p><strong>7. Seguridad:</strong> Implementamos medidas técnicas y organizativas para proteger tus datos.</p>
            <p>Para ejercer tus derechos, contáctanos a través de la aplicación.</p>
          </div>
          <div class="btn-container">
            <ion-button @click="closePrivacyModal" fill="solid">Cerrar</ion-button>
          </div>
        </div>
      </ion-modal>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        style="display:none"
        @change="handleFileSelect"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import {
  IonPage, IonContent, IonItem, IonInput, IonCheckbox, IonSpinner,
  IonModal, IonButton, IonIcon, loadingController, IonLabel
} from "@ionic/vue";
import {
  eyeOutline, eyeOffOutline, cameraOutline, personOutline, mailOutline,
  lockClosedOutline, callOutline, cardOutline, addOutline, checkmarkCircleOutline,
  closeOutline, informationCircle
} from "ionicons/icons";
import { ArrowLeft } from '@lucide/vue';

import { useRegister, prepareRegisterData, validateRegisterData, type RegisterData } from "../services/authRegister";
import { useNotification } from "../../shared/composables/useNotification";
import { resizeImage } from "../../shared/utils/imageUtils";
import { validationRules } from "../utils/registerValidator";

const router = useRouter();
const { notification, showNotification, dismissNotification } = useNotification();
const { loading: registerLoading, register, confirmRegistration, resendSignUpCode, clearError } = useRegister();

const formData = reactive({
  identification: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptData: false,
});

const errors = reactive<Record<string, string>>({});
const photoUrl = ref("");
const photoPreview = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showTermsModal = ref(false);
const showPrivacyModal = ref(false);
const isVerifying = ref(false);
const verificationCode = ref("");
const confirmLoading = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const validateField = (fieldName: keyof typeof formData) => {
  const value = formData[fieldName];
  let errorMessage = "";

  if (fieldName === 'confirmPassword') {
    errorMessage = validationRules.confirmPassword(value as string, formData.password);
  } else if (fieldName === 'acceptData') {
    errorMessage = validationRules.acceptData(value as boolean);
  } else {
    errorMessage = (validationRules as any)[fieldName](value as string);
  }

  if (errorMessage) {
    errors[fieldName] = errorMessage;
    return false;
  }

  delete errors[fieldName];
  if (fieldName === 'password' && formData.confirmPassword) validateField('confirmPassword');
  return true;
};

const validateAllFields = () => {
  let isValid = true;
  (Object.keys(formData) as Array<keyof typeof formData>).forEach(field => {
    if (!validateField(field)) isValid = false;
  });
  return isValid;
};

const isFormFullyValid = computed(() => {
  const hasNoErrors = Object.keys(errors).length === 0;
  const hasRequiredData = formData.identification && formData.firstName && 
                          formData.lastName && formData.email && 
                          formData.password && formData.confirmPassword && 
                          formData.acceptData;
  return hasNoErrors && hasRequiredData;
});

const formProgressValue = computed(() => {
  const fields = ['identification', 'firstName', 'lastName', 'email', 'password', 'confirmPassword', 'acceptData'];
  const completedFields = fields.filter(field => formData[field as keyof typeof formData] && !errors[field]).length;
  return (completedFields / fields.length) * 100;
});

const passwordStrengthInfo = computed(() => {
  const currentPassword = formData.password;
  if (!currentPassword) return { percentage: 0, text: '', class: '' };
  
  let score = 0;
  const strengthFeedback = [];
  
  if (currentPassword.length >= 8) score += 25; else strengthFeedback.push('8+ caracteres');
  if (/[A-Z]/.test(currentPassword)) score += 25; else strengthFeedback.push('mayúscula');
  if (/[a-z]/.test(currentPassword)) score += 25; else strengthFeedback.push('minúscula');
  if (/[\d\W]/.test(currentPassword)) score += 25; else strengthFeedback.push('número/símbolo');

  if (score < 50) return { percentage: score, text: `Débil (falta: ${strengthFeedback.join(', ')})`, class: 'weak' };
  if (score < 75) return { percentage: score, text: 'Media', class: 'medium' };
  if (score < 100) return { percentage: score, text: 'Buena', class: 'good' };
  return { percentage: score, text: 'Excelente', class: 'excellent' };
});

const handleFileSelect = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
    showNotification('warning', 'Formato no válido', 'Usa PNG o JPG');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showNotification('warning', 'Archivo muy grande', 'Máximo 5MB');
    return;
  }

  const loading = await loadingController.create({ message: 'Procesando...' });
  await loading.present();

  try {
    photoPreview.value = URL.createObjectURL(file);
    photoUrl.value = await resizeImage(file, 150);
    showNotification('success', 'Imagen cargada', 'Procesada correctamente');
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo procesar la imagen');
  } finally {
    await loading.dismiss();
    (event.target as HTMLInputElement).value = '';
  }
};

const handleRegister = async () => {
  clearError();
  dismissNotification();

  if (!validateAllFields()) {
    showNotification('warning', 'Datos incompletos', 'Revisa los campos en rojo');
    return;
  }

  const registerRequest = prepareRegisterData({
    ...formData,
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.replace(/\D/g, ''),
    photoUrl: photoUrl.value
  });

  showNotification('info', 'Procesando', 'Creando tu cuenta...');
  const response = await register(registerRequest);

  if (!response?.success) {
    showNotification('error', 'Error', response?.message || 'Error en el registro');
    return;
  }

  isVerifying.value = true;
  showNotification('success', '¡Casi listo!', 'Ingresa el código enviado a tu correo');
};

const handleVerification = async () => {
  if (verificationCode.value.length < 6) {
    showNotification('warning', 'Código incompleto', 'Ingresa los 6 dígitos');
    return;
  }

  confirmLoading.value = true;
  const response = await confirmRegistration(formData.email, verificationCode.value);
  confirmLoading.value = false;

  if (!response.success) {
    showNotification('error', 'Error', response.message);
    return;
  }

  showNotification('success', '¡Cuenta Activada!', 'Redirigiendo...');
  isVerifying.value = false;
  setTimeout(() => router.push("/login"), 1500);
};

const handleResendCode = async () => {
  const response = await resendSignUpCode(formData.email);
  const type = response.success ? 'success' : 'error';
  showNotification(type, response.success ? 'Enviado' : 'Error', response.message);
};

const formatPhone = () => {
  const value = formData.phone.replace(/\D/g, '');
  if (value.length <= 10) {
    formData.phone = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3').trim();
  }
};

const preventInvalidChars = (event: KeyboardEvent) => {
  const allowed = ['Backspace', 'Tab', 'Enter', 'Delete', 'ArrowLeft', 'ArrowRight'];
  if (!allowed.includes(event.key) && !/\d/.test(event.key)) event.preventDefault();
};

const togglePassword = () => showPassword.value = !showPassword.value;
const toggleConfirmPassword = () => showConfirmPassword.value = !showConfirmPassword.value;
const toggleAcceptData = () => { formData.acceptData = !formData.acceptData; validateField('acceptData'); };
const goBack = () => router.back();
const goToLogin = () => router.push("/login");
const showTerms = () => showTermsModal.value = true;
const closeTermsModal = () => showTermsModal.value = false;
const showPrivacy = () => showPrivacyModal.value = true;
const closePrivacyModal = () => showPrivacyModal.value = false;
const triggerFileInput = () => fileInputRef.value?.click();

onMounted(() => {
  Object.keys(formData).forEach(key => {
    watch(() => formData[key as keyof typeof formData], (val) => {
      if (errors[key] && val) setTimeout(() => validateField(key as keyof typeof formData), 300);
    });
  });

  nextTick(() => {
    (document.querySelector('ion-input') as any)?.setFocus();
  });
});
</script>

<style scoped src="../theme/RegisterPage.css"></style>
