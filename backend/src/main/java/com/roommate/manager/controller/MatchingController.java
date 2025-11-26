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
     * Example: GET /api/matching/similar/user123?topK=10
     */
    @GetMapping("/similar/{userId}")
    public ResponseEntity<Map<String, Object>> findSimilarRoommates(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") int topK
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
}
