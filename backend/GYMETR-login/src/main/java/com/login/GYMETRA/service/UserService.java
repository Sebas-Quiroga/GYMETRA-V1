package com.login.GYMETRA.service;

import com.login.GYMETRA.dto.JwtResponse;
import com.login.GYMETRA.dto.RegisterRequest;
import com.login.GYMETRA.entity.Role;
import com.login.GYMETRA.entity.User;
import com.login.GYMETRA.entity.UserRole;
import com.login.GYMETRA.repository.RoleRepository;
import com.login.GYMETRA.repository.UserRepository;
import com.login.GYMETRA.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final String DEFAULT_USER_ROLE = "Client";

    @Transactional
    public JwtResponse register(RegisterRequest request) {
        try {
            validateRegistrationRequest(request);

            Role clientRole = roleRepository.findByRoleName(DEFAULT_USER_ROLE)
                    .orElseThrow(() -> new IllegalStateException("Rol " + DEFAULT_USER_ROLE + " no encontrado"));

            User user = User.builder()
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .phone(request.getPhone())
                    .status("active")
                    .identification(request.getIdentification())
                    .photoUrl(request.getPhotoUrl())
                    .createdAt(OffsetDateTime.now())
                    .build();

            UserRole userRole = UserRole.builder()
                    .user(user)
                    .role(clientRole)
                    .build();

            user.setUserRoles(new HashSet<>(Set.of(userRole)));
            clientRole.getUserRoles().add(userRole);

            User savedUser = userRepository.save(user);

            String token = jwtService.generateToken(buildJwtClaims(savedUser), savedUser);

            return new JwtResponse(true, token, "Bearer", "Registro exitoso");

        } catch (UserAlreadyExistsException | IllegalArgumentException ex) {
            return new JwtResponse(false, null, null, ex.getMessage());
        }
    }

    private void validateRegistrationRequest(RegisterRequest request) {
        validateIdentification(request.getIdentification());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("El email ya está registrado");
        }

        if (userRepository.existsByIdentification(request.getIdentification())) {
            throw new UserAlreadyExistsException("La identificación ya está registrada");
        }
    }

    private void validateIdentification(Long identification) {
        if (identification == null || identification <= 0) {
            throw new IllegalArgumentException("El número de identificación es obligatorio");
        }

        int length = identification.toString().length();
        if (length < 6 || length > 12) {
            throw new IllegalArgumentException("El número de identificación debe tener entre 6 y 12 dígitos");
        }
    }

    private Map<String, Object> buildJwtClaims(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("email", user.getEmail());
        claims.put("firstName", user.getFirstName());
        claims.put("lastName", user.getLastName());
        claims.put("status", user.getStatus());
        claims.put("identification", user.getIdentification());
        claims.put("photoUrl", user.getPhotoUrl());
        claims.put("roleIds", user.getUserRoles().stream()
                .map(ur -> ur.getRole().getRoleId())
                .collect(Collectors.toList()));
        return claims;
    }

    public JwtResponse login(String email, String password) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return new JwtResponse(false, null, null, "Usuario no encontrado");
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return new JwtResponse(false, null, null, "Contraseña incorrecta");
        }

        String token = jwtService.generateToken(buildJwtClaims(user), user);
        return new JwtResponse(true, token, "Bearer", "Login exitoso");
    }

    public static class UserAlreadyExistsException extends RuntimeException {
        public UserAlreadyExistsException(String message) {
            super(message);
        }
    }
}
