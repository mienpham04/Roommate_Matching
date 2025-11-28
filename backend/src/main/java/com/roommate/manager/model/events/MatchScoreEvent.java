package com.roommate.manager.model.events;

public class MatchScoreEvent {

    private String userId;
    private double score;

    public MatchScoreEvent() {
    }

    public MatchScoreEvent(String userId, double score) {
        this.userId = userId;
        this.score = score;
    }

    // Getters
    public String getUserId() {
        return userId;
    }

    public double getScore() {
        return score;
    }

    // Setters
    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setScore(double score) {
        this.score = score;
    }

    @Override
    public String toString() {
        return "MatchScoreEvent{" +
                "userId='" + userId + '\'' +
                ", score=" + score +
                '}';
    }
}
