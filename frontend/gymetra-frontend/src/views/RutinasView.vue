<template>
  <ion-page>
    <!-- Header KINETIC -->
    <div class="view-header" role="banner">
      <div class="header-left">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </div>
      
      <router-link to="/home" class="logo-link">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="header-logo-text">{{ APP_NAME }}</span>
      </router-link>

      <div class="header-right"></div>
    </div>

    <ion-content class="rutinas-content">
      <div class="rutinas-container">
        <!-- Intro Section -->
        <section class="rutinas-intro">
          <h1 class="rutinas-title">Base de <span class="accent">Ejercicios</span></h1>
          <p class="rutinas-sub">Explora la técnica perfecta para cada músculo.</p>
        </section>

        <!-- Muscle Selector -->
        <div class="selector-card">
          <ion-item lines="none" class="muscle-item">
            <ion-label position="stacked">Grupo Muscular</ion-label>
            <ion-select 
              v-model="selectedMuscle" 
              interface="action-sheet" 
              placeholder="Seleccionar músculo"
              @ionChange="handleMuscleChange"
            >
              <ion-select-option value="chest">Pecho (Chest)</ion-select-option>
              <ion-select-option value="back">Espalda (Back)</ion-select-option>
              <ion-select-option value="upper legs">Piernas (Legs)</ion-select-option>
              <ion-select-option value="shoulders">Hombros (Shoulders)</ion-select-option>
              <ion-select-option value="upper arms">Brazos (Arms)</ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <!-- States: Loading / Error / Empty -->
        <div v-if="loading" class="state-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Sincronizando con ExerciseDB...</p>
        </div>

        <div v-else-if="error" class="state-container error">
          <ion-icon :icon="alertCircleOutline"></ion-icon>
          <p>{{ error }}</p>
          <ion-button fill="clear" @click="fetchExercises">Reintentar</ion-button>
        </div>

        <!-- Exercise Grid -->
        <div v-else class="exercise-grid">
          <div 
            v-for="exercise in exercises" 
            :key="exercise.id" 
            class="exercise-card"
          >
            <div class="card-visual">
              <img :src="exercise.gifUrl" :alt="exercise.name" loading="lazy" />
              <div class="card-overlay"></div>
              <div class="equipment-tag">{{ exercise.equipment }}</div>
            </div>
            
            <div class="card-info">
              <h3 class="exercise-name">{{ exercise.name }}</h3>
              <div class="muscle-tag">
                <span class="dot"></span>
                {{ exercise.target }}
              </div>
            </div>
          </div>
        </div>

        <!-- Limit notice -->
        <p v-if="!loading && !error" class="limit-notice">
          Mostrando los ejercicios más efectivos de {{ selectedMuscle }}.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  IonPage, IonContent, IonButtons, IonButton, 
  IonIcon, IonItem, IonLabel, IonSelect, 
  IonSelectOption, IonSpinner 
} from '@ionic/vue';
import { arrowBackOutline, alertCircleOutline } from 'ionicons/icons';
import { getExercisesByBodyPart, type Exercise } from '@/services/fitnessService';

const APP_NAME = "GYMETRA";
const selectedMuscle = ref('chest');
const exercises = ref<Exercise[]>([]);
const loading = ref(false);
const error = ref('');

const fetchExercises = async () => {
  loading.value = true;
  error.value = '';
  try {
    const data = await getExercisesByBodyPart(selectedMuscle.value);
    exercises.value = data;
  } catch (err: any) {
    error.value = 'No se pudo conectar con la base de datos de ejercicios. Verifica tu API Key.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleMuscleChange = () => {
  fetchExercises();
};

onMounted(() => {
  fetchExercises();
});
</script>

<style scoped>
/* ─── Header KINETIC ─── */
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border-color);
}

.header-side { width: 40px; }
.logo-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.header-logo-img {
  height: 28px;
  width: auto;
}

@media (prefers-color-scheme: light) {
  .header-logo-img { filter: invert(1) brightness(0.2); }
}

.header-logo-text {
  font-family: var(--app-font-brand);
  font-size: 1.2rem;
  font-weight: 900;
  font-style: italic;
  color: var(--brand-primary);
  text-transform: uppercase;
}

/* ─── Content ─── */
.rutinas-content {
  --background: var(--bg-page);
}

.rutinas-container {
  padding: 2rem 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.rutinas-intro { margin-bottom: 2.5rem; text-align: center; }
.rutinas-title { 
  font-family: var(--app-font-brand); 
  font-size: 2.2rem; 
  font-weight: 950; 
  color: var(--text-main); 
  letter-spacing: -0.04em;
  margin-bottom: 0.5rem;
}
.rutinas-title .accent { color: var(--brand-primary); }
.rutinas-sub { color: var(--text-sub); font-weight: 500; }

/* ─── Selector ─── */
.selector-card {
  background: var(--bg-card);
  border-radius: 1.5rem;
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.02);
}

.muscle-item {
  --background: transparent;
  --color: var(--text-main);
}

/* ─── Exercise Grid ─── */
.exercise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.exercise-card {
  background: var(--bg-card);
  border-radius: 1.5rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 12px 40px rgba(0,0,0,0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.exercise-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  border-color: var(--brand-primary);
}

.card-visual {
  position: relative;
  height: 200px;
  background: #fff; /* GIFs suelen tener fondo blanco */
}

.card-visual img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.05), transparent);
}

.equipment-tag {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  background: rgba(var(--brand-primary-rgb), 0.1);
  color: var(--brand-primary);
  padding: 0.3rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(var(--brand-primary-rgb), 0.2);
}

.card-info {
  padding: 1.25rem;
  flex: 1;
}

.exercise-name {
  font-family: var(--app-font-brand);
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
  text-transform: capitalize;
  margin-bottom: 0.5rem;
}

.muscle-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-sub);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--brand-secondary);
  border-radius: 50%;
}

/* ─── States ─── */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
  color: var(--text-sub);
}

.state-container.error ion-icon { font-size: 3rem; color: var(--color-error); }

.limit-notice {
  text-align: center;
  margin-top: 3rem;
  font-size: 0.8rem;
  color: var(--text-sub);
  font-weight: 500;
}
</style>
