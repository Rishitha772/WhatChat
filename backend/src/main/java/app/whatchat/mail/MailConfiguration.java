package app.whatchat.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;

@Configuration
public class MailConfiguration {

    private static final Logger log = LoggerFactory.getLogger(MailConfiguration.class);

    @Value("${spring.mail.host:${SMTP_HOST:smtp.gmail.com}}")
    private String host;

    @Value("${spring.mail.port:${SMTP_PORT:587}}")
    private int port;

    @Value("${spring.mail.username:${SMTP_USERNAME:}}")
    private String username;

    @Value("${spring.mail.password:${SMTP_PASSWORD:}}")
    private String password;

    @Value("${spring.mail.properties.mail.smtp.auth:${SMTP_AUTH:true}}")
    private boolean smtpAuth;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable:${SMTP_STARTTLS:true}}")
    private boolean starttlsEnable;

    @Value("${app.mail.from:${MAIL_FROM:${SMTP_FROM:}}}")
    private String mailFrom;

    @Bean
    @ConditionalOnMissingBean(JavaMailSender.class)
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        String effectiveHost = (host != null && !host.isBlank()) ? host.trim() : "smtp.gmail.com";
        int effectivePort = (port > 0) ? port : 587;

        sender.setHost(effectiveHost);
        sender.setPort(effectivePort);

        if (username != null && !username.isBlank()) {
            sender.setUsername(username.trim());
        }

        if (password != null && !password.isBlank()) {
            sender.setPassword(password.trim());
        }

        sender.setDefaultEncoding(StandardCharsets.UTF_8.name());

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(smtpAuth));
        props.put("mail.smtp.starttls.enable", String.valueOf(starttlsEnable));
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", effectiveHost);
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");

        log.info("[MailConfiguration] Initialized JavaMailSender for host={}:{}, user={}, auth={}, starttls={}",
                effectiveHost, effectivePort,
                (username != null && !username.isBlank()) ? username.trim() : "(none)",
                smtpAuth, starttlsEnable);

        return sender;
    }

    public Map<String, Object> getDiagnostics() {
        Map<String, Object> diag = new LinkedHashMap<>();
        diag.put("host", host != null ? host.trim() : "");
        diag.put("port", port > 0 ? port : 587);
        diag.put("senderFrom", (mailFrom != null && !mailFrom.isBlank()) ? mailFrom.trim() : username);
        diag.put("usernameConfigured", username != null && !username.isBlank());
        diag.put("passwordConfigured", password != null && !password.isBlank());
        diag.put("smtpAuthEnabled", smtpAuth);
        diag.put("starttlsEnabled", starttlsEnable);
        diag.put("readyForDelivery", isConfigured());
        return diag;
    }

    public boolean isConfigured() {
        return host != null && !host.isBlank()
                && username != null && !username.isBlank()
                && password != null && !password.isBlank();
    }

    public String getMailFrom() {
        if (mailFrom != null && !mailFrom.isBlank()) {
            return mailFrom.trim();
        }
        if (username != null && !username.isBlank()) {
            return username.trim();
        }
        return "noreply@whatchat.app";
    }
}

