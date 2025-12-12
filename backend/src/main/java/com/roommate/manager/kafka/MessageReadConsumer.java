package com.roommate.manager.kafka;

import com.roommate.manager.controller.ChatStreamController;
import com.roommate.manager.model.MessageModel;
import com.roommate.manager.model.events.MessageReadEvent;
import com.roommate.manager.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Kafka consumer that listens for message read events
 * and broadcasts read receipts to senders via SSE
 */
@Service
public class MessageReadConsumer {

    @Autowired
    private ChatStreamController chatStreamController;

    @Autowired
    private MessageRepository messageRepository;

    @KafkaListener(topics = "chat.message.read", groupId = "chat-read-receipt-handler")
    public void handleMessageRead(MessageReadEvent event) {
        System.out.println("👀 Received message read event: " + event.getMessageIds().size() + " messages");

        try {
            // Get messages to determine senders
            List<MessageModel> messages = messageRepository.findAllById(event.getMessageIds());

            // Group by sender (in case batch read includes messages from multiple senders)
            Map<String, List<String>> senderToMessageIds = messages.stream()
                    .collect(Collectors.groupingBy(
                            MessageModel::getSenderId,
                            Collectors.mapping(MessageModel::getId, Collectors.toList())
                    ));

            // Broadcast read receipt to each sender
            for (Map.Entry<String, List<String>> entry : senderToMessageIds.entrySet()) {
                String senderId = entry.getKey();
                List<String> messageIds = entry.getValue();

                Map<String, Object> readReceiptData = new HashMap<>();
                readReceiptData.put("conversationId", event.getConversationId());
                readReceiptData.put("messageIds", messageIds);
                readReceiptData.put("readBy", event.getUserId());
                readReceiptData.put("readAt", event.getReadAt().toString());

                chatStreamController.broadcastReadReceipt(senderId, readReceiptData);

                System.out.println("✅ Broadcasted read receipt to sender " + senderId +
                        " for " + messageIds.size() + " messages");
            }

        } catch (Exception e) {
            System.err.println("❌ Error processing message read event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
