package app.whatchat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * WhatChat - Production Spring Boot 3.x Backend Application
 * Provides RESTful APIs, WebSocket STOMP real-time pub/sub,
 * MySQL 8.x persistence, S3 Object Storage signed URLs,
 * and the flagship My Space Event-Based Memory System.
 */
@SpringBootApplication
public class WhatChatApplication {

    public static void main(String[] args) {
        SpringApplication.run(WhatChatApplication.class, args);
    }
}
