package com.login.GYMETRA.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String firstName;

    @NotBlank(message = "El apellido es obligatorio")
    private String lastName;

    @Email(message = "Correo inválido")
    @NotBlank(message = "El email es obligatorio")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    private String phone;

    @NotNull(message = "La identificación es obligatoria")
    @Min(value = 100000, message = "La identificación debe tener al menos 6 dígitos")
    private Long identification;

    // Foto del usuario, opcional
    private String photoUrl;
}
