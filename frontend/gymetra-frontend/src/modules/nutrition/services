// src/services/nutritionService.ts
import axios from 'axios';
import { MealPlanResponse, RecipeDetail, DayPlan } from '@/interfaces/nutrition';
import { TranslationService } from './translationService';

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/mealplanner/generate';

export class NutritionService {
  /**
   * Generates a meal plan based on calories, diet, and timeFrame.
   * @param timeFrame 'day' | 'week'
   * @param targetCalories number
   * @param diet string (optional)
   */
  static async generateMealPlan(
    timeFrame: 'day' | 'week',
    targetCalories: number,
    diet?: string
  ): Promise<MealPlanResponse> {
    if (!API_KEY) {
      throw new Error('La API Key de Spoonacular no se encuentra. Por favor, añade VITE_SPOONACULAR_API_KEY a tu archivo .env.');
    }

    try {
      const response = await axios.get<MealPlanResponse>(BASE_URL, {
        params: {
          apiKey: API_KEY,
          timeFrame,
          targetCalories,
          diet,
          language: 'es',
        },
      });

      const data = response.data;

      // Translate titles
      if ((data as DayPlan).meals) {
        const day = data as DayPlan;
        for (const meal of day.meals) {
          meal.title = await TranslationService.translateToSpanish(meal.title);
        }
      } else if ((data as any).week) {
        const week = (data as any).week;
        for (const dayKey of Object.keys(week)) {
          const day = week[dayKey];
          for (const meal of day.meals) {
            meal.title = await TranslationService.translateToSpanish(meal.title);
          }
        }
      }

      return data;
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      const errorMessage = error.response?.data?.message || 'Error al conectar con la API de nutrición';
      throw new Error(errorMessage);
    }
  }

  /**
   * Fetches full recipe information including ingredients.
   * @param id number
   */
  static async getRecipeDetail(id: number): Promise<RecipeDetail> {
    if (!API_KEY) {
      throw new Error('La API Key de Spoonacular no se encuentra.');
    }

    try {
      const response = await axios.get<RecipeDetail>(
        `https://api.spoonacular.com/recipes/${id}/information`,
        {
          params: {
            apiKey: API_KEY,
            includeNutrition: false,
          },
        }
      );
      
      const detail = response.data;

      // Translate title and ingredients
      detail.title = await TranslationService.translateToSpanish(detail.title);
      
      const ingredientTranslations = await TranslationService.translateArray(
        detail.extendedIngredients.map(ing => ing.original)
      );
      
      detail.extendedIngredients.forEach((ing, idx) => {
        ing.original = ingredientTranslations[idx];
      });

      // Optionally translate instructions
      if (detail.instructions) {
        detail.instructions = await TranslationService.translateToSpanish(detail.instructions);
      }

      return detail;
    } catch (error: any) {
      console.error('Error fetching recipe detail:', error);
      throw new Error('Error al obtener los detalles de la receta');
    }
  }
}
