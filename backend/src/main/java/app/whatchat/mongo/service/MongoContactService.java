package app.whatchat.mongo.service;

import app.whatchat.auth.AuthAccount;
import app.whatchat.auth.AuthAccountRepository;
import app.whatchat.auth.AuthService;
import app.whatchat.common.PhoneNumberUtil;
import app.whatchat.mongo.document.ContactDoc;
import app.whatchat.mongo.repository.ContactMongoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MongoContactService {

    private static final Logger log = LoggerFactory.getLogger(MongoContactService.class);

    private final ContactMongoRepository contactRepository;
    private final AuthAccountRepository accountRepository;
    private final AuthService authService;
    private static final com.fasterxml.jackson.databind.ObjectMapper MAPPER = new com.fasterxml.jackson.databind.ObjectMapper()
            .findAndRegisterModules()
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    private static final java.io.File BACKUP_FILE = resolveBackupFile("contacts_backup.json");

    private static java.io.File resolveBackupFile(String filename) {
        java.io.File parentDir = new java.io.File("../.whatchat_data");
        if (parentDir.exists()) {
            return new java.io.File(parentDir, filename);
        }
        java.io.File dir = new java.io.File(".whatchat_data");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return new java.io.File(dir, filename);
    }

    private final Map<String, ContactDoc> fallbackContacts = new ConcurrentHashMap<>();

    @jakarta.annotation.PostConstruct
    public void initBackup() {
        try {
            if (BACKUP_FILE.exists() && BACKUP_FILE.length() > 0) {
                java.util.List<ContactDoc> list = MAPPER.readValue(
                        BACKUP_FILE, new com.fasterxml.jackson.core.type.TypeReference<java.util.List<ContactDoc>>() {});
                for (ContactDoc c : list) {
                    if (c != null && c.getId() != null) {
                        fallbackContacts.put(c.getId(), c);
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }

    private synchronized void persistBackup() {
        try {
            MAPPER.writerWithDefaultPrettyPrinter().writeValue(
                    BACKUP_FILE, new java.util.ArrayList<>(fallbackContacts.values()));
        } catch (Exception ignored) {
        }
    }

    public MongoContactService(ContactMongoRepository contactRepository) {
        this(contactRepository, null, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public MongoContactService(ContactMongoRepository contactRepository,
                               AuthAccountRepository accountRepository,
                               AuthService authService) {
        this.contactRepository = contactRepository;
        this.accountRepository = accountRepository;
        this.authService = authService;
    }

    public List<ContactDoc> getUserContacts(String userId) {
        try {
            return contactRepository.findByUserIdOrderByDisplayNameAsc(userId);
        } catch (Exception e) {
            log.warn("[MongoDB Contacts] Using fallback contact list: {}", e.getMessage());
            return fallbackContacts.values().stream()
                    .filter(c -> c.getUserId() != null && c.getUserId().equals(userId))
                    .sorted(Comparator.comparing(ContactDoc::getDisplayName, String.CASE_INSENSITIVE_ORDER))
                    .toList();
        }
    }

    public ContactDoc addContact(String userId, Map<String, Object> payload) {
        String phone = (String) payload.getOrDefault("phoneNumber", "");
        String name = (String) payload.getOrDefault("displayName", "Contact");
        String about = (String) payload.getOrDefault("about", "Hey there! I am using WhatChat.");
        String contactUserId = (String) payload.get("contactUserId");

        if (contactUserId != null && contactUserId.equals(userId)) {
            throw new IllegalArgumentException("You cannot add yourself as a contact.");
        }

        String normalizedPhone = phone != null && !phone.isBlank() ? PhoneNumberUtil.normalize(phone) : "";

        // Prevent duplicate contacts with same phone for this user
        if (!normalizedPhone.isBlank()) {
            boolean exists = false;
            try {
                exists = contactRepository.findByUserIdAndPhoneNumber(userId, normalizedPhone).isPresent();
            } catch (Exception e) {
                exists = fallbackContacts.values().stream()
                        .anyMatch(c -> userId.equals(c.getUserId()) && normalizedPhone.equals(c.getPhoneNumber()));
            }
            if (exists) {
                throw new IllegalArgumentException("A contact with phone number " + normalizedPhone + " already exists in your contacts.");
            }
        }

        String id = "cnt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        ContactDoc doc = new ContactDoc(id, userId, normalizedPhone.isBlank() ? phone : normalizedPhone, name, about);
        if (contactUserId != null && !contactUserId.isBlank()) {
            doc.setContactUserId(contactUserId);
            doc.setRegistered(true);
        }
        if (payload.containsKey("avatarUrl")) doc.setAvatarUrl((String) payload.get("avatarUrl"));
        if (payload.containsKey("username")) doc.setUsername((String) payload.get("username"));

        fallbackContacts.put(id, doc);
        persistBackup();

        try {
            return contactRepository.save(doc);
        } catch (Exception e) {
            log.warn("[MongoDB Contacts] Contact saved in memory: {}", e.getMessage());
            return doc;
        }
    }

    public boolean deleteContact(String userId, String contactId) {
        fallbackContacts.remove(contactId);
        persistBackup();
        try {
            contactRepository.deleteByUserIdAndId(userId, contactId);
            return true;
        } catch (Exception e) {
            try {
                contactRepository.deleteById(contactId);
            } catch (Exception ex) {
                log.warn("[MongoDB Contacts] Contact removed from cache: {}", ex.getMessage());
            }
            return true;
        }
    }

    public List<ContactDoc> searchContacts(String userId, String query) {
        List<ContactDoc> all = getUserContacts(userId);
        if (query == null || query.isBlank()) {
            return all;
        }
        String q = query.toLowerCase().trim();
        return all.stream()
                .filter(c -> (c.getDisplayName() != null && c.getDisplayName().toLowerCase().contains(q))
                        || (c.getPhoneNumber() != null && c.getPhoneNumber().contains(q))
                        || (c.getUsername() != null && c.getUsername().toLowerCase().contains(q)))
                .toList();
    }

    /**
     * Synchronize device contacts, normalize phone numbers to E.164, match with registered
     * WhatChat users, save matched contacts into MongoDB, and return matched & unregistered lists.
     */
    public SyncResult syncContacts(String userId, List<SyncContactItem> rawContacts) {
        if (rawContacts == null || rawContacts.isEmpty()) {
            return new SyncResult(Collections.emptyList(), Collections.emptyList(), 0, 0);
        }

        // Limit batch size to 500 contacts per request to protect against abuse/DoS
        List<SyncContactItem> batch = rawContacts.size() > 500
                ? rawContacts.subList(0, 500)
                : rawContacts;

        // Deduplicate and normalize by E.164 phone number
        Map<String, String> normalizedToNameMap = new LinkedHashMap<>();
        for (SyncContactItem item : batch) {
            if (item == null || item.phoneNumber() == null) continue;
            String normalized = PhoneNumberUtil.normalize(item.phoneNumber());
            if (normalized != null && !normalized.isBlank() && !normalizedToNameMap.containsKey(normalized)) {
                String name = item.name() != null && !item.name().isBlank() ? item.name().trim() : "Contact";
                normalizedToNameMap.put(normalized, name);
            }
        }

        if (normalizedToNameMap.isEmpty()) {
            return new SyncResult(Collections.emptyList(), Collections.emptyList(), 0, 0);
        }

        // Query registered accounts by normalized phone numbers
        List<String> phoneList = new ArrayList<>(normalizedToNameMap.keySet());
        List<AuthAccount> registeredAccounts = Collections.emptyList();
        if (accountRepository != null) {
            try {
                registeredAccounts = accountRepository.findByPhoneNumberIn(phoneList);
            } catch (Exception e) {
                log.warn("[MongoDB Contacts Sync] Falling back to auth service account lookup: {}", e.getMessage());
                if (authService != null) {
                    registeredAccounts = authService.findByPhoneNumbers(phoneList);
                }
            }
        } else if (authService != null) {
            registeredAccounts = authService.findByPhoneNumbers(phoneList);
        }

        // Map registered accounts by phone number (excluding self)
        Map<String, AuthAccount> phoneToAccount = new HashMap<>();
        String selfPhone = null;
        for (AuthAccount acc : registeredAccounts) {
            if (acc.getId() != null && acc.getId().equals(userId)) {
                selfPhone = acc.getPhoneNumber();
            } else if (acc.isActive() && acc.getPhoneNumber() != null) {
                phoneToAccount.put(acc.getPhoneNumber(), acc);
            }
        }
        if (selfPhone == null && accountRepository != null) {
            try {
                selfPhone = accountRepository.findById(userId).map(AuthAccount::getPhoneNumber).orElse(null);
            } catch (Exception ignored) {
            }
        }
        if (selfPhone == null && authService != null) {
            try {
                var current = authService.currentAccount(userId);
                if (current != null) {
                    selfPhone = current.phoneNumber();
                }
            } catch (Exception ignored) {
            }
        }

        List<MatchedContactView> matchedList = new ArrayList<>();
        List<UnregisteredContactView> unregisteredList = new ArrayList<>();

        for (Map.Entry<String, String> entry : normalizedToNameMap.entrySet()) {
            String phone = entry.getKey();
            if (selfPhone != null && phone.equals(selfPhone)) {
                continue; // Exclude user's own phone number from contacts and invites
            }
            String deviceName = entry.getValue();

            AuthAccount matchedAccount = phoneToAccount.get(phone);
            if (matchedAccount != null) {
                // Resolved display name: prefer device-saved name, fallback to WhatChat profile full name
                String finalDisplayName = (deviceName != null && !deviceName.isBlank() && !"Contact".equalsIgnoreCase(deviceName))
                        ? deviceName
                        : (matchedAccount.getFullName() != null ? matchedAccount.getFullName() : "Contact");

                // Save or update in ContactDoc for this user
                ContactDoc contactDoc = saveOrUpdateMatchedContact(userId, matchedAccount, finalDisplayName, phone);

                matchedList.add(new MatchedContactView(
                        matchedAccount.getId(),
                        finalDisplayName,
                        phone,
                        matchedAccount.getUsername(),
                        matchedAccount.getAvatarUrl(),
                        matchedAccount.getAbout(),
                        true
                ));
            } else {
                unregisteredList.add(new UnregisteredContactView(
                        deviceName,
                        phone,
                        false
                ));
            }
        }

        return new SyncResult(matchedList, unregisteredList, matchedList.size(), unregisteredList.size());
    }

    private ContactDoc saveOrUpdateMatchedContact(String userId, AuthAccount account, String displayName, String phone) {
        ContactDoc doc = null;
        try {
            Optional<ContactDoc> opt = contactRepository.findByUserIdAndContactUserId(userId, account.getId());
            if (opt.isEmpty()) {
                opt = contactRepository.findByUserIdAndPhoneNumber(userId, phone);
            }
            if (opt.isPresent()) {
                doc = opt.get();
            }
        } catch (Exception e) {
            log.warn("[MongoDB Contacts] Lookup check: {}", e.getMessage());
        }

        if (doc == null) {
            doc = fallbackContacts.values().stream()
                    .filter(c -> userId.equals(c.getUserId()) && (account.getId().equals(c.getContactUserId()) || phone.equals(c.getPhoneNumber())))
                    .findFirst()
                    .orElse(null);
        }

        if (doc == null) {
            String id = "cnt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            doc = new ContactDoc(id, userId, phone, displayName, account.getAbout());
            doc.setContactUserId(account.getId());
            doc.setUsername(account.getUsername());
            doc.setAvatarUrl(account.getAvatarUrl());
            doc.setRegistered(true);
        } else {
            doc.setDisplayName(displayName);
            doc.setContactUserId(account.getId());
            doc.setUsername(account.getUsername());
            doc.setAvatarUrl(account.getAvatarUrl());
            doc.setAbout(account.getAbout());
            doc.setRegistered(true);
            doc.setUpdatedAt(Instant.now());
        }

        fallbackContacts.put(doc.getId(), doc);
        persistBackup();
        try {
            return contactRepository.save(doc);
        } catch (Exception e) {
            log.warn("[MongoDB Contacts] Saved in fallback: {}", e.getMessage());
            return doc;
        }
    }

    // DTO records for synchronization
    public record SyncContactItem(String name, String phoneNumber) {}

    public record MatchedContactView(
            String userId,
            String name,
            String phoneNumber,
            String username,
            String profilePicture,
            String about,
            boolean isRegistered
    ) {}

    public record UnregisteredContactView(
            String name,
            String phoneNumber,
            boolean isRegistered
    ) {}

    public record SyncResult(
            List<MatchedContactView> matchedContacts,
            List<UnregisteredContactView> unregisteredContacts,
            int matchedCount,
            int unregisteredCount
    ) {}
}
