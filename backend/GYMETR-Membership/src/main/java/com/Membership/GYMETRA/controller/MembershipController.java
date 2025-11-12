package com.Membership.GYMETRA.controller;

import com.Membership.GYMETRA.entity.Membership;
import com.Membership.GYMETRA.service.MembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MembershipController {

    private final MembershipService membershipService;

    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    // Listar todas las membresías
    @GetMapping("/memberships")
    public ResponseEntity<List<Membership>> getAllMemberships() {
        List<Membership> memberships = membershipService.getAllMemberships();
        return ResponseEntity.ok(memberships);
    }

    // Endpoint específico para obtener membresías disponibles (alias)
    @GetMapping("/memberships/available") 
    public ResponseEntity<List<Membership>> getAvailableMemberships() {
        List<Membership> memberships = membershipService.getAllMemberships();
        return ResponseEntity.ok(memberships);
    }

    // Obtener membresía por ID
    @GetMapping("/memberships/{id}")
    public ResponseEntity<Membership> getMembershipById(@PathVariable Integer id) {
        return membershipService.getMembershipById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Crear nueva membresía
    @PostMapping("/memberships")
    public ResponseEntity<Membership> createMembership(@RequestBody Membership membership) {
        Membership saved = membershipService.saveMembership(membership);
        return ResponseEntity.ok(saved);
    }

    // Actualizar membresía
    @PutMapping("/memberships/{id}")
    public ResponseEntity<Membership> updateMembership(@PathVariable Integer id, @RequestBody Membership membership) {
        return membershipService.getMembershipById(id)
                .map(existing -> {
                    membership.setMembershipId(existing.getMembershipId());
                    return ResponseEntity.ok(membershipService.saveMembership(membership));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Eliminar membresía
    @DeleteMapping("/memberships/{id}")
    public ResponseEntity<Void> deleteMembership(@PathVariable Integer id) {
        membershipService.deleteMembership(id);
        return ResponseEntity.noContent().build();
    }
}
