package com.roommate.manager.controller;

import com.roommate.manager.service.VectorSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    @Autowired
    private VectorSearchService vectorSearchService;

    /**
     * Find similar roommates for a given user using AI embeddings
     * ONE-WAY matching: Only checks if others match what this user wants
     * Example: GET /api/matching/similar/user123?topK=10
     */
    @GetMapping("/similar/{userId}")
    public ResponseEntity<Map<String, Object>> findSimilarRoommates(
            @PathVariable String userId,
            @RequestParam(defaultValue = "3") int topK
    ) {
        try {
            List<Map<String, Object>> matches = vectorSearchService.findSimilarRoommates(userId, topK);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("totalMatches", matches.size());
            response.put("matches", matches);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "User not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Matching failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Find mutual matches using BIDIRECTIONAL scoring
     * Checks BOTH directions:
     * - Does B have what A wants? (A's preferences vs B's profile)
     * - Does A have what B wants? (B's preferences vs A's profile)
     *
     * Returns matches ranked by mutual compatibility score
     * Example: GET /api/matching/mutual/user123?topK=10
     */
    @GetMapping("/mutual/{userId}")
    public ResponseEntity<Map<String, Object>> findMutualMatches(
            @PathVariable String userId,
            @RequestParam(defaultValue = "3") int topK
    ) {
        try {
            List<Map<String, Object>> matches = vectorSearchService.findMutualMatches(userId, topK);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("matchingType", "bidirectional");
            response.put("totalMatches", matches.size());
            response.put("matches", matches);
            response.put("scoreExplanation", Map.of(
                "forwardScore", "How well the match satisfies your preferences",
                "reverseScore", "How well you satisfy the match's preferences",
                "mutualScore", "Average of both scores (mutual compatibility)"
            ));

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "User not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Mutual matching failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Search for roommates using natural language query
     * Example: GET /api/matching/search?query=quiet clean early bird&topK=10
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchByQuery(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int topK
    ) {
        try {
            List<Map<String, Object>> matches = vectorSearchService.searchByQuery(query, topK);

            Map<String, Object> response = new HashMap<>();
            response.put("query", query);
            response.put("totalMatches", matches.size());
            response.put("matches", matches);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Search failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Search with filters and AI similarity
     * Example: POST /api/matching/search/filtered
     * Body: {
     *   "query": "quiet student",
     *   "minBudget": 500,
     *   "maxBudget": 1500,
     *   "zipCode": "02139",
     *   "topK": 10
     * }
     */
    @PostMapping("/search/filtered")
    public ResponseEntity<Map<String, Object>> searchWithFilters(
            @RequestBody Map<String, Object> request
    ) {
        try {
            String query = (String) request.get("query");
            Integer minBudget = request.get("minBudget") != null
                ? ((Number) request.get("minBudget")).intValue()
                : null;
            Integer maxBudget = request.get("maxBudget") != null
                ? ((Number) request.get("maxBudget")).intValue()
                : null;
            String zipCode = (String) request.get("zipCode");
            int topK = request.get("topK") != null
                ? ((Number) request.get("topK")).intValue()
                : 10;

            List<Map<String, Object>> matches = vectorSearchService.searchWithFilters(
                query, minBudget, maxBudget, zipCode, topK
            );

            Map<String, Object> response = new HashMap<>();
            response.put("query", query);
            response.put("filters", Map.of(
                "minBudget", minBudget != null ? minBudget : "none",
                "maxBudget", maxBudget != null ? maxBudget : "none",
                "zipCode", zipCode != null ? zipCode : "none"
            ));
            response.put("totalMatches", matches.size());
            response.put("matches", matches);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Filtered search failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Calculate scores between two specific users (EFFICIENT - no full scan)
     * POST /api/matching/validate
     * Body: { "userId1": "user123", "userId2": "user456" }
     *
     * This is much more efficient than fetching all matches - only compares these 2 users
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateMatch(@RequestBody Map<String, String> request) {
        try {
            String userId1 = request.get("userId1");
            String userId2 = request.get("userId2");

            if (userId1 == null || userId2 == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId1 and userId2 are required"));
            }

            // Use efficient pairwise calculation - only compares these 2 users
            Map<String, Object> scores = vectorSearchService.calculatePairwiseScores(userId1, userId2);

            // Return the scores with validation status
            Map<String, Object> response = new HashMap<>();
            response.put("userId1", userId1);
            response.put("userId2", userId2);
            response.put("mutualScore", scores.get("mutualScore"));
            response.put("similarityScore", scores.get("similarityScore"));
            response.put("isLowMatch", scores.get("isLowMatch"));
            response.put("stillMatches", scores.get("meetsRequirements"));
            response.put("attributeScore", scores.get("attributeScore"));
            response.put("embeddingScore", scores.get("embeddingScore"));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Match validation failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
