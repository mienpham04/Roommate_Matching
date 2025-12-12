package com.roommate.manager.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document("notifications")
public class NotificationModel {

    @Id
    private String id;

    @Indexed
    private String userId; // Recipient of notification

    @Indexed
    private String type; // LIKE_RECEIVED, NEW_MATCH, UNMATCH

    private String fromUserId; // User who triggered the event
    private String fromUserName; // Cached name for display
    private String fromUserImageUrl; // Cached image

    private boolean read;

    @CreatedDate
    @Indexed(expireAfterSeconds = 2592000) // Auto-delete after 30 days
    private LocalDateTime createdAt;

    // Constructors
    public NotificationModel() {}

    public NotificationModel(String userId, String type, String fromUserId,
                           String fromUserName, String fromUserImageUrl) {
        this.userId = userId;
        this.type = type;
        this.fromUserId = fromUserId;
        this.fromUserName = fromUserName;
        this.fromUserImageUrl = fromUserImageUrl;
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getFromUserId() {
        return fromUserId;
    }

    public void setFromUserId(String fromUserId) {
        this.fromUserId = fromUserId;
    }

    public String getFromUserName() {
        return fromUserName;
    }

    public void setFromUserName(String fromUserName) {
        this.fromUserName = fromUserName;
    }

    public String getFromUserImageUrl() {
        return fromUserImageUrl;
    }

    public void setFromUserImageUrl(String fromUserImageUrl) {
        this.fromUserImageUrl = fromUserImageUrl;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
