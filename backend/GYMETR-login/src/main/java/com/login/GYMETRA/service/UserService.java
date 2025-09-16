package com.login.GYMETRA.service;

import com.login.GYMETRA.dto.JwtResponse;
import com.login.GYMETRA.dto.RegisterRequest;
import com.login.GYMETRA.entity.Role;
import com.login.GYMETRA.entity.User;
import com.login.GYMETRA.entity.UserRole;
import com.login.GYMETRA.repository.RoleRepository;
import com.login.GYMETRA.repository.UserRepository;
import com.login.GYMETRA.repository.UserRoleRepository;
import com.login.GYMETRA.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public JwtResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .status("active")
                .createdAt(OffsetDateTime.now())
                .userRoles(new HashSet<>()) // 🔹 aseguramos que no sea null
                .build();
        userRepository.save(user);

        // Rol Client por defecto
        Role role = roleRepository.findByRoleName("Client")
                .orElseThrow(() -> new IllegalStateException("Rol 'Client' no encontrado"));

        UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .build();

        // 🔹 agregamos también en memoria
        user.getUserRoles().add(userRole);

        userRoleRepository.save(userRole);

        // Tomar ese rol
        Long roleId = role.getRoleId();

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("email", user.getEmail());
        claims.put("roleId", roleId);

        String token = jwtService.generateToken(claims, user);

        return new JwtResponse(token, "Bearer", user.getUserId(), user.getEmail(), roleId);
    }

    public JwtResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Contraseña incorrecta");
        }
        // 🔹 Actualizamos la fecha/hora de último login
        user.setLastLogin(OffsetDateTime.now());
        userRepository.save(user);

        // Tomamos el primer rol asignado (único en este caso)
        Long roleId = user.getUserRoles().stream()
                .findFirst()
                .map(ur -> ur.getRole().getRoleId())
                .orElseThrow(() -> new RuntimeException("Usuario sin rol asignado"));

        // Claims del token
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("email", user.getEmail());
        claims.put("roleId", roleId); // 🔹 solo un rol

        String token = jwtService.generateToken(claims, user);

        return new JwtResponse(token, "Bearer", user.getUserId(), user.getEmail(), roleId);
    }
}
