package com.roommate.manager.model;

public class LifestyleModel {

    private boolean petFriendly;
    private boolean smoking;
    private String guestFrequency; // "rarely", "often", etc.
    private boolean isNightOwl;

    // getters and setters

    public boolean isPetFriendly() {
        return petFriendly;
    }
    public void setPetFriendly(boolean petFriendly) {
        this.petFriendly = petFriendly;
    }

    public boolean isSmoking() {
        return smoking;
    }
    public void setSmoking(boolean smoking) {
        this.smoking = smoking;
    }

    public String getGuestFrequency() {
        return guestFrequency;
    }
    public void setGuestFrequency(String guestFrequency) {
        this.guestFrequency = guestFrequency;
    }

    public boolean isNightOwl() {
        return isNightOwl;
    }
    public void setIsNightOwl(boolean nightOwl) {
        isNightOwl = nightOwl;
    }
}
