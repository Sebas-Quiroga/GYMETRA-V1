<template>
  <ion-page>
    <div class="nutr-header" role="banner">
      <div class="nutr-header-left">
        <button class="nutr-back-btn" @click="$router.push('/home')" aria-label="Volver">
          <ArrowLeft :size="22" stroke-width="2.5" />
        </button>
      </div>
      <router-link to="/home" class="nutr-logo-link" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="brand-name-header">GYMETRA</span>
      </router-link>
      <div class="nutr-header-right">
        <button class="nutr-logout-btn" @click="logout" aria-label="Cerrar sesión">
          <LogOut :size="22" stroke-width="2" />
        </button>
      </div>
    </div>
    <ion-content class="nutr-content">
      <div class="nutr-container">
        <section class="nutr-hero">
          <p class="nutr-hero-eyebrow">Elite Performance</p>
          <h1 class="nutr-hero-title">Tu combustible<br/>ideal</h1>
        </section>
        <div class="nutr-form-card">
          <div class="nutr-form-grid">
            <div class="nutr-form-group">
              <label class="nutr-label">Tipo de Plan</label>
              <div class="nutr-select-wrap">
                <select v-model="form.timeFrame" class="nutr-select">
                  <option value="day">Diario</option>
                  <option value="week">Semanal</option>
                </select>
                <ChevronDown class="nutr-select-arrow" :size="16" stroke-width="2" />
              </div>
            </div>
            <div class="nutr-form-group">
              <label class="nutr-label">Calorías Objetivo</label>
              <div class="nutr-calories-row">
                <button class="nutr-cal-btn" @click="decreaseCalories" aria-label="Reducir calorias">
                  <Minus :size="18" stroke-width="2.5" />
                </button>
                <input v-model.number="form.targetCalories" type="number" class="nutr-calories-input" />
                <button class="nutr-cal-btn" @click="increaseCalories" aria-label="Aumentar calorias">
                  <Plus :size="18" stroke-width="2.5" />
                </button>
              </div>
            </div>
            <div class="nutr-form-group nutr-form-full">
              <label class="nutr-label">Dieta Opcional</label>
              <div class="nutr-select-wrap">
                <select v-model="form.diet" class="nutr-select">
                  <option value="">Sin restricciones</option>
                  <option value="vegetarian">Vegetariana</option>
                  <option value="vegan">Vegana</option>
                  <option value="paleo">Paleo</option>
                  <option value="ketogenic">Keto</option>
                </select>
                <ChevronDown class="nutr-select-arrow" :size="16" stroke-width="2" />
              </div>
            </div>
          </div>
          <button class="nutr-generate-btn" :disabled="loading" @click="generatePlan">
            <span v-if="!loading">Generar Plan Nutricional</span>
            <ion-spinner v-else name="crescent" color="light"></ion-spinner>
          </button>
        </div>
        <div v-if="plan">
          <div v-if="isDayPlan(plan)" class="nutr-macros">
            <div class="nutr-macro-card nutr-macro-highlight">
              <span class="nutr-macro-val">{{ Math.round(plan.nutrients.calories) }}</span>
              <span class="nutr-macro-label">Kcal</span>
            </div>
            <div class="nutr-macro-card">
              <span class="nutr-macro-val">{{ Math.round(plan.nutrients.protein) }}g</span>
              <span class="nutr-macro-label">Prot</span>
            </div>
            <div class="nutr-macro-card">
              <span class="nutr-macro-val">{{ Math.round(plan.nutrients.fat) }}g</span>
              <span class="nutr-macro-label">Grasa</span>
            </div>
          </div>
          <div v-if="isDayPlan(plan)" class="nutr-meals-list">
            <h3 class="nutr-menu-title">Menú Diario</h3>
            <div v-for="(meal, idx) in plan.meals" :key="meal.id" class="nutr-meal-item" @click="openRecipe(meal.id)">
               <div class="nutr-meal-img-wrap">
                 <img :src="getMealImage(meal)" :alt="meal.title" class="nutr-meal-img"/>
               </div>
               <div class="nutr-meal-info">
                 <div class="nutr-meal-top">
                   <span class="nutr-meal-type">{{ mealLabel(idx) }}</span>
                   <span class="nutr-meal-time">{{ meal.readyInMinutes }} min</span>
                 </div>
                 <h4 class="nutr-meal-title">{{ meal.title }}</h4>
                 <span class="nutr-meal-link">Ver detalles →</span>
               </div>
            </div>
          </div>
          <div v-else class="nutr-week-results">
            <div v-for="(dayData, dayName) in (plan as any).week" :key="dayName" class="nutr-week-day">
              <h3 class="nutr-day-label">{{ capitalize(String(dayName)) }}</h3>
              <div class="nutr-meals-list">
                <div v-for="(meal, idx) in dayData.meals" :key="meal.id" class="nutr-meal-item" @click="openRecipe(meal.id)">
                   <div class="nutr-meal-img-wrap">
                     <img :src="getMealImage(meal)" :alt="meal.title" class="nutr-meal-img"/>
                   </div>
                   <div class="nutr-meal-info">
                     <div class="nutr-meal-top">
                       <span class="nutr-meal-type">{{ mealLabel(idx) }}</span>
                       <span class="nutr-meal-time">{{ meal.readyInMinutes }} min</span>
                     </div>
                     <h4 class="nutr-meal-title">{{ meal.title }}</h4>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!plan && !loading" class="nutr-empty">
           <UtensilsCrossed :size="48" stroke-width="1.5" />
           <p>Define tus objetivos y genera tu plan ideal.</p>
        </div>
      </div>
    </ion-content>
    <RecipeDetailModal
      :is-open="modal.isOpen"
      :recipe="modal.recipe"
      :loading="modal.loading"
      @close="closeRecipeModal"
    />
  </ion-page>
</template>
<script setup lang="ts">
import { IonPage, IonContent, IonSpinner } from '@ionic/vue'
import { ArrowLeft, LogOut, ChevronDown, Minus, Plus, UtensilsCrossed } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../auth/store/auth'
import { APP_NAME } from '../../shared/config/branding'
import { DayPlan, MealPlanResponse, Meal } from '../../shared/types/nutrition'
import RecipeDetailModal from '../components/RecipeDetailModal.vue'
import { useNutrition } from '../composables/useNutrition'

const router = useRouter()
const auth = useAuthStore()

const {
  loading,
  plan,
  error,
  form,
  modal,
  decreaseCalories,
  increaseCalories,
  generatePlan,
  openRecipe,
  closeRecipeModal
} = useNutrition()

const mealLabels = ['Desayuno', 'Almuerzo', 'Cena']
const mealLabel = (i: number) => mealLabels[i] || `Comida ${i + 1}`
const isDayPlan = (p: MealPlanResponse): p is DayPlan => !!(p as DayPlan).meals
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const getMealImage = (m: Meal) => `https://spoonacular.com/recipeImages/${m.id}-312x231.${m.imageType || 'jpg'}`;

const logout = () => { 
  auth.clearToken()
  router.push('/login') 
}
</script>
<style src="../theme/NutritionPage.css"></style>

