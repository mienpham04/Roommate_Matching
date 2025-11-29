package com.roommate.manager.controller;

import com.roommate.manager.model.UserModel;
import com.roommate.manager.repository.UserRepository;
import com.roommate.manager.service.IndexManagementService;
import com.roommate.manager.service.EmbeddingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for managing Vector Search index operations
 */
@RestController
@RequestMapping("/api/index")
public class IndexController {

    @Autowired
    private IndexManagementService indexManagementService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmbeddingService embeddingService;

    /**
     * Batch upload all existing users to the Vector Search index
     * Example: POST /api/index/batch-upload
     */
    @PostMapping("/batch-upload")
    public ResponseEntity<Map<String, Object>> batchUploadUsers() {
        try {
            // Get all users from MongoDB
            List<UserModel> allUsers = userRepository.findAll();

            if (allUsers.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "No users found to upload");
                response.put("totalUsers", 0);
                response.put("uploadedCount", 0);
                return ResponseEntity.ok(response);
            }

            // Upload all users to the index
            int uploadedCount = indexManagementService.batchUploadUsers(allUsers);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Batch upload completed");
            response.put("totalUsers", allUsers.size());
            response.put("uploadedCount", uploadedCount);
            response.put("failedCount", allUsers.size() - uploadedCount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Batch upload failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Upload a specific user to the index by ID
     * Example: POST /api/index/upload/user123
     */
    @PostMapping("/upload/{userId}")
    public ResponseEntity<Map<String, Object>> uploadUser(@PathVariable String userId) {
        try {
            UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

            indexManagementService.uploadUserToIndex(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User vector uploaded successfully");
            response.put("userId", userId);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "User not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Upload failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Remove a specific user from the index by ID
     * Example: DELETE /api/index/remove/user123
     */
    @DeleteMapping("/remove/{userId}")
    public ResponseEntity<Map<String, Object>> removeUser(@PathVariable String userId) {
        try {
            indexManagementService.removeUserFromIndex(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User vector removed successfully");
            response.put("userId", userId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Removal failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Test query to verify vectors exist in the index
     * Queries for nearest neighbors using a random user's profile
     * Example: GET /api/index/test-query?userId=user123&count=10
     */
    @GetMapping("/test-query")
    public ResponseEntity<Map<String, Object>> testQuery(
            @RequestParam(required = false) String userId,
            @RequestParam(defaultValue = "10") int count) {
        try {
            // If userId not provided, get a random user
            UserModel testUser;
            if (userId != null && !userId.isEmpty()) {
                testUser = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
            } else {
                List<UserModel> allUsers = userRepository.findAll();
                if (allUsers.isEmpty()) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "No users in database");
                    errorResponse.put("message", "Please add users first");
                    return ResponseEntity.status(404).body(errorResponse);
                }
                testUser = allUsers.get(0); // Use first user
            }

            // Generate profile embedding for this user
            List<Float> testVector = embeddingService.generateProfileEmbedding(testUser);

            // Query the index
            List<String> neighbors = indexManagementService.queryIndex(testVector, count);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Query successful");
            response.put("queryUserId", testUser.getId());
            response.put("queryUserName", testUser.getFirstName() + " " + testUser.getLastName());
            response.put("nearestNeighbors", neighbors);
            response.put("neighborCount", neighbors.size());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "User not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Query failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
