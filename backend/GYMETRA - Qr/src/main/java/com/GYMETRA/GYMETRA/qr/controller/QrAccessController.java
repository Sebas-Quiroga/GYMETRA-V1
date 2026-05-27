package com.GYMETRA.GYMETRA.qr.controller;

import com.GYMETRA.GYMETRA.qr.entity.QrAccess;
import com.GYMETRA.GYMETRA.qr.entity.UserMin;
import com.GYMETRA.GYMETRA.qr.repository.UserMinRepository;
import com.GYMETRA.GYMETRA.qr.service.QrAccessService;
import com.GYMETRA.GYMETRA.qr.service.QrBusinessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qr-access")
@Tag(name = "QR Access", description = "Controlador para gestionar accesos mediante códigos QR")
@RequiredArgsConstructor
public class QrAccessController {
    
    private final QrAccessService qrAccessService;
    private final QrBusinessService qrBusinessService;
    private final UserMinRepository userMinRepository;

    @Operation(summary = "Obtener QR del usuario actual", description = "Identifica al usuario por su token de Cognito y devuelve su QR")
    @GetMapping("/me")
    public ResponseEntity<?> getMyQr(@AuthenticationPrincipal Jwt jwt) {
        String sub = jwt.getSubject();
        return userMinRepository.findByCognitoSub(sub)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(qrBusinessService.getOrCreateQrForUser(user.getUserId())))
                .orElse(ResponseEntity.status(404).body(Map.of("message", "Usuario no encontrado en la base de datos local.")));
    }

    @Operation(summary = "Listar todos los QRs de un usuario", description = "Recupera todos los registros de QR para un usuario específico")
    @GetMapping("/all/{userId}")
    public ResponseEntity<List<QrAccess>> getAllByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(qrAccessService.getAllByUserId(userId));
    }

    @Operation(summary = "Obtener o crear QR por ID", description = "Recupera el QR activo o genera uno nuevo si no existe")
    @GetMapping("/user/{userId}")
    public ResponseEntity<QrAccess> getOrCreateQr(@PathVariable Long userId) {
        return ResponseEntity.ok(qrBusinessService.getOrCreateQrForUser(userId));
    }

    @Operation(summary = "Crear registro de QR", description = "Crea manualmente un nuevo registro de acceso QR")
    @PostMapping
    public ResponseEntity<QrAccess> createQr(@RequestBody QrAccess qrAccess) {
        return ResponseEntity.ok(qrAccessService.save(qrAccess));
    }
}