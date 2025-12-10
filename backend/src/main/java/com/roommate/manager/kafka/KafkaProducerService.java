package com.roommate.manager.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

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
}
