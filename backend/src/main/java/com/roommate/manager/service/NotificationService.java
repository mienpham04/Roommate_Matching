package com.roommate.manager.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    private static final int MATCH_THRESHOLD = 75; // Customize your threshold

    @KafkaListener(topics = "match.score.updated", groupId = "notification-service")
    public void listenMatchScore(Map<String, Object> event) {
        System.out.println("🔔 NotificationService received score event: " + event);

        String userId = (String) event.get("userId");
        Integer score = (Integer) event.get("score");

        if (score == null) {
            System.out.println("⚠️  Missing score field in event.");
            return;
        }

        // Only notify when the score is high enough
        if (score < MATCH_THRESHOLD) {
            System.out.println("ℹ️ Score too low, no notification sent.");
            return;
        }

        // Build a rich notification event
        Map<String, Object> notificationEvent = new HashMap<>();
        notificationEvent.put("userId", userId);
        notificationEvent.put("message", "🎉 You have a new compatible roommate match!");
        notificationEvent.put("score", score);
        notificationEvent.put("timestamp", System.currentTimeMillis());

        // Send to notification topic
        kafkaTemplate.send("notifications.new_match", userId, notificationEvent);

        System.out.println("📤 NotificationService published notifications.new_match → " + notificationEvent);
    }
}