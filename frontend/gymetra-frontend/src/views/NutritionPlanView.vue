<template>
  <ion-page>
    <!-- Header KINETIC Dynamic -->
    <div class="nutr-header" role="banner">
      <div class="nutr-header-left">
        <button class="nutr-back-btn" @click="$router.push('/home')" aria-label="Volver">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      <router-link to="/home" class="nutr-logo-link" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Logo" class="header-logo-img" />
        <span class="header-logo-text">{{ APP_NAME }}</span>
      </router-link>

      <div class="nutr-header-right">
        <button class="nutr-logout-btn" @click="logout" aria-label="Cerrar sesión">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>

    <ion-content class="nutr-content">
      <div class="nutr-container">

        <!-- Hero -->
        <section class="nutr-hero">
          <p class="nutr-hero-eyebrow">Elite Performance</p>
          <h1 class="nutr-hero-title">Tu combustible<br/>ideal</h1>
        </section>

        <!-- Formulario -->
        <div class="nutr-form-card">
          <div class="nutr-form-grid">
            <div class="nutr-form-group">
              <label class="nutr-label">Tipo de Plan</label>
              <div class="nutr-select-wrap">
                <select v-model="form.timeFrame" class="nutr-select">
                  <option value="day">Diario</option>
                  <option value="week">Semanal</option>
                </select>
                <svg class="nutr-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>

            <div class="nutr-form-group">
              <label class="nutr-label">Calorías Objetivo</label>
              <div class="nutr-calories-row">
                <button class="nutr-cal-btn" @click="decreaseCalories" aria-label="Reducir calorias">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>
                </button>
                <input v-model.number="form.targetCalories" type="number" class="nutr-calories-input" />
                <button class="nutr-cal-btn" @click="increaseCalories" aria-label="Aumentar calorias">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
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
                <svg class="nutr-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <button class="nutr-generate-btn" :disabled="loading" @click="generatePlan">
            <span v-if="!loading">Generar Plan Nutricional</span>
            <ion-spinner v-else name="crescent" color="light"></ion-spinner>
          </button>
        </div>

        <!-- Resultados -->
        <div v-if="plan">
          <!-- Macros resumen -->
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

          <!-- Meals List -->
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

          <!-- Weekly Layout -->
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
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
           <p>Define tus objetivos y genera tu plan ideal.</p>
        </div>

      </div>
    </ion-content>

    <!-- Modal Separado -->
    <RecipeDetailModal
      :is-open="modal.isOpen"
      :recipe="modal.recipe"
      :loading="modal.loading"
      @close="modal.isOpen = false"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { IonPage, IonContent, IonSpinner } from '@ionic/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { APP_NAME } from '@/config/branding'
import { NutritionService } from '@/services/nutritionService'
import { DayPlan, MealPlanResponse, RecipeDetail, Meal } from '@/interfaces/nutrition'
import RecipeDetailModal from '@/components/nutrition/RecipeDetailModal.vue'

const router = useRouter()
const auth = useAuthStore()

// --- State ---
const loading = ref(false)
const plan = ref<MealPlanResponse | null>(null)
const error = ref<string | null>(null)

const form = reactive({
  timeFrame: 'day' as 'day' | 'week',
  targetCalories: 2000,
  diet: ''
})

const modal = reactive({
  isOpen: false,
  loading: false,
  recipe: null as RecipeDetail | null
})

// --- Helpers ---
const mealLabels = ['Desayuno', 'Almuerzo', 'Cena']
const mealLabel = (i: number) => mealLabels[i] || `Comida ${i + 1}`
const isDayPlan = (p: MealPlanResponse): p is DayPlan => !!(p as DayPlan).meals
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const getMealImage = (m: Meal) => `https://spoonacular.com/recipeImages/${m.id}-312x231.jpg`

const decreaseCalories = () => { form.targetCalories = Math.max(500, form.targetCalories - 50) }
const increaseCalories = () => { form.targetCalories = Math.min(6000, form.targetCalories + 50) }

// --- Actions ---
const logout = () => { auth.clearToken(); router.push('/login') }

const openRecipe = async (id: number) => {
  modal.isOpen = true
  modal.loading = true
  modal.recipe = null
  try {
    modal.recipe = await NutritionService.getRecipeDetail(id)
  } catch (err) {
    console.error('Error loading recipe:', err)
  } finally {
    modal.loading = false
  }
}

const generatePlan = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await NutritionService.generateMealPlan(form.timeFrame, form.targetCalories, form.diet || undefined)
    plan.value = res
    localStorage.setItem('cached_nutrition_plan', JSON.stringify(res))
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const cached = localStorage.getItem('cached_nutrition_plan')
  if (cached) {
    try { plan.value = JSON.parse(cached) } catch { localStorage.removeItem('cached_nutrition_plan') }
  }
})
</script>

<style src="../theme/NutritionPage.css"></style>
