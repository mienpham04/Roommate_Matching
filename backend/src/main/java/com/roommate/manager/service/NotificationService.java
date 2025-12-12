package com.roommate.manager.service;

import com.roommate.manager.model.NotificationModel;
import com.roommate.manager.model.UserModel;
import com.roommate.manager.repository.NotificationRepository;
import com.roommate.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Create and broadcast notification via WebSocket
     */
    public void createNotification(String userId, String type, String fromUserId) {
        // Fetch from user details for caching
        UserModel fromUser = userRepository.findById(fromUserId).orElse(null);
        if (fromUser == null) {
            System.err.println("Cannot create notification - fromUser not found: " + fromUserId);
            return;
        }

        String fromUserName = fromUser.getFirstName() + " " + fromUser.getLastName();
        String fromUserImageUrl = fromUser.getProfileImageUrl();

        // Save to database
        NotificationModel notification = new NotificationModel(
            userId, type, fromUserId, fromUserName, fromUserImageUrl
        );
        notification = notificationRepository.save(notification);

        // Broadcast via WebSocket to specific user
        messagingTemplate.convertAndSendToUser(
            userId,
            "/notifications",
            notification
        );

        System.out.println("Created and broadcasted notification: " + type +
                         " to user " + userId + " from " + fromUserId);
    }

    /**
     * Get recent notifications (last 48 hours)
     */
    public List<NotificationModel> getRecentNotifications(String userId) {
        LocalDateTime since = LocalDateTime.now().minusHours(48);
        return notificationRepository.findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, since);
    }

    /**
     * Get all notification history
     */
    public List<NotificationModel> getAllNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Mark notification as read
     */
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(String userId) {
        List<NotificationModel> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    /**
     * Get unread count
     */
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }
}