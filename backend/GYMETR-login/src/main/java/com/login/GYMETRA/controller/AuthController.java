package com.login.GYMETRA.controller;

import com.login.GYMETRA.dto.LoginRequest;
import com.login.GYMETRA.dto.RegisterRequest;
import com.login.GYMETRA.dto.JwtResponse;
import com.login.GYMETRA.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody RegisterRequest request) {
        JwtResponse jwtResponse = userService.register(request);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        JwtResponse response = userService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(response);
    }
}
