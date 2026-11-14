package app.whatchat.mongo.service;

import app.whatchat.mongo.document.NotificationDoc;
import app.whatchat.mongo.repository.NotificationMongoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    private NotificationMongoRepository notificationRepository;
    private MongoNotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationRepository = mock(NotificationMongoRepository.class);
        notificationService = new MongoNotificationService(notificationRepository);
    }

    @Test
    void createNotificationSavesNotification() {
        when(notificationRepository.save(any(NotificationDoc.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        NotificationDoc ntf = notificationService.createNotification(
                "user1", "message", "New Message", "Hello from Bob", Map.of("chatId", "conv_1"));

        assertThat(ntf).isNotNull();
        assertThat(ntf.getUserId()).isEqualTo("user1");
        assertThat(ntf.getType()).isEqualTo("message");
        assertThat(ntf.getTitle()).isEqualTo("New Message");
        assertThat(ntf.isRead()).isFalse();
    }

    @Test
    void markReadUpdatesStatus() {
        NotificationDoc ntf = new NotificationDoc("ntf_1", "user1", "message", "Title", "Text");
        when(notificationRepository.findById("ntf_1")).thenReturn(Optional.of(ntf));
        when(notificationRepository.save(any(NotificationDoc.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationDoc updated = notificationService.markRead("user1", "ntf_1");

        assertThat(updated.isRead()).isTrue();
    }

    @Test
    void getUserNotificationsReturnsRepositoryList() {
        NotificationDoc ntf = new NotificationDoc("ntf_1", "user1", "system", "Welcome", "Welcome to WhatChat!");
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("user1"))
                .thenReturn(List.of(ntf));

        List<NotificationDoc> list = notificationService.getUserNotifications("user1");

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getTitle()).isEqualTo("Welcome");
    }
}

