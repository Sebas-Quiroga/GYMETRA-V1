<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="goBack" fill="clear">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Crear Cuenta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding register-page">
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

      <div class="register-container">
        <div class="register-card">
        
        <!-- Header de la tarjeta -->
        <div class="card-header">
          <h2>¡Únete a nosotros!</h2>
          <p>Crea tu cuenta en pocos pasos</p>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleRegister">
          
          <!-- Identificación -->
          <ion-item>
            <ion-icon :icon="cardOutline" slot="start"></ion-icon>
            <ion-input
              v-model="formData.identification"
              type="text"
              label="Identificación"
              label-placement="floating"
              fill="outline"
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

          <!-- Nombre y Apellido en fila para tablets/desktop -->
          <div class="name-row">
            <ion-item class="name-item">
              <ion-icon :icon="personOutline" slot="start"></ion-icon>
              <ion-input
                v-model="formData.firstName"
                label="Nombre"
                label-placement="floating"
                fill="outline"
                placeholder="Tu nombre"
                :class="{ 'ion-invalid': errors.firstName }"
                @ion-blur="validateField('firstName')"
                autocomplete="given-name"
                :maxlength="50"
                :disabled="registerLoading"
              ></ion-input>
            </ion-item>
            <div v-if="errors.firstName" class="field-error">{{ errors.firstName }}</div>

            <ion-item class="name-item">
              <ion-icon :icon="personOutline" slot="start"></ion-icon>
              <ion-input
                v-model="formData.lastName"
                label="Apellido"
                label-placement="floating"
                fill="outline"
                placeholder="Tu apellido"
                :class="{ 'ion-invalid': errors.lastName }"
                @ion-blur="validateField('lastName')"
                autocomplete="family-name"
                :maxlength="50"
                :disabled="registerLoading"
              ></ion-input>
            </ion-item>
            <div v-if="errors.lastName" class="field-error">{{ errors.lastName }}</div>
          </div>

          <!-- Correo -->
          <ion-item>
            <ion-icon :icon="mailOutline" slot="start"></ion-icon>
            <ion-input
              v-model="formData.email"
              type="email"
              label="Correo Electrónico"
              label-placement="floating"
              fill="outline"
              placeholder="correo@ejemplo.com"
              :class="{ 'ion-invalid': errors.email }"
              @ion-blur="validateField('email')"
              autocomplete="email"
              :maxlength="100"
              :disabled="registerLoading"
            ></ion-input>
          </ion-item>
          <div v-if="errors.email" class="field-error">{{ errors.email }}</div>

          <!-- Contraseña -->
          <ion-item>
            <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
            <ion-input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              label="Contraseña"
              label-placement="floating"
              fill="outline"
              placeholder="Mínimo 8 caracteres"
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

          <!-- Indicador de fortaleza de contraseña -->
          <div v-if="formData.password" class="password-strength">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :class="passwordStrength.class"
                :style="{ width: passwordStrength.percentage + '%' }"
              ></div>
            </div>
            <span :class="passwordStrength.class" class="strength-text">{{ passwordStrength.text }}</span>
          </div>

          <!-- Confirmar Contraseña -->
          <ion-item>
            <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
            <ion-input
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              label="Confirmar Contraseña"
              label-placement="floating"
              fill="outline"
              placeholder="Repite tu contraseña"
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

          <!-- Teléfono -->
          <ion-item>
            <ion-icon :icon="callOutline" slot="start"></ion-icon>
            <ion-input
              v-model="formData.phone"
              type="tel"
              label="Teléfono (Opcional)"
              label-placement="floating"
              fill="outline"
              placeholder="300 123 4567"
              :class="{ 'ion-invalid': errors.phone }"
              @ion-blur="validateField('phone')"
              @ion-input="formatPhone"
              autocomplete="tel"
              :maxlength="15"
              :disabled="registerLoading"
            ></ion-input>
          </ion-item>
          <div v-if="errors.phone" class="field-error">{{ errors.phone }}</div>

          <!-- Foto de perfil -->
          <ion-item button @click="openPhotoOptions" class="photo-item" :disabled="registerLoading">
            <ion-icon :icon="cameraOutline" slot="start"></ion-icon>
            <ion-label>Foto de Perfil (Opcional)</ion-label>
            <div slot="end" class="photo-preview">
              <img v-if="photoPreview" :src="photoPreview" alt="Vista previa" class="preview-image" />
              <ion-icon v-else :icon="addOutline" class="camera-icon"></ion-icon>
            </div>
          </ion-item>

          <!-- Checkbox con mejor texto -->
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

          <!-- Progreso del formulario -->
          <div class="form-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: formProgress + '%' }"></div>
            </div>
            <span class="progress-text">{{ Math.round(formProgress) }}% completado</span>
          </div>

          <!-- Botón de registro -->
          <div class="btn-container">
            <ion-button 
              expand="block" 
              class="register-btn" 
              :class="{ loading: registerLoading }"
              @click="handleRegister" 
              :disabled="registerLoading || !isFormValid"
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

        <!-- Footer de la tarjeta -->
        <div class="card-footer">
          <p>¿Ya tienes cuenta? 
            <a @click="goToLogin" class="login-link">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
      </div>

      <!-- Modal seleccionar foto -->
      <ion-modal :is-open="showPhotoModal" @did-dismiss="closePhotoModal">
        <div class="modal-content">
          <h2>Seleccionar Foto</h2>
          
          <div class="photo-instructions">
            <ion-icon :icon="informationCircleOutline" class="info-icon"></ion-icon>
            <p>Selecciona una foto para tu perfil. Solo se permiten archivos PNG, JPG o JPEG.</p>
          </div>
          
          <div class="btn-container">
            <ion-button @click="selectFromGallery">
              <ion-icon :icon="imagesOutline" slot="start"></ion-icon>
              Desde Galería
            </ion-button>
            <ion-button @click="takePhoto">
              <ion-icon :icon="cameraOutline" slot="start"></ion-icon>
              Tomar Foto
            </ion-button>
          </div>
          
          <div v-if="photoPreview" class="current-photo">
            <h4>Vista Previa:</h4>
            <img :src="photoPreview" alt="Foto seleccionada" class="preview-large" />
            <ion-button fill="clear" @click="removePhoto" color="danger">
              <ion-icon :icon="trashOutline" slot="start"></ion-icon>
              Eliminar foto
            </ion-button>
          </div>
          
          <div class="btn-container">
            <ion-button @click="closePhotoModal" fill="clear" color="medium">
              Cancelar
            </ion-button>
          </div>
        </div>
      </ion-modal>

      <!-- Modal de términos y condiciones -->
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
            <ion-button @click="closeTermsModal" fill="solid">
              Cerrar
            </ion-button>
          </div>
        </div>
      </ion-modal>

      <!-- Modal de política de privacidad -->
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
            <ion-button @click="closePrivacyModal" fill="solid">
              Cerrar
            </ion-button>
          </div>
        </div>
      </ion-modal>

      <!-- Input de archivo oculto -->
      <input 
        ref="fileInput" 
        type="file" 
        accept="image/png,image/jpeg,image/jpg" 
        style="display:none" 
        @change="handleFileSelect" 
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, nextTick, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonInput,
  IonLabel,
  IonCheckbox,
  IonSpinner,
  IonModal,
  alertController,
  loadingController,
} from "@ionic/vue";
import {
  arrowBackOutline,
  eyeOutline,
  eyeOffOutline,
  cameraOutline,
  imagesOutline,
  personOutline,
  mailOutline,
  lockClosedOutline,
  callOutline,
  cardOutline,
  addOutline,
  checkmarkCircleOutline,
  closeOutline,
  informationCircleOutline,
  trashOutline,
  checkmarkCircle,
  alertCircle,
  warningOutline,
  informationCircle,
} from "ionicons/icons";

