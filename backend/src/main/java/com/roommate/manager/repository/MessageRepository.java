package com.roommate.manager.repository;

import com.roommate.manager.model.MessageModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<MessageModel, String> {

    /**
     * Get message history for a conversation (sorted by timestamp ascending)
     */
    List<MessageModel> findByConversationIdOrderByTimestampAsc(String conversationId);

    /**
     * Count unread messages for a specific user in a conversation
     */
    @Query("{ 'conversationId': ?0, 'recipientId': ?1, 'isRead': false }")
    long countUnreadMessages(String conversationId, String recipientId);

    /**
     * Get all unread messages for a user in a conversation
     */
    List<MessageModel> findByConversationIdAndRecipientIdAndIsReadFalse(String conversationId, String recipientId);

    /**
     * Get latest message in conversation
     */
    MessageModel findFirstByConversationIdOrderByTimestampDesc(String conversationId);
}
