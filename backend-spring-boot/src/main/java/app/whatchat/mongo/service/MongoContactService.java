package app.whatchat.mongo.service;

import app.whatchat.mongo.document.ContactDoc;
import app.whatchat.mongo.repository.ContactMongoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MongoContactService {

    private static final Logger log = LoggerFactory.getLogger(MongoContactService.class);

    private final ContactMongoRepository contactRepository;
    private final Map<String, ContactDoc> fallbackContacts = new ConcurrentHashMap<>();

    public MongoContactService(ContactMongoRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    public List<ContactDoc> getUserContacts(String userId) {
        try {
            return contactRepository.findByUserIdOrderByDisplayNameAsc(userId);
        } catch (Exception e) {
            log.warn("[MongoDB Contacts] Using fallback contact list: {}", e.getMessage());
            return fallbackContacts.values().stream()
                    .filter(c -> c.getUserId() != null && c.getUserId().equals(userId))
                    .toList();
        }
    }

    public ContactDoc addContact(String userId, Map<String, Object> payload) {
        String id = "cnt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String phone = (String) payload.getOrDefault("phoneNumber", "");
        String name = (String) payload.getOrDefault("displayName", "Contact");
        String about = (String) payload.getOrDefault("about", "Hey there! I am using WhatsApp.");

        ContactDoc doc = new ContactDoc(id, userId, phone, name, about);
        if (payload.containsKey("avatarUrl")) doc.setAvatarUrl((String) payload.get("avatarUrl"));
        if (payload.containsKey("username")) doc.setUsername((String) payload.get("username"));

        fallbackContacts.put(id, doc);

        try {
            return contactRepository.save(doc);
        } catch (Exception e) {
            log.warn("[MongoDB Contacts] Contact saved in memory: {}", e.getMessage());
            return doc;
        }
    }
}

