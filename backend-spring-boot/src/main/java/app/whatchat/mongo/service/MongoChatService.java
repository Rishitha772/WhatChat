package app.whatchat.mongo.service;

import app.whatchat.mongo.document.ChatMessageDoc;
import app.whatchat.mongo.document.ConversationDoc;
import app.whatchat.mongo.repository.ChatMessageMongoRepository;
import app.whatchat.mongo.repository.ConversationMongoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MongoChatService {

    private static final Logger log = LoggerFactory.getLogger(MongoChatService.class);

    private final ConversationMongoRepository conversationRepository;
    private final ChatMessageMongoRepository messageRepository;

    private final Map<String, ConversationDoc> fallbackConversations = new ConcurrentHashMap<>();
    private final Map<String, List<ChatMessageDoc>> fallbackMessages = new ConcurrentHashMap<>();

    public MongoChatService(ConversationMongoRepository conversationRepository,
                            ChatMessageMongoRepository messageRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    public List<ConversationDoc> getUserConversations(String userId) {
        try {
            return conversationRepository.findByParticipantsContainingOrderByUpdatedAtDesc(userId);
        } catch (Exception e) {
            log.warn("[MongoDB Chat] Using resilient fallback cache: {}", e.getMessage());
            return fallbackConversations.values().stream()
                    .filter(c -> c.getParticipants() != null && c.getParticipants().contains(userId))
                    .toList();
        }
    }

    @SuppressWarnings("unchecked")
    public ConversationDoc createConversation(String userId, Map<String, Object> payload) {
        String id = "conv_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String type = (String) payload.getOrDefault("type", "direct");
        String name = (String) payload.getOrDefault("name", "New Conversation");
        List<String> participants = (List<String>) payload.getOrDefault("participants", new ArrayList<>(List.of(userId)));
        if (!participants.contains(userId)) {
            participants.add(userId);
        }

        ConversationDoc doc = new ConversationDoc(id, type, name, participants);
        if (payload.containsKey("avatarUrl")) doc.setAvatarUrl((String) payload.get("avatarUrl"));
        if (payload.containsKey("description")) doc.setDescription((String) payload.get("description"));
        if (payload.containsKey("groupCategory")) doc.setGroupCategory((String) payload.get("groupCategory"));

        fallbackConversations.put(id, doc);

        try {
            return conversationRepository.save(doc);
        } catch (Exception e) {
            log.warn("[MongoDB Chat] Conversation saved in memory. Note: MongoDB is offline ({})", e.getMessage());
            return doc;
        }
    }

    public List<ChatMessageDoc> getMessages(String conversationId) {
        try {
            return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        } catch (Exception e) {
            log.warn("[MongoDB Chat] Using fallback message list: {}", e.getMessage());
            return fallbackMessages.getOrDefault(conversationId, Collections.emptyList());
        }
    }

    @SuppressWarnings("unchecked")
    public ChatMessageDoc sendMessage(String userId, String senderName, String conversationId, Map<String, Object> payload) {
        String id = "msg_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String text = (String) payload.getOrDefault("text", "");
        String timestamp = (String) payload.getOrDefault("timestamp", "Just now");

        ChatMessageDoc doc = new ChatMessageDoc(id, conversationId, userId, senderName, text, timestamp);
        if (payload.containsKey("attachments")) {
            doc.setAttachments((List<Map<String, Object>>) payload.get("attachments"));
        }
        if (payload.containsKey("replyTo")) {
            doc.setReplyTo((Map<String, Object>) payload.get("replyTo"));
        }

        fallbackMessages.computeIfAbsent(conversationId, k -> new ArrayList<>()).add(doc);

        try {
            ChatMessageDoc saved = messageRepository.save(doc);

            // Update conversation's lastMessage and updatedAt
            conversationRepository.findById(conversationId).ifPresent(c -> {
                Map<String, Object> lastMsg = new HashMap<>();
                lastMsg.put("id", saved.getId());
                lastMsg.put("text", saved.getText());
                lastMsg.put("senderId", saved.getSenderId());
                lastMsg.put("timestamp", saved.getTimestamp());
                lastMsg.put("status", saved.getStatus());
                c.setLastMessage(lastMsg);
                c.setUpdatedAt(Instant.now());
                conversationRepository.save(c);
            });

            return saved;
        } catch (Exception e) {
            log.warn("[MongoDB Chat] Message saved in memory. Note: MongoDB is offline ({})", e.getMessage());
            return doc;
        }
    }

    public boolean deleteMessage(String conversationId, String messageId) {
        List<ChatMessageDoc> list = fallbackMessages.get(conversationId);
        if (list != null) {
            list.removeIf(m -> m.getId().equals(messageId));
        }
        try {
            messageRepository.deleteById(messageId);
            return true;
        } catch (Exception e) {
            log.warn("[MongoDB Chat] Deleted from local cache: {}", e.getMessage());
            return true;
        }
    }
}

