package app.whatchat.mongo.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "contacts")
public class ContactDoc {

    @Id
    private String id;

    @Indexed
    private String userId; // User who owns this contact entry

    @Indexed
    private String phoneNumber;

    private String displayName;
    private String username;
    private String avatarUrl;
    private String about;
    private boolean isOnline;
    private boolean isFavorite;
    private String lastSeen;
    private Instant createdAt = Instant.now();

    public ContactDoc() {}

    public ContactDoc(String id, String userId, String phoneNumber, String displayName, String about) {
        this.id = id;
        this.userId = userId;
        this.phoneNumber = phoneNumber;
        this.displayName = displayName;
        this.about = about;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }

    public boolean isFavorite() { return isFavorite; }
    public void setFavorite(boolean favorite) { isFavorite = favorite; }

    public String getLastSeen() { return lastSeen; }
    public void setLastSeen(String lastSeen) { this.lastSeen = lastSeen; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

