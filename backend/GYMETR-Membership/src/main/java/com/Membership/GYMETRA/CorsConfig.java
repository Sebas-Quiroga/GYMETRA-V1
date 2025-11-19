package com.Membership.GYMETRA;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // todos los endpoints
                        // Patrones generales (permiten cualquier dominio)
                        .allowedOriginPatterns(
                                "http://*",
                                "https://*",
                                // Patrones específicos para VS Code Dev Tunnels (túneles públicos)
                                "https://*.use.devtunnels.ms",
                                "https://*.vscode-cdn.net",
                                "http://*.use.devtunnels.ms",
                                "http://*.vscode-cdn.net"
                        )
                        // Orígenes específicos para localhost
                        .allowedOrigins(
                                "http://localhost:8100",
                                "http://localhost:8101",
                                "http://localhost:8080",
                                "http://localhost:8081",
                                "http://127.0.0.1:8100",
                                "http://127.0.0.1:8101"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
