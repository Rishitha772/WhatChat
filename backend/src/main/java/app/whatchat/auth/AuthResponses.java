package app.whatchat.auth;

import java.time.Instant;

public final class AuthResponses {
    private AuthResponses() {}

    public record AccountView(
            String id,
            String fullName,
            String email,
            String username,
            String about,
            String phoneNumber,
            Instant createdAt,
            boolean profileComplete) {}

    public record Session(AccountView user, String token) {}
}
