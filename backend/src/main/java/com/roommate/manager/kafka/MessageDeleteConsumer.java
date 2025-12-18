package com.roommate.manager.kafka;

import com.roommate.manager.controller.ChatStreamController;
import com.roommate.manager.model.events.MessageDeleteEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka consumer that listens for message deletion events
 * and broadcasts deletion notifications to both users via SSE
 */
@Service
public class MessageDeleteConsumer {

    @Autowired
    private ChatStreamController chatStreamController;

    @KafkaListener(topics = "chat.message.deleted", groupId = "chat-message-delete-handler")
    public void handleMessageDeleted(MessageDeleteEvent event) {
        System.out.println("🗑️  Received message deletion event: " + event.getMessageId());

        try {
            Map<String, Object> deletionData = new HashMap<>();
            deletionData.put("messageId", event.getMessageId());
            deletionData.put("conversationId", event.getConversationId());
            deletionData.put("deletedBy", event.getDeletedBy());
            deletionData.put("deletedAt", event.getDeletedAt().toString());

            // Broadcast to all users in the conversation
            // The ChatStreamController will send to all connected clients
            // Frontend will filter by conversationId
            chatStreamController.broadcastMessageDeleted(event.getConversationId(), deletionData);

            System.out.println("✅ Broadcasted message deletion for message " + event.getMessageId());

        } catch (Exception e) {
            System.err.println("❌ Error processing message deletion event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
