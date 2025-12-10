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

    @Autowired
    private AttributeMatchingService attributeMatchingService;

    /**
     * Find similar roommates with the same LIFESTYLE as this user
     * Compares: User A's PROFILE vs Other users' PROFILES
     * Returns people who ARE like you (same habits, preferences, demographics)
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

        // Generate embedding for target user's PROFILE (who they are)
        // This finds people with similar lifestyles, habits, demographics
        List<Float> profileEmbedding = embeddingService.generateProfileEmbedding(targetUser);

        // Query the deployed index for similar PROFILES
        // Use a large topK to get all users from the index
        return queryProfilesIndex(profileEmbedding, topK, userId);
    }

    /**
     * Find mutual matches using HYBRID scoring (rule-based + embeddings)
     * STEP 1: Rule-based filtering - hard requirements (age, gender, lifestyle)
     * STEP 2: Attribute scoring - compatibility based on preferences
     * STEP 3: Embedding scoring - semantic similarity for personality/vibe
     * STEP 4: Combine scores with weighting
     *
     * @param userId The user ID to find matches for
     * @param topK Number of top mutual matches to return
     * @return List of users ranked by hybrid compatibility score
     */
    public List<Map<String, Object>> findMutualMatches(String userId, int topK) throws IOException {
        // Get the target user
        Optional<UserModel> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found: " + userId);
        }

        UserModel targetUser = userOptional.get();

        // Get all users from database
        List<UserModel> allUsers = userRepository.findAll();
        List<Map<String, Object>> results = new ArrayList<>();

        // Generate embeddings for target user (for later use)
        List<Float> aPreferenceEmbedding = embeddingService.generatePreferenceEmbedding(targetUser);
        List<Float> aProfileEmbedding = embeddingService.generateProfileEmbedding(targetUser);

        System.out.println("HYBRID MATCHING: Processing " + allUsers.size() + " users for " + targetUser.getFirstName());

        for (UserModel candidateUser : allUsers) {
            // Skip self
            if (candidateUser.getId().equals(userId)) {
                continue;
            }

            // STEP 1: Hard requirements filter (bidirectional)
            boolean aWantsBRequirements = attributeMatchingService.meetsHardRequirements(targetUser, candidateUser);
            boolean bWantsARequirements = attributeMatchingService.meetsHardRequirements(candidateUser, targetUser);

            if (!aWantsBRequirements || !bWantsARequirements) {
                System.out.println("  Filtered out " + candidateUser.getFirstName() + " (hard requirements not met)");
                continue; // Skip if hard requirements not met
            }

            // STEP 2: Calculate attribute-based compatibility scores
            double forwardAttributeScore = attributeMatchingService.calculateCompatibilityScore(targetUser, candidateUser);
            double reverseAttributeScore = attributeMatchingService.calculateCompatibilityScore(candidateUser, targetUser);
            double mutualAttributeScore = (forwardAttributeScore + reverseAttributeScore) / 2.0;

            // STEP 3: Calculate embedding-based similarity (semantic/personality match)
            List<Float> bProfileEmbedding = embeddingService.generateProfileEmbedding(candidateUser);
            List<Float> bPreferenceEmbedding = embeddingService.generatePreferenceEmbedding(candidateUser);

            double forwardEmbeddingScore = calculateCosineSimilarity(aPreferenceEmbedding, bProfileEmbedding);
            double reverseEmbeddingScore = calculateCosineSimilarity(bPreferenceEmbedding, aProfileEmbedding);
            double mutualEmbeddingScore = (forwardEmbeddingScore + reverseEmbeddingScore) / 2.0;

            // STEP 4: Combine scores with weighting
            // 50% attribute-based (lifestyle compatibility) + 50% embedding-based (personality/vibe)
            // Balanced approach: personality and lifestyle are equally important
            double hybridForwardScore = (forwardAttributeScore * 0.5) + (forwardEmbeddingScore * 0.5);
            double hybridReverseScore = (reverseAttributeScore * 0.5) + (reverseEmbeddingScore * 0.5);
            double hybridMutualScore = (hybridForwardScore + hybridReverseScore) / 2.0;

            System.out.println("  " + candidateUser.getFirstName() + ": " +
                "Attr=" + String.format("%.2f", mutualAttributeScore) +
                " Embed=" + String.format("%.2f", mutualEmbeddingScore) +
                " Hybrid=" + String.format("%.2f", hybridMutualScore));

            // Build result
            Map<String, Object> result = new HashMap<>();
            result.put("user", candidateUser);
            result.put("userId", candidateUser.getId());
            result.put("description", embeddingService.userProfileToText(candidateUser));

            // Compatibility scores
            result.put("forwardScore", hybridForwardScore);
            result.put("reverseScore", hybridReverseScore);
            result.put("mutualScore", hybridMutualScore);

            // Detailed breakdown
            result.put("attributeScore", mutualAttributeScore);
            result.put("embeddingScore", mutualEmbeddingScore);

            results.add(result);
        }

        // Sort by hybrid mutual score and return top K
        return results.stream()
            .sorted((a, b) -> Double.compare(
                (double) b.get("mutualScore"),
                (double) a.get("mutualScore")
            ))
            .limit(topK)
            .toList();
    }

    /**
     * Calculate compatibility scores between exactly TWO users (efficient for real-time updates)
     * This avoids the expensive operation of comparing against all users
     *
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @return Map containing mutualScore, similarityScore, and detailed breakdown
     */
    public Map<String, Object> calculatePairwiseScores(String userId1, String userId2) throws IOException {
        // Get both users
        Optional<UserModel> user1Optional = userRepository.findById(userId1);
        Optional<UserModel> user2Optional = userRepository.findById(userId2);

        if (user1Optional.isEmpty() || user2Optional.isEmpty()) {
            throw new IllegalArgumentException("One or both users not found");
        }

        UserModel user1 = user1Optional.get();
        UserModel user2 = user2Optional.get();

        System.out.println("====== PAIRWISE MATCHING ======");
        System.out.println("User 1: " + user1.getFirstName() + " " + user1.getLastName());
        System.out.println("User 2: " + user2.getFirstName() + " " + user2.getLastName());

        Map<String, Object> result = new HashMap<>();

        // Check hard requirements first (bidirectional)
        boolean user1WantsUser2 = attributeMatchingService.meetsHardRequirements(user1, user2);
        boolean user2WantsUser1 = attributeMatchingService.meetsHardRequirements(user2, user1);

        System.out.println("Hard Requirements Check:");
        System.out.println("  " + user1.getFirstName() + " wants " + user2.getFirstName() + ": " + user1WantsUser2);
        System.out.println("  " + user2.getFirstName() + " wants " + user1.getFirstName() + ": " + user2WantsUser1);

        if (!user1WantsUser2 || !user2WantsUser1) {
            // Hard requirements not met - return 0 scores
            System.out.println("❌ FAILED HARD REQUIREMENTS - Returning 0% score");
            System.out.println("===============================\n");
            result.put("mutualScore", 0.0);
            result.put("similarityScore", 0.0);
            result.put("meetsRequirements", false);
            return result;
        }

        // Generate embeddings for both users
        List<Float> user1PreferenceEmb = embeddingService.generatePreferenceEmbedding(user1);
        List<Float> user1ProfileEmb = embeddingService.generateProfileEmbedding(user1);
        List<Float> user2PreferenceEmb = embeddingService.generatePreferenceEmbedding(user2);
        List<Float> user2ProfileEmb = embeddingService.generateProfileEmbedding(user2);

        // Calculate attribute-based compatibility scores
        double forwardAttributeScore = attributeMatchingService.calculateCompatibilityScore(user1, user2);
        double reverseAttributeScore = attributeMatchingService.calculateCompatibilityScore(user2, user1);
        double mutualAttributeScore = (forwardAttributeScore + reverseAttributeScore) / 2.0;

        // Calculate embedding-based similarity (preference vs profile matching)
        double forwardEmbeddingScore = calculateCosineSimilarity(user1PreferenceEmb, user2ProfileEmb);
        double reverseEmbeddingScore = calculateCosineSimilarity(user2PreferenceEmb, user1ProfileEmb);
        double mutualEmbeddingScore = (forwardEmbeddingScore + reverseEmbeddingScore) / 2.0;

        // Calculate similarity score (profile vs profile - lifestyle similarity)
        double similarityScore = calculateCosineSimilarity(user1ProfileEmb, user2ProfileEmb);

        // Combine scores with weighting (50% attribute + 50% embedding)
        // Balanced approach: personality and lifestyle are equally important
        double hybridForwardScore = (forwardAttributeScore * 0.5) + (forwardEmbeddingScore * 0.5);
        double hybridReverseScore = (reverseAttributeScore * 0.5) + (reverseEmbeddingScore * 0.5);
        double hybridMutualScore = (hybridForwardScore + hybridReverseScore) / 2.0;

        // Build result
        result.put("userId1", userId1);
        result.put("userId2", userId2);
        result.put("mutualScore", hybridMutualScore);
        result.put("similarityScore", similarityScore);
        result.put("meetsRequirements", true);
        result.put("isLowMatch", hybridMutualScore <= 0.5);

        // Detailed breakdown
        result.put("attributeScore", mutualAttributeScore);
        result.put("embeddingScore", mutualEmbeddingScore);
        result.put("forwardScore", hybridForwardScore);
        result.put("reverseScore", hybridReverseScore);

        System.out.println("PAIRWISE SCORE: " + user1.getFirstName() + " <-> " + user2.getFirstName() +
            " | Mutual=" + String.format("%.2f", hybridMutualScore) +
            " | Similarity=" + String.format("%.2f", similarityScore));

        return result;
    }

    /**
     * Calculate cosine similarity between two embedding vectors
     */
    private double calculateCosineSimilarity(List<Float> vec1, List<Float> vec2) {
        if (vec1.size() != vec2.size()) {
            throw new IllegalArgumentException("Vectors must have same dimension");
        }

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (int i = 0; i < vec1.size(); i++) {
            dotProduct += vec1.get(i) * vec2.get(i);
            norm1 += vec1.get(i) * vec1.get(i);
            norm2 += vec2.get(i) * vec2.get(i);
        }

        if (norm1 == 0.0 || norm2 == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    /**
     * Get reverse score: How well does candidate's PREFERENCES match target's PROFILE
     * Uses index query with candidate's preferences to find target's profile ranking
     *
     * @param candidate The candidate user
     * @param targetProfileEmbedding Target user's profile embedding
     * @param targetUserId Target user ID
     * @return Reverse similarity score
     */
    private double getReverseScore(UserModel candidate, List<Float> targetProfileEmbedding, String targetUserId) throws IOException {
        // Generate candidate's preference embedding
        List<Float> candidatePreferenceEmbedding = embeddingService.generatePreferenceEmbedding(candidate);

        // Query index with candidate's preferences to see how well target's profile matches
        // We need to search for target's profile among the results
        List<Map<String, Object>> results = queryProfilesIndex(candidatePreferenceEmbedding, 100, candidate.getId());

        // Find target user in the results
        for (Map<String, Object> result : results) {
            String userId = (String) result.get("userId");
            if (userId.equals(targetUserId)) {
                return (double) result.get("similarityScore");
            }
        }

        // If target not found in top 100 results, return low score
        return 0.0;
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

        // Configure MatchServiceClient to use public VDB endpoint
        String vdbEndpoint = String.format("%s:443", config.getPublicEndpointDomain());
        MatchServiceSettings matchSettings = MatchServiceSettings.newBuilder()
            .setEndpoint(vdbEndpoint)
            .build();

        try (MatchServiceClient matchServiceClient = MatchServiceClient.create(matchSettings)) {
            // Build the query with restricts to ONLY return profile vectors
            // This is deterministic - we only get profiles, never preferences
            FindNeighborsRequest.Query query = FindNeighborsRequest.Query.newBuilder()
                .setDatapoint(
                    IndexDatapoint.newBuilder()
                        .addAllFeatureVector(queryEmbedding)
                        .addRestricts(
                            IndexDatapoint.Restriction.newBuilder()
                                .setNamespace("vector_type")
                                .addAllowList("profile")
                                .build()
                        )
                        .build()
                )
                .setNeighborCount(topK)
                .build();

            // Build the request
            FindNeighborsRequest request = FindNeighborsRequest.newBuilder()
                .setIndexEndpoint(config.getIndexEndpointPath())
                .setDeployedIndexId(config.getDeployedIndexId())
                .addQueries(query)
                .build();

            // Execute the query
            FindNeighborsResponse response = matchServiceClient.findNeighbors(request);

            // Process results
            List<Map<String, Object>> results = new ArrayList<>();

            if (response.getNearestNeighborsCount() > 0) {
                FindNeighborsResponse.NearestNeighbors neighbors = response.getNearestNeighbors(0);
                System.out.println("DEBUG: Found " + neighbors.getNeighborsCount() + " neighbors from index");

                for (FindNeighborsResponse.Neighbor neighbor : neighbors.getNeighborsList()) {
                    String datapointId = neighbor.getDatapoint().getDatapointId();
                    System.out.println("DEBUG: Processing datapoint: " + datapointId);

                    // Extract actual user ID (remove "_profile" suffix)
                    // Note: restricts ensure we ONLY get profile vectors, never preferences
                    String userId = datapointId.replace("_profile", "");
                    System.out.println("DEBUG: Extracted user ID: " + userId);

                    // Skip excluded user (avoid self-matching)
                    if (excludeUserId != null && userId.equals(excludeUserId)) {
                        System.out.println("DEBUG: Skipping excluded user (self)");
                        continue;
                    }

                    double distance = neighbor.getDistance();

                    // Convert distance to similarity score (cosine distance -> cosine similarity)
                    // Cosine similarity = 1 - cosine distance
                    double similarityScore = 1.0 - distance;
                    System.out.println("DEBUG: Similarity score: " + similarityScore);

                    // Fetch user from MongoDB
                    Optional<UserModel> userOpt = userRepository.findById(userId);
                    if (userOpt.isPresent()) {
                        UserModel user = userOpt.get();
                        System.out.println("DEBUG: Found user in MongoDB: " + user.getFirstName() + " " + user.getLastName());

                        Map<String, Object> result = new HashMap<>();
                        result.put("user", user);
                        result.put("similarityScore", similarityScore);
                        result.put("userId", userId);
                        result.put("description", embeddingService.userProfileToText(user));

                        results.add(result);
                    } else {
                        System.out.println("DEBUG: User NOT found in MongoDB for ID: " + userId);
                    }
                }
            } else {
                System.out.println("DEBUG: No neighbors found in response");
            }

            System.out.println("DEBUG: Total results: " + results.size());

            return results;

        } catch (Exception e) {
            throw new IOException("Error querying Vector Search index: " + e.getMessage(), e);
        }
    }
}
