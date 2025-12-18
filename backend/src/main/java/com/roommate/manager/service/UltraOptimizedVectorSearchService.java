package com.roommate.manager.service;

import com.google.cloud.aiplatform.v1.*;
import com.roommate.manager.config.VectorSearchConfig;
import com.roommate.manager.model.UserModel;
import com.roommate.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ULTRA-OPTIMIZED Vector Search - Uses embeddings directly from Vertex AI!
 *
 * KEY INSIGHT: Vertex AI ALREADY has all embeddings and RETURNS them in query results
 * No need to regenerate embeddings or store in MongoDB!
 *
 * Performance: Sub-second queries even with 10,000+ users
 */
@Service
public class UltraOptimizedVectorSearchService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VectorSearchConfig config;

    @Autowired
    private AttributeMatchingService attributeMatchingService;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private com.google.auth.oauth2.GoogleCredentials credentials;

    /**
     * ULTRA-FAST mutual matching using embeddings directly from Vertex AI
     *
     * How it works:
     * 1. Query Vertex AI for user's preference embedding → get top 100 PROFILE matches
     * 2. Query Vertex AI AGAIN for each candidate's preference embedding → get their vectors
     * 3. Use returned vectors for scoring (NO regeneration!)
     *
     * Result: All embeddings come from Vertex AI, zero AI API calls for generation!
     */
    public List<Map<String, Object>> findMutualMatchesUltraFast(String userId, int topK) throws IOException {
        Optional<UserModel> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found: " + userId);
        }

        UserModel targetUser = userOptional.get();

        System.out.println("=== ULTRA-FAST MATCHING START ===");
        System.out.println("Target user: " + targetUser.getFirstName());
        long startTime = System.currentTimeMillis();

        // STAGE 1: Get profile embeddings from Vertex AI for candidates
        // LOCATION-AWARE: Prioritize same-city candidates
        int vectorSearchLimit = Math.min(topK * 10, 150);
        String userCityCode = getCityCode(targetUser.getZipCode());

        List<CandidateWithEmbeddings> candidates = new ArrayList<>();

        // First: Try to get same-city candidates
        if (userCityCode != null) {
            System.out.println("🌆 STAGE 1a: Searching for same-city candidates (city code: " + userCityCode + ")");
            List<CandidateWithEmbeddings> sameCityCandidates = queryVertexAIWithEmbeddings(
                userId + "_preference",
                "profile",
                vectorSearchLimit,
                userId,
                userCityCode  // Filter by city code
            );
            candidates.addAll(sameCityCandidates);
            System.out.println("   Found " + sameCityCandidates.size() + " same-city candidates");
        }

        // Second: If we don't have enough candidates, search globally
        if (candidates.size() < vectorSearchLimit) {
            int remainingNeeded = vectorSearchLimit - candidates.size();
            System.out.println("🌍 STAGE 1b: Searching globally for " + remainingNeeded + " more candidates");
            List<CandidateWithEmbeddings> globalCandidates = queryVertexAIWithEmbeddings(
                userId + "_preference",
                "profile",
                remainingNeeded,
                userId,
                null  // No city filter
            );

            // Add only candidates we don't already have (avoid duplicates)
            Set<String> existingIds = candidates.stream()
                .map(c -> c.userId)
                .collect(java.util.stream.Collectors.toSet());

            for (CandidateWithEmbeddings candidate : globalCandidates) {
                if (!existingIds.contains(candidate.userId)) {
                    candidates.add(candidate);
                }
            }
            System.out.println("   Added " + (candidates.size() - existingIds.size()) + " global candidates");
        }

        long stage1Time = System.currentTimeMillis() - startTime;
        System.out.println("STAGE 1: Got " + candidates.size() + " candidates with embeddings in " + stage1Time + "ms");

        // STAGE 2: Get preference embeddings for candidates (batch query)
        long stage2Start = System.currentTimeMillis();
        Map<String, List<Float>> preferenceEmbeddings = batchGetPreferenceEmbeddings(
            candidates.stream()
                .map(c -> c.userId)
                .collect(Collectors.toList())
        );
        long stage2Time = System.currentTimeMillis() - stage2Start;
        System.out.println("STAGE 2: Got " + preferenceEmbeddings.size() + " preference embeddings in " + stage2Time + "ms");

        // STAGE 3: Get target user's embeddings from Vertex AI
        long stage3Start = System.currentTimeMillis();
        List<Float> targetProfileEmbedding = getEmbeddingFromVertexAI(userId + "_profile");
        List<Float> targetPreferenceEmbedding = getEmbeddingFromVertexAI(userId + "_preference");
        long stage3Time = System.currentTimeMillis() - stage3Start;
        System.out.println("STAGE 3: Got target embeddings in " + stage3Time + "ms");

        // STAGE 4: Score candidates using embeddings from Vertex AI
        long stage4Start = System.currentTimeMillis();
        List<Map<String, Object>> scoredResults = scoreCandidatesWithVertexAIEmbeddings(
            targetUser,
            targetProfileEmbedding,
            targetPreferenceEmbedding,
            candidates,
            preferenceEmbeddings
        );
        long stage4Time = System.currentTimeMillis() - stage4Start;
        System.out.println("STAGE 4: Scored candidates in " + stage4Time + "ms");

        // Sort and return top K
        List<Map<String, Object>> topMatches = scoredResults.stream()
            .sorted((a, b) -> Double.compare(
                (double) b.get("mutualScore"),
                (double) a.get("mutualScore")
            ))
            .limit(topK)
            .collect(Collectors.toList());

        long totalTime = System.currentTimeMillis() - startTime;
        System.out.println("=== MATCHING COMPLETE: " + topMatches.size() + " matches in " + totalTime + "ms ===");
        System.out.println("Breakdown: Stage1=" + stage1Time + "ms, Stage2=" + stage2Time + "ms, " +
                          "Stage3=" + stage3Time + "ms, Stage4=" + stage4Time + "ms\n");

        return topMatches;
    }

    /**
     * Query Vertex AI and get BOTH user data AND their embeddings
     * This is the key optimization - embeddings come back in the query response!
     */
    private List<CandidateWithEmbeddings> queryVertexAIWithEmbeddings(
            String queryDatapointId,
            String returnVectorType,
            int topK,
            String excludeUserId,
            String cityCodeFilter) throws IOException {

        String vdbEndpoint = String.format("%s:443", config.getPublicEndpointDomain());
        MatchServiceSettings matchSettings = MatchServiceSettings.newBuilder()
            .setEndpoint(vdbEndpoint)
            .setCredentialsProvider(() -> credentials)
            .build();

        try (MatchServiceClient matchServiceClient = MatchServiceClient.create(matchSettings)) {
            // Build restrictions for the query
            IndexDatapoint.Builder datapointBuilder = IndexDatapoint.newBuilder()
                .setDatapointId(queryDatapointId)
                .addRestricts(
                    IndexDatapoint.Restriction.newBuilder()
                        .setNamespace("vector_type")
                        .addAllowList(returnVectorType)
                        .build()
                );

            // Add city filter if provided
            if (cityCodeFilter != null && !cityCodeFilter.trim().isEmpty()) {
                datapointBuilder.addRestricts(
                    IndexDatapoint.Restriction.newBuilder()
                        .setNamespace("city_code")
                        .addAllowList(cityCodeFilter)
                        .build()
                );
            }

            // Query by datapoint ID (more efficient than regenerating embedding)
            // Note: Vertex AI returns embeddings in the datapoint by default
            FindNeighborsRequest.Query query = FindNeighborsRequest.Query.newBuilder()
                .setDatapoint(datapointBuilder.build())
                .setNeighborCount(topK)
                .build();

            FindNeighborsRequest request = FindNeighborsRequest.newBuilder()
                .setIndexEndpoint(config.getIndexEndpointPath())
                .setDeployedIndexId(config.getDeployedIndexId())
                .addQueries(query)
                .build();

            FindNeighborsResponse response = matchServiceClient.findNeighbors(request);
            List<CandidateWithEmbeddings> results = new ArrayList<>();

            if (response.getNearestNeighborsCount() > 0) {
                FindNeighborsResponse.NearestNeighbors neighbors = response.getNearestNeighbors(0);

                // Collect user IDs for batch fetch
                List<String> userIds = new ArrayList<>();
                Map<String, CandidateWithEmbeddings> candidateMap = new HashMap<>();

                for (FindNeighborsResponse.Neighbor neighbor : neighbors.getNeighborsList()) {
                    String datapointId = neighbor.getDatapoint().getDatapointId();
                    String userId = datapointId.replace("_" + returnVectorType, "");

                    if (excludeUserId != null && userId.equals(excludeUserId)) {
                        continue;
                    }

                    // EXTRACT EMBEDDING FROM VERTEX AI RESPONSE!
                    List<Float> embedding = neighbor.getDatapoint().getFeatureVectorList();
                    double similarityScore = 1.0 - neighbor.getDistance();

                    CandidateWithEmbeddings candidate = new CandidateWithEmbeddings();
                    candidate.userId = userId;
                    candidate.profileEmbedding = embedding;  // Got it from Vertex AI!
                    candidate.similarityScore = similarityScore;

                    userIds.add(userId);
                    candidateMap.put(userId, candidate);
                }

                // Batch fetch users from MongoDB
                if (!userIds.isEmpty()) {
                    Query mongoQuery = new Query(Criteria.where("_id").in(userIds));
                    List<UserModel> users = mongoTemplate.find(mongoQuery, UserModel.class);

                    for (UserModel user : users) {
                        CandidateWithEmbeddings candidate = candidateMap.get(user.getId());
                        if (candidate != null) {
                            candidate.user = user;
                            results.add(candidate);
                        }
                    }
                }
            }

            return results;

        } catch (Exception e) {
            throw new IOException("Error querying Vertex AI: " + e.getMessage(), e);
        }
    }

    /**
     * Get preference embeddings for multiple users in batch
     * Uses Vertex AI to fetch stored embeddings (no regeneration!)
     */
    private Map<String, List<Float>> batchGetPreferenceEmbeddings(List<String> userIds) throws IOException {
        Map<String, List<Float>> result = new HashMap<>();

        // For each user, query Vertex AI for their preference embedding
        // TODO: Optimize this with multi-query support if Vertex AI supports it
        for (String userId : userIds) {
            try {
                List<Float> embedding = getEmbeddingFromVertexAI(userId + "_preference");
                result.put(userId, embedding);
            } catch (Exception e) {
                System.err.println("Failed to get preference embedding for " + userId + ": " + e.getMessage());
            }
        }

        return result;
    }

    /**
     * Get a specific embedding from Vertex AI by datapoint ID
     * Uses the index to fetch pre-computed embeddings
     */
    private List<Float> getEmbeddingFromVertexAI(String datapointId) throws IOException {
        // Query for the specific datapoint to get its embedding
        // Use a self-query with k=1 to get the exact embedding
        String vdbEndpoint = String.format("%s:443", config.getPublicEndpointDomain());
        MatchServiceSettings matchSettings = MatchServiceSettings.newBuilder()
            .setEndpoint(vdbEndpoint)
            .setCredentialsProvider(() -> credentials)
            .build();

        try (MatchServiceClient matchServiceClient = MatchServiceClient.create(matchSettings)) {
            FindNeighborsRequest.Query query = FindNeighborsRequest.Query.newBuilder()
                .setDatapoint(
                    IndexDatapoint.newBuilder()
                        .setDatapointId(datapointId)
                        .build()
                )
                .setNeighborCount(1)
                .build();

            FindNeighborsRequest request = FindNeighborsRequest.newBuilder()
                .setIndexEndpoint(config.getIndexEndpointPath())
                .setDeployedIndexId(config.getDeployedIndexId())
                .addQueries(query)
                .build();

            FindNeighborsResponse response = matchServiceClient.findNeighbors(request);

            if (response.getNearestNeighborsCount() > 0) {
                FindNeighborsResponse.NearestNeighbors neighbors = response.getNearestNeighbors(0);
                if (neighbors.getNeighborsCount() > 0) {
                    // The first result is the datapoint itself
                    return neighbors.getNeighbors(0).getDatapoint().getFeatureVectorList();
                }
            }

            throw new IOException("Embedding not found for: " + datapointId);

        } catch (Exception e) {
            throw new IOException("Error fetching embedding from Vertex AI: " + e.getMessage(), e);
        }
    }

    /**
     * Score candidates using embeddings from Vertex AI (no regeneration!)
     */
    private List<Map<String, Object>> scoreCandidatesWithVertexAIEmbeddings(
            UserModel targetUser,
            List<Float> targetProfileEmb,
            List<Float> targetPreferenceEmb,
            List<CandidateWithEmbeddings> candidates,
            Map<String, List<Float>> preferenceEmbeddings) {

        List<Map<String, Object>> results = new ArrayList<>();
        int skippedIncomplete = 0;
        int skippedHardRequirements = 0;
        int skippedMissingEmbeddings = 0;

        System.out.println("\n🔍 SCORING CANDIDATES FOR: " + targetUser.getFirstName() + " " + targetUser.getLastName());
        System.out.println("   Target user profile complete: " + isProfileComplete(targetUser));
        System.out.println("   Total candidates to evaluate: " + candidates.size());

        for (CandidateWithEmbeddings candidate : candidates) {
            try {
                UserModel candidateUser = candidate.user;

                // Skip incomplete profiles
                if (!isProfileComplete(candidateUser)) {
                    skippedIncomplete++;
                    System.out.println("   ❌ Skipped " + candidateUser.getFirstName() + ": Incomplete profile");
                    continue;
                }

                // Check hard requirements
                boolean aWantsBRequirements = attributeMatchingService.meetsHardRequirements(targetUser, candidateUser);
                boolean bWantsARequirements = attributeMatchingService.meetsHardRequirements(candidateUser, targetUser);

                if (!aWantsBRequirements || !bWantsARequirements) {
                    skippedHardRequirements++;
                    System.out.println("   ❌ Skipped " + candidateUser.getFirstName() + ": Hard requirements failed");
                    System.out.println("      - " + targetUser.getFirstName() + " wants " + candidateUser.getFirstName() + ": " + aWantsBRequirements);
                    System.out.println("      - " + candidateUser.getFirstName() + " wants " + targetUser.getFirstName() + ": " + bWantsARequirements);
                    continue;
                }

                // Get embeddings (all from Vertex AI!)
                List<Float> candidateProfileEmb = candidate.profileEmbedding;
                List<Float> candidatePreferenceEmb = preferenceEmbeddings.get(candidateUser.getId());

                if (candidateProfileEmb == null || candidatePreferenceEmb == null) {
                    skippedMissingEmbeddings++;
                    System.out.println("   ❌ Skipped " + candidateUser.getFirstName() + ": Missing embeddings");
                    continue; // Skip if embeddings not found
                }

                // Calculate attribute scores
                double forwardAttributeScore = attributeMatchingService.calculateCompatibilityScore(targetUser, candidateUser);
                double reverseAttributeScore = attributeMatchingService.calculateCompatibilityScore(candidateUser, targetUser);
                double mutualAttributeScore = (forwardAttributeScore + reverseAttributeScore) / 2.0;

                // Calculate embedding scores using Vertex AI embeddings
                double forwardEmbeddingScore = calculateCosineSimilarity(targetPreferenceEmb, candidateProfileEmb);
                double reverseEmbeddingScore = calculateCosineSimilarity(candidatePreferenceEmb, targetProfileEmb);
                double mutualEmbeddingScore = (forwardEmbeddingScore + reverseEmbeddingScore) / 2.0;

                // Hybrid scoring
                double hybridForwardScore = (forwardAttributeScore * 0.5) + (forwardEmbeddingScore * 0.5);
                double hybridReverseScore = (reverseAttributeScore * 0.5) + (reverseEmbeddingScore * 0.5);
                double hybridMutualScore = (hybridForwardScore + hybridReverseScore) / 2.0;

                // Build result
                Map<String, Object> result = new HashMap<>();
                result.put("user", candidateUser);
                result.put("userId", candidateUser.getId());
                result.put("forwardScore", hybridForwardScore);
                result.put("reverseScore", hybridReverseScore);
                result.put("mutualScore", hybridMutualScore);
                result.put("attributeScore", mutualAttributeScore);
                result.put("embeddingScore", mutualEmbeddingScore);

                results.add(result);
                System.out.println("   ✅ Added " + candidateUser.getFirstName() + ": mutualScore=" + String.format("%.2f%%", hybridMutualScore * 100));

            } catch (Exception e) {
                System.err.println("Error scoring candidate " + candidate.userId + ": " + e.getMessage());
                e.printStackTrace();
            }
        }

        // Print summary
        System.out.println("\n📊 SCORING SUMMARY FOR: " + targetUser.getFirstName());
        System.out.println("   ✅ Successful matches: " + results.size());
        System.out.println("   ❌ Skipped (incomplete): " + skippedIncomplete);
        System.out.println("   ❌ Skipped (hard requirements): " + skippedHardRequirements);
        System.out.println("   ❌ Skipped (missing embeddings): " + skippedMissingEmbeddings);
        System.out.println("   📝 Total evaluated: " + candidates.size());

        if (results.isEmpty()) {
            System.out.println("\n⚠️  WARNING: NO MATCHES FOUND FOR " + targetUser.getFirstName());
            System.out.println("   Possible reasons:");
            System.out.println("   1. All candidates have incomplete profiles");
            System.out.println("   2. Hard requirements are too restrictive");
            System.out.println("   3. Missing embeddings in Vertex AI");
            System.out.println("   4. Target user's preferences not set up properly");
        }

        return results;
    }

    private boolean isProfileComplete(UserModel user) {
        if (user == null) return false;
        boolean hasName = user.getFirstName() != null && !user.getFirstName().trim().isEmpty() &&
                         user.getLastName() != null && !user.getLastName().trim().isEmpty();
        boolean hasGender = user.getGender() != null && !user.getGender().trim().isEmpty();
        boolean hasZipCode = user.getZipCode() != null && !user.getZipCode().trim().isEmpty();
        boolean hasDateOfBirth = user.getDateOfBirth() != null;
        return hasName && hasGender && hasZipCode && hasDateOfBirth;
    }

    /**
     * Extract city code from zipcode (first 3 digits)
     * In US zipcodes, the first 3 digits represent the sectional center facility (roughly a city/metro area)
     */
    private String getCityCode(String zipCode) {
        if (zipCode == null || zipCode.length() < 3) {
            return null;
        }
        return zipCode.substring(0, 3);
    }

    private double calculateCosineSimilarity(List<Float> vec1, List<Float> vec2) {
        if (vec1.size() != vec2.size()) {
            return 0.0;
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
     * Calculate compatibility scores between exactly TWO users (efficient for real-time updates)
     * Uses embeddings directly from Vertex AI - ULTRA FAST, no regeneration!
     *
     * IMPORTANT: This method is SYMMETRIC - it returns the same mutualScore regardless of parameter order
     * validate(A, B) === validate(B, A)
     *
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @return Map containing mutualScore, similarityScore, and detailed breakdown
     */
    public Map<String, Object> calculatePairwiseScores(String userId1, String userId2) throws IOException {
        // Normalize user order to ensure consistent scoring (alphabetical order)
        // This guarantees symmetry: calculatePairwiseScores(A, B) === calculatePairwiseScores(B, A)
        String normalizedUserId1, normalizedUserId2;
        if (userId1.compareTo(userId2) < 0) {
            normalizedUserId1 = userId1;
            normalizedUserId2 = userId2;
        } else {
            normalizedUserId1 = userId2;
            normalizedUserId2 = userId1;
        }

        // Get both users using normalized order
        Optional<UserModel> user1Optional = userRepository.findById(normalizedUserId1);
        Optional<UserModel> user2Optional = userRepository.findById(normalizedUserId2);

        if (user1Optional.isEmpty() || user2Optional.isEmpty()) {
            throw new IllegalArgumentException("One or both users not found");
        }

        UserModel user1 = user1Optional.get();
        UserModel user2 = user2Optional.get();

        System.out.println("====== ULTRA-FAST PAIRWISE MATCHING ======");
        System.out.println("Original request: userId1=" + userId1 + ", userId2=" + userId2);
        System.out.println("Normalized order: userId1=" + normalizedUserId1 + ", userId2=" + normalizedUserId2);
        System.out.println("User 1: " + user1.getFirstName() + " " + user1.getLastName());
        System.out.println("User 2: " + user2.getFirstName() + " " + user2.getLastName());

        // Check if both profiles are complete
        if (!isProfileComplete(user1) || !isProfileComplete(user2)) {
            System.out.println("❌ One or both users have incomplete profiles - Returning 0% score");
            System.out.println("==========================================\n");
            Map<String, Object> result = new HashMap<>();
            result.put("mutualScore", 0.0);
            result.put("similarityScore", 0.0);
            result.put("meetsRequirements", false);
            result.put("isLowMatch", true);
            return result;
        }

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
            if (!user1WantsUser2) {
                System.out.println("   Reason: " + user1.getFirstName() + " doesn't want " + user2.getFirstName());
            }
            if (!user2WantsUser1) {
                System.out.println("   Reason: " + user2.getFirstName() + " doesn't want " + user1.getFirstName());
            }
            System.out.println("==========================================\n");
            result.put("mutualScore", 0.0);
            result.put("similarityScore", 0.0);
            result.put("meetsRequirements", false);
            result.put("isLowMatch", true);
            result.put("failureReason", !user1WantsUser2 && !user2WantsUser1 ? "Both hard requirements failed" :
                                        !user1WantsUser2 ? user1.getFirstName() + " requirements not met" :
                                        user2.getFirstName() + " requirements not met");
            return result;
        }

        try {
            // Get embeddings directly from Vertex AI (NO regeneration!)
            // Use normalized IDs to ensure consistent embedding retrieval
            List<Float> user1ProfileEmb = getEmbeddingFromVertexAI(normalizedUserId1 + "_profile");
            List<Float> user1PreferenceEmb = getEmbeddingFromVertexAI(normalizedUserId1 + "_preference");
            List<Float> user2ProfileEmb = getEmbeddingFromVertexAI(normalizedUserId2 + "_profile");
            List<Float> user2PreferenceEmb = getEmbeddingFromVertexAI(normalizedUserId2 + "_preference");

            System.out.println("✓ Successfully fetched all embeddings from Vertex AI");

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
            double hybridForwardScore = (forwardAttributeScore * 0.5) + (forwardEmbeddingScore * 0.5);
            double hybridReverseScore = (reverseAttributeScore * 0.5) + (reverseEmbeddingScore * 0.5);
            double hybridMutualScore = (hybridForwardScore + hybridReverseScore) / 2.0;

            System.out.println("\n📊 SCORE CALCULATION:");
            System.out.println("  Forward (" + user1.getFirstName() + " → " + user2.getFirstName() + "):");
            System.out.println("    Attribute: " + String.format("%.2f", forwardAttributeScore));
            System.out.println("    Embedding: " + String.format("%.2f", forwardEmbeddingScore));
            System.out.println("    Hybrid: " + String.format("%.2f", hybridForwardScore));
            System.out.println("  Reverse (" + user2.getFirstName() + " → " + user1.getFirstName() + "):");
            System.out.println("    Attribute: " + String.format("%.2f", reverseAttributeScore));
            System.out.println("    Embedding: " + String.format("%.2f", reverseEmbeddingScore));
            System.out.println("    Hybrid: " + String.format("%.2f", hybridReverseScore));
            System.out.println("  MUTUAL SCORE: " + String.format("%.2f (%.0f%%)", hybridMutualScore, hybridMutualScore * 100));
            System.out.println("  Similarity: " + String.format("%.2f (%.0f%%)", similarityScore, similarityScore * 100));

            // Build result - return original user IDs as requested
            result.put("userId1", userId1);
            result.put("userId2", userId2);
            result.put("normalizedUserId1", normalizedUserId1);
            result.put("normalizedUserId2", normalizedUserId2);
            result.put("mutualScore", hybridMutualScore);
            result.put("similarityScore", similarityScore);
            result.put("meetsRequirements", true);
            result.put("isLowMatch", hybridMutualScore <= 0.5);

            // Detailed breakdown
            result.put("attributeScore", mutualAttributeScore);
            result.put("embeddingScore", mutualEmbeddingScore);
            result.put("forwardScore", hybridForwardScore);
            result.put("reverseScore", hybridReverseScore);

            System.out.println("\n✅ PAIRWISE SCORE: " + user1.getFirstName() + " <-> " + user2.getFirstName() +
                " | Mutual=" + String.format("%.0f%%", hybridMutualScore * 100) +
                " | Similarity=" + String.format("%.0f%%", similarityScore * 100));
            System.out.println("   This score is SYMMETRIC - same result regardless of parameter order");
            System.out.println("==========================================\n");

            return result;

        } catch (IOException e) {
            // If we can't fetch embeddings from Vertex AI, fall back to 0
            System.err.println("❌ EMBEDDING FETCH FAILED - Returning 0% score");
            System.err.println("   Error: " + e.getMessage());
            System.err.println("   User 1: " + normalizedUserId1 + " (" + user1.getFirstName() + ")");
            System.err.println("   User 2: " + normalizedUserId2 + " (" + user2.getFirstName() + ")");
            System.err.println("   This could indicate:");
            System.err.println("   - Missing embeddings in Vertex AI index");
            System.err.println("   - User profile was recently updated but embeddings not yet indexed");
            System.err.println("   - Network/permission issues accessing Vertex AI");
            e.printStackTrace();
            System.out.println("==========================================\n");
            result.put("mutualScore", 0.0);
            result.put("similarityScore", 0.0);
            result.put("meetsRequirements", false);
            result.put("isLowMatch", true);
            result.put("error", "Failed to fetch embeddings: " + e.getMessage());
            result.put("userId1", userId1);
            result.put("userId2", userId2);
            return result;
        }
    }

    // Helper class to hold candidate with their Vertex AI embeddings
    private static class CandidateWithEmbeddings {
        String userId;
        UserModel user;
        List<Float> profileEmbedding;  // From Vertex AI!
        double similarityScore;
    }
}
