package app.whatchat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * WhatChat - Production Spring Boot 3.x Backend Application
 * Powered exclusively by Spring Data MongoDB for all document persistence:
 * Auth & Users, Conversations, Real-Time Messages, Contacts, My Space Capsules, and Notifications.
 */
@SpringBootApplication
@EnableMongoRepositories(basePackages = {"app.whatchat.auth", "app.whatchat.mongo.repository"})
public class WhatChatApplication {

    public static void main(String[] args) {
        app.whatchat.config.DotenvConfigLoader.load();
        SpringApplication.run(WhatChatApplication.class, args);
    }
}
