package com.roommate.manager.repository;

import com.roommate.manager.model.LikeModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends MongoRepository<LikeModel, String> {

    // Find a like from one user to another
    Optional<LikeModel> findByFromUserIdAndToUserId(String fromUserId, String toUserId);

    // Find all likes sent by a user
    List<LikeModel> findByFromUserId(String fromUserId);

    // Find all likes received by a user
    List<LikeModel> findByToUserId(String toUserId);

    // Check if a like exists
    boolean existsByFromUserIdAndToUserId(String fromUserId, String toUserId);

    // Delete a like
    void deleteByFromUserIdAndToUserId(String fromUserId, String toUserId);
}
