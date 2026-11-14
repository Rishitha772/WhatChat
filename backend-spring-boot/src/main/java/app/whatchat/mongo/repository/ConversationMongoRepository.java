package app.whatchat.mongo.repository;

import app.whatchat.mongo.document.ConversationDoc;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationMongoRepository extends MongoRepository<ConversationDoc, String> {
    List<ConversationDoc> findByParticipantsContainingOrderByUpdatedAtDesc(String userId);
}

