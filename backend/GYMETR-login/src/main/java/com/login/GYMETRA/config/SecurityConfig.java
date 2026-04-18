package com.login.GYMETRA.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Security configuration for GYMETRA.
 *
 * <p>Authentication is delegated entirely to AWS Cognito.
 * The backend acts as a stateless OAuth2 Resource Server that:
 * <ul>
 *   <li>Validates JWT signatures via Cognito JWKS endpoint</li>
 *   <li>Enforces audience claim to prevent token reuse across clients</li>
 *   <li>Maps Cognito groups (cognito:groups) to Spring ROLE_* authorities</li>
 * </ul>
 */
@Configuration
public class SecurityConfig {

    // ---------------------------------------------------------------
    // Cognito configuration constants
    // ---------------------------------------------------------------
    private static final String COGNITO_ISSUER =
            "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_ckSy7zPAt";

    /** App client ID — all incoming tokens MUST carry this audience. */
    private static final String COGNITO_CLIENT_ID = "3gnvfec5v6tfp32u634mq645ll";

    // ---------------------------------------------------------------
    // Security filter chain
    // ---------------------------------------------------------------
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Allow preflight (CORS) unconditionally
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public endpoints — no token required
                        .requestMatchers(
                                "/public/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // Everything else requires a valid Cognito JWT
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    // ---------------------------------------------------------------
    // JWT decoder — validates signature, issuer AND audience
    // ---------------------------------------------------------------

    /**
     * Custom {@link JwtDecoder} that:
     * <ol>
     *   <li>Fetches public keys from the Cognito JWKS endpoint</li>
     *   <li>Validates the standard issuer claim</li>
     *   <li>Validates the audience claim against our Cognito App Client ID,
     *       preventing tokens issued by the same pool for a different client
     *       from being accepted here</li>
     * </ol>
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = JwtDecoders.fromIssuerLocation(COGNITO_ISSUER);

        OAuth2TokenValidator<Jwt> issuerValidator =
                JwtValidators.createDefaultWithIssuer(COGNITO_ISSUER);

        OAuth2TokenValidator<Jwt> audienceValidator = jwt -> {
            List<String> audience = jwt.getAudience();
            if (audience != null && audience.contains(COGNITO_CLIENT_ID)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token",
                            "Token audience does not match the expected client_id", null)
            );
        };

        decoder.setJwtValidator(
                new DelegatingOAuth2TokenValidator<>(issuerValidator, audienceValidator)
        );

        return decoder;
    }

    // ---------------------------------------------------------------
    // Role mapping — Cognito groups → Spring ROLE_* authorities
    // ---------------------------------------------------------------

    /**
     * Maps the {@code cognito:groups} claim to Spring Security granted authorities.
     *
     * <p>Example: Cognito group {@code "Admin"} → {@code ROLE_Admin}
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<String> groups = jwt.getClaimAsStringList("cognito:groups");
            if (groups == null || groups.isEmpty()) {
                return List.of();
            }
            List<GrantedAuthority> authorities = new ArrayList<>();
            for (String group : groups) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + group));
            }
            return authorities;
        });

        return converter;
    }

    // ---------------------------------------------------------------
    // CORS
    // ---------------------------------------------------------------
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5173",   // Vite / Vue dev server
                "http://localhost:8100",   // Ionic
                "http://localhost:8101"    // Ionic alternate port
        ));
        config.addAllowedOriginPattern("http://*");
        config.addAllowedOriginPattern("https://*");

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
