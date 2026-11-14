package app.whatchat.mongo.repository;

import app.whatchat.mongo.document.ConversationDoc;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationMongoRepository extends MongoRepository<ConversationDoc, String> {
    List<ConversationDoc> findByParticipantsContainingOrderByUpdatedAtDesc(String userId);

    @Query("{ 'type': 'direct', 'participants': { '$all': [?0, ?1] } }")
    Optional<ConversationDoc> findDirectConversation(String userA, String userB);
}
