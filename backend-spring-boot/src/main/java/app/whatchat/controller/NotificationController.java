package app.whatchat.controller;

import app.whatchat.service.PushNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> registerDeviceToken(
            @RequestBody Map<String, String> tokenPayload) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(Map.of("code", "FEATURE_NOT_IMPLEMENTED", "message", "Push notification registration is not available yet."));
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(
            @RequestBody Map<String, Object> preferences) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(Map.of("code", "FEATURE_NOT_IMPLEMENTED", "message", "Notification preferences are not available yet."));
    }

    @PostMapping("/test")
    public ResponseEntity<?> triggerTestNotification(
            @RequestParam(defaultValue = "DIRECT_MESSAGE") String type) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(Map.of("code", "FEATURE_NOT_IMPLEMENTED", "message", "Push notifications are not available yet."));
    }
}
