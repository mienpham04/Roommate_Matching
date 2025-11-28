package com.roommate.manager.controller;

import com.roommate.manager.model.UserModel;
import com.roommate.manager.repository.UserRepository;
import com.roommate.manager.service.IndexManagementService;
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
}