// Importar el servicio de registro
import { useRegister, validateRegisterData, prepareRegisterData, type RegisterData } from "@/services/useRegister";

// Importa el CSS externo
import "@/theme/RegisterPage.css";

// Interfaces
interface FormData {
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptData: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  icon: string;
  progress: number;
  duration: number;
}

// Composable de registro
const { loading: registerLoading, error: registerError, register, clearError } = useRegister();

// Estado reactivo del formulario
const formData = reactive<FormData>({
  identification: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptData: false,
});

// Estado de errores reactivo
const errors = reactive<ValidationErrors>({});

// Estado de notificaciones
const notification = reactive<NotificationState>({
  show: false,
  type: 'info',
  title: '',
  message: '',
  icon: informationCircle,
  progress: 0,
  duration: 5000,
});

// Estados adicionales
const photoUrl = ref("");
const photoPreview = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showPhotoModal = ref(false);
const showTermsModal = ref(false);
const showPrivacyModal = ref(false);
const fileInput = ref<HTMLInputElement>();

// Router
const router = useRouter();

// Variable para el temporizador de notificación
let notificationTimer: NodeJS.Timeout | null = null;
let notificationProgressTimer: NodeJS.Timeout | null = null;

// Funciones de notificación mejoradas
const showNotification = (
  type: NotificationState['type'], 
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

// Reglas de validación optimizadas
const validationRules = {
  identification: (value: string): string => {
    const id = value.trim();
    if (!id) return "La identificación es obligatoria";
    if (!/^\d+$/.test(id)) return "Solo se permiten números";
    if (id.length < 6 || id.length > 12) return "Debe tener entre 6 y 12 dígitos";
    return "";
  },

  firstName: (value: string): string => {
    const name = value.trim();
    if (!name) return "El nombre es obligatorio";
    if (name.length < 2) return "Mínimo 2 caracteres";
    if (name.length > 50) return "Máximo 50 caracteres";
    if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(name)) return "Solo se permiten letras y espacios";
    return "";
  },

  lastName: (value: string): string => {
    const name = value.trim();
    if (!name) return "El apellido es obligatorio";
    if (name.length < 2) return "Mínimo 2 caracteres";
    if (name.length > 50) return "Máximo 50 caracteres";
    if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(name)) return "Solo se permiten letras y espacios";
    return "";
  },

  email: (value: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValue = value.trim().toLowerCase();
    if (!emailValue) return "El correo electrónico es obligatorio";
    if (emailValue.length > 100) return "El correo es demasiado largo";
    if (!emailRegex.test(emailValue)) return "Ingresa un correo válido";
    return "";
  },

  password: (value: string): string => {
    if (!value) return "La contraseña es obligatoria";
    if (value.length < 8) return "Mínimo 8 caracteres";
    if (value.length > 100) return "Máximo 100 caracteres";
    return "";
  },

  confirmPassword: (value: string, password: string): string => {
    if (!value) return "Confirma tu contraseña";
    if (password !== value) return "Las contraseñas no coinciden";
    return "";
  },

  phone: (value: string): string => {
    if (value && value.trim().length > 0) {
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
      if (!/^\+?[\d]+$/.test(cleanPhone)) return "Formato de teléfono inválido";
      if (cleanPhone.length < 7 || cleanPhone.length > 15) return "El teléfono debe tener entre 7 y 15 dígitos";
    }
    return "";
  },

  acceptData: (value: boolean): string => {
    return value ? "" : "Debes aceptar los términos y condiciones";
  },
};

