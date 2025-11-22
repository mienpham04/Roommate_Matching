package com.roommate.manager.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.roommate.manager.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    // Additional custom queries can go here
    // Example: List<User> findByZipCode(String zipCode);
}

