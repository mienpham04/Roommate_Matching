package com.roommate.manager.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.roommate.manager.model.UserModel;
import com.roommate.manager.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
public class ClerkWebhookController {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ClerkWebhookController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/clerk")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload);

            String eventType = root.path("type").asText();     // "user.created"
            JsonNode data = root.path("data");                 // user object

            String clerkUserId = data.path("id").asText();     // This will be your Mongo _id

            switch (eventType) {
                case "user.created":
                case "user.updated":
                    upsertUserFromClerk(clerkUserId, data);
                    break;
                case "user.deleted":
                    userRepository.deleteById(clerkUserId);
                    break;
                default:
                    break;
            }

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body("Invalid payload");
        }
    }

    private void upsertUserFromClerk(String id, JsonNode data) {
        UserModel user = userRepository.findById(id).orElseGet(UserModel::new);

        if (user.getId() == null) user.setId(id);

        user.setFirstName(data.path("first_name").asText(null));
        user.setLastName(data.path("last_name").asText(null));

        // email
        String primaryEmailId = data.path("primary_email_address_id").asText(null);
        String email = null;
        if (primaryEmailId != null) {
            for (JsonNode emailNode : data.withArray("email_addresses")) {
                if (primaryEmailId.equals(emailNode.path("id").asText())) {
                    email = emailNode.path("email_address").asText();
                }
            }
        }
        user.setEmail(email);

        // image
        String image = data.path("image_url").asText(null);
        user.setProfileImageUrl(image);

        // Do NOT overwrite user-side fields:
        // zipCode, lifestyle, preferences, budget, moreAboutMe

        userRepository.save(user);
    }
}
