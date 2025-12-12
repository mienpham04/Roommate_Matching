package com.roommate.manager.model.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import java.time.LocalDateTime;

public class CityUpdateEvent {
    private String userId;
    private String oldCity; // null for new users
    private String newCity;
    private String eventType; // USER_CREATED, USER_UPDATED, USER_DELETED

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    public CityUpdateEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public CityUpdateEvent(String userId, String oldCity, String newCity, String eventType) {
        this.userId = userId;
        this.oldCity = oldCity;
        this.newCity = newCity;
        this.eventType = eventType;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getOldCity() {
        return oldCity;
    }

    public void setOldCity(String oldCity) {
        this.oldCity = oldCity;
    }

    public String getNewCity() {
        return newCity;
    }

    public void setNewCity(String newCity) {
        this.newCity = newCity;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
