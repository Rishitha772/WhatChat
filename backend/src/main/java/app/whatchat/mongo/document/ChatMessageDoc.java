package app.whatchat.mongo.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "chat_messages")
public class ChatMessageDoc {

    @Id
    private String id;

    @Indexed
    private String conversationId;

    @Indexed
    private String senderId;

    private String senderName;
    private String text;
    private String timestamp;
    private Instant createdAt = Instant.now();
    private String status = "sent"; // sent, delivered, read

    private Map<String, Object> replyTo;
    private List<Map<String, Object>> attachments = new ArrayList<>();
    private List<Map<String, Object>> reactions = new ArrayList<>();

    private boolean isStarred;
    private boolean isPinned;
    private boolean isEdited;
    private boolean isDeletedForEveryone;

    private String savedToEventId;
    private String savedToEventName;

    public ChatMessageDoc() {}

    public ChatMessageDoc(String id, String conversationId, String senderId, String senderName, String text, String timestamp) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.text = text;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Map<String, Object> getReplyTo() { return replyTo; }
    public void setReplyTo(Map<String, Object> replyTo) { this.replyTo = replyTo; }

    public List<Map<String, Object>> getAttachments() { return attachments; }
    public void setAttachments(List<Map<String, Object>> attachments) { this.attachments = attachments; }

    public List<Map<String, Object>> getReactions() { return reactions; }
    public void setReactions(List<Map<String, Object>> reactions) { this.reactions = reactions; }

    public boolean isStarred() { return isStarred; }
    public void setStarred(boolean starred) { isStarred = starred; }

    public boolean isPinned() { return isPinned; }
    public void setPinned(boolean pinned) { isPinned = pinned; }

    public boolean isEdited() { return isEdited; }
    public void setEdited(boolean edited) { isEdited = edited; }

    public boolean isDeletedForEveryone() { return isDeletedForEveryone; }
    public void setDeletedForEveryone(boolean deletedForEveryone) { isDeletedForEveryone = deletedForEveryone; }

    public String getSavedToEventId() { return savedToEventId; }
    public void setSavedToEventId(String savedToEventId) { this.savedToEventId = savedToEventId; }

    public String getSavedToEventName() { return savedToEventName; }
    public void setSavedToEventName(String savedToEventName) { this.savedToEventName = savedToEventName; }
}

