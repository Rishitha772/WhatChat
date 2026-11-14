package app.whatchat.auth;

import app.whatchat.auth.AuthResponses.AccountView;
import app.whatchat.auth.AuthResponses.Session;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private static final String SESSION_COOKIE = "WHATCHAT_SESSION";

    private final AuthService authService;
    private final boolean secureCookie;

    public AuthController(AuthService authService,
            @Value("${security.cookie.secure:false}") boolean secureCookie) {
        this.authService = authService;
        this.secureCookie = secureCookie;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request.fullName(), request.email(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Check your inbox for a verification link."));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody TokenRequest request) {
        authService.verifyEmail(request.token());
        return ResponseEntity.ok(Map.of("message", "Your email is verified. You can now sign in."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@Valid @RequestBody EmailRequest request) {
        authService.resendVerification(request.email());
        return ResponseEntity.ok(Map.of(
                "message", "If an unverified account exists for that address, a new link is on its way."));
    }

    @PostMapping("/login")
    public ResponseEntity<SessionResponse> login(@Valid @RequestBody LoginRequest request) {
        Session session = authService.login(request.email(), request.password());
        ResponseCookie cookie = sessionCookie(session.token(), Duration.ofHours(24));
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new SessionResponse(session.user().profileComplete()));
    }

    @GetMapping("/me")
    public AccountView me(Authentication authentication) {
        return authService.currentAccount(authentication.getName());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, sessionCookie("", Duration.ZERO).toString())
                .build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody EmailRequest request) {
        authService.requestPasswordReset(request.email());
        return ResponseEntity.ok(Map.of(
                "message", "If an active account exists for that address, a password reset link is on its way."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.password());
        return ResponseEntity.ok(Map.of("message", "Your password has been updated. You can sign in now."));
    }

    @PutMapping("/profile")
    public ResponseEntity<AccountView> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileRequest request) {
        authService.updateProfile(authentication.getName(), request.fullName(), request.username(), request.about());
        return ResponseEntity.ok(authService.currentAccount(authentication.getName()));
    }

    private ResponseCookie sessionCookie(String value, Duration maxAge) {
        return ResponseCookie.from(SESSION_COOKIE, value)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAge)
                .build();
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 8, max = 72)
            @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$") String password) {}

    public record LoginRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 72) String password) {}

    public record EmailRequest(@NotBlank @Email @Size(max = 254) String email) {}
    public record TokenRequest(@NotBlank @Size(max = 200) String token) {}
    public record ResetPasswordRequest(
            @NotBlank @Size(max = 200) String token,
            @NotBlank @Size(min = 8, max = 72)
            @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$") String password) {}
    public record ProfileRequest(
            @NotBlank @Size(max = 100) String fullName,
            @Size(max = 30) @Pattern(regexp = "(?:|[A-Za-z0-9_]{3,30})") String username,
            @Size(max = 255) String about) {}
    public record SessionResponse(boolean profileComplete) {}
}
