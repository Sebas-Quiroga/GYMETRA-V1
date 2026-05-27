package com.login.GYMETRA.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger configuration.
 *
 * <p>Registers a Bearer (JWT) security scheme so that the Swagger UI
 * shows an "Authorize" button where the user can paste a Cognito
 * access_token and test protected endpoints directly.
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("GYMETRA API")
                        .version("2.0")
                        .description("""
                                API de gestión de usuarios y membresías para GYMETRA.
                                
                                **Autenticación**: AWS Cognito — OAuth2 / OIDC
                                
                                Obtén tu `access_token` desde Cognito (en el frontend) y pégalo
                                en el botón **Authorize** → campo *Value*:
                                ```
                                Bearer eyJraWQiOi...
                                ```
                                """)
                        .contact(new Contact()
                                .name("GYMETRA Team")
                                .email("contact@gymetra.com")))
                // Apply bearerAuth to ALL operations by default
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, bearerScheme()));
    }

    private SecurityScheme bearerScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Pega el access_token de AWS Cognito (sin el prefijo 'Bearer ')");
    }
}