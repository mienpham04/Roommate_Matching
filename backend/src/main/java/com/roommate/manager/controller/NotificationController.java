package com.roommate.manager.controller;

import com.roommate.manager.model.NotificationModel;
import com.roommate.manager.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(originPatterns = "*", allowCredentials = "false")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Get recent notifications for user (last 48 hours)
     */
    @GetMapping("/recent/{userId}")
    public ResponseEntity<Map<String, Object>> getRecentNotifications(@PathVariable String userId) {
        try {
            List<NotificationModel> notifications = notificationService.getRecentNotifications(userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "notifications", notifications,
                "count", notifications.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to fetch notifications",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get all notification history
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<Map<String, Object>> getNotificationHistory(@PathVariable String userId) {
        try {
            List<NotificationModel> notifications = notificationService.getAllNotifications(userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "notifications", notifications,
                "count", notifications.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to fetch notification history",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@PathVariable String userId) {
        try {
            long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "unreadCount", count
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to get unread count",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/mark-read/{notificationId}")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable String notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notification marked as read"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to mark notification as read",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/mark-all-read/{userId}")
    public ResponseEntity<Map<String, Object>> markAllAsRead(@PathVariable String userId) {
        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "All notifications marked as read"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to mark all as read",
                "message", e.getMessage()
            ));
        }
    }
}
