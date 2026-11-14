package app.whatchat.mongo.service;

import app.whatchat.mongo.document.NotificationDoc;
import app.whatchat.mongo.repository.NotificationMongoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MongoNotificationService {

    private static final Logger log = LoggerFactory.getLogger(MongoNotificationService.class);

    private final NotificationMongoRepository notificationRepository;
    private final Map<String, List<NotificationDoc>> fallbackNotifications = new ConcurrentHashMap<>();

    public MongoNotificationService(NotificationMongoRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationDoc> getUserNotifications(String userId) {
        try {
            return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } catch (Exception e) {
            log.warn("[MongoDB Notifications] Using fallback notifications: {}", e.getMessage());
            return fallbackNotifications.getOrDefault(userId, Collections.emptyList());
        }
    }

    public NotificationDoc createNotification(String userId, String type, String title, String message, Map<String, Object> data) {
        String id = "ntf_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        NotificationDoc doc = new NotificationDoc(id, userId, type, title, message);
        if (data != null) doc.setData(data);

        fallbackNotifications.computeIfAbsent(userId, k -> new ArrayList<>()).add(0, doc);

        try {
            return notificationRepository.save(doc);
        } catch (Exception e) {
            log.warn("[MongoDB Notifications] Notification saved in memory: {}", e.getMessage());
            return doc;
        }
    }

    public NotificationDoc markRead(String userId, String notificationId) {
        NotificationDoc doc = findNotification(userId, notificationId);
        doc.setRead(true);
        try {
            return notificationRepository.save(doc);
        } catch (Exception ignored) {
            return doc;
        }
    }

    public void markAllRead(String userId) {
        List<NotificationDoc> list = getUserNotifications(userId);
        for (NotificationDoc doc : list) {
            doc.setRead(true);
            try {
                notificationRepository.save(doc);
            } catch (Exception ignored) {}
        }
    }

    public void deleteNotification(String userId, String notificationId) {
        List<NotificationDoc> list = fallbackNotifications.get(userId);
        if (list != null) {
            list.removeIf(n -> n.getId().equals(notificationId));
        }
        try {
            notificationRepository.deleteById(notificationId);
        } catch (Exception ignored) {}
    }

    private NotificationDoc findNotification(String userId, String notificationId) {
        NotificationDoc doc = null;
        try {
            doc = notificationRepository.findById(notificationId).orElse(null);
        } catch (Exception ignored) {}
        if (doc == null) {
            doc = fallbackNotifications.getOrDefault(userId, Collections.emptyList()).stream()
                    .filter(n -> n.getId().equals(notificationId)).findFirst().orElse(null);
        }
        if (doc == null) {
            throw new IllegalArgumentException("Notification not found with ID: " + notificationId);
        }
        return doc;
    }
}
