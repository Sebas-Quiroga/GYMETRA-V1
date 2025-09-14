package com.login.GYMETRA.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type; // Bearer
    private Long userId;
    private String email;
    private Long roleId;
}