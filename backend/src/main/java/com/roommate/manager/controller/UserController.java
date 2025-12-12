package com.roommate.manager.controller;

import com.roommate.manager.model.UserModel;
import com.roommate.manager.repository.UserRepository;
import com.roommate.manager.service.IndexManagementService;
import com.roommate.manager.kafka.KafkaProducerService;
import com.roommate.manager.model.events.ProfileUpdateEvent;
import com.roommate.manager.model.events.CityUpdateEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IndexManagementService indexManagementService;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    // CREATE
    @PostMapping("/new_user")
    public UserModel createUser(@RequestBody UserModel user) {
        // Validate that Clerk ID is provided
        if (user.getId() == null || user.getId().isEmpty()) {
            throw new IllegalArgumentException("Clerk user ID must be provided as 'id' field.");
        }

        // Check if user with this Clerk ID already exists
        if (userRepository.existsById(user.getId())) {
            throw new IllegalArgumentException("User with ID " + user.getId() + " already exists.");
        }

        // Check for duplicate email
        if (user.getEmail() != null) {
            UserModel existingUser = userRepository.findByEmail(user.getEmail());
            if (existingUser != null) {
                throw new IllegalArgumentException("User with email " + user.getEmail() + " already exists.");
            }
        }

        // Save user to MongoDB (id is already set to Clerk ID)
        UserModel savedUser = userRepository.save(user);

        // Publish city update event
        try {
            CityUpdateEvent event = new CityUpdateEvent(
                savedUser.getId(),
                null,
                savedUser.getCity(),
                "USER_CREATED"
            );
            kafkaProducerService.sendCityUpdateEvent(event);
            System.out.println("Published city update event for new user");
        } catch (Exception e) {
            System.err.println("Warning: Failed to publish city update event: " + e.getMessage());
        }

        // Upload vectors to STREAMING index (supports real-time upsert)
        try {
            indexManagementService.uploadUserToIndex(savedUser);
        } catch (Exception e) {
            System.err.println("Warning: Failed to upload user vector to index: " + e.getMessage());
            // Continue anyway - user is saved in MongoDB
        }

        return savedUser;
    }

    // UPLOAD USER TO INDEX
    @PostMapping("/upload-to-index/{id}")
    public String uploadUserToIndex(@PathVariable String id) {
        Optional<UserModel> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            try {
                indexManagementService.uploadUserToIndex(userOpt.get());
                return "User uploaded to index successfully.";
            } catch (Exception e) {
                return "Failed to upload user to index: " + e.getMessage();
            }
        } else {
            return "User not found.";
        }
    }

    // READ (Get all users)
    @GetMapping
    public List<UserModel> getAllUsers() {
        return userRepository.findAll();
    }

    // READ (Get one user by ID)
    @GetMapping("/{id}")
    public Optional<UserModel> getUserById(@PathVariable String id) {
        return userRepository.findById(id);
    }

    // READ (Get one user by email)
    @GetMapping("/email/{email}")
    public UserModel getUserByEmail(@PathVariable String email) {
        UserModel user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User with email " + email + " not found.");
        }
        return user;
    }

    // UPDATE (Replace entire user)
    @PutMapping("/{id}")
    public UserModel updateUser(@PathVariable String id, @RequestBody UserModel updatedUser) {
        // Fetch old user to check city change
        UserModel oldUser = userRepository.findById(id).orElse(null);
        String oldCity = (oldUser != null) ? oldUser.getCity() : null;

        updatedUser.setId(id);
        UserModel savedUser = userRepository.save(updatedUser);

        // Publish city update event if city changed
        String newCity = savedUser.getCity();
        if (oldCity == null || !oldCity.equals(newCity)) {
            try {
                CityUpdateEvent event = new CityUpdateEvent(
                    id,
                    oldCity,
                    newCity,
                    "USER_UPDATED"
                );
                kafkaProducerService.sendCityUpdateEvent(event);
                System.out.println("Published city update event for user update");
            } catch (Exception e) {
                System.err.println("Warning: Failed to publish city update event: " + e.getMessage());
            }
        }

        // Update vectors in STREAMING index
        try {
            indexManagementService.uploadUserToIndex(savedUser);
        } catch (Exception e) {
            System.err.println("Warning: Failed to update user vector in index: " + e.getMessage());
        }

        // Publish Kafka event for profile update
        try {
            ProfileUpdateEvent event = new ProfileUpdateEvent(id, savedUser.getFirstName(), savedUser.getLastName(), "PROFILE");
            kafkaProducerService.sendProfileUpdated(event);
            System.out.println("Published profile update event for user: " + id);
        } catch (Exception e) {
            System.err.println("Warning: Failed to publish profile update event: " + e.getMessage());
        }

        return savedUser;
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        // Fetch user to get city before deletion
        UserModel user = userRepository.findById(id).orElse(null);
        String city = (user != null) ? user.getCity() : null;

        userRepository.deleteById(id);

        // Publish city update event
        if (city != null) {
            try {
                CityUpdateEvent event = new CityUpdateEvent(
                    id,
                    city,
                    null,
                    "USER_DELETED"
                );
                kafkaProducerService.sendCityUpdateEvent(event);
                System.out.println("Published city update event for user deletion");
            } catch (Exception e) {
                System.err.println("Warning: Failed to publish city update event: " + e.getMessage());
            }
        }

        // Remove vectors from STREAMING index
        try {
            indexManagementService.removeUserFromIndex(id);
        } catch (Exception e) {
            System.err.println("Warning: Failed to remove user vector from index: " + e.getMessage());
        }
    }
}
