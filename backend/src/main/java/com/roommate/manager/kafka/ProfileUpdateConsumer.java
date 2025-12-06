package com.roommate.manager.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.roommate.manager.model.events.ProfileUpdateEvent;
import com.roommate.manager.model.UserModel;
import com.roommate.manager.repository.UserRepository;
import com.roommate.manager.service.IndexManagementService;

/**
 * Kafka consumer that listens for profile/preference update events
 * and triggers matching score recalculation by updating the vector index
 */
@Service
public class ProfileUpdateConsumer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IndexManagementService indexManagementService;

    @KafkaListener(topics = "profile.updated", groupId = "profile-update-handler")
    public void handleProfileUpdate(ProfileUpdateEvent event) {
        System.out.println("Received profile update event: " + event);

        try {
            String userId = event.getUserId();

            // Fetch the updated user from database
            UserModel user = userRepository.findById(userId).orElse(null);

            if (user == null) {
                System.err.println("User not found for profile update event: " + userId);
                return;
            }

            // Update the vector index with new embeddings
            // This will recalculate matching scores in real-time
            indexManagementService.uploadUserToIndex(user);

            System.out.println("Successfully updated vector index for user: " + userId +
                             " (update type: " + event.getUpdateType() + ")");

        } catch (Exception e) {
            System.err.println("Error processing profile update event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
