
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
    private static final Duration SESSION_DURATION = Duration.ofHours(24);

    private final AuthService authService;
    private final boolean secureCookie;

    public AuthController(
            AuthService authService,
            @Value("${security.cookie.secure:false}") boolean secureCookie) {

        this.authService = authService;
        this.secureCookie = secureCookie;
    }

    // ============================================================
    // REGISTER
    // ============================================================

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthService.RegistrationResult result = authService.register(
                request.fullName(),
                request.email(),
                request.password(),
                request.phoneNumber(),
                request.username());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message", result.message(),
                        "emailVerified", result.emailVerified()));
    }

    // ============================================================
    // VERIFY EMAIL
    // ============================================================

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(
            @Valid @RequestBody TokenRequest request) {

        authService.verifyEmail(request.token());

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Your email has been verified. You can now sign in."));
    }

    // ============================================================
    // RESEND VERIFICATION EMAIL
    // ============================================================

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, Object>> resendVerification(
            @Valid @RequestBody EmailRequest request) {

        AuthService.ResendResult result = authService.resendVerification(request.email());

        return ResponseEntity.ok(
                Map.of(
                        "message", result.message(),
                        "alreadyVerified", result.alreadyVerified()));
    }

    // ============================================================
    // LOGIN
    // ============================================================

    @PostMapping("/login")
    public ResponseEntity<SessionResponse> login(
            @Valid @RequestBody LoginRequest request) {

        Session session = authService.login(
                request.email(),
                request.password());

        ResponseCookie cookie = sessionCookie(
                session.token(),
                SESSION_DURATION);

        SessionResponse response = new SessionResponse(
                session.user().profileComplete(),
                session.token(),
                session.user());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + session.token())
                .body(response);
    }

    // ============================================================
    // OTP AUTHENTICATION
    // ============================================================

    @PostMapping("/otp/send")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> payload) {
        String phoneNumber = payload.get("phoneNumber");
        return ResponseEntity.ok(authService.sendOtp(phoneNumber));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> payload) {
        String phoneNumber = payload.get("phoneNumber");
        String code = payload.get("code");
        AuthService.OtpVerifyResult result = authService.verifyOtp(phoneNumber, code);
        Map<String, Object> response = new java.util.LinkedHashMap<>();
        response.put("registered", result.registered());
        response.put("phoneNumber", result.phoneNumber());
        response.put("message", result.message());
        if (result.session() != null) {
            ResponseCookie cookie = sessionCookie(result.session().token(), SESSION_DURATION);
            response.put("token", result.session().token());
            response.put("session", new SessionResponse(
                    result.session().user().profileComplete(),
                    result.session().token(),
                    result.session().user()));
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + result.session().token())
                    .body(response);
        }
        return ResponseEntity.ok(response);
    }

    // ============================================================
    // CURRENT USER
    // ============================================================

    @GetMapping("/me")
    public ResponseEntity<AccountView> me(
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AccountView account = authService.currentAccount(authentication.getName());

        return ResponseEntity.ok(account);
    }

    // ============================================================
    // LOGOUT
    // ============================================================

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {

        ResponseCookie cookie = sessionCookie(
                "",
                Duration.ZERO);

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    // ============================================================
    // FORGOT PASSWORD
    // ============================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody EmailRequest request) {

        AuthService.ResetRequestResult result = authService.requestPasswordReset(request.email());

        return ResponseEntity.ok(
                Map.of("message", result.message()));
    }

    // ============================================================
    // RESET PASSWORD
    // ============================================================

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(
                request.token(),
                request.password());

        ResponseCookie expiredCookie = sessionCookie(
                "",
                Duration.ZERO);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredCookie.toString())
                .body(
                        Map.of(
                                "message",
                                "Your password has been updated. Please sign in again."));
    }

    // ============================================================
    // UPDATE PROFILE
    // ============================================================

    @PutMapping("/profile")
    public ResponseEntity<AccountView> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileRequest request) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String accountId = authentication.getName();

        authService.updateProfile(
                accountId,
                request.fullName(),
                request.username(),
                request.about(),
                request.phoneNumber());

        return ResponseEntity.ok(
                authService.currentAccount(accountId));
    }

    // ============================================================
    // SESSION COOKIE
    // ============================================================

    private ResponseCookie sessionCookie(
            String value,
            Duration maxAge) {

        return ResponseCookie.from(SESSION_COOKIE, value)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();
    }

    // ============================================================
    // REQUEST DTOs
    // ============================================================

    public record RegisterRequest(

            @NotBlank @Size(max = 100) String fullName,

            @NotBlank @Email @Size(max = 254) String email,

            @NotBlank @Size(min = 8, max = 72) @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$") String password,

            @Size(max = 20) String phoneNumber,

            @Size(max = 30) @Pattern(regexp = "(?:|[A-Za-z0-9_]{3,30})") String username) {
        public RegisterRequest(
                String fullName,
                String email,
                String password) {

            this(fullName, email, password, null, null);
        }
    }

    public record LoginRequest(

            @NotBlank @Size(max = 254) String email,

            @NotBlank @Size(max = 72) String password) {
    }

    public record EmailRequest(

            @NotBlank @Email @Size(max = 254) String email) {
    }

    public record TokenRequest(

            @NotBlank @Size(max = 200) String token) {
    }

    public record ResetPasswordRequest(

            @NotBlank @Size(max = 200) String token,

            @NotBlank @Size(min = 8, max = 72) @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$") String password) {
    }

    public record ProfileRequest(

            @NotBlank @Size(max = 100) String fullName,

            @Size(max = 30) @Pattern(regexp = "(?:|[A-Za-z0-9_]{3,30})") String username,

            @Size(max = 255) String about,

            @Size(max = 20) String phoneNumber) {
        public ProfileRequest(
                String fullName,
                String username,
                String about) {

            this(fullName, username, about, null);
        }
    }

    public record SessionResponse(
            boolean profileComplete,
            String token,
            AccountView user) {
    }
}
