package com.roommate.manager.model;

/**
 * Represents what a user wants in their potential roommate
 */
public class PreferenceModel {

    private Boolean petFriendly;
    private Boolean smoking;
    private String guestFrequency; // e.g., "I prefer roommates who rarely have guests"
    private Boolean isNightOwl;
    private Integer minAge;
    private Integer maxAge;
    private String gender; // Preferred gender or "no preference"

    // Getters and Setters

    public Boolean getPetFriendly() {
        return petFriendly;
    }
    public void setPetFriendly(Boolean petFriendly) {
        this.petFriendly = petFriendly;
    }

    public Boolean getSmoking() {
        return smoking;
    }
    public void setSmoking(Boolean smoking) {
        this.smoking = smoking;
    }

    public String getGuestFrequency() {
        return guestFrequency;
    }
    public void setGuestFrequency(String guestFrequency) {
        this.guestFrequency = guestFrequency;
    }

    public Boolean getIsNightOwl() {
        return isNightOwl;
    }
    public void setIsNightOwl(Boolean nightOwl) {
        isNightOwl = nightOwl;
    }

    public Integer getMinAge() {
        return minAge;
    }
    public void setMinAge(Integer minAge) {
        this.minAge = minAge;
    }

    public Integer getMaxAge() {
        return maxAge;
    }
    public void setMaxAge(Integer maxAge) {
        this.maxAge = maxAge;
    }

    public String getGender() {
        return gender;
    }
    public void setGender(String gender) {
        this.gender = gender;
    }
}
