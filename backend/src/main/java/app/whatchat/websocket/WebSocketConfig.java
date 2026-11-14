package app.whatchat.websocket;

import app.whatchat.auth.AuthSecurity;
import app.whatchat.auth.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebSocketConfig.class);
    private final AuthService authService;

    public WebSocketConfig(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Native WebSocket and SockJS endpoints for React client
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Application destinations routed to @MessageMapping methods
        registry.setApplicationDestinationPrefixes("/app");

        // Simple in-memory broker for subscriptions: /topic (broadcasts) & /queue (user-specific)
        registry.enableSimpleBroker("/topic", "/queue");

        // User destination prefix for private messaging: convertAndSendToUser(userId, "/queue/...", ...)
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String token = null;

                    // 1. Try native Authorization header (Bearer <token>)
                    List<String> authHeader = accessor.getNativeHeader("Authorization");
                    if (authHeader != null && !authHeader.isEmpty()) {
                        String raw = authHeader.get(0);
                        if (raw.startsWith("Bearer ")) {
                            token = raw.substring(7).trim();
                        }
                    }

                    // 2. Try cookie or query parameter
                    if (token == null) {
                        List<String> tokenParam = accessor.getNativeHeader("token");
                        if (tokenParam != null && !tokenParam.isEmpty()) {
                            token = tokenParam.get(0);
                        }
                    }

                    if (token != null) {
                        String userId = authService.validateSession(token);
                        if (userId != null) {
                            Principal userPrincipal = new UsernamePasswordAuthenticationToken(userId, null, List.of());
                            accessor.setUser(userPrincipal);
                            log.info("[WebSocket] Authenticated connection for user: {}", userId);
                        }
                    }
                }
                return message;
            }
        });
    }
}

