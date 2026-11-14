package app.whatchat.auth;

import app.whatchat.auth.AuthResponses.AccountView;
import app.whatchat.auth.AuthResponses.Session;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private static final Duration VERIFICATION_TTL = Duration.ofHours(24);
    private static final Duration RESET_TTL = Duration.ofMinutes(30);
    private static final Duration SESSION_TTL = Duration.ofHours(24);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AuthAccountRepository accounts;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSenders;
    private final String jwtSecret;
    private final String appUrl;
    private final String mailFrom;
    private final String mailHost;

    public AuthService(
            AuthAccountRepository accounts,
            PasswordEncoder passwordEncoder,
            ObjectProvider<JavaMailSender> mailSenders,
            @Value("${security.jwt.secret-key}") String jwtSecret,
            @Value("${app.url:http://localhost:3000}") String appUrl,
            @Value("${app.mail.from:}") String mailFrom,
            @Value("${spring.mail.host:}") String mailHost) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
        this.mailSenders = mailSenders;
        this.jwtSecret = jwtSecret;
        this.appUrl = appUrl.replaceAll("/+$", "");
        this.mailFrom = mailFrom;
        this.mailHost = mailHost;
        if (jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must contain at least 32 bytes.");
        }
    }

    @Transactional
    public void register(String fullName, String email, String password) {
        validatePassword(password);
        requireEmailDelivery();
        String normalizedEmail = normalizeEmail(email);
        if (accounts.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new AuthException(HttpStatus.CONFLICT, "EMAIL_ALREADY_REGISTERED",
                    "An account already uses this email address.");
        }

        AuthAccount account = new AuthAccount(
                UUID.randomUUID().toString(),
                fullName.trim(),
                normalizedEmail,
                passwordEncoder.encode(password));
        String token = newToken();
        account.setVerificationTokenHash(hashToken(token));
        account.setVerificationExpiresAt(Instant.now().plus(VERIFICATION_TTL));
        if (mailHost.isBlank() || mailSenders.getIfAvailable() == null) {
            account.setEmailVerified(true);
        }
        accounts.saveAndFlush(account);
        sendMail(normalizedEmail, "Verify your WhatChat email",
                "Use this secure link within 24 hours to verify your email address:",
                appUrl + "/verify-email?token=" + token);
    }

    @Transactional
    public void verifyEmail(String token) {
        AuthAccount account = accounts.findByVerificationTokenHash(hashToken(token))
                .orElseThrow(() -> new AuthException(HttpStatus.BAD_REQUEST, "INVALID_VERIFICATION_TOKEN",
                        "This verification link is invalid or has expired."));
        if (account.isEmailVerified()) {
            throw new AuthException(HttpStatus.CONFLICT, "ALREADY_VERIFIED",
                    "This email address has already been verified.");
        }
        if (account.getVerificationExpiresAt() == null
                || account.getVerificationExpiresAt().isBefore(Instant.now())) {
            account.setVerificationTokenHash(null);
            account.setVerificationExpiresAt(null);
            throw new AuthException(HttpStatus.GONE, "EXPIRED_VERIFICATION_TOKEN",
                    "This verification link has expired. Request a new one to continue.");
        }
        account.setEmailVerified(true);
        account.setVerificationTokenHash(null);
        account.setVerificationExpiresAt(null);
    }

    @Transactional
    public void resendVerification(String email) {
        requireEmailDelivery();
        accounts.findByEmailIgnoreCase(normalizeEmail(email))
                .filter(account -> !account.isEmailVerified())
                .ifPresent(account -> {
                    String token = newToken();
                    account.setVerificationTokenHash(hashToken(token));
                    account.setVerificationExpiresAt(Instant.now().plus(VERIFICATION_TTL));
                    sendMail(account.getEmail(), "Verify your WhatChat email",
                            "Use this secure link within 24 hours to verify your email address:",
                            appUrl + "/verify-email?token=" + token);
                });
    }

    @Transactional(readOnly = true)
    public Session login(String email, String password) {
        AuthAccount account = accounts.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                        "The email or password is incorrect."));
        if (!passwordEncoder.matches(password, account.getPasswordHash())) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                    "The email or password is incorrect.");
        }
        if (!account.isActive()) {
            throw new AuthException(HttpStatus.FORBIDDEN, "ACCOUNT_DISABLED",
                    "This account is currently disabled.");
        }
        if (!account.isEmailVerified()) {
            throw new AuthException(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED",
                    "Verify your email address before signing in.");
        }
        return new Session(toView(account), createSessionToken(account));
    }

    @Transactional(readOnly = true)
    public AccountView currentAccount(String accountId) {
        return toView(findAccount(accountId));
    }

    @Transactional
    public void updateProfile(String accountId, String fullName, String username, String about) {
        AuthAccount account = findAccount(accountId);
        String normalizedUsername = username == null || username.isBlank() ? null : username.trim();
        if (normalizedUsername != null && accounts.existsByUsernameIgnoreCase(normalizedUsername)
                && !normalizedUsername.equalsIgnoreCase(account.getUsername())) {
            throw new AuthException(HttpStatus.CONFLICT, "USERNAME_ALREADY_TAKEN",
                    "That username is already in use.");
        }
        account.setFullName(fullName.trim());
        account.setUsername(normalizedUsername);
        account.setAbout(about == null || about.isBlank() ? null : about.trim());
        account.setProfileComplete(true);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        requireEmailDelivery();
        accounts.findByEmailIgnoreCase(normalizeEmail(email))
                .filter(AuthAccount::isActive)
                .ifPresent(account -> {
                    String token = newToken();
                    account.setResetTokenHash(hashToken(token));
                    account.setResetExpiresAt(Instant.now().plus(RESET_TTL));
                    sendMail(account.getEmail(), "Reset your WhatChat password",
                            "Use this secure link within 30 minutes to choose a new password:",
                            appUrl + "/reset-password?token=" + token);
                });
    }

    @Transactional
    public void resetPassword(String token, String password) {
        validatePassword(password);
        AuthAccount account = accounts.findByResetTokenHash(hashToken(token))
                .orElseThrow(() -> new AuthException(HttpStatus.BAD_REQUEST, "INVALID_RESET_TOKEN",
                        "This password reset link is invalid or has expired."));
        if (account.getResetExpiresAt() == null || account.getResetExpiresAt().isBefore(Instant.now())) {
            account.setResetTokenHash(null);
            account.setResetExpiresAt(null);
            throw new AuthException(HttpStatus.GONE, "EXPIRED_RESET_TOKEN",
                    "This password reset link has expired. Request a new one to continue.");
        }
        account.setPasswordHash(passwordEncoder.encode(password));
        account.incrementSessionVersion();
        account.setResetTokenHash(null);
        account.setResetExpiresAt(null);
    }

    public String createSessionToken(AuthAccount account) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(account.getId())
                .claim("sessionVersion", account.getSessionVersion())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(SESSION_TTL)))
                .signWith(signingKey())
                .compact();
    }

    public String validateSession(String token) {
        try {
            var claims = Jwts.parser().verifyWith(signingKey()).build()
                    .parseSignedClaims(token).getPayload();
            Object tokenVersion = claims.get("sessionVersion");
            if (!(tokenVersion instanceof Number version)) return null;
            return accounts.findById(claims.getSubject())
                    .filter(AuthAccount::isActive)
                    .filter(AuthAccount::isEmailVerified)
                    .filter(account -> account.getSessionVersion() == version.intValue())
                    .map(AuthAccount::getId)
                    .orElse(null);
        } catch (JwtException | IllegalArgumentException exception) {
            return null;
        }
    }

    private AccountView toView(AuthAccount account) {
        return new AccountView(account.getId(), account.getFullName(), account.getEmail(),
                account.getUsername(), account.getAbout(), account.getCreatedAt(), account.isProfileComplete());
    }

    private AuthAccount findAccount(String id) {
        return accounts.findById(id).filter(AuthAccount::isActive)
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED",
                        "Sign in to continue."));
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    private void requireEmailDelivery() {
        if (!mailHost.isBlank() && (mailFrom.isBlank() || mailSenders.getIfAvailable() == null)) {
            throw new AuthException(HttpStatus.SERVICE_UNAVAILABLE, "EMAIL_NOT_CONFIGURED",
                    "Email delivery is not configured. Contact the administrator.");
        }
    }

    private void validatePassword(String password) {
        int byteLength = password.getBytes(StandardCharsets.UTF_8).length;
        if (byteLength > 72) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "PASSWORD_TOO_LONG",
                    "Choose a password with no more than 72 UTF-8 bytes.");
        }
        if (password.length() < 8 || password.chars().noneMatch(Character::isUpperCase)
                || password.chars().noneMatch(Character::isDigit)
                || password.chars().allMatch(Character::isLetterOrDigit)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "WEAK_PASSWORD",
                    "Use at least eight characters with an uppercase letter, a number, and a symbol.");
        }
    }

    private void sendMail(String recipient, String subject, String message, String link) {
        if (mailHost.isBlank() || mailSenders.getIfAvailable() == null) {
            System.out.println("[LOCAL DEV MAIL] To: " + recipient + " | " + subject + " | Link: " + link);
            return;
        }
        try {
            MimeMessage mail = mailSenders.getObject().createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mail, StandardCharsets.UTF_8.name());
            helper.setFrom(mailFrom);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText("<p>" + message + "</p><p><a href=\"" + link
                    + "\">Continue securely</a></p><p>If you did not request this, you can ignore this email.</p>",
                    true);
            mailSenders.getObject().send(mail);
        } catch (MessagingException | RuntimeException exception) {
            throw new AuthException(HttpStatus.SERVICE_UNAVAILABLE, "EMAIL_DELIVERY_FAILED",
                    "We could not deliver the email. Please try again later.");
        }
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(java.util.Locale.ROOT);
    }

    private static String newToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hashToken(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is required by the Java runtime.", exception);
        }
    }
}
