package app.whatchat.websocket;

import app.whatchat.auth.AuthService;
import app.whatchat.mongo.document.ChatMessageDoc;
import app.whatchat.mongo.service.MongoChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;
import java.util.Map;

@Controller
public class WebSocketChatController {

    private static final Logger log = LoggerFactory.getLogger(WebSocketChatController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final MongoChatService chatService;
    private final AuthService authService;

    public WebSocketChatController(SimpMessagingTemplate messagingTemplate,
                                   MongoChatService chatService,
                                   AuthService authService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
        this.authService = authService;
    }

    /**
     * Handle incoming real-time chat message:
     * Saves message into MongoDB, then broadcasts to subscribers of /topic/conversations.{conversationId}
     */
    @MessageMapping("/chat.send")
    public void handleSendMessage(Principal principal, @Payload Map<String, Object> payload) {
        String senderId = principal != null ? principal.getName() : (String) payload.getOrDefault("senderId", "usr_anon");
        String conversationId = (String) payload.get("conversationId");
        String senderName = (String) payload.getOrDefault("senderName", "User");

        if (conversationId == null || conversationId.isBlank()) {
            log.warn("[WebSocket] Received message without conversationId");
            return;
        }

        try {
            ChatMessageDoc savedMessage = chatService.sendMessage(senderId, senderName, conversationId, payload);
            messagingTemplate.convertAndSend("/topic/conversations." + conversationId, savedMessage);
            log.info("[WebSocket] Broadcasted message {} to conversation {}", savedMessage.getId(), conversationId);
        } catch (Exception e) {
            log.error("[WebSocket] Failed to send message: {}", e.getMessage());
        }
    }

    /**
     * Handle typing indicators:
     * Broadcasts typing event to /topic/conversations.{conversationId}.typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(Principal principal, @Payload Map<String, Object> payload) {
        String userId = principal != null ? principal.getName() : (String) payload.getOrDefault("userId", "usr_anon");
        String conversationId = (String) payload.get("conversationId");
        boolean isTyping = Boolean.TRUE.equals(payload.get("isTyping"));

        if (conversationId != null) {
            Map<String, Object> typingEvent = Map.of(
                    "conversationId", conversationId,
                    "userId", userId,
                    "isTyping", isTyping,
                    "timestamp", Instant.now().toString()
            );
            messagingTemplate.convertAndSend("/topic/conversations." + conversationId + ".typing", typingEvent);
        }
    }

    /**
     * Handle read and delivery receipts:
     * Updates message status in MongoDB and notifies /topic/conversations.{conversationId}.receipts
     */
    @MessageMapping("/chat.receipt")
    public void handleReceipt(Principal principal, @Payload Map<String, Object> payload) {
        String userId = principal != null ? principal.getName() : "usr_anon";
        String messageId = (String) payload.get("messageId");
        String conversationId = (String) payload.get("conversationId");
        String status = (String) payload.getOrDefault("status", "delivered");

        if (messageId != null && conversationId != null) {
            if ("read".equalsIgnoreCase(status)) {
                chatService.markRead(messageId, userId);
            } else {
                chatService.markDelivered(messageId, userId);
            }

            Map<String, Object> receiptEvent = Map.of(
                    "messageId", messageId,
                    "conversationId", conversationId,
                    "status", status,
                    "updatedBy", userId,
                    "timestamp", Instant.now().toString()
            );
            messagingTemplate.convertAndSend("/topic/conversations." + conversationId + ".receipts", receiptEvent);
        }
    }

    /**
     * Handle user online/offline presence:
     * Updates MongoDB user status and broadcasts to /topic/presence
     */
    @MessageMapping("/chat.presence")
    public void handlePresence(Principal principal, @Payload Map<String, Object> payload) {
        String userId = principal != null ? principal.getName() : (String) payload.get("userId");
        boolean isOnline = Boolean.TRUE.equals(payload.get("isOnline"));

        if (userId != null) {
            authService.updatePresence(userId, isOnline);
            Map<String, Object> presenceEvent = Map.of(
                    "userId", userId,
                    "isOnline", isOnline,
                    "timestamp", Instant.now().toString()
            );
            messagingTemplate.convertAndSend("/topic/presence", presenceEvent);
        }
    }
}

