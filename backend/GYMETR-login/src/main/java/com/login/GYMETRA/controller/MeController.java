package com.login.GYMETRA.controller;

import com.login.GYMETRA.entity.User;
import com.login.GYMETRA.service.CognitoUserSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Endpoint that exposes the authenticated user's identity data.
 *
 * <p>Requires a valid Cognito access_token in the {@code Authorization: Bearer} header.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Me", description = "Información del usuario autenticado (requiere token Cognito)")
public class MeController {

    private final CognitoUserSyncService cognitoUserSyncService;

    /**
     * Returns the Cognito JWT claims and the corresponding local user profile.
     *
     * <p>On first call for a new Cognito user, a local profile is automatically
     * created in the database (find-or-create by sub).
     *
     * @param jwt the validated JWT injected by Spring Security
     * @return 200 with identity data
     */
    @Operation(
            summary = "Obtener perfil del usuario autenticado",
            description = "Retorna los claims del JWT de Cognito y el perfil local del usuario. " +
                    "Si es la primera vez que el usuario accede, se crea su registro local automáticamente.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil obtenido correctamente"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido")
    })
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal Jwt jwt) {
        // Sync or create the local user profile based on the Cognito sub
        User localUser = cognitoUserSyncService.syncUser(jwt);

        Map<String, Object> response = new LinkedHashMap<>();

        // --- Cognito identity ---
        response.put("sub",    jwt.getSubject());
        response.put("email",  jwt.getClaimAsString("email"));

        // --- Local profile ---
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("userId",    localUser.getUserId());
        profile.put("firstName", localUser.getFirstName());
        profile.put("lastName",  localUser.getLastName());
        profile.put("phone",     localUser.getPhone());
        profile.put("status",    localUser.getStatus());
        profile.put("photoUrl",  localUser.getPhotoUrl());
        profile.put("createdAt", localUser.getCreatedAt());
        profile.put("lastLogin", localUser.getLastLogin());
        response.put("localProfile", profile);

        // --- All Cognito claims (useful for debugging) ---
        response.put("cognitoClaims", jwt.getClaims());

        return ResponseEntity.ok(response);
    }
}
