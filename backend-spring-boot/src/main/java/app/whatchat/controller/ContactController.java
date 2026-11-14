package app.whatchat.controller;

import app.whatchat.mongo.document.ContactDoc;
import app.whatchat.mongo.service.MongoContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Controller for User Contacts and Directory.
 * Stored in MongoDB collection `contacts`.
 */
@RestController
@RequestMapping("/api/v1/contacts")
public class ContactController {

    private final MongoContactService contactService;

    public ContactController(MongoContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    public ResponseEntity<List<ContactDoc>> getContacts(Principal principal) {
        String userId = principal != null ? principal.getName() : "usr_default";
        return ResponseEntity.ok(contactService.getUserContacts(userId));
    }

    @PostMapping
    public ResponseEntity<ContactDoc> addContact(
            Principal principal,
            @RequestBody Map<String, Object> payload) {
        String userId = principal != null ? principal.getName() : "usr_default";
        return ResponseEntity.ok(contactService.addContact(userId, payload));
    }
}

