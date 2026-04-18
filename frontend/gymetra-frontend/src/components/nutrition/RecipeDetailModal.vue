<template>
  <ion-modal :is-open="isOpen" @didDismiss="emit('close')" class="recipe-detail-modal">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modal-toolbar">
        <ion-buttons slot="start">
          <button class="modal-close-icon-btn" @click="emit('close')" aria-label="Cerrar">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <line x1="18" y1="6" x2="6" y2="18"></line>
               <line x1="6" y1="6" x2="18" y2="18"></line>
             </svg>
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
        <!-- Hero Section -->
        <div class="modal-hero">
          <img :src="recipe.image" :alt="recipe.title" class="modal-recipe-img" @error="handleImgError"/>
          <div class="modal-hero-overlay"></div>
          <div class="modal-hero-badge">Estilo Pro</div>
        </div>

        <div class="modal-body-content">
          <h2 class="modal-recipe-title">{{ recipe.title }}</h2>

          <!-- Quick Stats KINETIC -->
          <div class="modal-stats-grid">
            <div class="stat-card">
              <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10l4 2"/><circle cx="12" cy="12" r="10"/></svg>
              <div class="stat-info">
                <span class="stat-val">{{ recipe.readyInMinutes }}′</span>
                <span class="stat-label">Minutos</span>
              </div>
            </div>
            <div class="stat-card">
              <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <div class="stat-info">
                <span class="stat-val">{{ recipe.servings }}</span>
                <span class="stat-label">Porciones</span>
              </div>
            </div>
          </div>

          <!-- Ingredients Section -->
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

          <!-- Preparation Section - REDESIGNED -->
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

          <!-- Action Footer -->
          <div class="modal-footer">
            <a :href="recipe.sourceUrl" target="_blank" class="premium-button">
              <span>EXPLORAR FUENTE COMPLETA</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
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
import { RecipeDetail } from '@/interfaces/nutrition'

const props = defineProps<{
  isOpen: boolean;
  recipe: RecipeDetail | null;
  loading: boolean;
}>()

const emit = defineEmits(['close'])

const handleImgError = (e: any) => {
  e.target.style.display = 'none'
}

/**
 * Format instructions into aesthetic numbered steps
 */
const formattedSteps = computed(() => {
  if (!props.recipe?.instructions) return ''
  
  // Transform <ol>/<li> into modern aesthetic containers
  let text = props.recipe.instructions;
  
  // Detect if it's a simple text block without tags
  if (!text.includes('<') && text.length > 50) {
    // Basic splitting by sentences to create pseudo-steps
    const sentences = text.split(/\. /);
    return sentences.map((s, i) => `
      <div class="preparation-step">
        <div class="step-num">${i + 1}</div>
        <div class="step-text">${s.trim()}${s.endsWith('.') ? '' : '.'}</div>
      </div>
    `).join('');
  }

  return text
    .replace(/<ol[^>]*>/g, '<div class="steps-container">')
    .replace(/<\/ol>/g, '</div>')
    .replace(/<li[^>]*>/g, '<div class="preparation-step">') // we inject number via CSS counter
    .replace(/<\/li>/g, '</div>')
    .replace(/<p[^>]*>/g, '<div class="step-paragraph">')
    .replace(/<\/p>/g, '</div>');
})
</script>

<style scoped>
.modal-toolbar {
  --background: var(--bg-card);
  --color: var(--text-main);
  --border-width: 0;
  padding-top: 10px;
}

.modal-header-title {
  font-family: var(--app-font-brand);
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--text-main);
}

.modal-close-icon-btn {
  background: var(--bg-subtle);
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-primary);
  margin-left: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-close-icon-btn:active { transform: scale(0.9) rotate(90deg); }

.modal-main-content {
  --background: var(--bg-page);
}

.modal-state-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 1.5rem;
  color: var(--text-sub);
}

.modal-scroll-area {
  max-width: 650px;
  margin: 0 auto;
}

.modal-hero {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.modal-recipe-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.modal-hero:hover .modal-recipe-img { transform: scale(1.05); }

.modal-hero-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to top, var(--bg-page), transparent 70%);
}

.modal-hero-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: var(--brand-primary);
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: 2rem;
  font-size: 0.7rem;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  box-shadow: 0 8px 24px rgba(var(--ion-color-primary-rgb), 0.4);
}

.modal-body-content {
  padding: 0 1.5rem 3rem;
  margin-top: -30px;
  position: relative;
}

.modal-recipe-title {
  font-family: var(--app-font-brand);
  font-size: 2rem;
  font-weight: 950;
  color: var(--text-main);
  margin-bottom: 1.5rem;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

/* Stats Grid KINETIC */
.modal-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-card);
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.02);
}

.stat-icon {
  width: 24px;
  height: 24px;
  color: var(--brand-primary);
}

.stat-info { display: flex; flex-direction: column; }
.stat-val { font-size: 1.2rem; font-weight: 900; color: var(--text-main); line-height: 1; }
.stat-label { font-size: 0.65rem; font-weight: 800; color: var(--text-sub); text-transform: uppercase; margin-top: 0.2rem; }

/* Sections */
.modal-detail-section { margin-bottom: 2.5rem; }

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.section-icon { font-size: 1.25rem; }
.section-title {
  font-family: var(--app-font-brand);
  font-size: 1.2rem;
  font-weight: 900;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

/* Ingredients */
.ingredients-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.ingredient-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-subtle);
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--border-color);
}

.ing-bullet {
  width: 22px;
  height: 22px;
  background: var(--brand-primary);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 900;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ing-name { font-size: 0.95rem; font-weight: 600; color: var(--text-main); }

/* Preparation REDESIGN */
.preparation-box {
  background: var(--bg-card);
  border-radius: 1.5rem;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.03);
  counter-reset: steps-counter;
}

.steps-wrapper :deep(.steps-container) {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.steps-wrapper :deep(.preparation-step) {
  display: flex;
  gap: 1.25rem;
  position: relative;
}

.steps-wrapper :deep(.preparation-step::before) {
  counter-increment: steps-counter;
  content: counter(steps-counter);
  width: 32px;
  height: 32px;
  background: var(--bg-subtle);
  color: var(--brand-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.9rem;
  flex-shrink: 0;
  border: 1px solid var(--border-color);
}

/* Manual steps formatting */
.steps-wrapper :deep(.step-num) {
  width: 32px;
  height: 32px;
  background: var(--bg-subtle);
  color: var(--brand-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  flex-shrink: 0;
}

.steps-wrapper :deep(.step-text), 
.steps-wrapper :deep(.step-paragraph),
.summary-wrapper {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-sub);
  font-weight: 500;
}

.modal-footer { margin-top: 1rem; }

.premium-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  background: var(--brand-primary);
  color: #fff;
  padding: 1.25rem;
  border-radius: 1.25rem;
  text-decoration: none;
  font-weight: 950;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  box-shadow: 0 12px 32px rgba(var(--ion-color-primary-rgb), 0.3);
  transition: transform 0.2s ease;
}

.premium-button:active { transform: scale(0.98); }

@media (min-width: 768px) {
  .recipe-detail-modal {
    --width: 650px;
    --height: 90%;
    --border-radius: 2rem;
  }
}
</style>
