package com.roommate.manager.service;

import com.google.cloud.aiplatform.v1.*;
import com.roommate.manager.config.VectorSearchConfig;
import com.roommate.manager.model.UserModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.io.IOException;
import java.util.List;

/**
 * Service to manage vector uploads to the deployed Vector Search index
 */
@Service
public class IndexManagementService {

    @Autowired
    private VectorSearchConfig config;

    @Autowired
    private EmbeddingService embeddingService;

    //CLAUD CODE START
    /**
     * Upload a user's embedding vectors to the Vector Search index
     * Uploads TWO vectors per user:
     * 1. Profile vector (who they ARE) - ID: userId_profile
     * 2. Preference vector (what they WANT) - ID: userId_preference
     *
     * @param user User to upload
     * @throws IOException if upload fails
     */
    public void uploadUserToIndex(UserModel user) throws IOException {
        if (config.getIndexId() == null || config.getIndexId().isEmpty()) {
            System.err.println("Index ID not configured, skipping vector upload");
            return;
        }

        // Generate BOTH embeddings for the user
        List<Float> profileEmbedding = embeddingService.generateProfileEmbedding(user);
        List<Float> preferenceEmbedding = embeddingService.generatePreferenceEmbedding(user);

        // Create datapoint for PROFILE (who they are)
        // Add restricts to mark this as a profile vector for filtering
        IndexDatapoint profileDatapoint = IndexDatapoint.newBuilder()
            .setDatapointId(user.getId() + "_profile")
            .addAllFeatureVector(profileEmbedding)
            .addRestricts(
                IndexDatapoint.Restriction.newBuilder()
                    .setNamespace("vector_type")
                    .addAllowList("profile")
                    .build()
            )
            .build();

        // Create datapoint for PREFERENCE (what they want)
        // Add restricts to mark this as a preference vector for filtering
        IndexDatapoint preferenceDatapoint = IndexDatapoint.newBuilder()
            .setDatapointId(user.getId() + "_preference")
            .addAllFeatureVector(preferenceEmbedding)
            .addRestricts(
                IndexDatapoint.Restriction.newBuilder()
                    .setNamespace("vector_type")
                    .addAllowList("preference")
                    .build()
            )
            .build();

        // Upload BOTH vectors to index
        // Configure client with explicit endpoint for the region
        String endpoint = String.format("%s-aiplatform.googleapis.com:443", config.getLocation());
        IndexServiceSettings settings = IndexServiceSettings.newBuilder()
            .setEndpoint(endpoint)
            .build();

        try (IndexServiceClient indexServiceClient = IndexServiceClient.create(settings)) {
            UpsertDatapointsRequest request = UpsertDatapointsRequest.newBuilder()
                .setIndex(config.getIndexPath())
                .addDatapoints(profileDatapoint)
                .addDatapoints(preferenceDatapoint)
                .build();

            indexServiceClient.upsertDatapoints(request);
            System.out.println("Successfully uploaded profile + preference vectors for user: " + user.getId());

        } catch (Exception e) {
            throw new IOException("Failed to upload user vectors to index: " + e.getMessage(), e);
        }
    }
    //CLAUD CODE END

    /**
     * Batch upload multiple users to the index
     * @param users List of users to upload
     * @return Number of successfully uploaded users
     */
    public int batchUploadUsers(List<UserModel> users) {
        int successCount = 0;

        for (UserModel user : users) {
            try {
                uploadUserToIndex(user);
                successCount++;
            } catch (IOException e) {
                System.err.println("Failed to upload user " + user.getId() + ": " + e.getMessage());
            }
        }

        return successCount;
    }

    /**
     * Test query to verify vectors exist in the index
     * Queries for nearest neighbors using a test vector
     *
     * @param testVector Test embedding vector (768 dimensions)
     * @param numNeighbors Number of neighbors to return
     * @return List of nearest neighbor datapoint IDs
     */
    public List<String> queryIndex(List<Float> testVector, int numNeighbors) throws IOException {
        if (config.getIndexEndpoint() == null || config.getDeployedIndexId() == null) {
            throw new IOException("Index endpoint or deployed index ID not configured");
        }

        // Configure MatchServiceClient to use public VDB endpoint
        String vdbEndpoint = String.format("%s:443", config.getPublicEndpointDomain());
        MatchServiceSettings matchSettings = MatchServiceSettings.newBuilder()
            .setEndpoint(vdbEndpoint)
            .build();

        try (MatchServiceClient matchServiceClient = MatchServiceClient.create(matchSettings)) {
            FindNeighborsRequest.Query query = FindNeighborsRequest.Query.newBuilder()
                .setDatapoint(IndexDatapoint.newBuilder()
                    .addAllFeatureVector(testVector)
                    .build())
                .setNeighborCount(numNeighbors)
                .build();

            FindNeighborsRequest request = FindNeighborsRequest.newBuilder()
                .setIndexEndpoint(config.getIndexEndpointPath())
                .setDeployedIndexId(config.getDeployedIndexId())
                .addQueries(query)
                .build();

            FindNeighborsResponse response = matchServiceClient.findNeighbors(request);

            // Extract and return neighbor IDs
            return response.getNearestNeighbors(0)
                .getNeighborsList()
                .stream()
                .map(neighbor -> neighbor.getDatapoint().getDatapointId())
                .toList();

        } catch (Exception e) {
            throw new IOException("Failed to query index: " + e.getMessage(), e);
        }
    }

    /**
     * Remove a user's vectors from the index
     * Removes BOTH profile and preference vectors
     *
     * @param userId User ID to remove
     */
    public void removeUserFromIndex(String userId) throws IOException {
        if (config.getIndexId() == null || config.getIndexId().isEmpty()) {
            return;
        }

        // Configure client with explicit endpoint for the region
        String endpoint = String.format("%s-aiplatform.googleapis.com:443", config.getLocation());
        IndexServiceSettings settings = IndexServiceSettings.newBuilder()
            .setEndpoint(endpoint)
            .build();

        try (IndexServiceClient indexServiceClient = IndexServiceClient.create(settings)) {
            RemoveDatapointsRequest request = RemoveDatapointsRequest.newBuilder()
                .setIndex(config.getIndexPath())
                .addDatapointIds(userId + "_profile")
                .addDatapointIds(userId + "_preference")
                .build();

            indexServiceClient.removeDatapoints(request);
            System.out.println("Successfully removed profile + preference vectors for user: " + userId);

        } catch (Exception e) {
            throw new IOException("Failed to remove user vectors from index: " + e.getMessage(), e);
        }
    }
}
