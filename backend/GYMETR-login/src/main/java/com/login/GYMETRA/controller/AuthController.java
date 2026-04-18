package com.login.GYMETRA.controller;

import com.login.GYMETRA.dto.EditUserRequest;
import com.login.GYMETRA.entity.User;
import com.login.GYMETRA.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CRUD endpoints for User management.
 *
 * <p>Authentication is handled upstream by AWS Cognito — all endpoints here
 * require a valid Cognito JWT in the {@code Authorization: Bearer} header.
 *
 * <p>The {@code /login} and {@code /register} endpoints have been removed.
 * Cognito manages the full authentication lifecycle.  Use {@code POST /api/users/profile}
 * to store extra profile data after Cognito registration if needed.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestión de usuarios — requiere token Cognito")
public class AuthController {

    private final UserService userService;

    // ---------------------------------------------------------------
    // Obtener todos los usuarios
    // ---------------------------------------------------------------
    @Operation(
            summary = "Listar usuarios",
            description = "Devuelve todos los usuarios registrados.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Lista obtenida"))
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ---------------------------------------------------------------
    // Obtener usuario por ID
    // ---------------------------------------------------------------
    @Operation(
            summary = "Obtener usuario por ID",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUserById(
            @Parameter(description = "ID del usuario", required = true)
            @PathVariable Long userId) {
        return userService.getUserById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ---------------------------------------------------------------
    // Editar usuario
    // ---------------------------------------------------------------
    @Operation(
            summary = "Editar usuario",
            description = "Actualiza los datos de un usuario existente.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario actualizado",
                    content = @Content(schema = @Schema(implementation = User.class))),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> editUser(
            @Parameter(description = "ID del usuario a editar", required = true)
            @PathVariable Long userId,
            @RequestBody EditUserRequest request) {
        return userService.editUserById(userId, request)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ---------------------------------------------------------------
    // Eliminar usuario
    // ---------------------------------------------------------------
    @Operation(
            summary = "Eliminar usuario",
            description = "Elimina un usuario por su ID.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario eliminado"),
            @ApiResponse(responseCode = "404", description = "No encontrado")
    })
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(
            @Parameter(description = "ID del usuario a eliminar", required = true)
            @PathVariable Long userId) {
        boolean deleted = userService.deleteUser(userId);
        return deleted
                ? ResponseEntity.ok("Usuario eliminado exitosamente")
                : ResponseEntity.notFound().build();
    }

    // ---------------------------------------------------------------
    // Suspender / activar cuenta
    // ---------------------------------------------------------------
    @Operation(
            summary = "Cambiar estado de cuenta",
            description = "Cambia el estado de un usuario a 'active' o 'suspended'.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estado actualizado"),
            @ApiResponse(responseCode = "400", description = "Estado inválido"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<String> updateUserStatus(
            @Parameter(description = "ID del usuario", required = true)
            @PathVariable Long userId,
            @Parameter(description = "Nuevo estado: 'active' o 'suspended'", required = true)
            @RequestParam String status) {
        boolean updated = userService.updateUserStatus(userId, status);
        if (!updated) return ResponseEntity.notFound().build();
        return ResponseEntity.ok("Estado actualizado a: " + status);
    }
}
