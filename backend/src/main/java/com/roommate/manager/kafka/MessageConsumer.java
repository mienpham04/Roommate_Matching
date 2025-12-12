package com.roommate.manager.kafka;

import com.roommate.manager.controller.ChatStreamController;
import com.roommate.manager.model.events.MessageEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka consumer that listens for new chat messages
 * and broadcasts them to recipients via SSE
 */
@Service
public class MessageConsumer {

    @Autowired
    private ChatStreamController chatStreamController;

    @KafkaListener(topics = "chat.message.sent", groupId = "chat-message-handler")
    public void handleNewMessage(MessageEvent event) {
        System.out.println("📨 Received new message event: " + event.getMessageId());

        try {
            // Prepare message data for SSE
            Map<String, Object> messageData = new HashMap<>();
            messageData.put("messageId", event.getMessageId());
            messageData.put("conversationId", event.getConversationId());
            messageData.put("senderId", event.getSenderId());
            messageData.put("recipientId", event.getRecipientId());
            messageData.put("content", event.getContent());
            messageData.put("timestamp", event.getTimestamp().toString());
            messageData.put("isRead", false);

            // Broadcast to recipient only
            chatStreamController.broadcastNewMessage(event.getRecipientId(), messageData);

            System.out.println("✅ Successfully broadcasted message " + event.getMessageId() +
                    " to recipient " + event.getRecipientId());

        } catch (Exception e) {
            System.err.println("❌ Error processing new message event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
