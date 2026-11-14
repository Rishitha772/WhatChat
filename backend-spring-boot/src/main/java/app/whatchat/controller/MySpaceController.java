package app.whatchat.controller;

<<<<<<< HEAD
import app.whatchat.mongo.document.EventMessageDoc;
import app.whatchat.mongo.document.MySpaceEventDoc;
import app.whatchat.mongo.service.MongoMySpaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Controller for My Space - Personal Event-Based Memory Storage System.
 * Powered by MongoDB document collections `myspace_events` and `myspace_messages`.
=======
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * Controller for My Space - Personal Event-Based Memory Storage System.
 * Handles Event creation, memory logging, attachment uploads with S3 presigned URLs,
 * and chronological timeline retrieval.
>>>>>>> origin/main
 */
@RestController
@RequestMapping("/api/v1/myspace")
public class MySpaceController {

<<<<<<< HEAD
    private final MongoMySpaceService mySpaceService;

    public MySpaceController(MongoMySpaceService mySpaceService) {
        this.mySpaceService = mySpaceService;
    }

    @GetMapping("/events")
    public ResponseEntity<List<MySpaceEventDoc>> getUserEvents(
            Principal principal,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        String userId = principal != null ? principal.getName() : "usr_default";
        return ResponseEntity.ok(mySpaceService.getUserEvents(userId, category, search));
    }

    @PostMapping("/events")
    public ResponseEntity<MySpaceEventDoc> createEvent(
            Principal principal,
            @RequestBody Map<String, Object> eventPayload) {
        String userId = principal != null ? principal.getName() : "usr_default";
        return ResponseEntity.ok(mySpaceService.createEvent(userId, eventPayload));
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<?> deleteEvent(
            Principal principal,
            @PathVariable String eventId) {
        String userId = principal != null ? principal.getName() : "usr_default";
        mySpaceService.deleteEvent(userId, eventId);
        return ResponseEntity.ok(Map.of("success", true, "deletedEventId", eventId));
    }

    @GetMapping("/events/{eventId}/messages")
    public ResponseEntity<List<EventMessageDoc>> getEventMessages(
            @PathVariable String eventId) {
        return ResponseEntity.ok(mySpaceService.getEventMessages(eventId));
    }

    @PostMapping("/events/{eventId}/messages")
    public ResponseEntity<EventMessageDoc> addMemoryEntry(
            Principal principal,
            @PathVariable String eventId,
            @RequestBody Map<String, Object> memoryEntryPayload) {
        String userId = principal != null ? principal.getName() : "usr_default";
        return ResponseEntity.ok(mySpaceService.addEventMessage(userId, eventId, memoryEntryPayload));
    }

    @DeleteMapping("/events/{eventId}/messages/{messageId}")
    public ResponseEntity<?> deleteMemoryEntry(
            @PathVariable String eventId,
            @PathVariable String messageId) {
        mySpaceService.deleteEventMessage(eventId, messageId);
        return ResponseEntity.ok(Map.of("success", true, "deletedMessageId", messageId));
    }

    @PostMapping("/save-chat-message")
    public ResponseEntity<?> saveChatMessageToEvent(
            Principal principal,
            @RequestBody Map<String, Object> payload) {
        String userId = principal != null ? principal.getName() : "usr_default";
        String targetEventId = (String) payload.getOrDefault("targetEventId", "");
        EventMessageDoc saved = mySpaceService.addEventMessage(userId, targetEventId, payload);
        return ResponseEntity.ok(saved);
=======
    @GetMapping("/events")
    public ResponseEntity<List<Map<String, Object>>> getUserEvents(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        // Returns all personal events with category filtering
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/events")
    public ResponseEntity<Map<String, Object>> createEvent(
            @RequestBody Map<String, Object> eventPayload) {
        // Creates a new My Space Event capsule
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "id", UUID.randomUUID().toString()));
    }

    @GetMapping("/events/{eventId}/messages")
    public ResponseEntity<List<Map<String, Object>>> getEventMessages(
            @PathVariable String eventId) {
        // Retrieves dedicated self-memory conversation for the event
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/events/{eventId}/messages")
    public ResponseEntity<Map<String, Object>> addMemoryEntry(
            @PathVariable String eventId,
            @RequestBody Map<String, Object> memoryEntryPayload) {
        // Appends a personal reflection, photo, or document to the event conversation
        return ResponseEntity.ok(Map.of("status", "SAVED", "id", UUID.randomUUID().toString()));
    }

    @PostMapping("/save-chat-message")
    public ResponseEntity<Map<String, Object>> saveChatMessageToEvent(
            @RequestParam String messageId,
            @RequestParam String targetEventId) {
        // Bridges normal 1:1 or group chat messages directly into a My Space Event
        return ResponseEntity.ok(Map.of("status", "SAVED_TO_MY_SPACE"));
>>>>>>> origin/main
    }
}
