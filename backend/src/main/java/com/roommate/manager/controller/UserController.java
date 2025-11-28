package com.roommate.manager.controller;

import com.roommate.manager.model.UserModel;
import com.roommate.manager.repository.UserRepository;
import com.roommate.manager.service.IndexManagementService;
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

    // CREATE
    @PostMapping("/new_user")
    public UserModel createUser(@RequestBody UserModel user) {
        // Save user to MongoDB
        UserModel savedUser = userRepository.save(user);

        // Upload vector to index (async - don't block on failures)
        try {
            indexManagementService.uploadUserToIndex(savedUser);
        } catch (Exception e) {
            System.err.println("Warning: Failed to upload user vector to index: " + e.getMessage());
            // Continue anyway - user is saved in MongoDB
        }

        return savedUser;
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

    // UPDATE (Replace entire user)
    @PutMapping("/{id}")
    public UserModel updateUser(@PathVariable String id, @RequestBody UserModel updatedUser) {
        updatedUser.setId(id);
        UserModel savedUser = userRepository.save(updatedUser);

        // Update vector in index
        try {
            indexManagementService.uploadUserToIndex(savedUser);
        } catch (Exception e) {
            System.err.println("Warning: Failed to update user vector in index: " + e.getMessage());
        }

        return savedUser;
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);

        // Remove vector from index
        try {
            indexManagementService.removeUserFromIndex(id);
        } catch (Exception e) {
            System.err.println("Warning: Failed to remove user vector from index: " + e.getMessage());
        }
    }
}
