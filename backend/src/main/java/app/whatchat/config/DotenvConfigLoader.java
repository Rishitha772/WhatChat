package app.whatchat.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Automatically locates and loads the root or local .env file into Spring's Environment
 * and Java System properties before any bean initialization or property evaluation.
 */
public class DotenvConfigLoader implements EnvironmentPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DotenvConfigLoader.class);
    private static final String PROPERTY_SOURCE_NAME = "whatchatDotenvProperties";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> envProperties = loadDotenvProperties();
        if (!envProperties.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, envProperties));
            log.info("[Dotenv] Loaded {} configuration properties into Spring Environment", envProperties.size());
        }
    }

    /**
     * Static loader that can be called directly from main() before SpringApplication.run()
     */
    public static Map<String, Object> load() {
        Map<String, Object> properties = loadDotenvProperties();
        for (Map.Entry<String, Object> entry : properties.entrySet()) {
            if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue().toString());
            }
        }
        return properties;
    }

    private static Map<String, Object> loadDotenvProperties() {
        Map<String, Object> properties = new LinkedHashMap<>();
        File envFile = findDotenvFile();
        if (envFile == null || !envFile.exists() || !envFile.canRead()) {
            log.warn("[Dotenv] No readable .env file found in working directory or parent hierarchy.");
            return properties;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int equalsIndex = line.indexOf('=');
                if (equalsIndex > 0) {
                    String key = line.substring(0, equalsIndex).trim();
                    String value = line.substring(equalsIndex + 1).trim();

                    // Strip surrounding quotes if present
                    if ((value.startsWith("\"") && value.endsWith("\""))
                            || (value.startsWith("'") && value.endsWith("'"))) {
                        if (value.length() >= 2) {
                            value = value.substring(1, value.length() - 1);
                        }
                    }

                    if (!key.isEmpty()) {
                        properties.put(key, value);
                        // Also inject into system properties if not already set
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
            }
            log.info("[Dotenv] Successfully parsed .env from: {}", envFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("[Dotenv] Failed to read .env file from: {}", envFile.getAbsolutePath(), e);
        }

        return properties;
    }

    private static File findDotenvFile() {
        // 1. Current working directory
        File current = new File(".env");
        if (current.exists() && current.isFile()) {
            return current;
        }

        // 2. Parent directory (e.g. when executed inside backend-spring-boot directory)
        File parent = new File("../.env");
        if (parent.exists() && parent.isFile()) {
            return parent;
        }

        // 3. User dir relative
        String userDir = System.getProperty("user.dir", ".");
        File userDirEnv = new File(userDir, ".env");
        if (userDirEnv.exists() && userDirEnv.isFile()) {
            return userDirEnv;
        }

        File userDirParentEnv = new File(new File(userDir).getParentFile(), ".env");
        if (userDirParentEnv.exists() && userDirParentEnv.isFile()) {
            return userDirParentEnv;
        }

        return null;
    }
}

