package app.whatchat.mongo.repository;

import app.whatchat.mongo.document.ChatMessageDoc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageMongoRepository extends MongoRepository<ChatMessageDoc, String> {
    List<ChatMessageDoc> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    Page<ChatMessageDoc> findByConversationIdOrderByCreatedAtDesc(String conversationId, Pageable pageable);

    long countByConversationIdAndStatusNotAndSenderIdNot(String conversationId, String status, String senderId);

    void deleteByConversationId(String conversationId);
}
