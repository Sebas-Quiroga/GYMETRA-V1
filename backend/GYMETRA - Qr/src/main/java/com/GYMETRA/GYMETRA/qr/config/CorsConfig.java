package com.GYMETRA.GYMETRA.qr.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/**")
                        // Orígenes específicos para localhost
                        .allowedOrigins("http://localhost:8100", "http://127.0.0.1:8100", "http://175.100.9.251:8100")
                        // Patrones para permitir túneles públicos de VS Code
                        .allowedOriginPatterns(
                                "http://*",
                                "https://*",
                                "https://*.use.devtunnels.ms",
                                "https://*.vscode-cdn.net",
                                "http://*.use.devtunnels.ms",
                                "http://*.vscode-cdn.net"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
