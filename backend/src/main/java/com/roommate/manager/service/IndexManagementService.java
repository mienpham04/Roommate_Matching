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
        IndexDatapoint profileDatapoint = IndexDatapoint.newBuilder()
            .setDatapointId(user.getId() + "_profile")
            .addAllFeatureVector(profileEmbedding)
            .build();

        // Create datapoint for PREFERENCE (what they want)
        IndexDatapoint preferenceDatapoint = IndexDatapoint.newBuilder()
            .setDatapointId(user.getId() + "_preference")
            .addAllFeatureVector(preferenceEmbedding)
            .build();

        // Upload BOTH vectors to index
        try (IndexServiceClient indexServiceClient = IndexServiceClient.create()) {
            UpsertDatapointsRequest request = UpsertDatapointsRequest.newBuilder()
                .setIndex(config.getIndexId())
                .addDatapoints(profileDatapoint)
                .addDatapoints(preferenceDatapoint)
                .build();

            indexServiceClient.upsertDatapoints(request);
            System.out.println("Successfully uploaded profile + preference vectors for user: " + user.getId());

        } catch (Exception e) {
            throw new IOException("Failed to upload user vectors to index: " + e.getMessage(), e);
        }
    }

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
     * Remove a user's vectors from the index
     * Removes BOTH profile and preference vectors
     *
     * @param userId User ID to remove
     */
    public void removeUserFromIndex(String userId) throws IOException {
        if (config.getIndexId() == null || config.getIndexId().isEmpty()) {
            return;
        }

        try (IndexServiceClient indexServiceClient = IndexServiceClient.create()) {
            RemoveDatapointsRequest request = RemoveDatapointsRequest.newBuilder()
                .setIndex(config.getIndexId())
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
