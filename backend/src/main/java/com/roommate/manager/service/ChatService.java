package com.roommate.manager.service;

import com.roommate.manager.model.ConversationModel;
import com.roommate.manager.model.MessageModel;
import com.roommate.manager.repository.ConversationRepository;
import com.roommate.manager.repository.LikeRepository;
import com.roommate.manager.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private LikeRepository likeRepository;

    /**
     * Generate conversation ID from two user IDs (alphabetically sorted)
     */
    public String generateConversationId(String userId1, String userId2) {
        List<String> sorted = Arrays.asList(userId1, userId2);
        Collections.sort(sorted);
        return sorted.get(0) + "_" + sorted.get(1);
    }

    /**
     * Validate that two users are matched (mutual likes exist)
     */
    public boolean areUsersMatched(String userId1, String userId2) {
        boolean like1to2 = likeRepository.existsByFromUserIdAndToUserId(userId1, userId2);
        boolean like2to1 = likeRepository.existsByFromUserIdAndToUserId(userId2, userId1);
        return like1to2 && like2to1;
    }

    /**
     * Get or create conversation between two users
     */
    @Transactional
    public ConversationModel getOrCreateConversation(String userId1, String userId2) {
        String conversationId = generateConversationId(userId1, userId2);

        // Check if conversation exists
        Optional<ConversationModel> existing = conversationRepository.findById(conversationId);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Create new conversation
        List<String> sorted = Arrays.asList(userId1, userId2);
        Collections.sort(sorted);

        ConversationModel conversation = new ConversationModel();
        conversation.setId(conversationId);
        conversation.setUser1Id(sorted.get(0));
        conversation.setUser2Id(sorted.get(1));

        Map<String, Integer> unreadCounts = new HashMap<>();
        unreadCounts.put(userId1, 0);
        unreadCounts.put(userId2, 0);
        conversation.setUnreadCounts(unreadCounts);

        return conversationRepository.save(conversation);
    }

    /**
     * Save message and update conversation metadata
     */
    @Transactional
    public MessageModel saveMessage(MessageModel message) {
        // Save message
        MessageModel savedMessage = messageRepository.save(message);

        // Update conversation
        ConversationModel conversation = conversationRepository.findById(message.getConversationId())
                .orElseThrow(() -> new IllegalStateException("Conversation not found"));

        conversation.setLastMessageContent(message.getContent());
        conversation.setLastMessageTimestamp(message.getTimestamp());
        conversation.setLastMessageSenderId(message.getSenderId());

        // Increment unread count for recipient
        Map<String, Integer> unreadCounts = conversation.getUnreadCounts();
        unreadCounts.put(
                message.getRecipientId(),
                unreadCounts.getOrDefault(message.getRecipientId(), 0) + 1
        );
        conversation.setUnreadCounts(unreadCounts);

        conversationRepository.save(conversation);

        return savedMessage;
    }

    /**
     * Mark messages as read and update conversation unread counts
     */
    @Transactional
    public List<MessageModel> markMessagesAsRead(List<String> messageIds, String userId) {
        List<MessageModel> messages = messageRepository.findAllById(messageIds);
        LocalDateTime readAt = LocalDateTime.now();

        String conversationId = null;
        int markedCount = 0;

        for (MessageModel message : messages) {
            if (!message.isRead() && message.getRecipientId().equals(userId)) {
                message.setRead(true);
                message.setReadAt(readAt);
                conversationId = message.getConversationId();
                markedCount++;
            }
        }

        List<MessageModel> updatedMessages = messageRepository.saveAll(messages);

        // Update conversation unread count
        if (conversationId != null && markedCount > 0) {
            ConversationModel conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new IllegalStateException("Conversation not found"));

            Map<String, Integer> unreadCounts = conversation.getUnreadCounts();
            int currentUnread = unreadCounts.getOrDefault(userId, 0);
            unreadCounts.put(userId, Math.max(0, currentUnread - markedCount));
            conversation.setUnreadCounts(unreadCounts);

            conversationRepository.save(conversation);
        }

        return updatedMessages;
    }

    /**
     * Get unread count for a user across all conversations
     */
    public Map<String, Integer> getUnreadCountsByConversation(String userId) {
        List<ConversationModel> conversations = conversationRepository.findByUserId(userId);
        Map<String, Integer> unreadCounts = new HashMap<>();

        for (ConversationModel conv : conversations) {
            int count = conv.getUnreadCounts().getOrDefault(userId, 0);
            if (count > 0) {
                unreadCounts.put(conv.getId(), count);
            }
        }

        return unreadCounts;
    }
}
