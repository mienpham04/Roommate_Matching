package com.roommate.manager.repository;

import com.roommate.manager.model.NotificationModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<NotificationModel, String> {

    // Get recent notifications (last 48 hours)
    List<NotificationModel> findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(
        String userId, LocalDateTime since);

    // Get all notifications for user
    List<NotificationModel> findByUserIdOrderByCreatedAtDesc(String userId);

    // Count unread notifications
    long countByUserIdAndReadFalse(String userId);

    // Mark all as read
    List<NotificationModel> findByUserIdAndReadFalse(String userId);
}
