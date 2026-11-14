package app.whatchat.mongo.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "myspace_events")
public class MySpaceEventDoc {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String name;
    private String category;
    private String eventDate;
    private String description;
    private String coverImageUrl;
    private Instant createdAt = Instant.now();
    private boolean isFavorite;
    private boolean isLocked;
    private int memoryCount;

    private Map<String, Integer> mediaCounts = new HashMap<>();

    public MySpaceEventDoc() {
        this.mediaCounts.put("photos", 0);
        this.mediaCounts.put("videos", 0);
        this.mediaCounts.put("documents", 0);
        this.mediaCounts.put("audio", 0);
        this.mediaCounts.put("notes", 0);
    }

    public MySpaceEventDoc(String id, String userId, String name, String category, String eventDate, String description, String coverImageUrl) {
        this();
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.category = category;
        this.eventDate = eventDate;
        this.description = description;
        this.coverImageUrl = coverImageUrl;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public boolean isFavorite() { return isFavorite; }
    public void setFavorite(boolean favorite) { isFavorite = favorite; }

    public boolean isLocked() { return isLocked; }
    public void setLocked(boolean locked) { isLocked = locked; }

    public int getMemoryCount() { return memoryCount; }
    public void setMemoryCount(int memoryCount) { this.memoryCount = memoryCount; }

    public Map<String, Integer> getMediaCounts() { return mediaCounts; }
    public void setMediaCounts(Map<String, Integer> mediaCounts) { this.mediaCounts = mediaCounts; }
}

