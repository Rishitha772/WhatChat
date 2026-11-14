
package app.whatchat;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public WhatChatApplication whatChatOpenAPI() {
        return new WhatChatApplication()
                .info(new Info()
                        .title("WhatChat API Documentation")
                        .description(
                                "Official REST API documentation for WhatChat. " +
                                "A real-time messaging application with personal " +
                                "memory storage, authentication and communication features."
                        )
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("WhatChat Development Team")
                                .email("rishithakhandesh@gmail.com")
                        )
                );
    }
}