// Función de validación optimizada
const validateField = (fieldName: keyof FormData): boolean => {
  let errorMessage = "";
  
  switch (fieldName) {
    case 'identification':
      errorMessage = validationRules.identification(formData.identification);
      break;
    case 'firstName':
      errorMessage = validationRules.firstName(formData.firstName);
      break;
    case 'lastName':
      errorMessage = validationRules.lastName(formData.lastName);
      break;
    case 'email':
      errorMessage = validationRules.email(formData.email);
      // Normalizar email
      if (!errorMessage) {
        formData.email = formData.email.trim().toLowerCase();
      }
      break;
    case 'password':
      errorMessage = validationRules.password(formData.password);
      // Revalidar confirmPassword si ya tiene valor
      if (!errorMessage && formData.confirmPassword) {
        validateField('confirmPassword');
      }
      break;
    case 'confirmPassword':
      errorMessage = validationRules.confirmPassword(formData.confirmPassword, formData.password);
      break;
    case 'phone':
      errorMessage = validationRules.phone(formData.phone);
      break;
    case 'acceptData':
      errorMessage = validationRules.acceptData(formData.acceptData);
      break;
  }

  if (errorMessage) {
    errors[fieldName] = errorMessage;
    return false;
  } else {
    delete errors[fieldName];
    return true;
  }
};

