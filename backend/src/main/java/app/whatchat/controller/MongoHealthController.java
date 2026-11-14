package app.whatchat.controller;

import app.whatchat.mongo.service.MongoHealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Convenience controller to inspect MongoDB status, active database,
 * connection health, and collection counts.
 */
@RestController
@RequestMapping("/api/v1/mongo")
public class MongoHealthController {

    private final MongoHealthService healthService;

    public MongoHealthController(MongoHealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getMongoStatus() {
        return ResponseEntity.ok(healthService.getStatus());
    }
}

