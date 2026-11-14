package app.whatchat.controller;

import app.whatchat.mongo.document.NotificationDoc;
import app.whatchat.mongo.service.MongoNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "In-app notifications and alerts")
public class NotificationController {

    private final MongoNotificationService notificationService;

    public NotificationController(MongoNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Retrieve all notifications for the authenticated user")
    public ResponseEntity<List<NotificationDoc>> getNotifications(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(notificationService.getUserNotifications(principal.getName()));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<NotificationDoc> markRead(
            Principal principal,
            @PathVariable String id) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(notificationService.markRead(principal.getName(), id));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read for current user")
    public ResponseEntity<Map<String, Object>> markAllRead(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        notificationService.markAllRead(principal.getName());
        return ResponseEntity.ok(Map.of("success", true, "message", "All notifications marked as read."));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification")
    public ResponseEntity<Map<String, Object>> deleteNotification(
            Principal principal,
            @PathVariable String id) {
        if (principal == null) return ResponseEntity.status(401).build();
        notificationService.deleteNotification(principal.getName(), id);
        return ResponseEntity.ok(Map.of("success", true, "deletedNotificationId", id));
    }

    @PostMapping("/test")
    @Operation(summary = "Trigger a test notification")
    public ResponseEntity<NotificationDoc> triggerTestNotification(
            Principal principal,
            @RequestParam(defaultValue = "DIRECT_MESSAGE") String type) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(notificationService.createNotification(
                principal.getName(),
                type,
                "WhatChat Test Alert",
                "This is a verified test notification sent at " + java.time.Instant.now(),
                Map.of("test", true)
        ));
    }
}