// Validar todo el formulario
const validateAllFields = (): boolean => {
  const fields: (keyof FormData)[] = [
    'identification', 'firstName', 'lastName', 
    'email', 'password', 'confirmPassword', 'phone', 'acceptData'
  ];
  
  let isValid = true;
  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  return isValid;
};

// Computed properties
const isFormValid = computed(() => {
  return Object.keys(errors).length === 0 &&
         formData.identification.trim() !== "" &&
         formData.firstName.trim() !== "" &&
         formData.lastName.trim() !== "" &&
         formData.email.trim() !== "" &&
         formData.password !== "" &&
         formData.confirmPassword !== "" &&
         formData.acceptData;
});

const formProgress = computed(() => {
  let completed = 0;
  const totalFields = 7;

  if (formData.identification.trim() && !errors.identification) completed++;
  if (formData.firstName.trim() && !errors.firstName) completed++;
  if (formData.lastName.trim() && !errors.lastName) completed++;
  if (formData.email.trim() && !errors.email) completed++;
  if (formData.password && !errors.password) completed++;
  if (formData.confirmPassword && !errors.confirmPassword) completed++;
  if (formData.acceptData) completed++;

  return (completed / totalFields) * 100;
});

const passwordStrength = computed(() => {
  const pwd = formData.password;
  if (!pwd) return { percentage: 0, text: '', class: '' };

  let score = 0;
  let feedback = [];

  if (pwd.length >= 8) score += 25;
  else feedback.push('8+ caracteres');

  if (/[A-Z]/.test(pwd)) score += 25;
  else feedback.push('mayúscula');

  if (/[a-z]/.test(pwd)) score += 25;
  else feedback.push('minúscula');

  if (/[\d\W]/.test(pwd)) score += 25;
  else feedback.push('número/símbolo');

  if (score < 50) {
    return { 
      percentage: score, 
      text: `Débil (falta: ${feedback.join(', ')})`, 
      class: 'weak' 
    };
  } else if (score < 75) {
    return { 
      percentage: score, 
      text: 'Media', 
      class: 'medium' 
    };
  } else if (score < 100) {
    return { 
      percentage: score, 
      text: 'Buena', 
      class: 'good' 
    };
  } else {
    return { 
      percentage: score, 
      text: 'Excelente', 
      class: 'excellent' 
    };
  }
});

// Funciones de utilidad
const preventInvalidChars = (event: KeyboardEvent) => {
  const allowedKeys = ['Backspace', 'Tab', 'Enter', 'Delete', 'ArrowLeft', 'ArrowRight'];
  if (!allowedKeys.includes(event.key) && !/\d/.test(event.key)) {
    event.preventDefault();
  }
};

const formatPhone = () => {
  const value = formData.phone.replace(/\D/g, '');
  if (value.length <= 10) {
    formData.phone = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3').trim();
  }
};

// Funciones de UI
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const toggleAcceptData = () => {
  formData.acceptData = !formData.acceptData;
  validateField('acceptData');
};

const goBack = () => {
  router.back();
};

const goToLogin = () => {
  router.push("/login");
};

// Funciones de modales
const showTerms = () => {
  showTermsModal.value = true;
};

const closeTermsModal = () => {
  showTermsModal.value = false;
};

const showPrivacy = () => {
  showPrivacyModal.value = true;
};

const closePrivacyModal = () => {
  showPrivacyModal.value = false;
};

// Funciones de foto
const openPhotoOptions = () => {
  showPhotoModal.value = true;
};

