package com.roommate.manager.service;

import com.roommate.manager.model.UserModel;
import com.roommate.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VectorSearchService {

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Find similar roommates based on a user's profile using AI embeddings
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

        // Generate embedding for target user
        List<Float> targetEmbedding = embeddingService.generateEmbedding(targetUser);

        // Get all other users and calculate similarity
        List<UserModel> allUsers = userRepository.findAll();

        List<Map<String, Object>> rankedUsers = new ArrayList<>();

        for (UserModel candidate : allUsers) {
            // Skip the target user
            if (candidate.getId().equals(userId)) {
                continue;
            }

            try {
                // Generate embedding for candidate
                List<Float> candidateEmbedding = embeddingService.generateEmbedding(candidate);

                // Calculate similarity
                double similarity = embeddingService.cosineSimilarity(targetEmbedding, candidateEmbedding);

                Map<String, Object> result = new HashMap<>();
                result.put("user", candidate);
                result.put("similarityScore", similarity);
                result.put("userId", candidate.getId());

                rankedUsers.add(result);

            } catch (Exception e) {
                // Skip users that fail embedding generation
                System.err.println("Failed to generate embedding for user: " + candidate.getId());
            }
        }

        // Sort by similarity score (descending) and return top K
        return rankedUsers.stream()
            .sorted((a, b) -> Double.compare(
                (Double) b.get("similarityScore"),
                (Double) a.get("similarityScore")
            ))
            .limit(topK)
            .collect(Collectors.toList());
    }

    /**
     * Find roommates matching a natural language query
     * @param query Natural language description (e.g., "quiet, clean, early bird")
     * @param topK Number of matches to return
     * @return List of matching users with similarity scores
     */
    public List<Map<String, Object>> searchByQuery(String query, int topK) throws IOException {
        // Generate embedding for the query
        List<Float> queryEmbedding = embeddingService.generateEmbeddingFromText(query);

        // Get all users and calculate similarity
        List<UserModel> allUsers = userRepository.findAll();

        List<Map<String, Object>> rankedUsers = new ArrayList<>();

        for (UserModel candidate : allUsers) {
            try {
                // Generate embedding for candidate
                List<Float> candidateEmbedding = embeddingService.generateEmbedding(candidate);

                // Calculate similarity
                double similarity = embeddingService.cosineSimilarity(queryEmbedding, candidateEmbedding);

                Map<String, Object> result = new HashMap<>();
                result.put("user", candidate);
                result.put("similarityScore", similarity);
                result.put("userId", candidate.getId());
                result.put("description", embeddingService.userProfileToText(candidate));

                rankedUsers.add(result);

            } catch (Exception e) {
                System.err.println("Failed to generate embedding for user: " + candidate.getId());
            }
        }

        // Sort by similarity score (descending) and return top K
        return rankedUsers.stream()
            .sorted((a, b) -> Double.compare(
                (Double) b.get("similarityScore"),
                (Double) a.get("similarityScore")
            ))
            .limit(topK)
            .collect(Collectors.toList());
    }

    /**
     * Search with filters (budget, location, etc.) and vector similarity
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
        // Generate embedding for the query
        List<Float> queryEmbedding = embeddingService.generateEmbeddingFromText(query);

        // Get all users
        List<UserModel> allUsers = userRepository.findAll();

        // Apply filters
        List<UserModel> filteredUsers = allUsers.stream()
            .filter(user -> {
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
            .toList();

        // Calculate similarity for filtered users
        List<Map<String, Object>> rankedUsers = new ArrayList<>();

        for (UserModel candidate : filteredUsers) {
            try {
                List<Float> candidateEmbedding = embeddingService.generateEmbedding(candidate);
                double similarity = embeddingService.cosineSimilarity(queryEmbedding, candidateEmbedding);

                Map<String, Object> result = new HashMap<>();
                result.put("user", candidate);
                result.put("similarityScore", similarity);
                result.put("userId", candidate.getId());
                result.put("description", embeddingService.userProfileToText(candidate));

                rankedUsers.add(result);

            } catch (Exception e) {
                System.err.println("Failed to generate embedding for user: " + candidate.getId());
            }
        }

        return rankedUsers.stream()
            .sorted((a, b) -> Double.compare(
                (Double) b.get("similarityScore"),
                (Double) a.get("similarityScore")
            ))
            .limit(topK)
            .collect(Collectors.toList());
    }
}
