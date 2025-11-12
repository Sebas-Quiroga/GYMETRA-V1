package com.Membership.GYMETRA.controller;

import com.Membership.GYMETRA.entity.UserMembership;
import com.Membership.GYMETRA.service.UserMembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-memberships")
public class UserMembershipController {

    private final UserMembershipService userMembershipService;

    public UserMembershipController(UserMembershipService userMembershipService) {
        this.userMembershipService = userMembershipService;
    }

    // =====================================
    // 1️⃣ Crear o actualizar membresía
    // =====================================
    @PostMapping
    public ResponseEntity<UserMembership> createOrUpdateMembership(@RequestBody UserMembership userMembership) {
        try {
            UserMembership saved = userMembershipService.createOrUpdateMembership(userMembership);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // =====================================
    // 2️⃣ Activar membresía
    // =====================================
    @PutMapping("/{id}/activate")
    public ResponseEntity<UserMembership> activateMembership(@PathVariable Integer id) {
        return updateMembershipStatus(id, UserMembership.Status.ACTIVE);
    }

    // =====================================
    // 3️⃣ Suspender membresía
    // =====================================
    @PutMapping("/{id}/suspend")
    public ResponseEntity<UserMembership> suspendMembership(@PathVariable Integer id) {
        return updateMembershipStatus(id, UserMembership.Status.SUSPENDED);
    }

    // =====================================
    // 4️⃣ Cancelar membresía
    // =====================================
    @PutMapping("/{id}/cancel")
    public ResponseEntity<UserMembership> cancelMembership(@PathVariable Integer id) {
        return updateMembershipStatus(id, UserMembership.Status.CANCELED);
    }

    // =====================================
    // Método interno para actualizar status
    // =====================================
    private ResponseEntity<UserMembership> updateMembershipStatus(Integer id, UserMembership.Status status) {
        return userMembershipService.getUserMembershipById(id)
                .map(membership -> {
                    membership.setStatus(status);
                    UserMembership updated = userMembershipService.createOrUpdateMembership(membership);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // =====================================
    // 5️⃣ Listar todas las membresías de un usuario
    // =====================================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserMembership>> getMembershipsByUser(@PathVariable Integer userId) {
        List<UserMembership> memberships = userMembershipService.getUserMembershipsByUserId(userId);
        return ResponseEntity.ok(memberships);
    }

    // =====================================
    // 6️⃣ Obtener días restantes de la última membresía activa
    // =====================================
    @GetMapping("/user/{userId}/remaining-days")
    public ResponseEntity<Long> getRemainingDays(@PathVariable Integer userId) {
        return userMembershipService.getLatestActiveMembership(userId)
                .map(membership -> ResponseEntity.ok(userMembershipService.getRemainingDays(membership)))
                .orElse(ResponseEntity.notFound().build());
    }

    // =====================================
    // 7️⃣ Tarea programada para eliminar pendientes > 5 minutos
    // =====================================
    @Scheduled(fixedRate = 60000) // Cada 1 minuto
    public void cleanupPendingMemberships() {
        userMembershipService.deletePendingOlderThanMinutes(5);
    }
}
