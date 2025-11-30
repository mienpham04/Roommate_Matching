package com.roommate.manager.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.roommate.manager.model.UserModel;

public interface UserRepository extends MongoRepository<UserModel, String> {
    // Find user by email (for duplicate checking)
    UserModel findByEmail(String email);
}

