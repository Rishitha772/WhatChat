
package app.whatchat.auth;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "auth_accounts")
public class AuthAccount {

    @Id
    private String id;

    private String fullName;

    private String email;

    private String passwordHash;

    private boolean emailVerified;

    private boolean active = true;

    private boolean profileComplete;

    private int sessionVersion;

    private String username;

    private String about;

    private String verificationTokenHash;

    private Instant verificationExpiresAt;

    private String resetTokenHash;

    private Instant resetExpiresAt;

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

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public void setVerificationTokenHash(String tokenHash) {
        this.verificationTokenHash = tokenHash;
    }

    public void setVerificationExpiresAt(Instant expiresAt) {
        this.verificationExpiresAt = expiresAt;
    }

    public void setResetTokenHash(String tokenHash) {
        this.resetTokenHash = tokenHash;
    }

    public void setResetExpiresAt(Instant expiresAt) {
        this.resetExpiresAt = expiresAt;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public void setProfileComplete(boolean profileComplete) {
        this.profileComplete = profileComplete;
    }

    public void incrementSessionVersion() {
        sessionVersion++;
    }
}
