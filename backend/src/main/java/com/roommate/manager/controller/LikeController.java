package com.roommate.manager.controller;

import com.roommate.manager.model.LikeModel;
import com.roommate.manager.model.UserModel;
import com.roommate.manager.model.events.LikeEvent;
import com.roommate.manager.repository.LikeRepository;
import com.roommate.manager.repository.UserRepository;
import com.roommate.manager.kafka.KafkaProducerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    /**
     * Send a like/heart from one user to another
     * POST /api/likes
     * Body: { "fromUserId": "user123", "toUserId": "user456" }
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> sendLike(@RequestBody Map<String, String> request) {
        try {
            String fromUserId = request.get("fromUserId");
            String toUserId = request.get("toUserId");

            if (fromUserId == null || toUserId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "fromUserId and toUserId are required"));
            }

            if (fromUserId.equals(toUserId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot like yourself"));
            }

            // Check if like already exists
            if (likeRepository.existsByFromUserIdAndToUserId(fromUserId, toUserId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Like already exists"));
            }

            // Create and save like
            LikeModel like = new LikeModel(fromUserId, toUserId);
            likeRepository.save(like);

            // Check if it's a mutual like
            boolean isMutual = likeRepository.existsByFromUserIdAndToUserId(toUserId, fromUserId);

            // Publish Kafka event
            try {
                String eventType = isMutual ? "MATCH_CREATED" : "LIKE_SENT";
                LikeEvent event = new LikeEvent(fromUserId, toUserId, eventType);
                kafkaProducerService.sendLikeEvent(event);
                System.out.println("Published like event: " + eventType);
            } catch (Exception e) {
                System.err.println("Warning: Failed to publish like event: " + e.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isMutual", isMutual);
            response.put("message", isMutual ? "It's a match!" : "Like sent successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send like", "message", e.getMessage()));
        }
    }

    /**
     * Remove a like
     * DELETE /api/likes
     * Body: { "fromUserId": "user123", "toUserId": "user456" }
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> removeLike(@RequestBody Map<String, String> request) {
        try {
            String fromUserId = request.get("fromUserId");
            String toUserId = request.get("toUserId");

            if (fromUserId == null || toUserId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "fromUserId and toUserId are required"));
            }

            likeRepository.deleteByFromUserIdAndToUserId(fromUserId, toUserId);

            return ResponseEntity.ok(Map.of("success", true, "message", "Like removed successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to remove like", "message", e.getMessage()));
        }
    }

    /**
     * Get all users that the current user has liked
     * GET /api/likes/sent/{userId}
     */
    @GetMapping("/sent/{userId}")
    public ResponseEntity<Map<String, Object>> getSentLikes(@PathVariable String userId) {
        try {
            List<LikeModel> likes = likeRepository.findByFromUserId(userId);
            List<String> likedUserIds = likes.stream()
                    .map(LikeModel::getToUserId)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "likedUserIds", likedUserIds,
                "count", likedUserIds.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to get sent likes", "message", e.getMessage()));
        }
    }

    /**
     * Get all users who liked the current user
     * GET /api/likes/received/{userId}
     */
    @GetMapping("/received/{userId}")
    public ResponseEntity<Map<String, Object>> getReceivedLikes(@PathVariable String userId) {
        try {
            List<LikeModel> likes = likeRepository.findByToUserId(userId);
            List<String> likerIds = likes.stream()
                    .map(LikeModel::getFromUserId)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "likerIds", likerIds,
                "count", likerIds.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to get received likes", "message", e.getMessage()));
        }
    }

    /**
     * Get mutual matches (users who both liked each other)
     * GET /api/likes/mutual/{userId}
     */
    @GetMapping("/mutual/{userId}")
    public ResponseEntity<Map<String, Object>> getMutualMatches(@PathVariable String userId) {
        try {
            // Get all users that this user liked
            List<LikeModel> sentLikes = likeRepository.findByFromUserId(userId);
            Set<String> likedUserIds = sentLikes.stream()
                    .map(LikeModel::getToUserId)
                    .collect(Collectors.toSet());

            // Get all users who liked this user
            List<LikeModel> receivedLikes = likeRepository.findByToUserId(userId);
            Set<String> likerIds = receivedLikes.stream()
                    .map(LikeModel::getFromUserId)
                    .collect(Collectors.toSet());

            // Find intersection (mutual likes)
            Set<String> mutualMatchIds = new HashSet<>(likedUserIds);
            mutualMatchIds.retainAll(likerIds);

            // Fetch user details for mutual matches
            List<UserModel> mutualMatchUsers = new ArrayList<>();
            for (String matchId : mutualMatchIds) {
                userRepository.findById(matchId).ifPresent(mutualMatchUsers::add);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "mutualMatches", mutualMatchUsers,
                "count", mutualMatchUsers.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to get mutual matches", "message", e.getMessage()));
        }
    }

    /**
     * Check if user A liked user B
     * GET /api/likes/check/{fromUserId}/{toUserId}
     */
    @GetMapping("/check/{fromUserId}/{toUserId}")
    public ResponseEntity<Map<String, Object>> checkLike(
            @PathVariable String fromUserId,
            @PathVariable String toUserId) {
        try {
            boolean liked = likeRepository.existsByFromUserIdAndToUserId(fromUserId, toUserId);
            boolean mutual = liked && likeRepository.existsByFromUserIdAndToUserId(toUserId, fromUserId);

            return ResponseEntity.ok(Map.of(
                "liked", liked,
                "mutual", mutual
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to check like", "message", e.getMessage()));
        }
    }

    /**
     * Unmatch two users (remove both likes in both directions)
     * DELETE /api/likes/unmatch
     * Body: { "userId1": "user123", "userId2": "user456" }
     */
    @DeleteMapping("/unmatch")
    public ResponseEntity<Map<String, Object>> unmatch(@RequestBody Map<String, String> request) {
        try {
            String userId1 = request.get("userId1");
            String userId2 = request.get("userId2");

            if (userId1 == null || userId2 == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId1 and userId2 are required"));
            }

            // Delete both directions of the like
            likeRepository.deleteByFromUserIdAndToUserId(userId1, userId2);
            likeRepository.deleteByFromUserIdAndToUserId(userId2, userId1);

            // Publish Kafka event
            try {
                LikeEvent event = new LikeEvent(userId1, userId2, "UNMATCH");
                kafkaProducerService.sendLikeEvent(event);
                System.out.println("Published unmatch event");
            } catch (Exception e) {
                System.err.println("Warning: Failed to publish unmatch event: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully unmatched"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to unmatch", "message", e.getMessage()));
        }
    }
}
