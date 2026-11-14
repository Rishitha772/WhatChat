package app.whatchat.mongo.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "conversations")
public class ConversationDoc {

    @Id
    private String id;

    private String type; // direct, group
    private String name;
    private String avatarUrl;
    private String description;

    @Indexed
    private List<String> participants = new ArrayList<>();
    private List<String> adminIds = new ArrayList<>();
    private String groupCategory;

    private Map<String, Object> lastMessage;
    private int unreadCount;
    private boolean isPinned;
    private boolean isMuted;
    private boolean isArchived;
    private boolean isFavorite;
    private Instant updatedAt = Instant.now();

    public ConversationDoc() {}

    public ConversationDoc(String id, String type, String name, List<String> participants) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.participants = participants;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getParticipants() { return participants; }
    public void setParticipants(List<String> participants) { this.participants = participants; }

    public List<String> getAdminIds() { return adminIds; }
    public void setAdminIds(List<String> adminIds) { this.adminIds = adminIds; }

    public String getGroupCategory() { return groupCategory; }
    public void setGroupCategory(String groupCategory) { this.groupCategory = groupCategory; }

    public Map<String, Object> getLastMessage() { return lastMessage; }
    public void setLastMessage(Map<String, Object> lastMessage) { this.lastMessage = lastMessage; }

    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }

    public boolean isPinned() { return isPinned; }
    public void setPinned(boolean pinned) { isPinned = pinned; }

    public boolean isMuted() { return isMuted; }
    public void setMuted(boolean muted) { isMuted = muted; }

    public boolean isArchived() { return isArchived; }
    public void setArchived(boolean archived) { isArchived = archived; }

    public boolean isFavorite() { return isFavorite; }
    public void setFavorite(boolean favorite) { isFavorite = favorite; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

