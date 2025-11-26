package com.roommate.manager.config;

import com.google.cloud.vertexai.VertexAI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class VectorSearchConfig {

    @Value("${gcp.project.id}")
    private String projectId;

    @Value("${gcp.location}")
    private String location;

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
}
