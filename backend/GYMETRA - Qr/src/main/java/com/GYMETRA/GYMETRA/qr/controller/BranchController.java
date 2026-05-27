package com.GYMETRA.GYMETRA.qr.controller;

import com.GYMETRA.GYMETRA.qr.entity.Branch;
import com.GYMETRA.GYMETRA.qr.service.BranchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/branches")
@Tag(name = "Sucursales", description = "Controlador para gestionar las sedes del gimnasio")
@RequiredArgsConstructor
public class BranchController {
    
    private final BranchService branchService;

    @Operation(summary = "Listar sucursales", description = "Obtiene la lista de todas las sedes registradas")
    @GetMapping
    public ResponseEntity<List<Branch>> getAllBranches() {
        return ResponseEntity.ok(branchService.getAllBranches());
    }

    @Operation(summary = "Crear sucursal", description = "Registra una nueva sede en el sistema")
    @PostMapping
    public ResponseEntity<Branch> createBranch(@RequestBody Branch branch) {
        return ResponseEntity.ok(branchService.saveBranch(branch));
    }
}