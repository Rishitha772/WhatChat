package app.whatchat.controller;

import app.whatchat.mongo.document.ContactDoc;
import app.whatchat.mongo.service.MongoContactService;
import app.whatchat.mongo.service.MongoContactService.SyncContactItem;
import app.whatchat.mongo.service.MongoContactService.SyncResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/contacts")
@Tag(name = "Contacts", description = "Contact management, synchronization and directory search")
public class ContactController {

    private final MongoContactService contactService;

    public ContactController(MongoContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    @Operation(summary = "Retrieve all contacts for the authenticated user")
    public ResponseEntity<List<ContactDoc>> getContacts(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(contactService.getUserContacts(principal.getName()));
    }

    @PostMapping
    @Operation(summary = "Add a new contact to the user's directory")
    public ResponseEntity<ContactDoc> addContact(
            Principal principal,
            @RequestBody Map<String, Object> payload) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(contactService.addContact(principal.getName(), payload));
    }

    @PostMapping("/sync")
    @Operation(summary = "Synchronize device contacts, normalize phone numbers, match with registered users and save")
    public ResponseEntity<SyncResult> syncContacts(
            Principal principal,
            @RequestBody SyncRequest request) {
        if (principal == null) return ResponseEntity.status(401).build();
        List<SyncContactItem> list = request != null && request.contacts() != null ? request.contacts() : List.of();
        return ResponseEntity.ok(contactService.syncContacts(principal.getName(), list));
    }

    @GetMapping("/search")
    @Operation(summary = "Search user's contacts by name, username, or phone number")
    public ResponseEntity<List<ContactDoc>> searchContacts(
            Principal principal,
            @RequestParam(required = false, defaultValue = "") String q) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(contactService.searchContacts(principal.getName(), q));
    }

    @DeleteMapping("/{contactId}")
    @Operation(summary = "Remove a contact from the user's directory")
    public ResponseEntity<Map<String, Object>> removeContact(
            Principal principal,
            @PathVariable String contactId) {
        if (principal == null) return ResponseEntity.status(401).build();
        contactService.deleteContact(principal.getName(), contactId);
        return ResponseEntity.ok(Map.of("success", true, "deletedContactId", contactId));
    }

    public record SyncRequest(List<SyncContactItem> contacts) {}
}
