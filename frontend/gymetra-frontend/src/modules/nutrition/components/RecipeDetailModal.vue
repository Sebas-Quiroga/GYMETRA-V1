<template>
  <ion-modal :is-open="isOpen" @didDismiss="emit('close')" class="recipe-detail-modal">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modal-toolbar">
        <ion-buttons slot="start">
          <button class="modal-close-icon-btn" @click="emit('close')" aria-label="Cerrar">
             <X :size="24" stroke-width="2.5" />
          </button>
        </ion-buttons>
        <ion-title class="modal-header-title">Detalles de la Receta</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="modal-main-content">
      <div v-if="loading" class="modal-state-view">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Preparando tu receta...</p>
      </div>
      <div v-else-if="recipe" class="modal-scroll-area">
        <div class="modal-hero">
          <img :src="recipe.image" :alt="recipe.title" class="modal-recipe-img" @error="handleImgError"/>
          <div class="modal-hero-overlay"></div>
          <div class="modal-hero-badge">Estilo Pro</div>
        </div>
        <div class="modal-body-content">
          <h2 class="modal-recipe-title">{{ recipe.title }}</h2>
          <div class="modal-stats-grid">
            <div class="stat-card">
              <Clock class="stat-icon" :size="24" stroke-width="2" />
              <div class="stat-info">
                <span class="stat-val">{{ recipe.readyInMinutes }}′</span>
                <span class="stat-label">Minutos</span>
              </div>
            </div>
            <div class="stat-card">
              <Users class="stat-icon" :size="24" stroke-width="2" />
              <div class="stat-info">
                <span class="stat-val">{{ recipe.servings }}</span>
                <span class="stat-label">Porciones</span>
              </div>
            </div>
          </div>
          <section class="modal-detail-section">
            <div class="section-header">
              <span class="section-icon">🥗</span>
              <h3 class="section-title">Ingredientes</h3>
            </div>
            <div class="ingredients-list">
              <div v-for="(ing, idx) in recipe.extendedIngredients" :key="ing.id" class="ingredient-pill">
                <span class="ing-bullet">{{ idx + 1 }}</span>
                <span class="ing-name">{{ ing.original }}</span>
              </div>
            </div>
          </section>
          <section class="modal-detail-section">
            <div class="section-header">
              <span class="section-icon">👨‍🍳</span>
              <h3 class="section-title">Instrucciones de Preparación</h3>
            </div>
            <div class="preparation-box">
              <div v-if="recipe.instructions" class="steps-wrapper" v-html="formattedSteps"></div>
              <div v-else-if="recipe.summary" class="summary-wrapper" v-html="recipe.summary"></div>
              <p v-else class="empty-msg">No se encontraron detalles de preparación.</p>
            </div>
          </section>
          <div class="modal-footer">
            <a :href="recipe.sourceUrl" target="_blank" class="premium-button">
              <span>EXPLORAR FUENTE COMPLETA</span>
              <ExternalLink :size="20" stroke-width="2.5" />
            </a>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import {
  IonModal, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonContent, IonSpinner
} from '@ionic/vue'
import { X, Clock, Users, ExternalLink } from '@lucide/vue'
import { RecipeDetail } from '../../shared/types/nutrition'
const props = defineProps<{
  isOpen: boolean;
  recipe: RecipeDetail | null;
  loading: boolean;
}>()
const emit = defineEmits(['close'])
const handleImgError = (e: any) => {
  e.target.style.display = 'none'
}
const formattedSteps = computed(() => {
  if (!props.recipe?.instructions) return ''
  let text = props.recipe.instructions;
  if (!text.includes('<') && text.length > 50) {
    const sentences = text.split(/\. /);
    return sentences.map((s: string, i: number) => `
      <div class="preparation-step">
        <div class="step-num">${i + 1}</div>
        <div class="step-text">${s.trim()}${s.endsWith('.') ? '' : '.'}</div>
      </div>
    `).join('');
  }
  return text
    .replace(/<ol[^>]*>/g, '<div class="steps-container">')
    .replace(/<\/ol>/g, '</div>')
    .replace(/<li[^>]*>/g, '<div class="preparation-step">')
    .replace(/<\/li>/g, '</div>')
    .replace(/<p[^>]*>/g, '<div class="step-paragraph">')
    .replace(/<\/p>/g, '</div>');
})
</script>
<style scoped src="../theme/RecipeDetailModal.css"></style>

