package com.roommate.manager.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    @KafkaListener(topics = "user_lifestyle", groupId = "roommate-matching-group")
    public void consumeRoommateEvent(String message) {
        System.out.println("Received message: " + message);
        // Process the message here
    }
}
