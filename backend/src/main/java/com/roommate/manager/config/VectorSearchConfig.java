package com.roommate.manager.config;

import com.google.cloud.vertexai.VertexAI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class VectorSearchConfig {

    @Value("${gcp.project.id}")
    private String projectId;

    @Value("${gcp.project.number}")
    private String projectNumber;

    @Value("${gcp.location}")
    private String location;

    @Value("${vertex.ai.index.id:#{null}}")
    private String indexId;

    @Value("${vertex.ai.index.endpoint:#{null}}")
    private String indexEndpoint;

    @Value("${vertex.ai.deployed.index.id:#{null}}")
    private String deployedIndexId;

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
