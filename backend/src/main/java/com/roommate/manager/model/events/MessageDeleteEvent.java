package com.roommate.manager.model.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import java.time.LocalDateTime;

public class MessageDeleteEvent {

    private String messageId;
    private String conversationId;
    private String deletedBy; // User ID who deleted the message

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime deletedAt;

    // Default constructor required for Jackson
    public MessageDeleteEvent() {
        this.deletedAt = LocalDateTime.now();
    }

    // Parameterized constructor
    public MessageDeleteEvent(String messageId, String conversationId, String deletedBy) {
        this.messageId = messageId;
        this.conversationId = conversationId;
        this.deletedBy = deletedBy;
        this.deletedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getDeletedBy() {
        return deletedBy;
    }

    public void setDeletedBy(String deletedBy) {
        this.deletedBy = deletedBy;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    @Override
    public String toString() {
        return "MessageDeleteEvent{" +
                "messageId='" + messageId + '\'' +
                ", conversationId='" + conversationId + '\'' +
                ", deletedBy='" + deletedBy + '\'' +
                ", deletedAt=" + deletedAt +
                '}';
    }
}
