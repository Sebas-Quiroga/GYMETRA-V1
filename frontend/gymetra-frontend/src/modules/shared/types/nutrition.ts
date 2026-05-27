export interface Meal {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  imageType?: string;
}
export interface Nutrients {
  calories: number;
  carbohydrates: number;
  fat: number;
  protein: number;
}
export interface DayPlan {
  meals: Meal[];
  nutrients: Nutrients;
}
export interface WeekPlan {
  week: {
    monday: DayPlan;
    tuesday: DayPlan;
    wednesday: DayPlan;
    thursday: DayPlan;
    friday: DayPlan;
    saturday: DayPlan;
    sunday: DayPlan;
  };
}
export type MealPlanResponse = DayPlan | WeekPlan;
export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
  image: string;
}
export interface RecipeDetail {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  image: string;
  summary: string;
  instructions: string;
  extendedIngredients: Ingredient[];
  sourceUrl: string;
}

