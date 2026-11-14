package app.whatchat.auth;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "users")
public class AuthAccount {

    @Id
    private String id;

    private String fullName;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private boolean emailVerified;

    private boolean active = true;

    private boolean profileComplete;

    private int sessionVersion;

    @Indexed(unique = true, sparse = true)
    private String username;

    private String about = "Hey there! I am using WhatChat.";

    private String avatarUrl;

    @Indexed(sparse = true)
    private String phoneNumber;

    private boolean isOnline;

    private String lastSeen;

    @Indexed
    private String verificationTokenHash;

    private Instant verificationExpiresAt;

    @Indexed
    private String resetTokenHash;

    private Instant resetExpiresAt;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public AuthAccount() {}

    public AuthAccount(String id, String fullName, String email, String passwordHash) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isProfileComplete() { return profileComplete; }
    public void setProfileComplete(boolean profileComplete) { this.profileComplete = profileComplete; }

    public int getSessionVersion() { return sessionVersion; }
    public void setSessionVersion(int sessionVersion) { this.sessionVersion = sessionVersion; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }

    public String getLastSeen() { return lastSeen; }
    public void setLastSeen(String lastSeen) { this.lastSeen = lastSeen; }

    public String getVerificationTokenHash() { return verificationTokenHash; }
    public void setVerificationTokenHash(String tokenHash) { this.verificationTokenHash = tokenHash; }

    public Instant getVerificationExpiresAt() { return verificationExpiresAt; }
    public void setVerificationExpiresAt(Instant expiresAt) { this.verificationExpiresAt = expiresAt; }

    public String getResetTokenHash() { return resetTokenHash; }
    public void setResetTokenHash(String tokenHash) { this.resetTokenHash = tokenHash; }

    public Instant getResetExpiresAt() { return resetExpiresAt; }
    public void setResetExpiresAt(Instant expiresAt) { this.resetExpiresAt = expiresAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public void incrementSessionVersion() { sessionVersion++; }
}
