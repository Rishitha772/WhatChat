package app.whatchat.mongo.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "myspace_messages")
public class EventMessageDoc {

    @Id
    private String id;

    @Indexed
    private String eventId;

    @Indexed
    private String userId;

    private String type; // photo, video, document, audio, note, reflection, forwarded_chat
    private String content;
    private List<Map<String, Object>> attachments = new ArrayList<>();
    private String memoryDate;
    private Instant createdAt = Instant.now();
    private boolean isHighlight;
    private List<String> tags = new ArrayList<>();
    private String sourceChatName;

    public EventMessageDoc() {}

    public EventMessageDoc(String id, String eventId, String userId, String type, String content, String memoryDate) {
        this.id = id;
        this.eventId = eventId;
        this.userId = userId;
        this.type = type;
        this.content = content;
        this.memoryDate = memoryDate;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public List<Map<String, Object>> getAttachments() { return attachments; }
    public void setAttachments(List<Map<String, Object>> attachments) { this.attachments = attachments; }

    public String getMemoryDate() { return memoryDate; }
    public void setMemoryDate(String memoryDate) { this.memoryDate = memoryDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public boolean isHighlight() { return isHighlight; }
    public void setHighlight(boolean highlight) { isHighlight = highlight; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getSourceChatName() { return sourceChatName; }
    public void setSourceChatName(String sourceChatName) { this.sourceChatName = sourceChatName; }
}

