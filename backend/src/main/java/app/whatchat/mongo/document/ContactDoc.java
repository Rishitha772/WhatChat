package app.whatchat.mongo.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "contacts")
@CompoundIndexes({
        @CompoundIndex(name = "user_phone_unique", def = "{'userId': 1, 'phoneNumber': 1}", unique = false),
        @CompoundIndex(name = "user_contact_user", def = "{'userId': 1, 'contactUserId': 1}", unique = false)
})
public class ContactDoc {

    @Id
    private String id;

    @Indexed
    private String userId; // Owner user ID

    @Indexed
    private String contactUserId; // Matched WhatChat registered user ID (if any)

    @Indexed
    private String phoneNumber; // Normalized E.164 phone number

    private String displayName;
    private String username;
    private String avatarUrl;
    private String about;
    private boolean isOnline;
    private boolean isFavorite;
    private boolean isRegistered;
    private String lastSeen;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public ContactDoc() {}

    public ContactDoc(String id, String userId, String phoneNumber, String displayName, String about) {
        this.id = id;
        this.userId = userId;
        this.phoneNumber = phoneNumber;
        this.displayName = displayName;
        this.about = about;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    // Owner alias for prompt specifications
    public String getOwnerUserId() { return userId; }
    public void setOwnerUserId(String ownerUserId) { this.userId = ownerUserId; }

    public String getContactUserId() { return contactUserId; }
    public void setContactUserId(String contactUserId) { this.contactUserId = contactUserId; }

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

    public boolean isRegistered() { return isRegistered; }
    public void setRegistered(boolean registered) { isRegistered = registered; }

    public String getLastSeen() { return lastSeen; }
    public void setLastSeen(String lastSeen) { this.lastSeen = lastSeen; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
