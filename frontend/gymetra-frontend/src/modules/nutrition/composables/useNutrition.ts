import { ref, reactive, onMounted } from 'vue'
import { NutritionService } from '../services/nutritionService'
import { MealPlanResponse, RecipeDetail } from '../../shared/types/nutrition'

export function useNutrition() {
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

  const decreaseCalories = () => { 
    form.targetCalories = Math.max(500, form.targetCalories - 50) 
  }
  
  const increaseCalories = () => { 
    form.targetCalories = Math.min(6000, form.targetCalories + 50) 
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

  const openRecipe = async (id: number) => {
    modal.isOpen = true
    modal.loading = true
    modal.recipe = await NutritionService.getRecipeDetail(id)
    modal.loading = false
  }
  
  const closeRecipeModal = () => {
    modal.isOpen = false
  }

  const loadCachedPlan = () => {
    const cached = localStorage.getItem('cached_nutrition_plan')
    if (cached) {
      try { 
        plan.value = JSON.parse(cached) 
      } catch { 
        localStorage.removeItem('cached_nutrition_plan') 
      }
    }
  }

  onMounted(loadCachedPlan)

  return {
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
  }
}
