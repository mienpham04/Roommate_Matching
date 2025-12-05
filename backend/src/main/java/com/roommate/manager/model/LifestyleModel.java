package com.roommate.manager.model;

public class LifestyleModel {

    private boolean petFriendly;
    private boolean smoking;
    private String guestFrequency; // "rarely", "often", etc.
    private boolean nightOwl;

    // getters and setters

    public boolean getPetFriendly() {
        return petFriendly;
    }
    public void setPetFriendly(boolean petFriendly) {
        this.petFriendly = petFriendly;
    }

    public boolean getSmoking() {
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

    public boolean getNightOwl() {
        return nightOwl;
    }
    public void setNightOwl(boolean nightOwl) {
        this.nightOwl = nightOwl;
    }
}
