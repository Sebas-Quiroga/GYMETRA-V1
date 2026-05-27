package com.GYMETRA.GYMETRA.qr.controller;

import com.GYMETRA.GYMETRA.qr.dto.AccessLogResponse;
import com.GYMETRA.GYMETRA.qr.dto.EntradaSalidaRequest;
import com.GYMETRA.GYMETRA.qr.entity.AccessLog;
import com.GYMETRA.GYMETRA.qr.service.AccessLogService;
import com.GYMETRA.GYMETRA.qr.service.AccessLogBusinessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/access-log")
@Tag(name = "Logs de Acceso", description = "Controlador para registrar entradas y salidas")
@RequiredArgsConstructor
public class AccessLogController {
    
    private final AccessLogService accessLogService;
    private final AccessLogBusinessService accessLogBusinessService;

    @Operation(summary = "Listar todos los logs", description = "Obtiene el historial completo de accesos")
    @GetMapping
    public ResponseEntity<List<AccessLogResponse>> getAllLogs() {
        List<AccessLogResponse> responses = accessLogService.getAllLogs().stream()
                .map(AccessLogResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Marcar entrada", description = "Registra el ingreso de un usuario a una sucursal")
    @PostMapping("/entrada")
    public ResponseEntity<?> marcarEntrada(@RequestBody EntradaSalidaRequest req) {
        try {
            AccessLog log = accessLogBusinessService.marcarIngreso(req.getUserId(), req.getBranchId());
            return ResponseEntity.ok(new AccessLogResponse(log));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Operation(summary = "Marcar salida", description = "Registra el egreso de un usuario de una sucursal")
    @PostMapping("/salida")
    public ResponseEntity<?> marcarSalida(@RequestBody EntradaSalidaRequest req) {
        try {
            AccessLog log = accessLogBusinessService.marcarSalida(req.getUserId(), req.getBranchId());
            return ResponseEntity.ok(new AccessLogResponse(log));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}