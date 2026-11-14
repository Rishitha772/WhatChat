package app.whatchat.mongo;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableMongoRepositories(basePackages = "app.whatchat.mongo.repository")
public class MongoConfig extends AbstractMongoClientConfiguration {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);

    @Value("${spring.data.mongodb.uri:mongodb://localhost:27017/whatchat_db}")
    private String mongoUri;

    @Value("${spring.data.mongodb.database:whatchat_db}")
    private String databaseName;

    @Override
    protected String getDatabaseName() {
        return databaseName;
    }

    @Override
    public MongoClient mongoClient() {
        log.info("[MongoDB] Initializing client connection with URI: {}", maskUri(mongoUri));
        
        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(mongoUri))
                .applyToSocketSettings(builder -> 
                        builder.connectTimeout(1000, TimeUnit.MILLISECONDS)
                               .readTimeout(3000, TimeUnit.MILLISECONDS))
                .applyToClusterSettings(builder -> 
                        builder.serverSelectionTimeout(800, TimeUnit.MILLISECONDS))
                .build();

        return MongoClients.create(settings);
    }

    @Bean
    @Primary
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), getDatabaseName());
    }

    private String maskUri(String uri) {
        if (uri == null) return "null";
        // Hide password if present in URI
        return uri.replaceAll("://([^:]+):([^@]+)@", "://$1:****@");
    }
}
