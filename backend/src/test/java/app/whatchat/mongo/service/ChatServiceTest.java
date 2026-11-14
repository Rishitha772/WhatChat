package app.whatchat.mongo.service;

import app.whatchat.mongo.document.ChatMessageDoc;
import app.whatchat.mongo.document.ConversationDoc;
import app.whatchat.mongo.repository.ChatMessageMongoRepository;
import app.whatchat.mongo.repository.ConversationMongoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ChatServiceTest {

    private ConversationMongoRepository conversationRepository;
    private ChatMessageMongoRepository messageRepository;
    private MongoChatService chatService;

    @BeforeEach
    void setUp() {
        conversationRepository = mock(ConversationMongoRepository.class);
        messageRepository = mock(ChatMessageMongoRepository.class);
        chatService = new MongoChatService(conversationRepository, messageRepository);
    }

    @Test
    void createDirectConversationRejectsSelfConversation() {
        assertThatThrownBy(() -> chatService.createDirectConversation("user1", "user1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot create a direct conversation with yourself");
    }

    @Test
    void createDirectConversationReturnsExistingIfFound() {
        ConversationDoc existing = new ConversationDoc("conv_1", "direct", null, List.of("user1", "user2"));
        when(conversationRepository.findDirectConversation("user1", "user2"))
                .thenReturn(Optional.of(existing));

        ConversationDoc result = chatService.createDirectConversation("user1", "user2");

        assertThat(result.getId()).isEqualTo("conv_1");
        verify(conversationRepository, never()).save(any());
    }

    @Test
    void createDirectConversationSavesNewWhenNotFound() {
        when(conversationRepository.findDirectConversation("user1", "user2"))
                .thenReturn(Optional.empty());
        when(conversationRepository.save(any(ConversationDoc.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        ConversationDoc result = chatService.createDirectConversation("user1", "user2");

        assertThat(result).isNotNull();
        assertThat(result.getType()).isEqualTo("direct");
        assertThat(result.getParticipants()).containsExactlyInAnyOrder("user1", "user2");
    }

    @Test
    void createGroupConversationSetsAdminAndParticipants() {
        when(conversationRepository.save(any(ConversationDoc.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> payload = new HashMap<>();
        payload.put("name", "Project Team");
        payload.put("participants", new ArrayList<>(List.of("user2", "user3")));

        ConversationDoc result = chatService.createGroup("user1", payload);

        assertThat(result.getName()).isEqualTo("Project Team");
        assertThat(result.getType()).isEqualTo("group");
        assertThat(result.getAdminIds()).contains("user1");
        assertThat(result.getParticipants()).contains("user1", "user2", "user3");
    }

    @Test
    void sendMessageRejectsNonParticipant() {
        ConversationDoc conv = new ConversationDoc("conv_1", "direct", null, List.of("user1", "user2"));
        when(conversationRepository.findById("conv_1")).thenReturn(Optional.of(conv));

        Map<String, Object> payload = Map.of("text", "Hello");

        assertThatThrownBy(() -> chatService.sendMessage("intruder", "Intruder", "conv_1", payload))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void sendMessageSavesValidMessage() {
        ConversationDoc conv = new ConversationDoc("conv_1", "direct", null, List.of("user1", "user2"));
        when(conversationRepository.findById("conv_1")).thenReturn(Optional.of(conv));
        when(messageRepository.save(any(ChatMessageDoc.class))).thenAnswer(inv -> inv.getArgument(0));
        when(conversationRepository.save(any(ConversationDoc.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> payload = Map.of("text", "Hello World");

        ChatMessageDoc msg = chatService.sendMessage("user1", "User One", "conv_1", payload);

        assertThat(msg).isNotNull();
        assertThat(msg.getText()).isEqualTo("Hello World");
        assertThat(msg.getSenderId()).isEqualTo("user1");
        assertThat(msg.getStatus()).isEqualTo("sent");
    }
}

