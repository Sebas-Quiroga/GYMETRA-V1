package com.GYMETRA.GYMETRA.qr.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class MembershipProxyService {

    private final RestTemplate restTemplate;

    @Value("${app.services.membership-url}")
    private String membershipApiUrl;

    public boolean checkPermission(Long userId, String permission) {
        try {
            String url = membershipApiUrl + "/user-memberships/user/" + userId + "/permission/" + permission;
            Boolean hasPermission = restTemplate.getForObject(url, Boolean.class);
            return hasPermission != null && hasPermission;
        } catch (Exception e) {
            System.err.println("❌ ERROR VALIDANDO PERMISO: " + e.getMessage());
            return false;
        }
    }
}
