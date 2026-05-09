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
    
    // Caché en memoria para evitar llamadas repetidas y ahorrar cuota de API
    private final Map<String, String> translationCache = new ConcurrentHashMap<>();

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
