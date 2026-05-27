package com.GYMETRA.GYMETRA.qr.controller;

import com.GYMETRA.GYMETRA.qr.service.MembershipProxyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/memberships-proxy")
@Tag(name = "Proxy de Membresías", description = "Proxy para consultar el estado de membresía desde otros servicios")
@RequiredArgsConstructor
public class MembershipProxyController {

    private final MembershipProxyService membershipProxyService;
    private final RestTemplate restTemplate;

    @Value("${app.services.membership-url}")
    private String membershipApiUrl;

    @Operation(summary = "Consultar membresía de usuario", description = "Consulta el estado de membresía llamando al microservicio de Membresías")
    @GetMapping("/{userId}")
    public ResponseEntity<?> getMembership(@PathVariable Long userId) {
        try {
            String url = membershipApiUrl + "/user-memberships/user/" + userId;
            Object response = restTemplate.getForObject(url, Object.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(502).body("Error consultando membresía: " + e.getMessage());
        }
    }

    @Operation(summary = "Verificar permiso de usuario", description = "Verifica si el usuario tiene un permiso específico (training/nutrition)")
    @GetMapping("/{userId}/check-permission/{permission}")
    public ResponseEntity<Boolean> checkPermission(@PathVariable Long userId, @PathVariable String permission) {
        return ResponseEntity.ok(membershipProxyService.checkPermission(userId, permission));
    }
}

