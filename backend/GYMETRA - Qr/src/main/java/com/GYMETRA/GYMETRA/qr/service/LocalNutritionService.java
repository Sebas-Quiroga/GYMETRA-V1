package com.GYMETRA.GYMETRA.qr.service;

import com.GYMETRA.GYMETRA.qr.entity.Recipe;
import com.GYMETRA.GYMETRA.qr.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class LocalNutritionService {

    private final RecipeRepository recipeRepository;

    public Map<String, Object> generateMealPlan(String timeFrame, Double targetCalories, String diet) {
        if ("day".equalsIgnoreCase(timeFrame)) {
            return generateDayPlan(targetCalories, diet);
        } else {
            Map<String, Object> weekPlan = new LinkedHashMap<>();
            Map<String, Object> weekDays = new LinkedHashMap<>();
            String[] days = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"};
            
            for (String day : days) {
                weekDays.put(day, generateDayPlan(targetCalories / 7.0, diet)); // Simplificación
                // Nota: Spoonacular usa targetCalories para el DÍA incluso en plan semanal (es cal/dia)
                // Así que usaremos el mismo targetCalories para cada día
                weekDays.put(day, generateDayPlan(targetCalories, diet));
            }
            weekPlan.put("week", weekDays);
            return weekPlan;
        }
    }

    private Map<String, Object> generateDayPlan(Double targetCalories, String diet) {
        // Un plan diario típico: 25% Desayuno, 40% Almuerzo, 35% Cena
        Double breakfastCal = targetCalories * 0.25;
        Double lunchCal = targetCalories * 0.45;
        Double dinnerCal = targetCalories * 0.30;

        List<Recipe> meals = new ArrayList<>();
        
        meals.addAll(getRandomRecipe("breakfast", breakfastCal, diet));
        meals.addAll(getRandomRecipe("lunch", lunchCal, diet));
        meals.addAll(getRandomRecipe("dinner", dinnerCal, diet));

        // Si faltan comidas (por falta de datos), intentamos rellenar con main course
        while (meals.size() < 3) {
            meals.addAll(getRandomRecipe("main course", targetCalories / 3, diet));
            if (meals.size() >= 3) break;
            // Si seguimos sin datos, abortamos loop
            break;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("meals", meals);
        
        // Calcular totales de nutrientes
        Map<String, Double> nutrients = new HashMap<>();
        nutrients.put("calories", meals.stream().mapToDouble(Recipe::getCalories).sum());
        nutrients.put("protein", meals.stream().mapToDouble(Recipe::getProtein).sum());
        nutrients.put("fat", meals.stream().mapToDouble(Recipe::getFat).sum());
        nutrients.put("carbohydrates", meals.stream().mapToDouble(Recipe::getCarbs).sum());
        
        response.put("nutrients", nutrients);
        return response;
    }

    private List<Recipe> getRandomRecipe(String type, Double maxCal, String diet) {
        if (diet != null && !diet.isEmpty()) {
            return recipeRepository.findRandomByDietAndDishTypeAndMaxCalories(diet, type, maxCal, 1);
        }
        List<Recipe> found = recipeRepository.findRandomByDishTypeAndMaxCalories(type, maxCal, 1);
        
        // Fallback: si no hay del tipo específico, buscar cualquiera que no sea desayuno para almuerzo/cena
        if (found.isEmpty() && !"breakfast".equals(type)) {
            found = recipeRepository.findRandomByDishTypeAndMaxCalories("main course", maxCal, 1);
        }
        
        return found;
    }

    public Optional<Recipe> getRecipeDetail(Integer id) {
        return recipeRepository.findById(id);
    }
}
