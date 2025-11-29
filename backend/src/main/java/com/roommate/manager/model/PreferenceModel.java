package com.roommate.manager.model;

public class PreferenceModel {

    private boolean petFriendly;
    private boolean smoking;
    private String guestFrequency;
    private boolean isNightOwl;
    private int minAge;
    private int maxAge;
    private String gender;

    // Getters & Setters
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

    public void setNightOwl(boolean nightOwl) {
        isNightOwl = nightOwl;
    }

    public int getMinAge() {
        return minAge;
    }

    public void setMinAge(int minAge) {
        this.minAge = minAge;
    }

    public int getMaxAge() {
        return maxAge;
    }

    public void setMaxAge(int maxAge) {
        this.maxAge = maxAge;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
}
