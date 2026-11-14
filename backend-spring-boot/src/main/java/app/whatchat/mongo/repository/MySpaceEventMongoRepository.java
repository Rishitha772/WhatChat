package app.whatchat.mongo.repository;

import app.whatchat.mongo.document.MySpaceEventDoc;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MySpaceEventMongoRepository extends MongoRepository<MySpaceEventDoc, String> {
    List<MySpaceEventDoc> findByUserIdOrderByCreatedAtDesc(String userId);
    List<MySpaceEventDoc> findByUserIdAndCategoryIgnoreCaseOrderByCreatedAtDesc(String userId, String category);
}

