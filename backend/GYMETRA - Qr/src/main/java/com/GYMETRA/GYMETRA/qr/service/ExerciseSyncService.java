package com.GYMETRA.GYMETRA.qr.service;

import com.GYMETRA.GYMETRA.qr.entity.Exercise;
import com.GYMETRA.GYMETRA.qr.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExerciseSyncService {

    private final ExerciseRepository exerciseRepository;
    private final TranslationService translationService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${rapidapi.exercise.key}")
    private String apiKey;

    @Value("${rapidapi.exercise.host}")
    private String apiHost;

    private static final String BASE_URL = "https://exercisedb.p.rapidapi.com";

    /**
     * Se ejecuta automáticamente al iniciar la aplicación.
     * Si no hay ejercicios, dispara una sincronización inicial.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        long count = exerciseRepository.count();
        // Si tenemos menos de 1300 ejercicios, consideramos que la carga está incompleta
        if (count < 1300) {
            log.info("ℹ️ Base de datos incompleta ({} registros). Iniciando sincronización completa...", count);
            new Thread(this::syncAllExercises).start();
        } else {
            log.info("✅ La base de datos contiene {} ejercicios. Todo listo.", count);
        }
    }

    /**
     * Tarea programada: Sincroniza la base de datos de ejercicios semanalmente.
     * Se ejecuta todos los domingos a las 3:00 AM.
     */
    @Scheduled(cron = "0 0 3 * * SUN")
    public void scheduledSync() {
        log.info("⏰ Iniciando sincronización de ejercicios programada...");
        syncAllExercises();
    }

    /**
     * Sincroniza todos los ejercicios desde ExerciseDB.
     * Limita la carga inicial para evitar saturación, pero descarga los GIFs.
     */
    public void clearAndSync() {
        log.warn("🧹 Limpiando base de datos de ejercicios para resincronización...");
        exerciseRepository.deleteAll();
        syncAllExercises();
    }

    /**
     * Sincroniza todos los ejercicios desde ExerciseDB.
     */
    public void syncAllExercises() {
        try {
            log.info("🌐 Conectando con ExerciseDB a través de RapidAPI...");
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-rapidapi-key", apiKey);
            headers.set("x-rapidapi-host", apiHost);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // El endpoint /exercises devuelve una lista. Usamos paginación si es necesario.
            // Algunos planes están limitados a 10 por página por defecto.
            int offset = 0;
            int limit = 50; 
            int totalSaved = 0;
            boolean hasMore = true;

            while (hasMore) {
                log.info("📡 Obteniendo ejercicios (offset: {}, limit: {})...", offset, limit);
                String url = BASE_URL + "/exercises?limit=" + limit + "&offset=" + offset;
                ResponseEntity<Map[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map[].class);

                if (response.getBody() == null || response.getBody().length == 0) {
                    hasMore = false;
                    break;
                }

                log.info("📦 Recibidos {} ejercicios. Procesando medios...", response.getBody().length);
                List<Map> exerciseList = Arrays.asList(response.getBody());

                for (Map data : exerciseList) {
                    try {
                        String id = (String) data.get("id");
                        
                        // La API nueva NO trae gifUrl. Debemos usar el endpoint /image
                        // Endpoint: /image?exerciseId={id}&resolution=360
                        String downloadUrl = BASE_URL + "/image?exerciseId=" + id + "&resolution=360";

                        // Descargar GIF binario
                        byte[] gifData = downloadGif(downloadUrl);

                        // Traducir metadatos al español
                        String nameEs = translationService.translateToSpanish((String) data.get("name"));
                        String targetEs = translationService.translateToSpanish((String) data.get("target"));
                        String equipmentEs = translationService.translateToSpanish((String) data.get("equipment"));
                        String bodyPartEs = translationService.translateToSpanish((String) data.get("bodyPart"));

                        Exercise exercise = Exercise.builder()
                                .id(id)
                                .name(nameEs)
                                .gifUrl(downloadUrl) 
                                .gifData(gifData)
                                .target(targetEs)
                                .equipment(equipmentEs)
                                .bodyPart(bodyPartEs)
                                .build();

                        exerciseRepository.save(exercise);
                        totalSaved++;
                        
                        // Retardo para respetar límites de API de traducción gratuita
                        Thread.sleep(200);
                        
                        if (totalSaved % 10 == 0) log.info("🔄 Sincronizados {} / 1300 ejercicios...", totalSaved);
                        
                    } catch (Exception e) {
                        log.error("⚠️ Error procesando ejercicio {}: {}", data.get("name"), e.getMessage());
                    }
                }
                
                offset += exerciseList.size();
                if (exerciseList.isEmpty()) hasMore = false; // Fin real de los datos
            }
            log.info("✅ Sincronización completada. Total: {} ejercicios guardados.", totalSaved);
        } catch (Exception e) {
            log.error("🛑 Error crítico en la sincronización de ejercicios: {}", e.getMessage());
        }
    }

    /**
     * Descarga el GIF desde la URL externa y lo convierte a bytes.
     */
    private byte[] downloadGif(String url) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-rapidapi-key", apiKey);
            headers.set("x-rapidapi-host", apiHost);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, byte[].class);
            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("🖼️ No se pudo descargar el GIF desde {}: {}", url, e.getMessage());
        }
        return null;
    }
}
