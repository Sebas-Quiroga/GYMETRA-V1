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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
                .build();
        userRepository.save(user);

        Role role = roleRepository.findByRoleName("Client")
                .orElseThrow(() -> new IllegalStateException("Rol 'Client' no encontrado"));

        UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .build();
        userRoleRepository.save(userRole);

        // Construimos los claims para el token
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("email", user.getEmail());
        claims.put("roleIds", user.getUserRoles().stream()
                .map(ur -> ur.getRole().getRoleId())
                .collect(Collectors.toList()));

        String token = jwtService.generateToken(claims, user);

        return new JwtResponse(token, "Bearer");
    }

    public JwtResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        // Construimos los claims para el token
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("email", user.getEmail());
        claims.put("roleIds", user.getUserRoles().stream()
                .map(ur -> ur.getRole().getRoleId())
                .collect(Collectors.toList()));

        String token = jwtService.generateToken(claims, user);

        // Tomamos el primer rol asignado (si hay más, puedes ajustarlo)
        Long roleId = user.getUserRoles().stream()
                .findFirst()
                .map(ur -> ur.getRole().getRoleId())
                .orElseThrow(() -> new RuntimeException("Usuario sin rol asignado"));

        return new JwtResponse(token, "Bearer");
    }
}
