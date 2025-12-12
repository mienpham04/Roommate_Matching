package com.roommate.manager.kafka;

import com.roommate.manager.model.events.LikeEvent;
import com.roommate.manager.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationConsumer {

    @Autowired
    private NotificationService notificationService;

    @KafkaListener(topics = "notifications.like", groupId = "notification-handler")
    public void handleLikeEvent(LikeEvent event) {
        System.out.println("Received like event: " + event.getEventType() +
                         " from " + event.getFromUserId() + " to " + event.getToUserId());

        switch (event.getEventType()) {
            case "LIKE_SENT":
                // Create LIKE_RECEIVED notification for toUser
                notificationService.createNotification(
                    event.getToUserId(),
                    "LIKE_RECEIVED",
                    event.getFromUserId()
                );
                break;

            case "MATCH_CREATED":
                // Create NEW_MATCH notification for both users
                notificationService.createNotification(
                    event.getToUserId(),
                    "NEW_MATCH",
                    event.getFromUserId()
                );
                notificationService.createNotification(
                    event.getFromUserId(),
                    "NEW_MATCH",
                    event.getToUserId()
                );
                break;

            case "UNMATCH":
                // Create UNMATCH notification for both users
                notificationService.createNotification(
                    event.getToUserId(),
                    "UNMATCH",
                    event.getFromUserId()
                );
                notificationService.createNotification(
                    event.getFromUserId(),
                    "UNMATCH",
                    event.getToUserId()
                );
                break;

            default:
                System.err.println("Unknown like event type: " + event.getEventType());
        }
    }
}
