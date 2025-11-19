package com.login.GYMETRA.config;

import com.login.GYMETRA.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ✅ CRÍTICO: Permitir preflight (CORS) ANTES que cualquier otra cosa
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Rutas públicas
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/api/auth/validate-token",
                                "/api/auth/users",
                                "/api/auth/users/{userId}",              // ✅ ahora accesible sin JWT
                                "/api/auth/users/{userId}/status",       // ✅ actualizar estado de usuario
                                "/api/roles/**",                         // ✅ rutas de roles públicas
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // Todo lo demás requiere autenticación
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ IMPORTANTE: Con allowCredentials(true), NO podemos usar patrones genéricos como "*"
        // Debemos usar patrones específicos o orígenes específicos
        
        // ✅ Orígenes específicos para localhost
        configuration.addAllowedOrigin("http://localhost:8101");
        configuration.addAllowedOrigin("http://localhost:8100");
        configuration.addAllowedOrigin("http://localhost:8080");
        configuration.addAllowedOrigin("http://127.0.0.1:8100");
        configuration.addAllowedOrigin("http://127.0.0.1:8101");
        
        // ✅ Orígenes específicos para IPs locales
        configuration.addAllowedOrigin("http://175.100.1.214"); // tu IP específica
        configuration.addAllowedOrigin("http://192.168.0.11");  // IP local (si usas red LAN)
        
        // ✅ Patrones específicos para VS Code Dev Tunnels (túneles públicos)
        // Estos patrones permiten cualquier subdominio de devtunnels.ms y vscode-cdn.net
        // IMPORTANTE: Con allowCredentials, debemos usar patrones específicos, no genéricos
        configuration.addAllowedOriginPattern("https://*.use.devtunnels.ms");
        configuration.addAllowedOriginPattern("https://*.vscode-cdn.net");
        configuration.addAllowedOriginPattern("http://*.use.devtunnels.ms");
        configuration.addAllowedOriginPattern("http://*.vscode-cdn.net");
        
        // ✅ Permitir cualquier origen HTTPS (para desarrollo con túneles)
        // Nota: Esto funciona porque no usamos allowCredentials con este patrón
        configuration.addAllowedOriginPattern("https://*");
        configuration.addAllowedOriginPattern("http://*");

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight por 1 hora

        // Aplicar configuración global
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
