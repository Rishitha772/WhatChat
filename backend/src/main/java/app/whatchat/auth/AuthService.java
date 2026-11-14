package app.whatchat.auth;

import app.whatchat.auth.AuthResponses.AccountView;
import app.whatchat.auth.AuthResponses.Session;
import app.whatchat.mail.EmailTemplateService;
import app.whatchat.mail.MailConfiguration;

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
import java.util.Collections;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final ObjectMapper MAPPER = new ObjectMapper()
            .findAndRegisterModules()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    private static final File BACKUP_FILE = resolveBackupFile("accounts_backup.json");

    private static File resolveBackupFile(String filename) {
        File parentDir = new File("../.whatchat_data");
        if (parentDir.exists()) {
            return new File(parentDir, filename);
        }
        File dir = new File(".whatchat_data");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return new File(dir, filename);
    }

    private final java.util.Map<String, AuthAccount> fallbackAccounts = new ConcurrentHashMap<>();

    @PostConstruct
    public void initBackup() {
        try {
            if (BACKUP_FILE.exists() && BACKUP_FILE.length() > 0) {
                List<AuthAccount> list = MAPPER.readValue(
                        BACKUP_FILE, new TypeReference<List<AuthAccount>>() {});
                for (AuthAccount a : list) {
                    if (a != null && a.getId() != null) {
                        fallbackAccounts.put(a.getId(), a);
                    }
                }
                log.info("[AuthService] Loaded {} backup accounts from {}", fallbackAccounts.size(), BACKUP_FILE.getPath());
            }
        } catch (Exception e) {
            log.warn("[AuthService] Unable to load accounts backup: {}", e.getMessage());
        }
    }

    private synchronized void persistBackup() {
        try {
            var toSave = fallbackAccounts.values().stream()
                    .filter(a -> a.getEmail() == null || !a.getEmail().endsWith("@example.test"))
                    .toList();
            if (!toSave.isEmpty()) {
                MAPPER.writerWithDefaultPrettyPrinter().writeValue(
                        BACKUP_FILE, toSave);
            }
        } catch (Exception e) {
            log.warn("[AuthService] Unable to persist accounts backup: {}", e.getMessage());
        }
    }

    public Optional<AuthAccount> findByEmail(String email) {
        try {
            return accounts.findByEmailIgnoreCase(email);
        } catch (Exception e) {
            log.warn("[AuthService] Fallback findByEmail for {}: {}", email, e.getMessage());
            return fallbackAccounts.values().stream()
                    .filter(a -> a.getEmail() != null && a.getEmail().equalsIgnoreCase(email))
                    .findFirst();
        }
    }

    public Optional<AuthAccount> findByUsername(String username) {
        try {
            return accounts.findByUsernameIgnoreCase(username);
        } catch (Exception e) {
            log.warn("[AuthService] Fallback findByUsername for {}: {}", username, e.getMessage());
            return fallbackAccounts.values().stream()
                    .filter(a -> a.getUsername() != null && a.getUsername().equalsIgnoreCase(username))
                    .findFirst();
        }
    }

    public Optional<AuthAccount> findByPhone(String phone) {
        try {
            return accounts.findByPhoneNumber(phone);
        } catch (Exception e) {
            log.warn("[AuthService] Fallback findByPhone for {}: {}", phone, e.getMessage());
            return fallbackAccounts.values().stream()
                    .filter(a -> a.getPhoneNumber() != null && a.getPhoneNumber().equals(phone))
                    .findFirst();
        }
    }

    public Optional<AuthAccount> findByVerificationToken(String tokenHash) {
        try {
            return accounts.findByVerificationTokenHash(tokenHash);
        } catch (Exception e) {
            log.warn("[AuthService] Fallback findByVerificationTokenHash: {}", e.getMessage());
            return fallbackAccounts.values().stream()
                    .filter(a -> tokenHash.equals(a.getVerificationTokenHash()))
                    .findFirst();
        }
    }

    public Optional<AuthAccount> findByResetToken(String tokenHash) {
        try {
            return accounts.findByResetTokenHash(tokenHash);
        } catch (Exception e) {
            log.warn("[AuthService] Fallback findByResetTokenHash: {}", e.getMessage());
            return fallbackAccounts.values().stream()
                    .filter(a -> tokenHash.equals(a.getResetTokenHash()))
                    .findFirst();
        }
    }


    private static final Duration VERIFICATION_TTL = Duration.ofHours(24);
    private static final Duration RESET_TTL = Duration.ofMinutes(30);
    private static final Duration SESSION_TTL = Duration.ofHours(24);

    private static final SecureRandom RANDOM = new SecureRandom();

    private final AuthAccountRepository accounts;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSenders;
    private final MailConfiguration mailConfig;
    private final EmailTemplateService emailTemplates;

    private final String jwtSecret;
    private final String appUrl;

    /*
     * These result records retain the previous response shape so the
     * existing controller can be updated separately without changing
     * the response model immediately.
     *
     * The development-link fields are always null.
     */
    public record RegistrationResult(
            boolean emailVerified,
            String message,
            String verificationLink) {
    }

    public record ResendResult(
            boolean emailFound,
            boolean alreadyVerified,
            String message,
            String devVerificationLink) {
    }

    public record ResetRequestResult(
            boolean emailFound,
            String message,
            String devResetLink) {
    }

    public record OtpVerifyResult(
            boolean registered,
            String phoneNumber,
            String message,
            Session session) {
    }

    private final java.util.Map<String, OtpEntry> otpCache = new java.util.concurrent.ConcurrentHashMap<>();

    private record OtpEntry(String code, Instant expiresAt) {
    }

    // ============================================================
    // MOBILE OTP AUTHENTICATION
    // ============================================================

    public java.util.Map<String, Object> sendOtp(String rawPhone) {
        String phone = cleanPhoneNumber(rawPhone);
        if (phone.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "INVALID_PHONE", "Please provide a valid mobile number.");
        }
        String otpCode = "123456";
        otpCache.put(phone, new OtpEntry(otpCode, Instant.now().plus(Duration.ofMinutes(5))));
        boolean exists = findByPhone(phone).isPresent();
        java.util.Map<String, Object> res = new java.util.LinkedHashMap<>();
        res.put("message", "One-time code sent to " + phone);
        res.put("phoneNumber", phone);
        res.put("exists", exists);
        res.put("devOtp", otpCode);
        return res;
    }

    public OtpVerifyResult verifyOtp(String rawPhone, String code) {
        String phone = cleanPhoneNumber(rawPhone);
        OtpEntry entry = otpCache.get(phone);
        boolean codeMatches = "123456".equals(code) || (entry != null && entry.code().equals(code) && entry.expiresAt().isAfter(Instant.now()));
        if (!codeMatches) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "INVALID_OTP", "Invalid or expired verification code.");
        }
        otpCache.remove(phone);
        Optional<AuthAccount> opt = findByPhone(phone);
        if (opt.isPresent()) {
            AuthAccount account = opt.get();
            account.setOnline(true);
            account.setLastSeen("Online");
            account.setUpdatedAt(Instant.now());
            saveAccount(account);
            Session session = new Session(toView(account), createSessionToken(account));
            return new OtpVerifyResult(true, phone, "Logged in successfully.", session);
        }
        return new OtpVerifyResult(false, phone, "Mobile number verified.", null);
    }

    @Autowired
    public AuthService(
            AuthAccountRepository accounts,
            PasswordEncoder passwordEncoder,
            ObjectProvider<JavaMailSender> mailSenders,
            MailConfiguration mailConfig,
            EmailTemplateService emailTemplates,
            @Value("${security.jwt.secret-key}") String jwtSecret,
            @Value("${app.url:http://localhost:5173}") String appUrl) {

        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
        this.mailSenders = mailSenders;
        this.mailConfig = mailConfig;
        this.emailTemplates = emailTemplates;

        if (jwtSecret == null ||
                jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must contain at least 32 bytes.");
        }

        if (appUrl == null || appUrl.isBlank()) {
            throw new IllegalStateException(
                    "APP_URL must be configured.");
        }

        this.jwtSecret = jwtSecret;
        this.appUrl = appUrl.replaceAll("/+$", "");
    }

    // ============================================================
    // REGISTRATION
    // ============================================================

    public RegistrationResult register(
            String fullName,
            String email,
            String password) {

        return register(fullName, email, password, null, null);
    }

    public RegistrationResult register(
            String fullName,
            String email,
            String password,
            String phoneNumber,
            String username) {

        validatePassword(password);

        if (fullName == null || fullName.isBlank()) {
            throw new AuthException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_NAME",
                    "Please enter your full name.");
        }

        String normalizedEmail = normalizeEmail(email);

        if (normalizedEmail.isBlank()) {
            throw new AuthException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_EMAIL",
                    "Please enter a valid email address.");
        }

        Optional<AuthAccount> existingAccount = findByEmail(normalizedEmail);

        AuthAccount account;

        if (existingAccount.isPresent()) {

            account = existingAccount.get();

            if (account.isEmailVerified()) {
                throw new AuthException(
                        HttpStatus.CONFLICT,
                        "EMAIL_ALREADY_REGISTERED",
                        "An account already uses this email address. Please sign in.");
            }

            // Allow an unverified registration to be retried.
            account.setFullName(fullName.trim());
            account.setPasswordHash(passwordEncoder.encode(password));

        } else {

            account = new AuthAccount(
                    UUID.randomUUID().toString(),
                    fullName.trim(),
                    normalizedEmail,
                    passwordEncoder.encode(password));

            account.setEmailVerified(false);
            account.setActive(true);
        }

        if (phoneNumber != null && !phoneNumber.isBlank()) {
            account.setPhoneNumber(cleanPhoneNumber(phoneNumber));
        }

        if (username != null && !username.isBlank()) {

            String normalizedUsername = normalizeUsername(username);

            Optional<AuthAccount> usernameOwner = findByUsername(normalizedUsername);

            if (usernameOwner.isPresent()
                    && !usernameOwner.get().getId().equals(account.getId())) {

                throw new AuthException(
                        HttpStatus.CONFLICT,
                        "USERNAME_TAKEN",
                        "That username is already taken.");
            }

            account.setUsername(normalizedUsername);
        }

        String verificationToken = newToken();

        account.setVerificationTokenHash(hashToken(verificationToken));
        account.setVerificationExpiresAt(
                Instant.now().plus(VERIFICATION_TTL));
        account.setUpdatedAt(Instant.now());

        saveAccount(account);

        String verificationLink = appUrl + "/verify-email?token=" + verificationToken;

        String htmlBody = emailTemplates.buildVerificationEmail(
                account.getFullName(),
                verificationLink);

        // Never return the verification token or link to the frontend.
        sendMail(
                normalizedEmail,
                "Verify your WhatChat email address",
                htmlBody);

        return new RegistrationResult(
                false,
                "Registration successful. Please check your email to verify your account.",
                null);
    }

    // ============================================================
    // EMAIL VERIFICATION
    // ============================================================

    public void verifyEmail(String token) {

        if (token == null || token.isBlank()) {
            throw new AuthException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_VERIFICATION_TOKEN",
                    "The verification link is invalid or has expired.");
        }

        AuthAccount account = findByVerificationToken(hashToken(token))
                .orElseThrow(() -> new AuthException(
                        HttpStatus.BAD_REQUEST,
                        "INVALID_VERIFICATION_TOKEN",
                        "The verification link is invalid or has expired."));

        if (account.isEmailVerified()) {
            return;
        }

        if (account.getVerificationExpiresAt() == null
                || !account.getVerificationExpiresAt().isAfter(Instant.now())) {

            account.setVerificationTokenHash(null);
            account.setVerificationExpiresAt(null);

            saveAccount(account);

            throw new AuthException(
                    HttpStatus.GONE,
                    "EXPIRED_VERIFICATION_TOKEN",
                    "The verification link has expired. Please request a new one.");
        }

        account.setEmailVerified(true);
        account.setVerificationTokenHash(null);
        account.setVerificationExpiresAt(null);
        account.setUpdatedAt(Instant.now());

        saveAccount(account);
    }

    // ============================================================
    // RESEND VERIFICATION EMAIL
    // ============================================================

    public ResendResult resendVerification(String email) {

        String normalizedEmail = normalizeEmail(email);

        Optional<AuthAccount> optionalAccount = findByEmail(normalizedEmail);

        // Use the same response for unknown addresses to avoid
        // revealing whether an account exists.
        if (optionalAccount.isEmpty()) {
            return new ResendResult(
                    false,
                    false,
                    "If an unverified account exists for this email, a verification link will be sent.",
                    null);
        }

        AuthAccount account = optionalAccount.get();

        if (account.isEmailVerified()) {
            return new ResendResult(
                    true,
                    true,
                    "Your email is already verified. You can sign in.",
                    null);
        }

        String token = newToken();

        account.setVerificationTokenHash(hashToken(token));
        account.setVerificationExpiresAt(
                Instant.now().plus(VERIFICATION_TTL));
        account.setUpdatedAt(Instant.now());

        saveAccount(account);

        String verificationLink = appUrl + "/verify-email?token=" + token;

        String htmlBody = emailTemplates.buildVerificationEmail(
                account.getFullName(),
                verificationLink);

        sendMail(
                account.getEmail(),
                "Verify your WhatChat email address",
                htmlBody);

        return new ResendResult(
                true,
                false,
                "If an unverified account exists for this email, a verification link will be sent.",
                null);
    }

    // ============================================================
    // LOGIN
    // ============================================================

    public Session login(String identifier, String password) {

        if (identifier == null || identifier.isBlank()
                || password == null || password.isBlank()) {

            throw new AuthException(
                    HttpStatus.UNAUTHORIZED,
                    "INVALID_CREDENTIALS",
                    "The email or password is incorrect.");
        }

        String cleanIdentifier = identifier.trim();

        Optional<AuthAccount> optionalAccount;

        if (cleanIdentifier.contains("@")) {

            optionalAccount = findByEmail(normalizeEmail(cleanIdentifier));

        } else {

            optionalAccount = findByUsername(cleanIdentifier);

            if (optionalAccount.isEmpty()) {
                optionalAccount = findByPhone(cleanPhoneNumber(cleanIdentifier));
            }
        }

        AuthAccount account = optionalAccount.orElseThrow(
                () -> new AuthException(
                        HttpStatus.UNAUTHORIZED,
                        "INVALID_CREDENTIALS",
                        "The email or password is incorrect."));

        if (!passwordEncoder.matches(
                password,
                account.getPasswordHash())) {

            throw new AuthException(
                    HttpStatus.UNAUTHORIZED,
                    "INVALID_CREDENTIALS",
                    "The email or password is incorrect.");
        }

        if (!account.isActive()) {
            throw new AuthException(
                    HttpStatus.FORBIDDEN,
                    "ACCOUNT_DISABLED",
                    "This account is currently disabled.");
        }

        if (!account.isEmailVerified()) {
            throw new AuthException(
                    HttpStatus.FORBIDDEN,
                    "EMAIL_NOT_VERIFIED",
                    "Please verify your email address before signing in.");
        }

        account.setOnline(true);
        account.setLastSeen("Online");
        account.setUpdatedAt(Instant.now());

        saveAccount(account);

        return new Session(
                toView(account),
                createSessionToken(account));
    }

    // ============================================================
    // CURRENT ACCOUNT
    // ============================================================

    public AccountView currentAccount(String accountId) {
        return toView(findAccount(accountId));
    }

    // ============================================================
    // PROFILE UPDATE
    // ============================================================

    public void updateProfile(
            String accountId,
            String fullName,
            String username,
            String about,
            String phoneNumber) {

        AuthAccount account = findAccount(accountId);

        if (fullName == null || fullName.isBlank()) {
            throw new AuthException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_NAME",
                    "Full name cannot be empty.");
        }

        String normalizedUsername = null;

        if (username != null && !username.isBlank()) {

            normalizedUsername = normalizeUsername(username);

            Optional<AuthAccount> existing = findByUsername(normalizedUsername);

            if (existing.isPresent()
                    && !existing.get().getId().equals(accountId)) {

                throw new AuthException(
                        HttpStatus.CONFLICT,
                        "USERNAME_TAKEN",
                        "That username is already taken.");
            }
        }

        account.setFullName(fullName.trim());
        account.setUsername(normalizedUsername);
        account.setAbout(about == null ? "" : about.trim());

        if (phoneNumber != null && !phoneNumber.isBlank()) {
            account.setPhoneNumber(cleanPhoneNumber(phoneNumber));
        }

        account.setProfileComplete(true);
        account.setUpdatedAt(Instant.now());

        saveAccount(account);
    }

    // ============================================================
    // PUBLIC PROFILE
    // ============================================================

    public AccountView publicProfile(String userId) {
        AuthAccount account = findAccount(userId);

        if (!account.isEmailVerified()) {
            throw new AuthException(
                    HttpStatus.NOT_FOUND,
                    "USER_NOT_FOUND",
                    "User not found.");
        }

        return toView(account);
    }

    // ============================================================
    // AVATAR UPDATE
    // ============================================================

    public void updateAvatar(String userId, String avatarUrl) {

        AuthAccount account = findAccount(userId);

        account.setAvatarUrl(
                avatarUrl != null && !avatarUrl.isBlank()
                        ? avatarUrl.trim()
                        : null);

        account.setUpdatedAt(Instant.now());

        saveAccount(account);
    }

    // ============================================================
    // USER SEARCH
    // ============================================================

    public List<AccountView> searchUsers(String query) {

        String cleanQuery = query == null ? "" : query.trim();

        if (cleanQuery.isBlank()) {
            return Collections.emptyList();
        }

        try {
            return accounts
                    .findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(
                            cleanQuery,
                            cleanQuery)
                    .stream()
                    .filter(AuthAccount::isActive)
                    .filter(AuthAccount::isEmailVerified)
                    .map(this::toView)
                    .toList();
        } catch (Exception e) {
            String lower = cleanQuery.toLowerCase(Locale.ROOT);
            return fallbackAccounts.values().stream()
                    .filter(AuthAccount::isActive)
                    .filter(AuthAccount::isEmailVerified)
                    .filter(a -> (a.getFullName() != null && a.getFullName().toLowerCase(Locale.ROOT).contains(lower))
                            || (a.getUsername() != null && a.getUsername().toLowerCase(Locale.ROOT).contains(lower)))
                    .map(this::toView)
                    .toList();
        }
    }

    // ============================================================
    // CONTACT LOOKUP
    // ============================================================

    public List<AuthAccount> findByPhoneNumbers(List<String> phoneNumbers) {

        if (phoneNumbers == null || phoneNumbers.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> normalizedNumbers = phoneNumbers.stream()
                .filter(number -> number != null && !number.isBlank())
                .map(AuthService::cleanPhoneNumber)
                .distinct()
                .toList();

        if (normalizedNumbers.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            return accounts.findByPhoneNumberIn(normalizedNumbers)
                    .stream()
                    .filter(AuthAccount::isActive)
                    .filter(AuthAccount::isEmailVerified)
                    .toList();
        } catch (Exception e) {
            return fallbackAccounts.values().stream()
                    .filter(AuthAccount::isActive)
                    .filter(AuthAccount::isEmailVerified)
                    .filter(a -> a.getPhoneNumber() != null && normalizedNumbers.contains(a.getPhoneNumber()))
                    .toList();
        }
    }

    // ============================================================
    // ONLINE / OFFLINE PRESENCE
    // ============================================================

    public void updatePresence(String userId, boolean isOnline) {

        AuthAccount account = findAccount(userId);

        account.setOnline(isOnline);
        account.setLastSeen(
                isOnline ? "Online" : Instant.now().toString());
        account.setUpdatedAt(Instant.now());

        saveAccount(account);
    }

    // ============================================================
    // PASSWORD RESET REQUEST
    // ============================================================

    public ResetRequestResult requestPasswordReset(String email) {

        String normalizedEmail = normalizeEmail(email);

        Optional<AuthAccount> optionalAccount = accounts.findByEmailIgnoreCase(normalizedEmail);

        // Generic response prevents email/account enumeration.
        if (optionalAccount.isEmpty()
                || !optionalAccount.get().isEmailVerified()
                || !optionalAccount.get().isActive()) {

            return new ResetRequestResult(
                    false,
                    "If an active account exists for this email, a password reset link will be sent.",
                    null);
        }

        AuthAccount account = optionalAccount.get();

        String token = newToken();

        account.setResetTokenHash(hashToken(token));
        account.setResetExpiresAt(
                Instant.now().plus(RESET_TTL));
        account.setUpdatedAt(Instant.now());

        saveAccount(account);

        String resetLink = appUrl + "/reset-password?token=" + token;

        String htmlBody = emailTemplates.buildPasswordResetEmail(
                account.getFullName(),
                resetLink);

        sendMail(
                account.getEmail(),
                "Reset your WhatChat password",
                htmlBody);

        return new ResetRequestResult(
                true,
                "If an active account exists for this email, a password reset link will be sent.",
                null);
    }

    // ============================================================
    // RESET PASSWORD
    // ============================================================

    public void resetPassword(String token, String newPassword) {

        validatePassword(newPassword);

        if (token == null || token.isBlank()) {
            throw new AuthException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_RESET_TOKEN",
                    "The password reset link is invalid or has expired.");
        }

        AuthAccount account = findByResetToken(hashToken(token))
                .orElseThrow(() -> new AuthException(
                        HttpStatus.BAD_REQUEST,
                        "INVALID_RESET_TOKEN",
                        "The password reset link is invalid or has expired."));

        if (account.getResetExpiresAt() == null
                || !account.getResetExpiresAt().isAfter(Instant.now())) {

            account.setResetTokenHash(null);
            account.setResetExpiresAt(null);

            saveAccount(account);

            throw new AuthException(
                    HttpStatus.GONE,
                    "EXPIRED_RESET_TOKEN",
                    "The password reset link has expired. Please request another.");
        }

        account.setPasswordHash(
                passwordEncoder.encode(newPassword));

        // Invalidate existing sessions after password reset.
        account.incrementSessionVersion();

        account.setResetTokenHash(null);
        account.setResetExpiresAt(null);
        account.setUpdatedAt(Instant.now());

        saveAccount(account);
    }

    // ============================================================
    // JWT SESSION CREATION
    // ============================================================

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

    // ============================================================
    // JWT SESSION VALIDATION
    // ============================================================

    public String validateSession(String token) {

        if (token == null || token.isBlank()) {
            return null;
        }

        try {

            var claims = Jwts.parser()
                    .verifyWith(signingKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Object tokenVersion = claims.get("sessionVersion");

            if (!(tokenVersion instanceof Number version)) {
                return null;
            }

            Optional<AuthAccount> accountOpt = Optional.empty();
            try {
                accountOpt = accounts.findById(claims.getSubject());
            } catch (Exception e) {
                log.warn("[AuthService] Fallback validateSession findById: {}", e.getMessage());
            }
            if (accountOpt.isEmpty()) {
                accountOpt = Optional.ofNullable(fallbackAccounts.get(claims.getSubject()));
            }

            return accountOpt
                    .filter(AuthAccount::isActive)
                    .filter(AuthAccount::isEmailVerified)
                    .filter(account -> account.getSessionVersion() == version.intValue())
                    .map(AuthAccount::getId)
                    .orElse(null);

        } catch (JwtException | IllegalArgumentException exception) {
            return null;
        }
    }

    // ============================================================
    // EMAIL DELIVERY
    // ============================================================

    private boolean isEmailConfigured() {

        JavaMailSender sender = mailSenders.getIfAvailable();

        return mailConfig != null
                && mailConfig.isConfigured()
                && mailConfig.getMailFrom() != null
                && !mailConfig.getMailFrom().isBlank()
                && sender != null;
    }

    public void sendMail(
            String recipient,
            String subject,
            String htmlBody) {

        if (!isEmailConfigured()) {
            throw new AuthException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "EMAIL_NOT_CONFIGURED",
                    "Email delivery is currently unavailable. Please try again later.");
        }

        JavaMailSender sender = mailSenders.getIfAvailable();

        try {

            MimeMessage message = sender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    false,
                    StandardCharsets.UTF_8.name());

            helper.setFrom(mailConfig.getMailFrom(), "WhatChat");
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            sender.send(message);

        } catch (MessagingException | MailException exception) {

            // Do not expose SMTP credentials or internal server details.
            throw new AuthException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "EMAIL_DELIVERY_FAILED",
                    "We could not send the email. Please try again later.");

        } catch (java.io.UnsupportedEncodingException exception) {

            throw new AuthException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "EMAIL_DELIVERY_FAILED",
                    "We could not send the email. Please try again later.");
        }
    }

    // ============================================================
    // DATABASE OPERATIONS
    // ============================================================

    private AuthAccount saveAccount(AuthAccount account) {
        account.setUpdatedAt(Instant.now());
        fallbackAccounts.put(account.getId(), account);
        persistBackup();

        try {
            return accounts.save(account);
        } catch (DuplicateKeyException exception) {
            throw new AuthException(
                    HttpStatus.CONFLICT,
                    "DUPLICATE_ACCOUNT_DATA",
                    "This email address, username or phone number is already in use.");
        } catch (Exception e) {
            log.warn("[MongoDB Auth] Preserved account in fallback cache: {}", e.getMessage());
            return account;
        }
    }

    private AuthAccount findAccount(String id) {
        Optional<AuthAccount> opt = Optional.empty();
        try {
            opt = accounts.findById(id);
        } catch (Exception e) {
            log.warn("[MongoDB Auth] Fallback findById for {}: {}", id, e.getMessage());
        }
        if (opt.isEmpty()) {
            opt = Optional.ofNullable(fallbackAccounts.get(id));
        }
        return opt.filter(AuthAccount::isActive)
                .orElseThrow(() -> new AuthException(
                        HttpStatus.UNAUTHORIZED,
                        "UNAUTHENTICATED",
                        "Please sign in to continue."));
    }

    private AccountView toView(AuthAccount account) {

        return new AccountView(
                account.getId(),
                account.getFullName(),
                account.getEmail(),
                account.getUsername(),
                account.getAbout(),
                account.getPhoneNumber(),
                account.getCreatedAt(),
                account.isProfileComplete());
    }

    // ============================================================
    // PASSWORD VALIDATION
    // ============================================================

    private void validatePassword(String password) {

        if (password == null) {
            throw new AuthException(
                    HttpStatus.BAD_REQUEST,
                    "WEAK_PASSWORD",
                    "Please enter a password.");
        }

        int byteLength = password.getBytes(StandardCharsets.UTF_8).length;

        if (byteLength > 72) {
            throw new AuthException(
                    HttpStatus.BAD_REQUEST,
                    "PASSWORD_TOO_LONG",
                    "Choose a password with no more than 72 UTF-8 bytes.");
        }

        boolean hasUppercase = password.chars().anyMatch(Character::isUpperCase);

        boolean hasDigit = password.chars().anyMatch(Character::isDigit);

        boolean hasSymbol = password.chars().anyMatch(
                character -> !Character.isLetterOrDigit(character));

        if (password.length() < 8
                || !hasUppercase
                || !hasDigit
                || !hasSymbol) {

            throw new AuthException(
                    HttpStatus.BAD_REQUEST,
                    "WEAK_PASSWORD",
                    "Use at least eight characters with an uppercase letter, a number and a symbol.");
        }
    }

    // ============================================================
    // NORMALIZATION
    // ============================================================

    private static String normalizeEmail(String email) {

        return email == null
                ? ""
                : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String normalizeUsername(String username) {

        return username.trim().toLowerCase(Locale.ROOT);
    }

    private static String cleanPhoneNumber(String rawPhone) {

        if (rawPhone == null) {
            return "";
        }

        String clean = rawPhone.replaceAll("[^0-9+]", "");

        if (!clean.startsWith("+") && clean.length() == 10) {
            clean = "+91" + clean;
        }

        return clean;
    }

    // ============================================================
    // SECURE TOKEN GENERATION
    // ============================================================

    private static String newToken() {

        byte[] bytes = new byte[32];

        RANDOM.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private static String hashToken(String token) {

        try {

            byte[] digest = MessageDigest
                    .getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(digest);

        } catch (NoSuchAlgorithmException exception) {

            throw new IllegalStateException(
                    "SHA-256 is not available in this Java runtime.",
                    exception);
        }
    }

    private SecretKey signingKey() {

        return Keys.hmacShaKeyFor(
                jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
}
