package app.whatchat.controller;

import app.whatchat.mongo.document.ChatMessageDoc;
import app.whatchat.mongo.document.ConversationDoc;
import app.whatchat.mongo.service.MongoChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/conversations")
@Tag(name = "Conversations", description = "Direct and group conversation management")
public class ChatController {

    private final MongoChatService chatService;

    public ChatController(MongoChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    @Operation(summary = "Retrieve all conversations for the authenticated user")
    public ResponseEntity<List<ConversationDoc>> getConversations(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.getUserConversations(principal.getName()));
    }

    @GetMapping("/{conversationId}")
    @Operation(summary = "Retrieve a specific conversation by ID")
    public ResponseEntity<ConversationDoc> getConversation(
            Principal principal,
            @PathVariable String conversationId) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.getConversation(conversationId, principal.getName()));
    }

    @GetMapping("/{conversationId}/participants")
    @Operation(summary = "Retrieve participant IDs of a conversation")
    public ResponseEntity<List<String>> getParticipants(
            Principal principal,
            @PathVariable String conversationId) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.getParticipants(conversationId, principal.getName()));
    }

    @PostMapping
    @Operation(summary = "Create a direct 1-to-1 conversation or new group")
    public ResponseEntity<ConversationDoc> createConversation(
            Principal principal,
            @RequestBody Map<String, Object> payload) {
        if (principal == null) return ResponseEntity.status(401).build();
        String type = (String) payload.getOrDefault("type", "direct");
        if ("group".equalsIgnoreCase(type)) {
            return ResponseEntity.ok(chatService.createGroup(principal.getName(), payload));
        } else {
            String recipientId = (String) payload.get("recipientId");
            if (recipientId == null && payload.containsKey("participants")) {
                @SuppressWarnings("unchecked")
                List<String> list = (List<String>) payload.get("participants");
                recipientId = list.stream().filter(id -> !id.equals(principal.getName())).findFirst().orElse(null);
            }
            if (recipientId == null) {
                throw new IllegalArgumentException("Recipient ID is required for direct conversation.");
            }
            return ResponseEntity.ok(chatService.createDirectConversation(principal.getName(), recipientId));
        }
    }

    @PostMapping("/group")
    @Operation(summary = "Create a new group conversation")
    public ResponseEntity<ConversationDoc> createGroup(
            Principal principal,
            @RequestBody Map<String, Object> payload) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.createGroup(principal.getName(), payload));
    }

    @PostMapping("/{conversationId}/members")
    @Operation(summary = "Add a new member to a group")
    public ResponseEntity<ConversationDoc> addGroupMember(
            Principal principal,
            @PathVariable String conversationId,
            @RequestBody Map<String, String> payload) {
        if (principal == null) return ResponseEntity.status(401).build();
        String memberId = payload.get("userId");
        return ResponseEntity.ok(chatService.addGroupMember(conversationId, principal.getName(), memberId));
    }

    @DeleteMapping("/{conversationId}/members/{userId}")
    @Operation(summary = "Remove a member from a group")
    public ResponseEntity<ConversationDoc> removeGroupMember(
            Principal principal,
            @PathVariable String conversationId,
            @PathVariable String userId) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.removeGroupMember(conversationId, principal.getName(), userId));
    }

    @PutMapping("/{conversationId}")
    @Operation(summary = "Update group profile, title, or avatar")
    public ResponseEntity<ConversationDoc> updateGroup(
            Principal principal,
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> updates) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.updateGroup(conversationId, principal.getName(), updates));
    }

    @PostMapping("/{conversationId}/leave")
    @Operation(summary = "Leave a group conversation")
    public ResponseEntity<Map<String, Object>> leaveGroup(
            Principal principal,
            @PathVariable String conversationId) {
        if (principal == null) return ResponseEntity.status(401).build();
        chatService.leaveGroup(conversationId, principal.getName());
        return ResponseEntity.ok(Map.of("success", true, "leftConversationId", conversationId));
    }

    // --- Message Endpoints under /conversations for Frontend Compatibility ---

    @GetMapping("/{conversationId}/messages")
    @Operation(summary = "Retrieve messages for conversation with pagination")
    public ResponseEntity<List<ChatMessageDoc>> getConversationMessages(
            Principal principal,
            @PathVariable String conversationId,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "50") int size) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.getMessages(conversationId, principal.getName(), page, size));
    }

    @PostMapping("/{conversationId}/messages")
    @Operation(summary = "Send a message to a conversation")
    public ResponseEntity<ChatMessageDoc> sendConversationMessage(
            Principal principal,
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> payload) {
        if (principal == null) return ResponseEntity.status(401).build();
        String senderName = (String) payload.getOrDefault("senderName", "You");
        return ResponseEntity.ok(chatService.sendMessage(principal.getName(), senderName, conversationId, payload));
    }
}
