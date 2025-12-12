package com.roommate.manager.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.roommate.manager.model.events.MessageEvent;
import com.roommate.manager.model.events.MessageReadEvent;
import com.roommate.manager.model.events.ProfileUpdateEvent;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Send profile update event to Kafka
     * Used for both PROFILE and PREFERENCE updates
     */
    public void sendProfileUpdated(ProfileUpdateEvent event) {
        kafkaTemplate.send("profile.updated", event.getUserId(), event);
    }

    /**
     * Send chat message event to Kafka
     */
    public void sendChatMessage(MessageEvent event) {
        kafkaTemplate.send("chat.message.sent", event.getConversationId(), event);
        System.out.println("📤 Published message event to Kafka: " + event.getMessageId());
    }

    /**
     * Send message read receipt event to Kafka
     */
    public void sendMessageReadReceipt(MessageReadEvent event) {
        kafkaTemplate.send("chat.message.read", event.getConversationId(), event);
        System.out.println("📤 Published read receipt event to Kafka: " + event.getMessageIds().size() + " messages");
    }
}
