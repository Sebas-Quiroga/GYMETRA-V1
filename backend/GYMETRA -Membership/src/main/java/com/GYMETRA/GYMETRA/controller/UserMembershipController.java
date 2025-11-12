package com.GYMETRA.GYMETRA.controller;

import com.GYMETRA.GYMETRA.entity.Membership;
import com.GYMETRA.GYMETRA.entity.UserMembership;
import com.GYMETRA.GYMETRA.service.MembershipService;
import com.GYMETRA.GYMETRA.service.UserMembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-memberships")
public class UserMembershipController {

    @Autowired
    private UserMembershipService userMembershipService;

    @Autowired
    private MembershipService membershipService;

    // Crear UserMembership
    @PostMapping("/user/{userId}/membership/{membershipId}")
    public ResponseEntity<UserMembership> create(@PathVariable Integer userId,
                                                 @PathVariable Integer membershipId) {
        Membership membership = membershipService.getMembershipById(membershipId);
        return ResponseEntity.ok(userMembershipService.createUserMembership(userId, membership));
    }

    // Listar todas las membresías de un usuario
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserMembership>> listByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(userMembershipService.getUserMembershipsByUserId(userId));
    }

    // Obtener UserMembership por ID
    @GetMapping("/{id}")
    public ResponseEntity<UserMembership> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(userMembershipService.getById(id));
    }

    // Actualizar status de UserMembership
    @PatchMapping("/{id}/status")
    public ResponseEntity<UserMembership> updateStatus(@PathVariable Integer id,
                                                       @RequestParam UserMembership.Status status) {
        return ResponseEntity.ok(userMembershipService.updateStatus(id, status));
    }

    // Eliminar UserMembership
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        userMembershipService.deleteUserMembership(id);
        return ResponseEntity.noContent().build();
    }
}
