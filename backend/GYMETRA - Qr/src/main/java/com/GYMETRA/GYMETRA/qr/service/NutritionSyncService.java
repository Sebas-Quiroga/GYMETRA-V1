package com.GYMETRA.GYMETRA.qr.service;

import com.GYMETRA.GYMETRA.qr.entity.Recipe;
import com.GYMETRA.GYMETRA.qr.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NutritionSyncService {

    private final RecipeRepository recipeRepository;
    private final TranslationService translationService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spoonacular.api.key}")
    private String apiKey;

    @Value("${spoonacular.api.url}")
    private String apiUrl;

    /**
     * Sincronización inicial al arrancar si la base de datos está vacía.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        if (recipeRepository.count() == 0) {
            log.info("ℹ️ Base de datos de recetas vacía. Iniciando sincronización inicial...");
            new Thread(this::syncRecipes).start();
        }
    }

    /**
     * Sincronización programada cada domingo a las 4:00 AM.
     */
    @Scheduled(cron = "0 0 4 * * SUN")
    public void scheduledSync() {
        log.info("⏰ Iniciando sincronización de recetas programada...");
        syncRecipes();
    }

    public void syncRecipes() {
        try {
            log.info("🌐 Iniciando descarga masiva de recetas (500+)...");
            // Sincronizar por categorías principales para mayor diversidad
            syncByCategory(null, 200); 
            syncByCategory("vegetarian", 100);
            syncByCategory("ketogenic", 100);
            syncByCategory("paleo", 100);
            
            log.info("✅ Sincronización de recetas completada.");
        } catch (Exception e) {
            log.error("🛑 Error sincronizando recetas: {}", e.getMessage());
        }
    }

    private void syncByCategory(String diet, int count) {
        try {
            String url = String.format("%s/recipes/complexSearch?apiKey=%s&addRecipeInformation=true&instructionsRequired=true&fillIngredients=true&number=%d",
                    apiUrl, apiKey, count);
            
            if (diet != null) {
                url += "&diet=" + diet;
            }

            log.info("📡 Consultando Spoonacular API (Diet: {})...", diet != null ? diet : "General");
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getBody() != null && response.getBody().containsKey("results")) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.getBody().get("results");
                
                for (Map<String, Object> data : results) {
                    try {
                        Recipe recipe = mapToEntity(data, diet);
                        recipeRepository.save(recipe);
                        // Pequeño retardo para la API de traducción
                        Thread.sleep(150);
                    } catch (Exception ex) {
                        log.warn("⚠️ Error guardando receta {}: {}", data.get("title"), ex.getMessage());
                    }
                }
                log.info("📦 Guardadas {} recetas.", results.size());
            }
        } catch (Exception e) {
            log.error("❌ Error en syncByCategory({}): {}", diet, e.getMessage());
        }
    }

    private Recipe mapToEntity(Map<String, Object> data, String fallbackDiet) {
        // Extraer macros del campo nutrition si existe, de lo contrario usar valores por defecto
        Map<String, Object> nutrition = (Map<String, Object>) data.get("nutrition");
        Double cal = 0.0, prot = 0.0, fat = 0.0, carbs = 0.0;
        
        if (nutrition != null && nutrition.containsKey("nutrients")) {
            List<Map<String, Object>> nutrients = (List<Map<String, Object>>) nutrition.get("nutrients");
            for (Map<String, Object> n : nutrients) {
                String name = (String) n.get("name");
                Double amount = Double.valueOf(n.get("amount").toString());
                if ("Calories".equalsIgnoreCase(name)) cal = amount;
                else if ("Protein".equalsIgnoreCase(name)) prot = amount;
                else if ("Fat".equalsIgnoreCase(name)) fat = amount;
                else if ("Carbohydrates".equalsIgnoreCase(name)) carbs = amount;
            }
        }

        // Determinar dishType simplificado y traducirlo
        List<String> dishTypes = (List<String>) data.get("dishTypes");
        String mainDishType = "main course";
        if (dishTypes != null && !dishTypes.isEmpty()) {
            if (dishTypes.contains("breakfast")) mainDishType = "breakfast";
            else if (dishTypes.contains("lunch")) mainDishType = "lunch";
            else if (dishTypes.contains("dinner")) mainDishType = "dinner";
            else mainDishType = dishTypes.get(0);
        }
        mainDishType = translationService.translateToSpanish(mainDishType);

        // Determinar dietType desde la API y traducirlo
        List<String> dietsList = (List<String>) data.get("diets");
        String dietType = fallbackDiet;
        if (dietsList != null && !dietsList.isEmpty()) {
            dietType = dietsList.get(0); // Tomar la primera dieta de la lista
        }
        if (dietType != null) {
            dietType = translationService.translateToSpanish(dietType);
        } else {
            dietType = "General";
        }

        // Extraer instrucciones desde analyzedInstructions si instructions es nulo
        String instructionsStr = (String) data.get("instructions");
        if (instructionsStr == null || instructionsStr.trim().isEmpty()) {
            List<Map<String, Object>> analyzedInstructions = (List<Map<String, Object>>) data.get("analyzedInstructions");
            if (analyzedInstructions != null && !analyzedInstructions.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                for (Map<String, Object> section : analyzedInstructions) {
                    List<Map<String, Object>> steps = (List<Map<String, Object>>) section.get("steps");
                    if (steps != null) {
                        for (Map<String, Object> step : steps) {
                            sb.append(step.get("number")).append(". ").append(step.get("step")).append("\n");
                        }
                    }
                }
                instructionsStr = sb.toString();
            }
        }

        String imageUrl = (String) data.get("image");
        byte[] imageData = downloadImage(imageUrl);

        return Recipe.builder()
                .id((Integer) data.get("id"))
                .title(translationService.translateToSpanish((String) data.get("title")))
                .summary(translationService.translateToSpanish((String) data.get("summary")))
                .instructions(translationService.translateToSpanish(instructionsStr))
                .imageUrl(imageUrl)
                .imageData(imageData)
                .readyInMinutes((Integer) data.get("readyInMinutes"))
                .servings((Integer) data.get("servings"))
                .calories(cal)
                .protein(prot)
                .fat(fat)
                .carbs(carbs)
                .dietType(dietType)
                .dishType(mainDishType)
                .build();
    }

    /**
     * Descarga la imagen de la receta en formato binario.
     */
    private byte[] downloadImage(String url) {
        if (url == null || url.isEmpty()) return null;
        try {
            ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);
            return response.getBody();
        } catch (Exception e) {
            log.warn("🖼️ No se pudo descargar imagen desde {}: {}", url, e.getMessage());
            return null;
        }
    }
}
