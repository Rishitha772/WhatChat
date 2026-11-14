package app.whatchat.controller;

import app.whatchat.mongo.document.ChatMessageDoc;
import app.whatchat.mongo.service.MongoChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/messages")
@Tag(name = "Messages", description = "Message sending, pagination, editing, deletion, and receipts")
public class MessageController {

    private final MongoChatService chatService;

    public MessageController(MongoChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    @Operation(summary = "Send a new chat message")
    public ResponseEntity<ChatMessageDoc> sendMessage(
            Principal principal,
            @RequestBody Map<String, Object> payload) {
        if (principal == null) return ResponseEntity.status(401).build();
        String conversationId = (String) payload.get("conversationId");
        if (conversationId == null || conversationId.isBlank()) {
            throw new IllegalArgumentException("conversationId is required.");
        }
        String senderName = (String) payload.getOrDefault("senderName", "You");
        return ResponseEntity.ok(chatService.sendMessage(principal.getName(), senderName, conversationId, payload));
    }

    @GetMapping("/{conversationId}")
    @Operation(summary = "Retrieve messages for a conversation with pagination")
    public ResponseEntity<List<ChatMessageDoc>> getMessages(
            Principal principal,
            @PathVariable String conversationId,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "50") int size) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.getMessages(conversationId, principal.getName(), page, size));
    }

    @PutMapping("/{messageId}")
    @Operation(summary = "Edit an existing message")
    public ResponseEntity<ChatMessageDoc> editMessage(
            Principal principal,
            @PathVariable String messageId,
            @RequestBody Map<String, String> payload) {
        if (principal == null) return ResponseEntity.status(401).build();
        String newText = payload.get("text");
        return ResponseEntity.ok(chatService.editMessage(messageId, principal.getName(), newText));
    }

    @DeleteMapping("/{messageId}")
    @Operation(summary = "Delete a message (optional forEveryone)")
    public ResponseEntity<Map<String, Object>> deleteMessage(
            Principal principal,
            @PathVariable String messageId,
            @RequestParam(required = false, defaultValue = "false") boolean forEveryone) {
        if (principal == null) return ResponseEntity.status(401).build();
        chatService.deleteMessage(messageId, principal.getName(), forEveryone);
        return ResponseEntity.ok(Map.of("success", true, "deletedMessageId", messageId));
    }

    @PutMapping("/{messageId}/delivered")
    @Operation(summary = "Mark message as delivered")
    public ResponseEntity<ChatMessageDoc> markDelivered(
            Principal principal,
            @PathVariable String messageId) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.markDelivered(messageId, principal.getName()));
    }

    @PutMapping("/{messageId}/read")
    @Operation(summary = "Mark message as read")
    public ResponseEntity<ChatMessageDoc> markRead(
            Principal principal,
            @PathVariable String messageId) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.markRead(messageId, principal.getName()));
    }

    @GetMapping("/unread/count")
    @Operation(summary = "Get unread message count for a conversation")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            Principal principal,
            @RequestParam String conversationId) {
        if (principal == null) return ResponseEntity.status(401).build();
        long count = chatService.getUnreadCount(conversationId, principal.getName());
        return ResponseEntity.ok(Map.of("conversationId", conversationId, "unreadCount", count));
    }
}

