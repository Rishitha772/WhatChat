package app.whatchat.mongo.service;

import com.mongodb.client.MongoClient;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class MongoHealthService {

    private static final Logger log = LoggerFactory.getLogger(MongoHealthService.class);

    private final MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.uri:mongodb://localhost:27017/whatchat_db}")
    private String mongoUri;

    @Value("${spring.data.mongodb.database:whatchat_db}")
    private String databaseName;

    public MongoHealthService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("database", databaseName);
        status.put("configuredUri", maskUri(mongoUri));

        try {
            // Execute quick ping
            Document pingResult = mongoTemplate.getDb().runCommand(new Document("ping", 1));
            status.put("status", "CONNECTED");
            status.put("ping", pingResult.get("ok"));
            status.put("collections", mongoTemplate.getCollectionNames());
            status.put("eventCount", mongoTemplate.getCollection("myspace_events").countDocuments());
            status.put("messageCount", mongoTemplate.getCollection("chat_messages").countDocuments());
            status.put("conversationCount", mongoTemplate.getCollection("conversations").countDocuments());
        } catch (Exception e) {
            status.put("status", "OFFLINE_FALLBACK");
            status.put("error", e.getMessage());
            status.put("note", "Application is operating in resilient standalone mode. Start MongoDB on localhost:27017 or set MONGODB_URI to connect.");
        }

        return status;
    }

    private String maskUri(String uri) {
        if (uri == null) return "null";
        return uri.replaceAll("://([^:]+):([^@]+)@", "://$1:****@");
    }
}

