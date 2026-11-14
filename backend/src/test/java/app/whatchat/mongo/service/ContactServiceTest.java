package app.whatchat.mongo.service;

import app.whatchat.mongo.document.ContactDoc;
import app.whatchat.mongo.repository.ContactMongoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ContactServiceTest {

    private ContactMongoRepository contactRepository;
    private MongoContactService contactService;

    @BeforeEach
    void setUp() {
        contactRepository = mock(ContactMongoRepository.class);
        contactService = new MongoContactService(contactRepository);
    }

    @Test
    void addContactRejectsSelfContact() {
        Map<String, Object> payload = Map.of(
                "contactUserId", "user1",
                "displayName", "Myself"
        );

        assertThatThrownBy(() -> contactService.addContact("user1", payload))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("You cannot add yourself as a contact");
    }

    @Test
    void addContactRejectsDuplicatePhoneNumber() {
        ContactDoc existing = new ContactDoc("cnt_1", "user1", "+1234567890", "Existing Contact", "About");
        when(contactRepository.findByUserIdAndPhoneNumber("user1", "+1234567890"))
                .thenReturn(Optional.of(existing));

        Map<String, Object> payload = Map.of(
                "phoneNumber", "+1234567890",
                "displayName", "Another Name"
        );

        assertThatThrownBy(() -> contactService.addContact("user1", payload))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void addContactSavesNewContact() {
        when(contactRepository.findByUserIdAndPhoneNumber("user1", "+1987654321"))
                .thenReturn(Optional.empty());
        when(contactRepository.save(any(ContactDoc.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> payload = Map.of(
                "phoneNumber", "+1987654321",
                "displayName", "Alice Smith",
                "about", "Hello WhatChat"
        );

        ContactDoc contact = contactService.addContact("user1", payload);

        assertThat(contact).isNotNull();
        assertThat(contact.getDisplayName()).isEqualTo("Alice Smith");
        assertThat(contact.getPhoneNumber()).isEqualTo("+1987654321");
    }

    @Test
    void getUserContactsReturnsRepositoryData() {
        ContactDoc contact = new ContactDoc("cnt_1", "user1", "+1234567890", "Bob", "Hello");
        when(contactRepository.findByUserIdOrderByDisplayNameAsc("user1"))
                .thenReturn(List.of(contact));

        List<ContactDoc> list = contactService.getUserContacts("user1");

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getDisplayName()).isEqualTo("Bob");
    }
}

