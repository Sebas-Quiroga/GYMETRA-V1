package com.login.GYMETRA.controller;

import com.login.GYMETRA.dto.LoginRequest;
import com.login.GYMETRA.dto.RegisterRequest;
import com.login.GYMETRA.dto.EditUserRequest;
import com.login.GYMETRA.dto.JwtResponse;
import com.login.GYMETRA.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "API para gestión de autenticación y usuarios")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
public class AuthController {

    private final UserService userService;

    @Operation(summary = "Registrar nuevo usuario", description = "Registra un nuevo usuario en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario registrado exitosamente",
            content = @Content(schema = @Schema(implementation = JwtResponse.class))),
        @ApiResponse(responseCode = "400", description = "Datos de registro inválidos")
    })
    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody RegisterRequest request) {
        JwtResponse jwtResponse = userService.register(request);

        // Determinar HTTP status basado en éxito
        HttpStatus status = jwtResponse.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(jwtResponse);
    }

    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario y devuelve un token JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login exitoso",
            content = @Content(schema = @Schema(implementation = JwtResponse.class))),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        JwtResponse response = userService.login(request.getEmail(), request.getPassword());

        HttpStatus status;
        if (response.isSuccess()) {
            status = HttpStatus.OK;
        } else {
            // Usuario no encontrado o contraseña incorrecta
            status = response.getMessage().equalsIgnoreCase("Usuario no encontrado")
                    ? HttpStatus.NOT_FOUND
                    : HttpStatus.UNAUTHORIZED;
        }

        return ResponseEntity.status(status).body(response);
    }

    @Operation(
        summary = "Editar usuario",
        description = "Actualiza los datos de un usuario existente. Requiere autenticación con JWT token."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Usuario actualizado exitosamente",
            content = @Content(schema = @Schema(implementation = JwtResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos de actualización inválidos"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "No autorizado - Token JWT faltante o inválido"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Prohibido - No tiene permisos para editar este usuario"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Usuario no encontrado"
        )
    })
    @PutMapping("/users/{userId}")
    public ResponseEntity<JwtResponse> editUser(
            @Parameter(description = "ID del usuario a editar", required = true)
            @PathVariable Long userId,
            @Parameter(description = "Datos del usuario a actualizar", required = true,
                    schema = @Schema(implementation = EditUserRequest.class))
            @RequestBody EditUserRequest request) {
        JwtResponse response = userService.editUser(userId, request);
        
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

}
