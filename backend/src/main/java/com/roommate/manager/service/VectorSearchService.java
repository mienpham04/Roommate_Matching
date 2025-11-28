package com.roommate.manager.service;

import com.google.cloud.aiplatform.v1.*;
import com.roommate.manager.config.VectorSearchConfig;
import com.roommate.manager.model.UserModel;
import com.roommate.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

/**
 * Service to search for similar roommates using Vertex AI Vector Search deployed index
 */
@Service
public class VectorSearchService {

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VectorSearchConfig config;

    /**
     * Find similar roommates based on a user's PREFERENCES using deployed Vector Search index
     * Compares: User A's PREFERENCES vs Other users' PROFILES
     *
     * @param userId The user ID to find matches for
     * @param topK Number of top matches to return
     * @return List of similar users with similarity scores
     */
    public List<Map<String, Object>> findSimilarRoommates(String userId, int topK) throws IOException {
        // Get the user
        Optional<UserModel> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found: " + userId);
        }

        UserModel targetUser = userOptional.get();

        // Generate embedding for target user's PREFERENCES (what they want)
        List<Float> preferenceEmbedding = embeddingService.generatePreferenceEmbedding(targetUser);

        // Query the deployed index for matching PROFILES
        return queryProfilesIndex(preferenceEmbedding, topK, userId);
    }

    /**
     * Find roommates matching a natural language query using deployed Vector Search index
     * The query is treated as a preference - searches for matching PROFILES
     *
     * @param query Natural language description (e.g., "quiet, clean, early bird")
     * @param topK Number of matches to return
     * @return List of matching users with similarity scores
     */
    public List<Map<String, Object>> searchByQuery(String query, int topK) throws IOException {
        // Generate embedding for the query (treated as a preference)
        List<Float> queryEmbedding = embeddingService.generateEmbeddingFromText("Looking for: " + query);

        // Query the deployed index for matching PROFILES
        return queryProfilesIndex(queryEmbedding, topK, null);
    }

    /**
     * Search with filters (budget, location, etc.) and vector similarity
     * Note: Filters are applied AFTER vector search for now
     *
     * @param query Natural language query
     * @param minBudget Minimum budget filter
     * @param maxBudget Maximum budget filter
     * @param zipCode Location filter
     * @param topK Number of results
     * @return Filtered and ranked results
     */
    public List<Map<String, Object>> searchWithFilters(
            String query,
            Integer minBudget,
            Integer maxBudget,
            String zipCode,
            int topK
    ) throws IOException {
        // Generate embedding for the query (treated as a preference)
        List<Float> queryEmbedding = embeddingService.generateEmbeddingFromText("Looking for: " + query);

        // Query index with more results to account for filtering
        int expandedTopK = topK * 5; // Get 5x more results before filtering
        List<Map<String, Object>> results = queryProfilesIndex(queryEmbedding, expandedTopK, null);

        // Apply filters
        return results.stream()
            .filter(result -> {
                UserModel user = (UserModel) result.get("user");

                // Budget filter
                if (minBudget != null && user.getBudget() != null) {
                    if (user.getBudget().getMax() < minBudget) {
                        return false;
                    }
                }
                if (maxBudget != null && user.getBudget() != null) {
                    if (user.getBudget().getMin() > maxBudget) {
                        return false;
                    }
                }

                // Location filter
                if (zipCode != null && user.getZipCode() != null) {
                    if (!user.getZipCode().equals(zipCode)) {
                        return false;
                    }
                }

                return true;
            })
            .limit(topK)
            .toList();
    }

    /**
     * Query the deployed Vector Search index for nearest neighbors among PROFILE vectors
     * This searches ONLY the "_profile" vectors, not the "_preference" vectors
     *
     * @param queryEmbedding The embedding vector to search for (usually a preference)
     * @param topK Number of nearest neighbors to return
     * @param excludeUserId Optional user ID to exclude from results (to avoid matching with self)
     * @return List of users with similarity scores
     */
    private List<Map<String, Object>> queryProfilesIndex(List<Float> queryEmbedding, int topK, String excludeUserId) throws IOException {
        if (config.getIndexEndpoint() == null || config.getIndexEndpoint().isEmpty()) {
            throw new IllegalStateException("Index endpoint not configured. Please set VERTEX_AI_INDEX_ENDPOINT in your .env file");
        }

        if (config.getDeployedIndexId() == null || config.getDeployedIndexId().isEmpty()) {
            throw new IllegalStateException("Deployed index ID not configured. Please set VERTEX_AI_DEPLOYED_INDEX_ID in your .env file");
        }

        try (MatchServiceClient matchServiceClient = MatchServiceClient.create()) {
            // Build the query
            FindNeighborsRequest.Query query = FindNeighborsRequest.Query.newBuilder()
                .setDatapoint(
                    IndexDatapoint.newBuilder()
                        .addAllFeatureVector(queryEmbedding)
                        .build()
                )
                .setNeighborCount(topK)
                .build();

            // Build the request
            FindNeighborsRequest request = FindNeighborsRequest.newBuilder()
                .setIndexEndpoint(config.getIndexEndpoint())
                .setDeployedIndexId(config.getDeployedIndexId())
                .addQueries(query)
                .build();

            // Execute the query
            FindNeighborsResponse response = matchServiceClient.findNeighbors(request);

            // Process results
            List<Map<String, Object>> results = new ArrayList<>();

            if (response.getNearestNeighborsCount() > 0) {
                FindNeighborsResponse.NearestNeighbors neighbors = response.getNearestNeighbors(0);

                for (FindNeighborsResponse.Neighbor neighbor : neighbors.getNeighborsList()) {
                    String datapointId = neighbor.getDatapoint().getDatapointId();

                    // Skip if this is a preference vector (we only want profiles)
                    if (datapointId.endsWith("_preference")) {
                        continue;
                    }

                    // Extract actual user ID (remove "_profile" suffix)
                    String userId = datapointId.replace("_profile", "");

                    // Skip excluded user (avoid self-matching)
                    if (excludeUserId != null && userId.equals(excludeUserId)) {
                        continue;
                    }

                    double distance = neighbor.getDistance();

                    // Convert distance to similarity score (cosine distance -> cosine similarity)
                    // Cosine similarity = 1 - cosine distance
                    double similarityScore = 1.0 - distance;

                    // Fetch user from MongoDB
                    Optional<UserModel> userOpt = userRepository.findById(userId);
                    if (userOpt.isPresent()) {
                        UserModel user = userOpt.get();

                        Map<String, Object> result = new HashMap<>();
                        result.put("user", user);
                        result.put("similarityScore", similarityScore);
                        result.put("userId", userId);
                        result.put("description", embeddingService.userProfileToText(user));

                        results.add(result);
                    }
                }
            }

            return results;

        } catch (Exception e) {
            throw new IOException("Error querying Vector Search index: " + e.getMessage(), e);
        }
    }
}
