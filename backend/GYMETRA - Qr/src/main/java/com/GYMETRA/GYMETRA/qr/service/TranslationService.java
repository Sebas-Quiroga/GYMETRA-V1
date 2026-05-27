package com.GYMETRA.GYMETRA.qr.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servicio de traducción para convertir términos de fitness y nutrición al español.
 * Utiliza la API de MyMemory para las traducciones y mantiene un caché local.
 */
@Service
@Slf4j
public class TranslationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BASE_URL = "https://api.mymemory.translated.net/get";
    
    // Caché en memoria pre-poblada con los términos más comunes de ExerciseDB
    private final Map<String, String> translationCache = new ConcurrentHashMap<>();

    public TranslationService() {
        // Body parts
        translationCache.put("back", "espalda");
        translationCache.put("cardio", "cardio");
        translationCache.put("chest", "pecho");
        translationCache.put("lower arms", "antebrazos");
        translationCache.put("lower legs", "pantorrillas");
        translationCache.put("neck", "cuello");
        translationCache.put("shoulders", "hombros");
        translationCache.put("upper arms", "brazos");
        translationCache.put("upper legs", "piernas");
        translationCache.put("waist", "cintura");

        // Targets
        translationCache.put("abductors", "abductores");
        translationCache.put("abs", "abdominales");
        translationCache.put("adductors", "aductores");
        translationCache.put("biceps", "bíceps");
        translationCache.put("calves", "gemelos");
        translationCache.put("cardiovascular system", "sistema cardiovascular");
        translationCache.put("delts", "deltoides");
        translationCache.put("forearms", "antebrazos");
        translationCache.put("glutes", "glúteos");
        translationCache.put("hamstrings", "isquiotibiales");
        translationCache.put("lats", "dorsales");
        translationCache.put("levator scapulae", "elevador de la escápula");
        translationCache.put("pectorals", "pectorales");
        translationCache.put("quads", "cuádriceps");
        translationCache.put("serratus anterior", "serrato anterior");
        translationCache.put("spine", "columna");
        translationCache.put("traps", "trapecios");
        translationCache.put("triceps", "tríceps");
        translationCache.put("upper back", "espalda alta");

        // Equipment
        translationCache.put("assisted", "asistido");
        translationCache.put("band", "banda");
        translationCache.put("barbell", "barra");
        translationCache.put("body weight", "peso corporal");
        translationCache.put("bosu ball", "balón bosu");
        translationCache.put("cable", "polea");
        translationCache.put("dumbbell", "mancuerna");
        translationCache.put("elliptical machine", "elíptica");
        translationCache.put("ez barbell", "barra ez");
        translationCache.put("hammer", "martillo");
        translationCache.put("kettlebell", "pesa rusa");
        translationCache.put("leverage machine", "máquina de palanca");
        translationCache.put("medicine ball", "balón medicinal");
        translationCache.put("olympic barbell", "barra olímpica");
        translationCache.put("resistance band", "banda de resistencia");
        translationCache.put("roller", "rodillo");
        translationCache.put("rope", "cuerda");
        translationCache.put("skierg", "skierg");
        translationCache.put("sled machine", "máquina de trineo");
        translationCache.put("smith machine", "máquina smith");
        translationCache.put("stability ball", "balón de estabilidad");
        translationCache.put("stationary bike", "bicicleta estática");
        translationCache.put("stepmill machine", "máquina escaladora");
        translationCache.put("tire", "llanta");
        translationCache.put("trap bar", "barra hexagonal");
        translationCache.put("upper body ergometer", "ergómetro de tren superior");
        translationCache.put("weighted", "con peso");
        translationCache.put("wheel roller", "rueda abdominal");

        // Diets (Spoonacular)
        translationCache.put("gluten free", "sin gluten");
        translationCache.put("dairy free", "sin lácteos");
        translationCache.put("lacto ovo vegetarian", "vegetariano");
        translationCache.put("vegan", "vegano");
        translationCache.put("paleolithic", "paleo");
        translationCache.put("primal", "primal");
        translationCache.put("whole 30", "whole 30");
        translationCache.put("pescatarian", "pescetariano");
        translationCache.put("ketogenic", "cetogénico");

        // Dish Types (Spoonacular)
        translationCache.put("soup", "sopa");
        translationCache.put("lunch", "almuerzo");
        translationCache.put("main course", "plato principal");
        translationCache.put("main dish", "plato principal");
        translationCache.put("dinner", "cena");
        translationCache.put("breakfast", "desayuno");
        translationCache.put("side dish", "guarnición");
        translationCache.put("dessert", "postre");
        translationCache.put("salad", "ensalada");
        translationCache.put("appetizer", "aperitivo");
        translationCache.put("beverage", "bebida");
        translationCache.put("snack", "snack");
        translationCache.put("drink", "bebida");
    }

    /**
     * Traduce un texto de inglés a español.
     */
    public String translateToSpanish(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }

        String cleanText = text.trim().toLowerCase();
        
        // 1. Verificar caché
        if (translationCache.containsKey(cleanText)) {
            return translationCache.get(cleanText);
        }

        try {
            // 2. Consultar API MyMemory
            String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                    .queryParam("q", cleanText)
                    .queryParam("langpair", "en|es")
                    .toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("responseData")) {
                Map<String, String> responseData = (Map<String, String>) response.get("responseData");
                String translatedText = responseData.get("translatedText");
                
                if (translatedText != null && !translatedText.equalsIgnoreCase(cleanText)) {
                    // Validar si el texto traducido es en realidad un mensaje de error de MyMemory
                    String upperTranslated = translatedText.toUpperCase();
                    if (upperTranslated.contains("INVALID LANGUAGE") || 
                        upperTranslated.contains("MYMEMORY WARNING") ||
                        upperTranslated.contains("YOU USED ALL YOUR FREE QUOTA")) {
                        log.warn("⚠️ MyMemory API devolvió un error para '{}': {}. Ignorando traducción.", cleanText, translatedText);
                        return text;
                    }

                    translationCache.put(cleanText, translatedText);
                    return translatedText;
                }
            }
        } catch (Exception e) {
            log.warn("⚠️ Error traduciendo '{}': {}. Se conservará el original.", cleanText, e.getMessage());
        }

        return text;
    }

    /**
     * Borra el caché de traducciones.
     */
    public void clearCache() {
        translationCache.clear();
    }
}