const closePhotoModal = () => {
  showPhotoModal.value = false;
};

const selectFromGallery = () => {
  if (fileInput.value) {
    fileInput.value.accept = "image/png,image/jpeg,image/jpg";
    fileInput.value.click();
  }
  closePhotoModal();
};

const takePhoto = () => {
  if (fileInput.value) {
    fileInput.value.accept = "image/png,image/jpeg,image/jpg";
    fileInput.value.capture = "camera";
    fileInput.value.click();
  }
  closePhotoModal();
};

const removePhoto = () => {
  photoPreview.value = "";
  photoUrl.value = "";
  closePhotoModal();
};

const resizeImage = (file: File, maxSize: number = 150): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      const aspectRatio = width / height;
      
      if (width > height) {
        width = Math.min(width, maxSize);
        height = width / aspectRatio;
      } else {
        height = Math.min(height, maxSize);
        width = height * aspectRatio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      let quality = 0.8;
      let base64 = canvas.toDataURL('image/jpeg', quality);
      
      while (base64.length > 100000 && quality > 0.1) {
        quality -= 0.1;
        base64 = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve(base64);
    };
    
    img.onerror = () => reject(new Error('Error al procesar la imagen'));
    img.src = URL.createObjectURL(file);
  });
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showNotification('warning', 'Formato no válido', 'Solo se permiten archivos PNG, JPG o JPEG', 4000);
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('warning', 'Archivo muy grande', 'La imagen debe ser menor a 5MB', 4000);
      return;
    }
    
    const loading = await loadingController.create({
      message: 'Procesando imagen...',
    });
    await loading.present();
    
    try {
      photoPreview.value = URL.createObjectURL(file);
      const base64 = await resizeImage(file, 150);
      photoUrl.value = base64;
      
      await loading.dismiss();
      showNotification('success', 'Imagen cargada', '✅ Imagen procesada correctamente', 3000);
    } catch (error) {
      await loading.dismiss();
      showNotification('error', 'Error de imagen', 'Error al procesar la imagen', 4000);
      console.error('Error procesando imagen:', error);
    }
  }
  
  target.value = '';
};

