package app.whatchat.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import app.whatchat.mail.EmailTemplateService;
import app.whatchat.mail.MailConfiguration;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Optional;
import java.util.Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class AuthServiceTest {
    private AuthAccountRepository accounts;
    private AuthService authService;
    private BCryptPasswordEncoder passwordEncoder;

    private static class SimpleObjectProvider<T> implements ObjectProvider<T> {
        private final T object;
        SimpleObjectProvider(T object) { this.object = object; }
        @Override public T getObject(Object... args) { return object; }
        @Override public T getIfAvailable() { return object; }
        @Override public T getIfUnique() { return object; }
        @Override public T getObject() { return object; }
        @Override public java.util.Iterator<T> iterator() {
            return object != null ? java.util.Collections.singleton(object).iterator() : java.util.Collections.emptyIterator();
        }
    }

    @BeforeEach
    void setUp() {
        accounts = mock(AuthAccountRepository.class);
        passwordEncoder = new BCryptPasswordEncoder(4);
        ObjectProvider<JavaMailSender> mailSenders = new SimpleObjectProvider<>(null);
        authService = new AuthService(accounts, passwordEncoder, mailSenders,
                null, new EmailTemplateService(),
                "test-session-secret-with-at-least-32-bytes", "http://localhost:3000");
    }

    @Test
    void loginIssuesAValidSignedSessionOnlyForVerifiedAccounts() {
        AuthAccount account = accountWithPassword("person@example.test", "LongPassword1!");
        account.setEmailVerified(true);
        when(accounts.findByEmailIgnoreCase("person@example.test")).thenReturn(Optional.of(account));
        when(accounts.findById(account.getId())).thenReturn(Optional.of(account));

        AuthResponses.Session session = authService.login("Person@Example.test", "LongPassword1!");

        assertThat(session.user().email()).isEqualTo("person@example.test");
        assertThat(authService.validateSession(session.token())).isEqualTo(account.getId());
        assertThat(authService.validateSession(session.token() + "invalid")).isNull();
    }

    @Test
    void loginRejectsIncorrectPasswordsAndUnverifiedAccounts() {
        AuthAccount account = accountWithPassword("person@example.test", "LongPassword1!");
        when(accounts.findByEmailIgnoreCase("person@example.test")).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> authService.login("person@example.test", "WrongPassword1!"))
                .isInstanceOf(AuthException.class)
                .extracting(error -> ((AuthException) error).getCode())
                .isEqualTo("INVALID_CREDENTIALS");

        assertThatThrownBy(() -> authService.login("person@example.test", "LongPassword1!"))
                .isInstanceOf(AuthException.class)
                .extracting(error -> ((AuthException) error).getStatus())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void registrationStoresOnlyTokenHashAndVerificationActivatesAccount() throws Exception {
        JavaMailSender sender = mock(JavaMailSender.class);
        MimeMessage mail = new MimeMessage(Session.getInstance(new Properties()));
        ObjectProvider<JavaMailSender> mailSenders = new SimpleObjectProvider<>(sender);
        MailConfiguration mailConfiguration = mock(MailConfiguration.class);
        when(mailConfiguration.isConfigured()).thenReturn(true);
        when(mailConfiguration.getMailFrom()).thenReturn("no-reply@example.test");
        when(sender.createMimeMessage()).thenReturn(mail);
        doNothing().when(sender).send(any(MimeMessage.class));

        authService = new AuthService(accounts, passwordEncoder, mailSenders,
                mailConfiguration, new EmailTemplateService(),
                "test-session-secret-with-at-least-32-bytes", "http://localhost:3000");
        when(accounts.findByEmailIgnoreCase("person@example.test")).thenReturn(Optional.empty());
        when(accounts.save(any(AuthAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.register("Test Person", "Person@Example.test", "LongPassword1!");
        var savedAccount = org.mockito.ArgumentCaptor.forClass(AuthAccount.class);
        org.mockito.Mockito.verify(accounts).save(savedAccount.capture());
        AuthAccount account = savedAccount.getValue();

        assertThat(account.getEmail()).isEqualTo("person@example.test");
        assertThat(account.getPasswordHash()).isNotEqualTo("LongPassword1!");
        assertThat(account.isEmailVerified()).isFalse();
        assertThat((String) mail.getContent()).contains("/verify-email?token=");
        String content = (String) mail.getContent();
        String token = content.replaceAll("(?s).*token=([A-Za-z0-9_-]+).*", "$1");
        assertThat(token).matches("[A-Za-z0-9_-]{40,}");
        assertThat(account.getVerificationTokenHash()).isEqualTo(hash(token));
        when(accounts.findByVerificationTokenHash(anyString())).thenAnswer(invocation ->
                account.getVerificationTokenHash().equals(invocation.getArgument(0))
                        ? Optional.of(account) : Optional.empty());

        authService.verifyEmail(token);

        assertThat(account.isEmailVerified()).isTrue();
        assertThat(account.getVerificationTokenHash()).isNull();
    }

    @Test
    void registrationRejectsWeakPasswordsBeforeEmailSetup() {
        assertThatThrownBy(() -> authService.register("Test Person", "person@example.test", "weakpass"))
                .isInstanceOf(AuthException.class)
                .extracting(error -> ((AuthException) error).getCode())
                .isEqualTo("WEAK_PASSWORD");
    }

    private AuthAccount accountWithPassword(String email, String password) {
        return new AuthAccount("account-id", "Test Person", email, passwordEncoder.encode(password));
    }

    private static String hash(String token) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8)));
    }
}
