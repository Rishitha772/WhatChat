package app.whatchat.mongo.service;

import app.whatchat.mongo.document.MySpaceEventDoc;
import app.whatchat.mongo.repository.EventMessageMongoRepository;
import app.whatchat.mongo.repository.MySpaceEventMongoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MySpaceServiceTest {

    private MySpaceEventMongoRepository eventRepository;
    private EventMessageMongoRepository messageRepository;
    private MongoMySpaceService mySpaceService;

    @BeforeEach
    void setUp() {
        eventRepository = mock(MySpaceEventMongoRepository.class);
        messageRepository = mock(EventMessageMongoRepository.class);
        mySpaceService = new MongoMySpaceService(eventRepository, messageRepository);
    }

    @Test
    void getEventByIdEnforcesPrivacyBetweenUsers() {
        MySpaceEventDoc event = new MySpaceEventDoc("evt_1", "user_alice", "Alice Vacation", "Travel", "2026-06-01",
                "Trip description", "");
        when(eventRepository.findById("evt_1")).thenReturn(Optional.of(event));

        // Bob attempts to read Alice's memory capsule
        assertThatThrownBy(() -> mySpaceService.getEventById("evt_1", "user_bob"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You do not have permission to access this personal memory capsule");
    }

    @Test
    void getEventByIdAllowsOwner() {
        MySpaceEventDoc event = new MySpaceEventDoc("evt_1", "user_alice", "Alice Vacation", "Travel", "2026-06-01",
                "Trip description", "");
        when(eventRepository.findById("evt_1")).thenReturn(Optional.of(event));

        MySpaceEventDoc result = mySpaceService.getEventById("evt_1", "user_alice");

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Alice Vacation");
    }

    @Test
    void createEventSavesMemoryCapsule() {
        when(eventRepository.save(any(MySpaceEventDoc.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> payload = Map.of(
                "name", "Family Reunion",
                "category", "Family",
                "description", "Summer trip 2026",
                "eventDate", "2026-07-15");

        MySpaceEventDoc result = mySpaceService.createEvent("user_alice", payload);

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo("user_alice");
        assertThat(result.getName()).isEqualTo("Family Reunion");
        assertThat(result.getCategory()).isEqualTo("Family");
    }
}