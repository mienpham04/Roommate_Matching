package com.roommate.manager.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.roommate.manager.model.UserModel;

public interface UserRepository extends MongoRepository<UserModel, String> {
    // Additional custom queries can go here
    // Example: List<User> findByZipCode(String zipCode);
}

