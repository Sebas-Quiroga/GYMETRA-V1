<template>
  <ion-page>
    <ion-content color="primary" class="dashboard">
      <!-- Header con menú y avatar -->
      <div class="header">
        <ion-buttons slot="start">
          <ion-menu-button auto-hide="false"></ion-menu-button>
        </ion-buttons>
        <div class="user-info">
          <h2>Hola, Juan</h2>
          <p>Miembro activo</p>
        </div>
        <ion-avatar class="avatar">
          <ion-icon :icon="personCircleOutline"></ion-icon>
        </ion-avatar>
      </div>

      <!-- Tarjetas -->
      <div class="cards">
        <ion-card class="stat-card">
          <ion-card-content>
            <h1>20</h1>
            <p>Restantes</p>
          </ion-card-content>
        </ion-card>

        <ion-card class="stat-card">
          <ion-card-content>
            <ion-icon :icon="appsOutline" size="large"></ion-icon>
            <p>Plan</p>
          </ion-card-content>
        </ion-card>

        <ion-card class="stat-card">
          <ion-card-content>
            <ion-icon :icon="qrCodeOutline" size="large"></ion-icon>
            <p>Código</p>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Gráfico -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Tiempo Entrenado</h3>
          <ion-icon :icon="timeOutline"></ion-icon>
        </div>
        <canvas id="trainingChart"></canvas>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonButtons,
  IonMenuButton,
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
} from "ionicons/icons";
import { onMounted } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

onMounted(() => {
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
.user-info h2 {
  margin: 0;
  color: white;
}
.user-info p {
  margin: 0;
  color: #dff;
}
.avatar ion-icon {
  font-size: 50px;
  color: white;
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
