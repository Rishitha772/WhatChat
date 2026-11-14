package app.whatchat.controller;

import app.whatchat.mongo.document.EventMessageDoc;
import app.whatchat.mongo.document.MySpaceEventDoc;
import app.whatchat.mongo.service.MongoMySpaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/myspace")
@Tag(name = "My Space", description = "Personal memory capsules, diary entries, and private event storage")
public class MySpaceController {

    private final MongoMySpaceService mySpaceService;

    public MySpaceController(MongoMySpaceService mySpaceService) {
        this.mySpaceService = mySpaceService;
    }

    @GetMapping("/events")
    @Operation(summary = "Retrieve all memory capsule events for the authenticated user")
    public ResponseEntity<List<MySpaceEventDoc>> getUserEvents(
            Principal principal,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mySpaceService.getUserEvents(principal.getName(), category, search));
    }

    @PostMapping("/events")
    @Operation(summary = "Create a new personal memory capsule event")
    public ResponseEntity<MySpaceEventDoc> createEvent(
            Principal principal,
            @RequestBody Map<String, Object> eventPayload) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mySpaceService.createEvent(principal.getName(), eventPayload));
    }

    @GetMapping("/events/{eventId}")
    @Operation(summary = "Retrieve a specific personal memory capsule event")
    public ResponseEntity<MySpaceEventDoc> getEvent(
            Principal principal,
            @PathVariable String eventId) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mySpaceService.getEventById(eventId, principal.getName()));
    }

    @PutMapping("/events/{eventId}")
    @Operation(summary = "Update personal memory capsule metadata")
    public ResponseEntity<MySpaceEventDoc> updateEvent(
            Principal principal,
            @PathVariable String eventId,
            @RequestBody Map<String, Object> updates) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mySpaceService.updateEvent(eventId, principal.getName(), updates));
    }

    @DeleteMapping("/events/{eventId}")
    @Operation(summary = "Delete personal memory capsule event and all its memories")
    public ResponseEntity<Map<String, Object>> deleteEvent(
            Principal principal,
            @PathVariable String eventId) {
        if (principal == null) return ResponseEntity.status(401).build();
        mySpaceService.deleteEvent(principal.getName(), eventId);
        return ResponseEntity.ok(Map.of("success", true, "deletedEventId", eventId));
    }

    @GetMapping("/events/{eventId}/messages")
    @Operation(summary = "Retrieve memories (photos, voice notes, reflections) inside a capsule")
    public ResponseEntity<List<EventMessageDoc>> getEventMessages(
            Principal principal,
            @PathVariable String eventId) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mySpaceService.getEventMessages(eventId, principal.getName()));
    }

    @PostMapping("/events/{eventId}/messages")
    @Operation(summary = "Add a memory entry into a memory capsule")
    public ResponseEntity<EventMessageDoc> addMemoryEntry(
            Principal principal,
            @PathVariable String eventId,
            @RequestBody Map<String, Object> memoryEntryPayload) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mySpaceService.addEventMessage(principal.getName(), eventId, memoryEntryPayload));
    }

    @GetMapping("/memories/{memoryId}")
    @Operation(summary = "Retrieve a specific personal memory by ID")
    public ResponseEntity<EventMessageDoc> getMemory(
            Principal principal,
            @PathVariable String memoryId) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mySpaceService.getMemoryById(memoryId, principal.getName()));
    }

    @PutMapping("/memories/{memoryId}")
    @Operation(summary = "Update a specific memory entry")
    public ResponseEntity<EventMessageDoc> updateMemory(
            Principal principal,
            @PathVariable String memoryId,
            @RequestBody Map<String, Object> payload) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mySpaceService.updateMemory(memoryId, principal.getName(), payload));
    }

    @DeleteMapping("/memories/{memoryId}")
    @Operation(summary = "Delete a specific memory entry")
    public ResponseEntity<Map<String, Object>> deleteMemory(
            Principal principal,
            @PathVariable String memoryId) {
        if (principal == null) return ResponseEntity.status(401).build();
        EventMessageDoc doc = mySpaceService.getMemoryById(memoryId, principal.getName());
        mySpaceService.deleteEventMessage(doc.getEventId(), memoryId, principal.getName());
        return ResponseEntity.ok(Map.of("success", true, "deletedMemoryId", memoryId));
    }

    @PostMapping("/save-chat-message")
    @Operation(summary = "Save a forwarded chat message or photo into a personal memory capsule")
    public ResponseEntity<EventMessageDoc> saveChatMessageToEvent(
            Principal principal,
            @RequestBody Map<String, Object> payload) {
        if (principal == null) return ResponseEntity.status(401).build();
        String targetEventId = (String) payload.getOrDefault("targetEventId", "");
        return ResponseEntity.ok(mySpaceService.addEventMessage(principal.getName(), targetEventId, payload));
    }
}
