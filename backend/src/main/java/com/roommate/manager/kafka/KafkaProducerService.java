package com.roommate.manager.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.roommate.manager.model.events.MatchScoreEvent;
import com.roommate.manager.model.events.PreferenceUpdateEvent;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendMessage(String topic, String key, Object message) {
        kafkaTemplate.send(topic, key, message);
    }

    public void sendMessage(String topic, Object message) {
        kafkaTemplate.send(topic, message);
    }

    public void sendPreferenceUpdated(PreferenceUpdateEvent event) {
        kafkaTemplate.send("preferences.updated", event.getUserId(), event);
    }

    public void sendMatchScoreUpdated(MatchScoreEvent event) {
        kafkaTemplate.send("match.score.updated", event.getUserId(), event);
    }
}
