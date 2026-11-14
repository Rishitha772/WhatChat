
package app.whatchat;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI whatChatOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("WhatChat API Documentation")
                        .description("Official REST API documentation for WhatChat – a real-time messaging application " +
                                "featuring 1:1 and group conversations, WebSocket messaging, personal memory capsules (My Space), " +
                                "contacts management, and notifications powered by MongoDB.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("WhatChat Engineering")
                                .email("support@whatchat.app")
                        )
                )
                .tags(List.of(
                        new Tag().name("Authentication").description("Registration, login, verification, and session control"),
                        new Tag().name("Users").description("User profile retrieval, search, avatar, and presence"),
                        new Tag().name("Contacts").description("Contact management and directory search"),
                        new Tag().name("Conversations").description("Direct and group conversation management"),
                        new Tag().name("Messages").description("Message sending, pagination, editing, deletion, and receipts"),
                        new Tag().name("My Space").description("Personal memory capsules and private event storage"),
                        new Tag().name("Notifications").description("In-app notifications and alerts")
                ))
                .components(new Components()
                        .addSecuritySchemes("cookieAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name("WHATCHAT_SESSION")
                                .description("Session cookie set automatically upon successful /api/v1/auth/login"))
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT token for authorization header (Bearer <token>)"))
                )
                .addSecurityItem(new SecurityRequirement().addList("cookieAuth").addList("bearerAuth"));
    }
}
