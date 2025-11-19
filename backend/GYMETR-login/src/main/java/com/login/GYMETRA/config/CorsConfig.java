package com.login.GYMETRA.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * Configuración CORS adicional para asegurar que funcione correctamente
 * con túneles públicos de VS Code.
 */
@Configuration
public class CorsConfig {

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistration() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // ✅ Permitir cualquier origen usando patrones específicos
        // Con allowCredentials, no podemos usar "*" directamente
        configuration.addAllowedOriginPattern("https://*");
        configuration.addAllowedOriginPattern("http://*");
        configuration.addAllowedOriginPattern("https://*.use.devtunnels.ms");
        configuration.addAllowedOriginPattern("http://*.use.devtunnels.ms");
        configuration.addAllowedOriginPattern("https://*.vscode-cdn.net");
        configuration.addAllowedOriginPattern("http://*.vscode-cdn.net");
        
        // Orígenes específicos de localhost
        configuration.addAllowedOrigin("http://localhost:8100");
        configuration.addAllowedOrigin("http://localhost:8101");
        configuration.addAllowedOrigin("http://localhost:8080");
        configuration.addAllowedOrigin("http://127.0.0.1:8100");
        configuration.addAllowedOrigin("http://127.0.0.1:8101");
        
        // Permitir todos los métodos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        
        // Permitir todos los headers
        configuration.setAllowedHeaders(List.of("*"));
        
        // Permitir credenciales
        configuration.setAllowCredentials(true);
        
        // Exponer headers
        configuration.setExposedHeaders(List.of("Authorization"));
        
        // Cache preflight
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        
        return bean;
    }
}

