<template>
  <ion-page>
    <!-- Header con botón de regreso -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Registro Usuario</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding register-page">
      <!-- Card principal del registro -->
      <div class="register-card">
        
        <!-- Campo Usuario -->
        <ion-item>
          <ion-input
            v-model="usuario"
            label="Usuario"
            label-placement="floating"
            fill="outline"
            placeholder="Nombre de usuario"
          ></ion-input>
        </ion-item>

        <!-- Campo Correo -->
        <ion-item>
          <ion-input
            v-model="correo"
            type="email"
            label="Correo"
            label-placement="floating"
            fill="outline"
            placeholder="correo@ejemplo.com"
          ></ion-input>
        </ion-item>

        <!-- Campo Contraseña -->
        <ion-item>
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

        <!-- Campo Confirmar Contraseña -->
        <ion-item>
          <ion-input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Confirmar Contraseña"
            label-placement="floating"
            fill="outline"
            placeholder="Confirmar contraseña"
          ></ion-input>
          <ion-icon
            slot="end"
            :icon="showConfirmPassword ? eyeOffOutline : eyeOutline"
            @click="toggleConfirmPassword"
            style="cursor: pointer"
          ></ion-icon>
        </ion-item>

        <!-- Campo Fecha de nacimiento -->
        <ion-item button @click="openDatePicker">
          <ion-input
            :value="fechaNacimiento"
            label="Fecha de nacimiento"
            label-placement="floating"
            fill="outline"
            placeholder="Selecciona tu fecha"
            readonly
          ></ion-input>
          <ion-icon slot="end" :icon="calendarOutline"></ion-icon>
        </ion-item>

        <!-- Checkbox Tratamiento de datos -->
        <div class="checkbox-container">
          <ion-checkbox v-model="acceptData" class="custom-checkbox"></ion-checkbox>
          <span class="checkbox-text">Acepto tratamiento de datos</span>
        </div>

        <!-- Botón Registrarse -->
        <div class="btn-container">
          <ion-button 
            expand="block" 
            class="register-btn" 
            @click="handleRegister" 
            :disabled="loading || !isFormValid"
          >
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Registrarse</span>
          </ion-button>
        </div>

        <!-- Error -->
        <div v-if="errorMessage" class="error-msg">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Modal para seleccionar fecha -->
      <ion-modal :is-open="showDateModal" @did-dismiss="closeDateModal">
        <ion-datetime 
          v-model="selectedDate"
          presentation="date"
          :max="maxDate"
          @ion-change="onDateChange"
        ></ion-datetime>
        <div class="modal-buttons">
          <ion-button fill="clear" @click="closeDateModal">Cancelar</ion-button>
          <ion-button @click="confirmDate">Confirmar</ion-button>
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
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonInput,
  IonCheckbox,
  IonSpinner,
  IonModal,
  IonDatetime,
} from "@ionic/vue";
import {
  arrowBackOutline,
  eyeOutline,
  eyeOffOutline,
  calendarOutline,
} from "ionicons/icons";

// Estado local
const usuario = ref("");
const correo = ref("");
const password = ref("");
const confirmPassword = ref("");
const fechaNacimiento = ref("");
const acceptData = ref(false);
const loading = ref(false);
const errorMessage = ref("");

// Estados de visibilidad de contraseñas
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Modal de fecha
const showDateModal = ref(false);
const selectedDate = ref("");
const maxDate = new Date().toISOString();

// Router
const router = useRouter();

// Computed para validar el formulario
const isFormValid = computed(() => {
  return (
    usuario.value.trim() !== "" &&
    correo.value.trim() !== "" &&
    password.value.trim() !== "" &&
    confirmPassword.value.trim() !== "" &&
    fechaNacimiento.value.trim() !== "" &&
    acceptData.value &&
    password.value === confirmPassword.value
  );
});

// Funciones
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const goBack = () => {
  router.back();
};

const openDatePicker = () => {
  showDateModal.value = true;
};

const closeDateModal = () => {
  showDateModal.value = false;
};

