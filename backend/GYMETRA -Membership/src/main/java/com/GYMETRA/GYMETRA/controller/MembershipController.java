package com.GYMETRA.GYMETRA.controller;

import com.GYMETRA.GYMETRA.entity.Membership;
import com.GYMETRA.GYMETRA.service.MembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memberships")
public class MembershipController {

    @Autowired
    private MembershipService membershipService;

    // Crear membresía
    @PostMapping
    public ResponseEntity<Membership> create(@RequestBody Membership membership) {
        return ResponseEntity.ok(membershipService.createMembership(membership));
    }

    // Listar todas las membresías
    @GetMapping
    public ResponseEntity<List<Membership>> listAll() {
        return ResponseEntity.ok(membershipService.getAllMemberships());
    }

    // Obtener membresía por ID
    @GetMapping("/{id}")
    public ResponseEntity<Membership> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(membershipService.getMembershipById(id));
    }

    // Actualizar membresía
    @PutMapping("/{id}")
    public ResponseEntity<Membership> update(@PathVariable Integer id, @RequestBody Membership membership) {
        return ResponseEntity.ok(membershipService.updateMembership(id, membership));
    }

    // Eliminar membresía
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        membershipService.deleteMembership(id);
        return ResponseEntity.noContent().build();
    }
}
