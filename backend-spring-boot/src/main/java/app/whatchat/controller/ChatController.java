package app.whatchat.controller;

import app.whatchat.mongo.document.ChatMessageDoc;
import app.whatchat.mongo.document.ConversationDoc;
import app.whatchat.mongo.service.MongoChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Controller for Conversations & Real-Time Messages.
 * Backed by MongoDB collections `conversations` and `chat_messages`.
 */
@RestController
@RequestMapping("/api/v1/conversations")
public class ChatController {

    private final MongoChatService chatService;

    public ChatController(MongoChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public ResponseEntity<List<ConversationDoc>> getConversations(Principal principal) {
        String userId = principal != null ? principal.getName() : "usr_default";
        return ResponseEntity.ok(chatService.getUserConversations(userId));
    }

    @PostMapping
    public ResponseEntity<ConversationDoc> createConversation(
            Principal principal,
            @RequestBody Map<String, Object> payload) {
        String userId = principal != null ? principal.getName() : "usr_default";
        return ResponseEntity.ok(chatService.createConversation(userId, payload));
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageDoc>> getMessages(
            @PathVariable String conversationId) {
        return ResponseEntity.ok(chatService.getMessages(conversationId));
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<ChatMessageDoc> sendMessage(
            Principal principal,
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> payload) {
        String userId = principal != null ? principal.getName() : "usr_default";
        String senderName = (String) payload.getOrDefault("senderName", "You");
        return ResponseEntity.ok(chatService.sendMessage(userId, senderName, conversationId, payload));
    }

    @DeleteMapping("/{conversationId}/messages/{messageId}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable String conversationId,
            @PathVariable String messageId) {
        chatService.deleteMessage(conversationId, messageId);
        return ResponseEntity.ok(Map.of("success", true, "deletedMessageId", messageId));
    }
}

