package com.GYMETRA.GYMETRA.qr.controller;

import com.GYMETRA.GYMETRA.qr.entity.Recipe;
import com.GYMETRA.GYMETRA.qr.service.LocalNutritionService;
import com.GYMETRA.GYMETRA.qr.service.NutritionSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/nutrition")
@RequiredArgsConstructor
@Tag(name = "Nutrición Local", description = "Endpoints para generar planes nutricionales desde la base de datos local")
public class NutritionController {

    private final LocalNutritionService localNutritionService;
    private final NutritionSyncService nutritionSyncService;

    @Operation(summary = "Generar plan nutricional", description = "Genera un plan de alimentación (diario/semanal) basado en calorías y dieta usando datos locales")
    @GetMapping("/generate")
    public ResponseEntity<Map<String, Object>> generatePlan(
            @RequestParam(defaultValue = "day") String timeFrame,
            @RequestParam Double targetCalories,
            @RequestParam(required = false) String diet) {
        
        return ResponseEntity.ok(localNutritionService.generateMealPlan(timeFrame, targetCalories, diet));
    }

    @Operation(summary = "Obtener detalle de receta", description = "Obtiene la información completa de una receta guardada localmente")
    @GetMapping("/recipes/{id}")
    public ResponseEntity<Recipe> getRecipeDetail(@PathVariable Integer id) {
        return localNutritionService.getRecipeDetail(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Obtener imagen de la receta", description = "Obtiene el archivo binario de la imagen de una receta")
    @GetMapping("/recipes/{id}/image")
    public ResponseEntity<byte[]> getRecipeImage(@PathVariable Integer id) {
        return localNutritionService.getRecipeDetail(id)
                .map(recipe -> {
                    byte[] image = recipe.getImageData();
                    if (image == null) return new ResponseEntity<byte[]>(org.springframework.http.HttpStatus.NOT_FOUND);

                    org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                    headers.setContentType(org.springframework.http.MediaType.IMAGE_JPEG);
                    return new ResponseEntity<>(image, headers, org.springframework.http.HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(org.springframework.http.HttpStatus.NOT_FOUND));
    }

    @Operation(summary = "Sincronización manual", description = "Dispara manualmente la sincronización de recetas desde Spoonacular")
    @PostMapping("/sync")
    public ResponseEntity<String> syncNow() {
        new Thread(nutritionSyncService::syncRecipes).start();
        return ResponseEntity.ok("Sincronización iniciada en segundo plano.");
    }
}
