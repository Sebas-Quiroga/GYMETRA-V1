

<template>
  <ion-page>
    <div class="pasarela-header-bar">
      <button class="pasarela-back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <span class="pasarela-header-title">Añadir nueva tarjeta</span>
    </div>
    <ion-content class="pasarela-content">
      <div class="pasarela-bg">
        <div class="pasarela-card">
          <!-- El header visual ya está en ion-header -->
          <form class="pasarela-form" @submit.prevent="handleSubmit">
            <div class="input-list">
              <div class="input-item">
                <input
                  type="text"
                  placeholder="Numero de la tarjeta"
                  class="pasarela-input"
                  v-model="form.cardNumber"
                  maxlength="16"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  @input="onCardNumberInput"
                  @blur="touched.cardNumber = true"
                />
                <div v-if="touched.cardNumber && errors.cardNumber" class="field-error">{{ errors.cardNumber }}</div>
              </div>
              <div class="input-item">
                <input
                  type="text"
                  placeholder="Nombre del titular de la tarjeta"
                  class="pasarela-input"
                  v-model="form.cardName"
                  maxlength="40"
                  @input="onCardNameInput"
                  @blur="touched.cardName = true"
                />
                <div v-if="touched.cardName && errors.cardName" class="field-error">{{ errors.cardName }}</div>
              </div>
              <div class="input-item">
                <input
                  type="text"
                  placeholder="MM/AA"
                  class="pasarela-input"
                  v-model="form.expiry"
                  maxlength="5"
                  @input="onExpiryInput"
                  @blur="touched.expiry = true"
                />
                <div v-if="touched.expiry && errors.expiry" class="field-error">{{ errors.expiry }}</div>
              </div>
              <div class="input-item">
                <input
                  type="text"
                  placeholder="CCV"
                  class="pasarela-input"
                  v-model="form.ccv"
                  maxlength="4"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  @input="onCCVInput"
                  @blur="touched.ccv = true"
                />
                <div v-if="touched.ccv && errors.ccv" class="field-error">{{ errors.ccv }}</div>
              </div>
            </div>
            <div class="card-icons">
              <img v-if="cardType === 'visa'" src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" />
              <img v-if="cardType === 'mastercard'" src="https://img.icons8.com/color/48/000000/mastercard-logo.png" alt="Mastercard" />
              <img v-if="cardType === 'amex'" src="https://img.icons8.com/color/48/000000/amex.png" alt="Amex" />
              <template v-if="!cardType">
                <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" style="opacity:0.4;" />
                <img src="https://img.icons8.com/color/48/000000/mastercard-logo.png" alt="Mastercard" style="opacity:0.4;" />
                <img src="https://img.icons8.com/color/48/000000/amex.png" alt="Amex" style="opacity:0.4;" />
              </template>
            </div>
            <div class="checkbox-row" style="align-items: flex-start; flex-direction: row; gap: 8px;">
              <input type="checkbox" id="save-card" class="pasarela-checkbox" :disabled="!isFormValid" />
              <label for="save-card" class="pasarela-checkbox-label" style="font-weight: 700; color: #888; margin-top: 2px;">
                Acepto el tratamiento de mis datos personales para procesar el pago conforme a la política de privacidad.
              </label>
            </div>
            <div style="margin-top: 8px; margin-bottom: 8px;">
              <span style="font-size: 13px; color: #222; max-width: 320px; font-weight: 500; display: block;">
                Consulta los detalles en nuestra <a href="#" style="color: #07B7E0; text-decoration: underline;">Política de Privacidad</a>.
              </span>
            </div>
            <button type="submit" class="pasarela-btn" :disabled="!isFormValid">Comprar</button>
          </form>
        </div>
        <div class="pasarela-footer"></div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { arrowBackOutline } from 'ionicons/icons';

const form = reactive({
  cardNumber: '',
  cardName: '',
  expiry: '',
  ccv: ''
});
const errors = reactive({
  cardNumber: '',
  cardName: '',
  expiry: '',
  ccv: ''
});
const touched = reactive({
  cardNumber: false,
  cardName: false,
  expiry: false,
  ccv: false
});

const cardType = computed(() => {
  const n = form.cardNumber;
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return '';
});

const isFormValid = computed(() => {
  return (
    !errors.cardNumber &&
    !errors.cardName &&
    !errors.expiry &&
    !errors.ccv &&
    form.cardNumber &&
    form.cardName &&
    form.expiry &&
    form.ccv
  );
});

function onCardNumberInput(e: Event) {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
  form.cardNumber = val;
  validateCardNumber();
}
function onCardNameInput(e: Event) {
  const val = (e.target as HTMLInputElement).value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
  form.cardName = val;
  validateCardName();
}
function onExpiryInput(e: Event) {
  let val = (e.target as HTMLInputElement).value.replace(/[^0-9/]/g, '');
  if (val.length === 2 && !val.includes('/')) val = val + '/';
  form.expiry = val.slice(0, 5);
  validateExpiry();
}
function onCCVInput(e: Event) {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
  form.ccv = val;
  validateCCV();
}

function validateCardNumber() {
  if (!form.cardNumber) {
    errors.cardNumber = 'Ingrese el número de la tarjeta';
  } else if (!/^\d{16}$/.test(form.cardNumber)) {
    errors.cardNumber = 'Debe tener 16 dígitos';
  } else {
    errors.cardNumber = '';
  }
}
function validateCardName() {
  if (!form.cardName) {
    errors.cardName = 'Ingrese el nombre del titular';
  } else if (!/^([a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+\s?)+$/.test(form.cardName)) {
    errors.cardName = 'Solo letras y espacios';
  } else {
    errors.cardName = '';
  }
}
function validateExpiry() {
  if (!form.expiry) {
    errors.expiry = 'Ingrese la fecha MM/AA';
  } else if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(form.expiry)) {
    errors.expiry = 'Formato inválido (MM/AA)';
  } else {
    errors.expiry = '';
  }
}
function validateCCV() {
  if (!form.ccv) {
    errors.ccv = 'Ingrese el CCV';
  } else if (!/^\d{3,4}$/.test(form.ccv)) {
    errors.ccv = 'Debe tener 3 o 4 dígitos';
  } else {
    errors.ccv = '';
  }
}

function handleSubmit() {
  touched.cardNumber = true;
  touched.cardName = true;
  touched.expiry = true;
  touched.ccv = true;
  validateCardNumber();
  validateCardName();
  validateExpiry();
  validateCCV();
  if (!errors.cardNumber && !errors.cardName && !errors.expiry && !errors.ccv) {
    // Aquí iría la lógica de envío
    alert('Datos validados y enviados');
  }
}
</script>
<style>
.pasarela-header-bar {
  background: #07B7E0;
  min-height: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 22px;
  box-shadow: none;
}
.pasarela-back-btn {
  background: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  cursor: pointer;
  padding: 0;
}
.pasarela-header-title {
  color: #fff;
  font-size: 1.45rem;
  font-weight: 800;
  font-family: 'Nunito', sans-serif;
  display: flex;
  align-items: center;
}
.field-error {
  color: #f04141;
  font-size: 12px;
  margin-top: 2px;
  margin-left: 4px;
  font-weight: 500;
  animation: errorSlideIn 0.3s ease-out;
}
@keyframes errorSlideIn {
  0% { opacity: 0; transform: translateY(-8px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>

<style src="../theme/PasarelaPago.css"></style>