// Función principal de registro optimizada
const handleRegister = async () => {
  // Limpiar errores previos y notificaciones
  clearError();
  dismissNotification();

  // Validar todos los campos
  if (!validateAllFields()) {
    showNotification('warning', 'Formulario incompleto', 'Por favor corrige los errores marcados en rojo', 5000);
    return;
  }

  try {
    // Preparar datos para el envío
    const rawData: RegisterData = {
      identification: formData.identification.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      phone: formData.phone.replace(/[\s\-\(\)]/g, ''),
      photoUrl: photoUrl.value
    };

    // Limpiar y formatear datos
    const registerData = prepareRegisterData(rawData);

    // Validación adicional usando el helper
    const validation = validateRegisterData(registerData);
    if (!validation.isValid) {
      console.error('Errores de validación:', validation.errors);
      
      // Mostrar errores específicos en los campos
      Object.keys(validation.errors).forEach(field => {
        errors[field] = validation.errors[field];
      });
      
      showNotification('error', 'Datos inválidos', 'Revisa los campos marcados en rojo', 5000);
      return;
    }

    console.log('📝 Iniciando registro con datos:', {
      ...registerData,
      password: '***'
    });

    // Mostrar notificación de carga
    showNotification('info', 'Creando cuenta', 'Procesando tu registro...', 10000);

    // Llamar al servicio de registro
    const response = await register(registerData);

    console.log('🔍 Respuesta del registro:', response);

    // Manejar diferentes tipos de respuesta del backend
    if (response && response.success !== false) {
      // Registro exitoso
      dismissNotification();
      
      const successMessage = response.message || 'Cuenta creada exitosamente';
      showNotification('success', '🎉 ¡Registro Exitoso!', successMessage, 6000);
      
      const alert = await alertController.create({
        header: '🎉 ¡Bienvenido!',
        message: 'Tu cuenta ha sido creada correctamente. Serás redirigido al inicio de sesión.',
        buttons: [{
          text: 'Continuar',
          handler: () => {
            clearForm();
            setTimeout(() => {
              router.push("/login");
            }, 500);
          }
        }]
      });
      await alert.present();

    } else {
      // Error de registro
      dismissNotification();
      
      const errorMsg = response?.message || "Error al registrar usuario";
      console.error('❌ Error de registro:', errorMsg);
      
      // Determinar el tipo de error para la notificación
      let notificationType: 'error' | 'warning' = 'error';
      let notificationTitle = 'Error de registro';
      
      if (errorMsg.toLowerCase().includes('existe') || 
          errorMsg.toLowerCase().includes('duplicado') ||
          errorMsg.toLowerCase().includes('ya registrado')) {
        notificationType = 'warning';
        notificationTitle = 'Usuario existente';
      }
      
      showNotification(notificationType, notificationTitle, errorMsg, 6000);
    }

  } catch (err: any) {
    console.error('💥 Error en handleRegister:', err);
    dismissNotification();
    
    // Determinar el tipo de error
    let errorMessage = 'Error inesperado al registrar usuario';
    let notificationTitle = 'Error del sistema';
    
    if (err.message) {
      errorMessage = err.message;
      
      // Errores específicos del backend
      if (err.message.includes('network') || err.message.includes('conexión')) {
        notificationTitle = 'Error de conexión';
        errorMessage = 'Verifica tu conexión a internet e intenta nuevamente';
      } else if (err.message.includes('timeout')) {
        notificationTitle = 'Tiempo agotado';
        errorMessage = 'La operación tardó demasiado. Intenta nuevamente';
      } else if (err.message.includes('servidor') || err.status >= 500) {
        notificationTitle = 'Error del servidor';
        errorMessage = 'Problema en nuestros servidores. Intenta más tarde';
      } else if (err.status === 400) {
        notificationTitle = 'Datos inválidos';
        errorMessage = 'Los datos enviados no son válidos';
      } else if (err.status === 409) {
        notificationTitle = 'Usuario existente';
        errorMessage = 'Ya existe una cuenta con estos datos';
      }
    }
    
    showNotification('error', notificationTitle, errorMessage, 8000);
  }
};

// Función para limpiar el formulario
const clearForm = () => {
  // Limpiar datos del formulario
  formData.identification = "";
  formData.firstName = "";
  formData.lastName = "";
  formData.email = "";
  formData.password = "";
  formData.confirmPassword = "";
  formData.phone = "";
  formData.acceptData = false;
  
  // Limpiar foto
  photoUrl.value = "";
  photoPreview.value = "";
  
  // Limpiar errores
  Object.keys(errors).forEach(key => delete errors[key]);
  
  // Limpiar notificaciones
  dismissNotification();
};

// Watchers optimizados para validación en tiempo real
const createFieldWatcher = (fieldName: keyof FormData) => {
  return watch(
    () => formData[fieldName],
    (newVal) => {
      if (errors[fieldName] && newVal) {
        // Solo revalidar si hay error y el campo tiene contenido
        setTimeout(() => validateField(fieldName), 300); // Debounce de 300ms
      }
    }
  );
};

// Crear watchers para todos los campos
onMounted(() => {
  createFieldWatcher('identification');
  createFieldWatcher('firstName');
  createFieldWatcher('lastName');
  createFieldWatcher('email');
  createFieldWatcher('password');
  createFieldWatcher('confirmPassword');
  createFieldWatcher('phone');
  createFieldWatcher('acceptData');
  
  // Enfocar el primer campo al cargar
  nextTick(() => {
    const firstInput = document.querySelector('.register-card ion-input') as any;
    if (firstInput) {
      firstInput.setFocus();
    }
  });
});

// Limpiar timers al desmontar el componente
onUnmounted(() => {
  if (notificationTimer) clearTimeout(notificationTimer);
  if (notificationProgressTimer) clearInterval(notificationProgressTimer);
});
</script>

<style scoped>
/* Los estilos están en el archivo CSS externo */
@import "@/theme/RegisterPage.css";
</style>