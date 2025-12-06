package com.roommate.manager.model.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import java.time.LocalDateTime;

public class ProfileUpdateEvent {

    private String userId;
    private String updateType; // "PROFILE" or "PREFERENCE"

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    public ProfileUpdateEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public ProfileUpdateEvent(String userId, String updateType) {
        this.userId = userId;
        this.updateType = updateType;
        this.timestamp = LocalDateTime.now();
    }

    // Getters
    public String getUserId() {
        return userId;
    }

    public String getUpdateType() {
        return updateType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    // Setters
    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setUpdateType(String updateType) {
        this.updateType = updateType;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ProfileUpdateEvent{" +
                "userId='" + userId + '\'' +
                ", updateType='" + updateType + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
