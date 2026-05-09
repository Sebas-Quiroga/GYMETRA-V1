package com.GYMETRA.GYMETRA.qr.controller;

import com.GYMETRA.GYMETRA.qr.entity.Exercise;
import com.GYMETRA.GYMETRA.qr.repository.ExerciseRepository;
import com.GYMETRA.GYMETRA.qr.service.ExerciseSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import com.GYMETRA.GYMETRA.qr.service.MembershipProxyService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API para la gestión de ejercicios.
 * Sirve datos desde la base de datos local para independencia total de APIs
 * externas.
 */
@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
@Tag(name = "Fitness Exercises", description = "Endpoints para consultar la base de datos local de ejercicios y GIFs")
@CrossOrigin(origins = "*") // Permitir acceso desde el frontend
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseSyncService syncService;
    private final MembershipProxyService membershipProxyService;

    @GetMapping
    @Operation(summary = "Obtener todos los ejercicios", description = "Lista completa de ejercicios traducidos")
    public ResponseEntity<?> getAllExercises(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null || !membershipProxyService.checkPermission(userId, "training")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Acceso denegado: Se requiere membresía con permiso de entrenamiento.");
        }

        return ResponseEntity.ok(exerciseRepository.findAll());
    }

    @GetMapping("/bodyPart/{bodyPart}")
    @Operation(summary = "Obtener ejercicios por parte del cuerpo", description = "Busca en la BD local")
    public ResponseEntity<?> getByBodyPart(
            @PathVariable String bodyPart,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null || !membershipProxyService.checkPermission(userId, "training")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Acceso denegado: Se requiere membresía con permiso de entrenamiento.");
        }

        return ResponseEntity.ok(exerciseRepository.findByBodyPartIgnoreCase(bodyPart));
    }

    @GetMapping("/target/{target}")
    @Operation(summary = "Obtener ejercicios por músculo objetivo", description = "Busca en la BD local")
    public ResponseEntity<?> getByTarget(
            @PathVariable String target,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null || !membershipProxyService.checkPermission(userId, "training")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Acceso denegado: Se requiere membresía con permiso de entrenamiento.");
        }

        return ResponseEntity.ok(exerciseRepository.findByTargetIgnoreCase(target));
    }

    @GetMapping("/equipment/{equipment}")
    @Operation(summary = "Obtener ejercicios por equipo", description = "Busca en la BD local")
    public ResponseEntity<?> getByEquipment(
            @PathVariable String equipment,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if (userId == null || !membershipProxyService.checkPermission(userId, "training")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Acceso denegado: Se requiere membresía con permiso de entrenamiento.");
        }

        return ResponseEntity.ok(exerciseRepository.findByEquipmentIgnoreCase(equipment));
    }

    @GetMapping("/exercise/{id}")
    @Operation(summary = "Obtener un ejercicio por ID")
    public ResponseEntity<?> getById(@PathVariable String id) {
        return exerciseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Buscar ejercicios por nombre")
    public ResponseEntity<?> getByName(@PathVariable String name) {
        return ResponseEntity.ok(exerciseRepository.findByNameContainingIgnoreCase(name));
    }

    @GetMapping("/targetList")
    @Operation(summary = "Listado de músculos objetivo disponibles")
    public ResponseEntity<List<String>> getTargetList() {
        return ResponseEntity.ok(exerciseRepository.findAllTargets());
    }

    @GetMapping("/bodyPartList")
    @Operation(summary = "Listado de partes del cuerpo disponibles")
    public ResponseEntity<List<String>> getBodyPartList() {
        return ResponseEntity.ok(exerciseRepository.findAllBodyParts());
    }

    @GetMapping("/equipmentList")
    @Operation(summary = "Listado de equipos disponibles")
    public ResponseEntity<List<String>> getEquipmentList() {
        return ResponseEntity.ok(exerciseRepository.findAllEquipment());
    }

    @GetMapping("/{id}/gif")
    @Operation(summary = "Obtener el GIF binario de un ejercicio")
    public ResponseEntity<byte[]> getExerciseGif(@PathVariable String id) {
        return exerciseRepository.findById(id)
                .map(exercise -> {
                    byte[] image = exercise.getGifData();
                    if (image == null)
                        return new ResponseEntity<byte[]>(HttpStatus.NOT_FOUND);

                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.IMAGE_GIF);
                    return new ResponseEntity<>(image, headers, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/sync/force")
    @Operation(summary = "Forzar sincronización inmediata", description = "Descarga datos de RapidAPI a SQL")
    public ResponseEntity<String> forceSync() {
        // En un entorno real, esto debería estar protegido para administradores
        new Thread(syncService::syncAllExercises).start(); // Ejecución asíncrona para evitar timeout del cliente
        return ResponseEntity.ok("Sincronización iniciada en segundo plano.");
    }

    @PostMapping("/sync/clear-and-force")
    @Operation(summary = "Limpiar y resincronizar", description = "Borra la tabla y reinicia la descarga")
    public ResponseEntity<String> clearAndForceSync() {
        new Thread(syncService::clearAndSync).start();
        return ResponseEntity.ok("Limpieza iniciada. Sincronizando catálogo en segundo plano...");
    }
}
