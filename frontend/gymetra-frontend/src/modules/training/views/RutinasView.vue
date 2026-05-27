<template>
  <ion-page>
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
        <span class="brand-name-header">GYMETRA</span>
      </router-link>
      <div class="header-right"></div>
    </div>
    <ion-content class="rutinas-content">
      <div class="rutinas-container">
        <section class="rutinas-intro">
          <h1 class="rutinas-title">Base de <span class="accent">Ejercicios</span></h1>
          <p class="rutinas-sub">Explora la técnica perfecta para cada músculo.</p>
        </section>
        <div class="selector-card">
          <ion-item lines="none" class="muscle-item">
            <ion-label position="stacked">Grupo Muscular</ion-label>
            <ion-select
              v-model="selectedMuscle"
              interface="action-sheet"
              :placeholder="loadingLists ? 'Cargando categorías...' : 'Seleccionar músculo'"
              @ionChange="handleMuscleChange"
            >
              <ion-select-option v-for="muscle in muscleList" :key="muscle" :value="muscle">
                {{ muscle.charAt(0).toUpperCase() + muscle.slice(1) }}
              </ion-select-option>
            </ion-select>
          </ion-item>
        </div>
        <div v-if="loading" class="state-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Sincronizando con ExerciseDB...</p>
        </div>
        <div v-else-if="error" class="state-container error">
          <ion-icon :icon="alertCircleOutline"></ion-icon>
          <p>{{ error }}</p>
          <ion-button fill="clear" @click="fetchExercises">Reintentar</ion-button>
        </div>
        <div v-else class="exercise-grid">
          <div
            v-for="exercise in exercises"
            :key="exercise.id"
            class="exercise-card"
          >
            <div class="card-visual">
              <img :src="getLocalGifUrl(exercise.id)" :alt="exercise.name" loading="lazy" />
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
import { getExercisesByBodyPart, getLocalGifUrl, getBodyPartList, type Exercise } from '../services/fitnessService';
const APP_NAME = "GYMETRA";
const selectedMuscle = ref('chest');
const exercises = ref<Exercise[]>([]);
const muscleList = ref<string[]>([]);
const loading = ref(false);
const loadingLists = ref(false);
const error = ref('');
const fetchExercises = async () => {
  loading.value = true;
  error.value = '';
  try {
    const data = await getExercisesByBodyPart(selectedMuscle.value);
    exercises.value = data;
  } catch {
    error.value = 'No se pudo conectar con la base de datos de ejercicios. Verifica tu API Key.';
  } finally {
    loading.value = false;
  }
};
const handleMuscleChange = () => {
  fetchExercises();
};
const initView = async () => {
  loadingLists.value = true;
  const list = await getBodyPartList();
  muscleList.value = list;
  if (list.length > 0) {
    selectedMuscle.value = list.find(m => m.toLowerCase().includes('pech')) || list[0];
    await fetchExercises();
  }
  loadingLists.value = false;
};
onMounted(() => {
  initView();
});
</script>
<style scoped src="../theme/RutinasView.css"></style>

