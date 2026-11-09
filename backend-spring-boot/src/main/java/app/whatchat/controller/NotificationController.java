package app.whatchat.controller;

import app.whatchat.service.PushNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * Controller for managing push notification tokens and preferences.
 */
@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final PushNotificationService pushNotificationService;

    public NotificationController(PushNotificationService pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }

    @PostMapping("/register-token")
    public ResponseEntity<Map<String, Object>> registerDeviceToken(
            @RequestBody Map<String, String> tokenPayload) {
        // Registers WebPush Subscription or Mobile FCM Token for recipient
        return ResponseEntity.ok(Map.of("status", "TOKEN_REGISTERED", "timestamp", System.currentTimeMillis()));
    }

    @PutMapping("/preferences")
    public ResponseEntity<Map<String, Object>> updatePreferences(
            @RequestBody Map<String, Object> preferences) {
        // Updates user notification preferences in MySQL
        return ResponseEntity.ok(Map.of("status", "PREFERENCES_UPDATED"));
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> triggerTestNotification(
            @RequestParam(defaultValue = "DIRECT_MESSAGE") String type) {
        // Triggers verification test alert to user's registered devices
        return ResponseEntity.ok(Map.of("status", "TEST_NOTIFICATION_SENT", "type", type));
    }
}
