package com.roommate.manager.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.vertexai.VertexAI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class VectorSearchConfig {

    @Value("${gcp.project.id}")
    private String projectId;

    @Value("${gcp.project.number}")
    private String projectNumber;

    @Value("${gcp.location}")
    private String location;

    @Value("${gcp.credentials.json:}")
    private String credentialsJson;

    @Value("${vertex.ai.index.id:#{null}}")
    private String indexId;

    @Value("${vertex.ai.index.endpoint:#{null}}")
    private String indexEndpoint;

    @Value("${vertex.ai.deployed.index.id:#{null}}")
    private String deployedIndexId;

    @Value("${vertex.ai.public.endpoint.domain:#{null}}")
    private String publicEndpointDomain;

    /**
     * Get GoogleCredentials from the configured source
     * Tries in order:
     * 1. GCP_CREDENTIALS_JSON environment variable (file path or JSON content)
     * 2. GOOGLE_APPLICATION_CREDENTIALS environment variable
     * 3. Application Default Credentials
     */
    @Bean
    public GoogleCredentials googleCredentials() throws IOException {
        GoogleCredentials credentials;

        if (credentialsJson != null && !credentialsJson.trim().isEmpty()) {
            // Check if it's a file path or JSON content
            if (credentialsJson.trim().startsWith("{")) {
                // It's JSON content
                credentials = GoogleCredentials.fromStream(
                    new ByteArrayInputStream(credentialsJson.getBytes())
                );
            } else {
                // It's a file path
                credentials = GoogleCredentials.fromStream(
                    new FileInputStream(credentialsJson)
                );
            }
        } else {
            // Fall back to Application Default Credentials
            credentials = GoogleCredentials.getApplicationDefault();
        }

        // Create scoped credentials for Vertex AI and refresh them
        return credentials.createScoped(
            "https://www.googleapis.com/auth/cloud-platform"
        );
    }

    @Bean
    public VertexAI vertexAI() {
        return new VertexAI(projectId, location);
    }

    public String getProjectId() {
        return projectId;
    }

    public String getLocation() {
        return location;
    }

    public String getIndexEndpoint() {
        return indexEndpoint;
    }

    public String getDeployedIndexId() {
        return deployedIndexId;
    }

    public String getPublicEndpointDomain() {
        return publicEndpointDomain;
    }

    /** Returns FULL resource name, not just the numeric ID */
    public String getIndexPath() {
        if (indexId == null) return null;

        return String.format(
            "projects/%s/locations/%s/indexes/%s",
            projectNumber,
            location,
            indexId
        );
    }

    /** Returns JUST the numeric ID (optional) */
    public String getIndexId() {
        return indexId;
    }

    public String getIndexEndpointPath() {
    return String.format(
        "projects/%s/locations/%s/indexEndpoints/%s",
        projectNumber, location, indexEndpoint
    );
}
}
