package com.roommate.manager.repository;

import com.roommate.manager.model.ConversationModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<ConversationModel, String> {

    /**
     * Find all conversations for a specific user (they can be either user1 or user2)
     */
    @Query("{ $or: [ { 'user1Id': ?0 }, { 'user2Id': ?0 } ] }")
    List<ConversationModel> findByUserId(String userId);

    /**
     * Find conversation between two users
     */
    Optional<ConversationModel> findByUser1IdAndUser2Id(String user1Id, String user2Id);
}
