package com.roommate.manager.controller;

import com.roommate.manager.model.User;
import com.roommate.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // CREATE
    @PostMapping("/new_user")
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // READ (Get all users)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // READ (Get one user by ID)
    @GetMapping("/{id}")
    public Optional<User> getUserById(@PathVariable String id) {
        return userRepository.findById(id);
    }

    // UPDATE (Replace entire user)
    @PutMapping("/{id}")
    public User updateUser(@PathVariable String id, @RequestBody User updatedUser) {
        updatedUser.setId(id);
        return userRepository.save(updatedUser);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
    }
}
