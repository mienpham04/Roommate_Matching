package com.roommate.manager.model.events;

import java.util.Map;

public class PreferenceUpdateEvent {

    private String userId;
    private Map<String, Object> preferences;

    public PreferenceUpdateEvent() {
    }

    public PreferenceUpdateEvent(String userId, Map<String, Object> preferences) {
        this.userId = userId;
        this.preferences = preferences;
    }

    // Getters
    public String getUserId() {
        return userId;
    }

    public Map<String, Object> getPreferences() {
        return preferences;
    }

    // Setters
    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setPreferences(Map<String, Object> preferences) {
        this.preferences = preferences;
    }

    @Override
    public String toString() {
        return "PreferenceUpdateEvent{" +
                "userId='" + userId + '\'' +
                ", preferences=" + preferences +
                '}';
    }
}
