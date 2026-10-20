package com.changeripple.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "BearerAuth";

        return new OpenAPI()
                .info(new Info()
<<<<<<< HEAD
                        .title("ChangeRipple v2.0 API")
                        .description("Advanced Software Change Impact Intelligence Platform REST API")
                        .version("2.0.0")
=======
                        .title("ChangeRipple API")
                        .description("Advanced Software Change Impact Intelligence Platform REST API")
                        .version("1.0.0")
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
                        .contact(new Contact().name("ChangeRipple Engineering").email("support@changeripple.io"))
                        .license(new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT access token (Bearer format)")));
    }
}
