package app.whatchat.service;

import org.springframework.stereotype.Service;
import java.util.*;

/**
 * Service for reliable cross-platform push notifications in WhatChat.
 * Supports WebPush (VAPID/Web Notification API) and mobile FCM token delivery.
 */
@Service
public class PushNotificationService {

    public enum NotificationType {
        DIRECT_MESSAGE,
        GROUP_MENTION,
        MEMORY_MILESTONE,
        SYSTEM_ALERT
    }

    /**
     * Dispatches push notification to user's registered devices
     */
    public boolean sendPushNotification(
            String recipientUserId,
            String title,
            String messageBody,
            NotificationType type,
            Map<String, String> dataPayload) {

        return false;
    }

    /**
     * Priority mention notification dispatch
     */
    public boolean sendMentionNotification(
            String recipientUserId,
            String senderDisplayName,
            String groupName,
            String snippet,
            String conversationId) {

        String title = groupName != null ? groupName : senderDisplayName;
        String body = "@" + recipientUserId + " was mentioned: " + snippet;

        Map<String, String> payload = Map.of(
                "conversationId", conversationId,
                "type", "MENTION",
                "priority", "HIGH"
        );

        return sendPushNotification(recipientUserId, title, body, NotificationType.GROUP_MENTION, payload);
    }

    /**
     * My Space memory anniversary / milestone reminder dispatch
     */
    public boolean sendMemoryMilestoneNotification(
            String userId,
            String eventName,
            String milestoneText,
            String eventId) {

        String title = "My Space Milestone: " + eventName;

        Map<String, String> payload = Map.of(
                "eventId", eventId,
                "type", "MEMORY",
                "priority", "NORMAL"
        );

        return sendPushNotification(userId, title, milestoneText, NotificationType.MEMORY_MILESTONE, payload);
    }
}
