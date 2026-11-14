package app.whatchat.mongo.repository;

import app.whatchat.mongo.document.ContactDoc;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactMongoRepository extends MongoRepository<ContactDoc, String> {
    List<ContactDoc> findByUserIdOrderByDisplayNameAsc(String userId);
    Optional<ContactDoc> findByUserIdAndPhoneNumber(String userId, String phoneNumber);
}

