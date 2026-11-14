package app.whatchat.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "auth_accounts")
public class AuthAccount {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(length = 254, nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", length = 100, nullable = false)
    private String passwordHash;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "profile_complete", nullable = false)
    private boolean profileComplete;

    @Column(name = "session_version", nullable = false)
    private int sessionVersion;

    @Column(length = 30, unique = true)
    private String username;

    @Column(length = 255)
    private String about;

    @Column(name = "verification_token_hash", length = 64)
    private String verificationTokenHash;

    @Column(name = "verification_expires_at")
    private Instant verificationExpiresAt;

    @Column(name = "reset_token_hash", length = 64)
    private String resetTokenHash;

    @Column(name = "reset_expires_at")
    private Instant resetExpiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AuthAccount() {}

    public AuthAccount(String id, String fullName, String email, String passwordHash) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public boolean isEmailVerified() { return emailVerified; }
    public boolean isActive() { return active; }
    public boolean isProfileComplete() { return profileComplete; }
    public int getSessionVersion() { return sessionVersion; }
    public String getUsername() { return username; }
    public String getAbout() { return about; }
    public String getVerificationTokenHash() { return verificationTokenHash; }
    public Instant getVerificationExpiresAt() { return verificationExpiresAt; }
    public String getResetTokenHash() { return resetTokenHash; }
    public Instant getResetExpiresAt() { return resetExpiresAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    public void setVerificationTokenHash(String tokenHash) { this.verificationTokenHash = tokenHash; }
    public void setVerificationExpiresAt(Instant expiresAt) { this.verificationExpiresAt = expiresAt; }
    public void setResetTokenHash(String tokenHash) { this.resetTokenHash = tokenHash; }
    public void setResetExpiresAt(Instant expiresAt) { this.resetExpiresAt = expiresAt; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setUsername(String username) { this.username = username; }
    public void setAbout(String about) { this.about = about; }
    public void setProfileComplete(boolean profileComplete) { this.profileComplete = profileComplete; }
    public void incrementSessionVersion() { sessionVersion++; }
}
