package com.roommate.manager.controller;

import com.roommate.manager.model.UserModel;
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
    public UserModel createUser(@RequestBody UserModel user) {
        return userRepository.save(user);
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
        return userRepository.save(updatedUser);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
    }
}
