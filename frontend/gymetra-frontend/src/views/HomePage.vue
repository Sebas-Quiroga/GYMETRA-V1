<template>
  <ion-page>
    <ion-content class="ion-padding login-page" color="primary">
      
      <!-- Card principal del login -->
      <div class="login-card">
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
          <a href="#" @click.prevent="openForgotModal">¿Olvidaste tu contraseña?</a>
          <p>
            ¿Nuevo miembro? <a href="#">Regístrate</a>
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
import {
  IonPage,
  IonContent,
  IonButtons,
  IonButton,
  IonAvatar,
  IonIcon,
  IonCard,
  IonCardContent,
} from "@ionic/vue";
import {
  personCircleOutline,
  appsOutline,
  qrCodeOutline,
  timeOutline,
  logOutOutline,
} from "ionicons/icons";
import { onMounted, ref } from "vue";
import { Chart, registerables } from "chart.js";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

Chart.register(...registerables);

const auth = useAuthStore();
const router = useRouter();

// Datos del cliente
const clientName = ref("Cliente");

function logout() {
  auth.clearToken();
  router.push("/login");
}

// Cargar info del JWT
function loadUserInfo() {
  const token = localStorage.getItem("jwt");
  if (token) {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));

      // Validar que sea CLIENTE
      if (!decoded.roleIds || !decoded.roleIds.includes(2)) {
        alert("❌ Acceso denegado: Esta área es solo para clientes");
        router.push("/login");
        return;
      }

      if (decoded.firstName && decoded.lastName) {
        clientName.value = `${decoded.firstName} ${decoded.lastName}`;
      }
    } catch (error) {
      console.error("Error al decodificar token:", error);
      router.push("/login");
    }
  } else {
    alert("❌ Sesión no encontrada. Por favor inicia sesión.");
    router.push("/login");
  }
}

onMounted(() => {
  loadUserInfo();

  const ctx = document.getElementById("trainingChart") as HTMLCanvasElement;
  if (ctx) {
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."],
        datasets: [
          {
            label: "Minutos",
            data: [30, 45, 35, 40, 50, 42, 48],
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: 6,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "white" } },
          y: { display: false },
        },
      },
    });
  }
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.user-info {
  flex: 1;
  margin-left: 15px;
  color: white;
}

.greeting {
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0;
}

.status {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}

.avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar ion-icon {
  font-size: 3rem;
  color: white;
}

ion-button {
  --background: transparent;
  --color: white;
}

/* Tarjetas */
.cards {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.stat-card {
  flex: 1;
  margin: 0 5px;
  text-align: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}
.stat-card h1 {
  margin: 0;
  font-size: 28px;
}
.stat-card p {
  margin: 5px 0 0;
}

/* Gráfico */
.chart-card {
  background: rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 12px;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  margin-bottom: 10px;
}
</style>
