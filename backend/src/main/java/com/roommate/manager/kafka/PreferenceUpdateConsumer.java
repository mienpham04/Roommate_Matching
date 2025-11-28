package com.roommate.manager.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.roommate.manager.model.events.MatchScoreEvent;
import com.roommate.manager.model.events.PreferenceUpdateEvent;

@Service
public class PreferenceUpdateConsumer {

    private final KafkaProducerService producer;

    public PreferenceUpdateConsumer(KafkaProducerService producer) {
        this.producer = producer;
    }

    @KafkaListener(topics = "preferences.updated", groupId = "matching-engine")
    public void handlePreferenceUpdate(PreferenceUpdateEvent event) {

        System.out.println("Matching Engine received: " + event);

        double score = computeMatch(event);

        MatchScoreEvent scoreEvent = new MatchScoreEvent(event.getUserId(), score);
        producer.sendMatchScoreUpdated(scoreEvent);
    }

    private double computeMatch(PreferenceUpdateEvent event) {
        return Math.random();
    }
}
