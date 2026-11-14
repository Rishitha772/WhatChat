package app.whatchat.mongo.repository;

import app.whatchat.mongo.document.EventMessageDoc;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventMessageMongoRepository extends MongoRepository<EventMessageDoc, String> {
    List<EventMessageDoc> findByEventIdOrderByCreatedAtAsc(String eventId);
    void deleteByEventId(String eventId);
}

