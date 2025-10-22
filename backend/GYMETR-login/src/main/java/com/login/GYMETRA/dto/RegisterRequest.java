package com.login.GYMETRA.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @NotBlank(message = "La identificación es obligatoria")
    @Pattern(regexp = "\\d{6,12}", message = "La identificación debe tener entre 6 y 12 dígitos")
    private long identification; // CAMBIADO A String

    // Foto del usuario, opcional
    private String photoUrl;
}
