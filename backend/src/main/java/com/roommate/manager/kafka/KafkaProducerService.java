package com.roommate.manager.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.roommate.manager.model.events.ProfileUpdateEvent;
import com.roommate.manager.model.events.LikeEvent;
import com.roommate.manager.model.events.CityUpdateEvent;

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
     * Send like event to Kafka
     */
    public void sendLikeEvent(LikeEvent event) {
        kafkaTemplate.send("notifications.like", event.getFromUserId(), event);
    }

    /**
     * Send city update event to Kafka
     */
    public void sendCityUpdateEvent(CityUpdateEvent event) {
        kafkaTemplate.send("city.updates", event.getUserId(), event);
    }
}