const onDateChange = (event: any) => {
  selectedDate.value = event.detail.value;
};

const confirmDate = () => {
  if (selectedDate.value) {
    const date = new Date(selectedDate.value);
    fechaNacimiento.value = date.toLocaleDateString('es-ES');
  }
  closeDateModal();
};

const handleRegister = async () => {
  errorMessage.value = "";
  
  // Validación de contraseñas
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Las contraseñas no coinciden";
    return;
  }

  // Validación de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo.value)) {
    errorMessage.value = "Por favor ingresa un correo válido";
    return;
  }

  loading.value = true;

  try {
    // Aquí iría la lógica de registro
    // const res = await register({
    //   usuario: usuario.value,
    //   correo: correo.value,
    //   password: password.value,
    //   fechaNacimiento: fechaNacimiento.value
    // });
    
    // Simulación de registro exitoso
    setTimeout(() => {
      loading.value = false;
      router.push("/login");
    }, 2000);
    
  } catch (err: any) {
    errorMessage.value = err.message || "Error al registrar usuario";
    loading.value = false;
  }
};
</script>

<style scoped>
/* Estilos de la página de registro */
.register-page {
  background: #07B7E0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

/* Card principal del registro */
.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 30px 25px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  max-width: 400px;
  width: 100%;
  position: relative;
  animation: cardSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

.register-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #07B7E0, #0ea5e9, #3b82f6);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shimmer {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

/* Inputs estilizados */
.register-card ion-item {
  --background: rgba(245, 245, 245, 0.9);
  --border-radius: 15px;
  --padding-start: 20px;
  --padding-end: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.register-card ion-item:hover {
  --background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.register-card ion-item:focus-within {
  --background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(7, 183, 224, 0.2);
  border-color: rgba(7, 183, 224, 0.3);
}

.register-card ion-item ion-input {
  --color: #333;
  --placeholder-color: #999;
  font-weight: 500;
}

.register-card ion-item ion-icon {
  color: #07B7E0;
  margin-right: 10px;
  cursor: pointer;
}

/* Checkbox personalizado */
.checkbox-container {
  display: flex;
  align-items: center;
  margin: 20px 0;
  padding: 0 5px;
}

.custom-checkbox {
  margin-right: 12px;
  --color: #07B7E0;
  --color-checked: #07B7E0;
  --border-color: #07B7E0;
  --border-color-checked: #07B7E0;
  --checkmark-color: white;
}

.checkbox-text {
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Botón de registro */
.btn-container {
  display: flex;
  justify-content: center;
  margin: 25px 0 15px 0;
}

.register-btn {
  --background: #000;
  --color: white;
  --border-radius: 25px;
  --box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  width: 100%;
  height: 55px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.register-btn:hover {
  --box-shadow: 0 12px 25px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

.register-btn:active {
  transform: translateY(0px);
  --box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
}

.register-btn:disabled {
  opacity: 0.6;
  transform: none !important;
  --box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

/* Spinner del botón */
.register-btn ion-spinner {
  --color: white;
  width: 24px;
  height: 24px;
}

/* Error */
.error-msg {
  margin-top: 15px;
  padding: 12px 16px;
  background: rgba(255, 75, 75, 0.1);
  color: #ff4d4f;
  font-weight: 600;
  text-align: center;
  border-radius: 12px;
  border: 1px solid rgba(255, 75, 75, 0.2);
  animation: errorShake 0.5s ease-in-out;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Header personalizado */
ion-header ion-toolbar {
  --background: #07B7E0;
  --color: white;
}

ion-header ion-title {
  color: white;
  font-weight: 600;
}

ion-header ion-button {
  --color: white;
}

/* Modal buttons */
.modal-buttons {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: white;
}

.modal-buttons ion-button {
  width: 120px;
}

/* Responsive */
@media (max-width: 480px) {
  .register-card {
    padding: 25px 20px;
    margin: 10px;
    border-radius: 20px;
  }
  
  .register-btn {
    height: 50px;
    font-size: 1rem;
  }
}
</style>