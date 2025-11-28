package com.roommate.manager.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.roommate.manager.model.events.MatchScoreEvent;

@Service
public class MatchScoreConsumer {

    @KafkaListener(topics = "match.score.updated", groupId = "notification-service")
    public void handleMatchScoreUpdated(MatchScoreEvent event) {
        System.out.println(
            "Notify user " + event.getUserId() + 
            " -> new score: " + event.getScore()
        );
    }

    
}
