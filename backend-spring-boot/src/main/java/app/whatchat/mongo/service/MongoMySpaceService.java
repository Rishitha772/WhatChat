package app.whatchat.mongo.service;

import app.whatchat.mongo.document.EventMessageDoc;
import app.whatchat.mongo.document.MySpaceEventDoc;
import app.whatchat.mongo.repository.EventMessageMongoRepository;
import app.whatchat.mongo.repository.MySpaceEventMongoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MongoMySpaceService {

    private static final Logger log = LoggerFactory.getLogger(MongoMySpaceService.class);

    private final MySpaceEventMongoRepository eventRepository;
    private final EventMessageMongoRepository messageRepository;

    // In-memory fallback cache if MongoDB is offline during local exploration
    private final Map<String, MySpaceEventDoc> fallbackEvents = new ConcurrentHashMap<>();
    private final Map<String, List<EventMessageDoc>> fallbackMessages = new ConcurrentHashMap<>();

    public MongoMySpaceService(MySpaceEventMongoRepository eventRepository,
                               EventMessageMongoRepository messageRepository) {
        this.eventRepository = eventRepository;
        this.messageRepository = messageRepository;
    }

    public List<MySpaceEventDoc> getUserEvents(String userId, String category, String search) {
        try {
            List<MySpaceEventDoc> list;
            if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all")) {
                list = eventRepository.findByUserIdAndCategoryIgnoreCaseOrderByCreatedAtDesc(userId, category);
            } else {
                list = eventRepository.findByUserIdOrderByCreatedAtDesc(userId);
            }

            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                return list.stream()
                        .filter(e -> (e.getName() != null && e.getName().toLowerCase().contains(q))
                                || (e.getDescription() != null && e.getDescription().toLowerCase().contains(q)))
                        .toList();
            }
            return list;
        } catch (Exception e) {
            log.warn("[MongoDB MySpace] Using resilient fallback cache: {}", e.getMessage());
            return fallbackEvents.values().stream()
                    .filter(ev -> ev.getUserId() != null && ev.getUserId().equals(userId))
                    .toList();
        }
    }

    public MySpaceEventDoc createEvent(String userId, Map<String, Object> payload) {
        String id = "evt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String name = (String) payload.getOrDefault("name", "New Memory Capsule");
        String category = (String) payload.getOrDefault("category", "Personal");
        String eventDate = (String) payload.getOrDefault("eventDate", Instant.now().toString().split("T")[0]);
        String description = (String) payload.getOrDefault("description", "");
        String coverImageUrl = (String) payload.getOrDefault("coverImageUrl", "");

        MySpaceEventDoc doc = new MySpaceEventDoc(id, userId, name, category, eventDate, description, coverImageUrl);
        fallbackEvents.put(id, doc);

        try {
            return eventRepository.save(doc);
        } catch (Exception e) {
            log.warn("[MongoDB MySpace] Event cached locally. Note: MongoDB is offline ({})", e.getMessage());
            return doc;
        }
    }

    public boolean deleteEvent(String userId, String eventId) {
        fallbackEvents.remove(eventId);
        fallbackMessages.remove(eventId);
        try {
            eventRepository.deleteById(eventId);
            messageRepository.deleteByEventId(eventId);
            return true;
        } catch (Exception e) {
            log.warn("[MongoDB MySpace] Deleted from local cache. Note: MongoDB is offline ({})", e.getMessage());
            return true;
        }
    }

    public List<EventMessageDoc> getEventMessages(String eventId) {
        try {
            return messageRepository.findByEventIdOrderByCreatedAtAsc(eventId);
        } catch (Exception e) {
            log.warn("[MongoDB MySpace] Using resilient fallback cache for messages: {}", e.getMessage());
            return fallbackMessages.getOrDefault(eventId, Collections.emptyList());
        }
    }

    @SuppressWarnings("unchecked")
    public EventMessageDoc addEventMessage(String userId, String eventId, Map<String, Object> payload) {
        String id = "em_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String type = (String) payload.getOrDefault("type", "note");
        String content = (String) payload.getOrDefault("content", "");
        String memoryDate = (String) payload.getOrDefault("memoryDate", Instant.now().toString().split("T")[0]);

        EventMessageDoc doc = new EventMessageDoc(id, eventId, userId, type, content, memoryDate);
        if (payload.containsKey("attachments")) {
            doc.setAttachments((List<Map<String, Object>>) payload.get("attachments"));
        }
        if (payload.containsKey("tags")) {
            doc.setTags((List<String>) payload.get("tags"));
        }
        if (payload.containsKey("sourceChatName")) {
            doc.setSourceChatName((String) payload.get("sourceChatName"));
        }

        fallbackMessages.computeIfAbsent(eventId, k -> new ArrayList<>()).add(doc);

        try {
            EventMessageDoc saved = messageRepository.save(doc);

            // Increment count on event document
            eventRepository.findById(eventId).ifPresent(ev -> {
                ev.setMemoryCount(ev.getMemoryCount() + 1);
                Map<String, Integer> counts = ev.getMediaCounts();
                if ("photo".equalsIgnoreCase(type)) counts.put("photos", counts.getOrDefault("photos", 0) + 1);
                else if ("document".equalsIgnoreCase(type)) counts.put("documents", counts.getOrDefault("documents", 0) + 1);
                else if ("audio".equalsIgnoreCase(type)) counts.put("audio", counts.getOrDefault("audio", 0) + 1);
                else counts.put("notes", counts.getOrDefault("notes", 0) + 1);
                ev.setMediaCounts(counts);
                eventRepository.save(ev);
            });

            return saved;
        } catch (Exception e) {
            log.warn("[MongoDB MySpace] Message cached locally. Note: MongoDB is offline ({})", e.getMessage());
            return doc;
        }
    }

    public boolean deleteEventMessage(String eventId, String messageId) {
        List<EventMessageDoc> list = fallbackMessages.get(eventId);
        if (list != null) {
            list.removeIf(m -> m.getId().equals(messageId));
        }
        try {
            messageRepository.deleteById(messageId);
            return true;
        } catch (Exception e) {
            log.warn("[MongoDB MySpace] Deleted from local cache: {}", e.getMessage());
            return true;
        }
    }
}

