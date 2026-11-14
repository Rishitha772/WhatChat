package app.whatchat.mongo.service;

import app.whatchat.mongo.document.ChatMessageDoc;
import app.whatchat.mongo.document.ConversationDoc;
import app.whatchat.mongo.repository.ChatMessageMongoRepository;
import app.whatchat.mongo.repository.ConversationMongoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
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
                    .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                    .toList();
        }
    }

    public ConversationDoc getConversation(String conversationId, String userId) {
        ConversationDoc conv = findConversation(conversationId);
        if (!conv.getParticipants().contains(userId)) {
            throw new AccessDeniedException("You are not a participant in this conversation.");
        }
        return conv;
    }

    public List<String> getParticipants(String conversationId, String userId) {
        ConversationDoc conv = getConversation(conversationId, userId);
        return conv.getParticipants();
    }

    public ConversationDoc createDirectConversation(String userA, String userB) {
        if (userA.equals(userB)) {
            throw new IllegalArgumentException("Cannot create a direct conversation with yourself.");
        }

        try {
            Optional<ConversationDoc> existing = conversationRepository.findDirectConversation(userA, userB);
            if (existing.isPresent()) {
                return existing.get();
            }
        } catch (Exception e) {
            log.warn("[MongoDB Chat] Direct conversation lookup check: {}", e.getMessage());
        }

        String id = "conv_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        ConversationDoc doc = new ConversationDoc(id, "direct", null, new ArrayList<>(List.of(userA, userB)));
        doc.setUpdatedAt(Instant.now());

        fallbackConversations.put(id, doc);
        try {
            return conversationRepository.save(doc);
        } catch (Exception e) {
            log.warn("[MongoDB Chat] Conversation saved in memory cache: {}", e.getMessage());
            return doc;
        }
    }

    @SuppressWarnings("unchecked")
    public ConversationDoc createGroup(String adminId, Map<String, Object> payload) {
        String name = (String) payload.getOrDefault("name", "New Group");
        String description = (String) payload.getOrDefault("description", "");
        String avatarUrl = (String) payload.get("avatarUrl");
        String groupCategory = (String) payload.getOrDefault("groupCategory", "General");
        List<String> participants = (List<String>) payload.getOrDefault("participants", new ArrayList<>());

        if (!participants.contains(adminId)) {
            participants.add(adminId);
        }

        String id = "conv_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        ConversationDoc doc = new ConversationDoc(id, "group", name, participants);
        doc.setDescription(description);
        doc.setAvatarUrl(avatarUrl);
        doc.setGroupCategory(groupCategory);
        doc.setAdminIds(new ArrayList<>(List.of(adminId)));
        doc.setUpdatedAt(Instant.now());

        fallbackConversations.put(id, doc);
        try {
            return conversationRepository.save(doc);
        } catch (Exception e) {
            log.warn("[MongoDB Chat] Group saved in memory cache: {}", e.getMessage());
            return doc;
        }
    }

    public ConversationDoc addGroupMember(String conversationId, String requesterId, String newMemberId) {
        ConversationDoc conv = findConversation(conversationId);
        if (!"group".equalsIgnoreCase(conv.getType())) {
            throw new IllegalArgumentException("Cannot add members to a 1-to-1 direct chat.");
        }
        if (!conv.getAdminIds().contains(requesterId)) {
            throw new AccessDeniedException("Only group admins can add new members.");
        }
        if (!conv.getParticipants().contains(newMemberId)) {
            conv.getParticipants().add(newMemberId);
            conv.setUpdatedAt(Instant.now());
            saveConversation(conv);
        }
        return conv;
    }

    public ConversationDoc removeGroupMember(String conversationId, String requesterId, String targetMemberId) {
        ConversationDoc conv = findConversation(conversationId);
        if (!"group".equalsIgnoreCase(conv.getType())) {
            throw new IllegalArgumentException("Cannot remove members from a 1-to-1 direct chat.");
        }
        if (!conv.getAdminIds().contains(requesterId)) {
            throw new AccessDeniedException("Only group admins can remove members.");
        }
        conv.getParticipants().remove(targetMemberId);
        conv.getAdminIds().remove(targetMemberId);
        conv.setUpdatedAt(Instant.now());
        saveConversation(conv);
        return conv;
    }

    public ConversationDoc updateGroup(String conversationId, String requesterId, Map<String, Object> updates) {
        ConversationDoc conv = findConversation(conversationId);
        if (!"group".equalsIgnoreCase(conv.getType())) {
            throw new IllegalArgumentException("Only group conversations can have their profile updated.");
        }
        if (!conv.getParticipants().contains(requesterId)) {
            throw new AccessDeniedException("You are not a member of this group.");
        }
        if (updates.containsKey("name")) conv.setName((String) updates.get("name"));
        if (updates.containsKey("description")) conv.setDescription((String) updates.get("description"));
        if (updates.containsKey("avatarUrl")) conv.setAvatarUrl((String) updates.get("avatarUrl"));
        conv.setUpdatedAt(Instant.now());
        saveConversation(conv);
        return conv;
    }

    public void leaveGroup(String conversationId, String userId) {
        ConversationDoc conv = findConversation(conversationId);
        conv.getParticipants().remove(userId);
        conv.getAdminIds().remove(userId);
        conv.setUpdatedAt(Instant.now());
        saveConversation(conv);
    }

    // --- Message Operations ---

    public List<ChatMessageDoc> getMessages(String conversationId, String userId, int page, int size) {
        getConversation(conversationId, userId); // validates membership
        try {
            Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
            Page<ChatMessageDoc> messagePage = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);
            List<ChatMessageDoc> content = new ArrayList<>(messagePage.getContent());
            Collections.reverse(content); // Chronological order
            return content;
        } catch (Exception e) {
            log.warn("[MongoDB Chat] Fallback retrieving messages: {}", e.getMessage());
            List<ChatMessageDoc> list = fallbackMessages.getOrDefault(conversationId, Collections.emptyList());
            int start = Math.min(page * size, list.size());
            int end = Math.min(start + size, list.size());
            return new ArrayList<>(list.subList(start, end));
        }
    }

    @SuppressWarnings("unchecked")
    public ChatMessageDoc sendMessage(String senderId, String senderName, String conversationId, Map<String, Object> payload) {
        ConversationDoc conv = getConversation(conversationId, senderId); // validates membership

        String text = (String) payload.getOrDefault("text", "");
        List<Map<String, Object>> attachments = (List<Map<String, Object>>) payload.get("attachments");

        if ((text == null || text.isBlank()) && (attachments == null || attachments.isEmpty())) {
            throw new IllegalArgumentException("Message content or attachment is required.");
        }

        String id = "msg_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String timestamp = (String) payload.getOrDefault("timestamp", "Just now");

        ChatMessageDoc doc = new ChatMessageDoc(id, conversationId, senderId, senderName, text, timestamp);
        if (attachments != null) doc.setAttachments(attachments);
        if (payload.containsKey("replyTo")) doc.setReplyTo((Map<String, Object>) payload.get("replyTo"));
        doc.setStatus("sent");
        doc.setCreatedAt(Instant.now());

        fallbackMessages.computeIfAbsent(conversationId, k -> new ArrayList<>()).add(doc);

        try {
            ChatMessageDoc saved = messageRepository.save(doc);

            // Update conversation lastMessage & updatedAt
            Map<String, Object> lastMsg = new HashMap<>();
            lastMsg.put("id", saved.getId());
            lastMsg.put("text", saved.getText());
            lastMsg.put("senderId", saved.getSenderId());
            lastMsg.put("timestamp", saved.getTimestamp());
            lastMsg.put("status", saved.getStatus());
            conv.setLastMessage(lastMsg);
            conv.setUpdatedAt(Instant.now());
            saveConversation(conv);

            return saved;
        } catch (Exception e) {
            log.warn("[MongoDB Chat] Message saved in memory cache: {}", e.getMessage());
            return doc;
        }
    }

    public ChatMessageDoc editMessage(String messageId, String requesterId, String newText) {
        ChatMessageDoc msg = findMessage(messageId);
        if (!msg.getSenderId().equals(requesterId)) {
            throw new AccessDeniedException("You can only edit your own messages.");
        }
        msg.setText(newText);
        msg.setEdited(true);
        try {
            return messageRepository.save(msg);
        } catch (Exception e) {
            return msg;
        }
    }

    public void deleteMessage(String messageId, String requesterId, boolean forEveryone) {
        ChatMessageDoc msg = findMessage(messageId);
        if (forEveryone) {
            if (!msg.getSenderId().equals(requesterId)) {
                throw new AccessDeniedException("You can only delete for everyone on your own messages.");
            }
            msg.setDeletedForEveryone(true);
            msg.setText("This message was deleted");
            msg.setAttachments(Collections.emptyList());
            try {
                messageRepository.save(msg);
            } catch (Exception ignored) {}
        } else {
            try {
                messageRepository.deleteById(messageId);
            } catch (Exception e) {
                fallbackMessages.values().forEach(list -> list.removeIf(m -> m.getId().equals(messageId)));
            }
        }
    }

    public ChatMessageDoc markDelivered(String messageId, String userId) {
        ChatMessageDoc msg = findMessage(messageId);
        if (!"read".equals(msg.getStatus())) {
            msg.setStatus("delivered");
            try {
                return messageRepository.save(msg);
            } catch (Exception ignored) {}
        }
        return msg;
    }

    public ChatMessageDoc markRead(String messageId, String userId) {
        ChatMessageDoc msg = findMessage(messageId);
        msg.setStatus("read");
        try {
            return messageRepository.save(msg);
        } catch (Exception ignored) {}
        return msg;
    }

    public long getUnreadCount(String conversationId, String userId) {
        try {
            return messageRepository.countByConversationIdAndStatusNotAndSenderIdNot(conversationId, "read", userId);
        } catch (Exception e) {
            return 0;
        }
    }

    private ConversationDoc findConversation(String conversationId) {
        try {
            Optional<ConversationDoc> doc = conversationRepository.findById(conversationId);
            if (doc.isPresent()) return doc.get();
        } catch (Exception ignored) {}
        ConversationDoc fallback = fallbackConversations.get(conversationId);
        if (fallback != null) return fallback;
        throw new IllegalArgumentException("Conversation not found with ID: " + conversationId);
    }

    private ChatMessageDoc findMessage(String messageId) {
        try {
            Optional<ChatMessageDoc> doc = messageRepository.findById(messageId);
            if (doc.isPresent()) return doc.get();
        } catch (Exception ignored) {}
        return fallbackMessages.values().stream()
                .flatMap(List::stream)
                .filter(m -> m.getId().equals(messageId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Message not found with ID: " + messageId));
    }

    private void saveConversation(ConversationDoc doc) {
        fallbackConversations.put(doc.getId(), doc);
        try {
            conversationRepository.save(doc);
        } catch (Exception ignored) {}
    }
}
