package app.whatchat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * WhatChat - Production Spring Boot 3.x Backend Application
 * Provides RESTful APIs, WebSocket STOMP real-time pub/sub,
 * MongoDB NoSQL storage for Chats & My Space, MySQL/H2 auth persistence,
 * S3 Object Storage signed URLs, and personal memory capsules.
 */
@SpringBootApplication
@EntityScan(basePackages = "app.whatchat.auth")
@EnableJpaRepositories(basePackages = "app.whatchat.auth")
public class WhatChatApplication {

    public static void main(String[] args) {
        SpringApplication.run(WhatChatApplication.class, args);
    }
}
