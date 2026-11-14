package app.whatchat.mongo.service;

import app.whatchat.mongo.document.EventMessageDoc;
import app.whatchat.mongo.document.MySpaceEventDoc;
import app.whatchat.mongo.repository.EventMessageMongoRepository;
import app.whatchat.mongo.repository.MySpaceEventMongoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MongoMySpaceService {

    private static final Logger log = LoggerFactory.getLogger(MongoMySpaceService.class);

    private final MySpaceEventMongoRepository eventRepository;
    private final EventMessageMongoRepository messageRepository;

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

    public MySpaceEventDoc getEventById(String eventId, String userId) {
        MySpaceEventDoc event = null;
        try {
            event = eventRepository.findById(eventId).orElse(null);
        } catch (Exception ignored) {}
        if (event == null) {
            event = fallbackEvents.get(eventId);
        }
        if (event == null) {
            throw new IllegalArgumentException("Memory capsule not found with ID: " + eventId);
        }
        if (!event.getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to access this personal memory capsule.");
        }
        return event;
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
            log.warn("[MongoDB MySpace] Event cached locally: {}", e.getMessage());
            return doc;
        }
    }

    public MySpaceEventDoc updateEvent(String eventId, String userId, Map<String, Object> updates) {
        MySpaceEventDoc doc = getEventById(eventId, userId);
        if (updates.containsKey("name")) doc.setName((String) updates.get("name"));
        if (updates.containsKey("description")) doc.setDescription((String) updates.get("description"));
        if (updates.containsKey("category")) doc.setCategory((String) updates.get("category"));
        if (updates.containsKey("coverImageUrl")) doc.setCoverImageUrl((String) updates.get("coverImageUrl"));
        if (updates.containsKey("isFavorite")) doc.setFavorite(Boolean.TRUE.equals(updates.get("isFavorite")));

        fallbackEvents.put(eventId, doc);
        try {
            return eventRepository.save(doc);
        } catch (Exception e) {
            return doc;
        }
    }

    public boolean deleteEvent(String userId, String eventId) {
        getEventById(eventId, userId); // validates ownership
        fallbackEvents.remove(eventId);
        fallbackMessages.remove(eventId);
        try {
            eventRepository.deleteById(eventId);
            messageRepository.deleteByEventId(eventId);
            return true;
        } catch (Exception e) {
            return true;
        }
    }

    public List<EventMessageDoc> getEventMessages(String eventId, String userId) {
        getEventById(eventId, userId); // validates ownership
        try {
            return messageRepository.findByEventIdOrderByCreatedAtAsc(eventId);
        } catch (Exception e) {
            return fallbackMessages.getOrDefault(eventId, Collections.emptyList());
        }
    }

    @SuppressWarnings("unchecked")
    public EventMessageDoc addEventMessage(String userId, String eventId, Map<String, Object> payload) {
        MySpaceEventDoc event = getEventById(eventId, userId); // validates ownership

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
            event.setMemoryCount(event.getMemoryCount() + 1);
            Map<String, Integer> counts = event.getMediaCounts();
            if ("photo".equalsIgnoreCase(type)) counts.put("photos", counts.getOrDefault("photos", 0) + 1);
            else if ("document".equalsIgnoreCase(type)) counts.put("documents", counts.getOrDefault("documents", 0) + 1);
            else if ("audio".equalsIgnoreCase(type)) counts.put("audio", counts.getOrDefault("audio", 0) + 1);
            else counts.put("notes", counts.getOrDefault("notes", 0) + 1);
            event.setMediaCounts(counts);
            eventRepository.save(event);

            return saved;
        } catch (Exception e) {
            return doc;
        }
    }

    public EventMessageDoc getMemoryById(String memoryId, String userId) {
        EventMessageDoc doc = null;
        try {
            doc = messageRepository.findById(memoryId).orElse(null);
        } catch (Exception ignored) {}
        if (doc == null) {
            doc = fallbackMessages.values().stream().flatMap(List::stream).filter(m -> m.getId().equals(memoryId)).findFirst().orElse(null);
        }
        if (doc == null) {
            throw new IllegalArgumentException("Memory not found with ID: " + memoryId);
        }
        if (!doc.getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to access this personal memory.");
        }
        return doc;
    }

    @SuppressWarnings("unchecked")
    public EventMessageDoc updateMemory(String memoryId, String userId, Map<String, Object> payload) {
        EventMessageDoc doc = getMemoryById(memoryId, userId);
        if (payload.containsKey("content")) doc.setContent((String) payload.get("content"));
        if (payload.containsKey("type")) doc.setType((String) payload.get("type"));
        if (payload.containsKey("memoryDate")) doc.setMemoryDate((String) payload.get("memoryDate"));
        if (payload.containsKey("isHighlight")) doc.setHighlight(Boolean.TRUE.equals(payload.get("isHighlight")));
        if (payload.containsKey("attachments")) doc.setAttachments((List<Map<String, Object>>) payload.get("attachments"));
        if (payload.containsKey("tags")) doc.setTags((List<String>) payload.get("tags"));

        try {
            return messageRepository.save(doc);
        } catch (Exception e) {
            return doc;
        }
    }

    public boolean deleteEventMessage(String eventId, String messageId, String userId) {
        getEventById(eventId, userId); // validates ownership
        List<EventMessageDoc> list = fallbackMessages.get(eventId);
        if (list != null) {
            list.removeIf(m -> m.getId().equals(messageId));
        }
        try {
            messageRepository.deleteById(messageId);
            return true;
        } catch (Exception e) {
            return true;
        }
    }
}
