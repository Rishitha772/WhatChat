package app.whatchat.mongo.repository;

import app.whatchat.mongo.document.NotificationDoc;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationMongoRepository extends MongoRepository<NotificationDoc, String> {
    List<NotificationDoc> findByUserIdOrderByCreatedAtDesc(String userId);
    List<NotificationDoc> findByUserIdAndReadFalseOrderByCreatedAtDesc(String userId);
}

