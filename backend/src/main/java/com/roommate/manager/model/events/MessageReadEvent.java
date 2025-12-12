package com.roommate.manager.model.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import java.time.LocalDateTime;
import java.util.List;

public class MessageReadEvent {

    private List<String> messageIds; // Support batch marking as read
    private String conversationId;
    private String userId; // Who marked as read

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime readAt;

    // Default constructor required for Jackson
    public MessageReadEvent() {
        this.readAt = LocalDateTime.now();
    }

    // Parameterized constructor
    public MessageReadEvent(List<String> messageIds, String conversationId, String userId) {
        this.messageIds = messageIds;
        this.conversationId = conversationId;
        this.userId = userId;
        this.readAt = LocalDateTime.now();
    }

    // Getters and Setters

    public List<String> getMessageIds() {
        return messageIds;
    }

    public void setMessageIds(List<String> messageIds) {
        this.messageIds = messageIds;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    @Override
    public String toString() {
        return "MessageReadEvent{" +
                "messageIds=" + messageIds +
                ", conversationId='" + conversationId + '\'' +
                ", userId='" + userId + '\'' +
                ", readAt=" + readAt +
                '}';
    }
}
