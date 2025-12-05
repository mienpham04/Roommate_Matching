package com.roommate.manager.model;

/**
 * Represents what a user wants in their potential roommate
 */
public class PreferenceModel {

    private Boolean petFriendly;
    private Boolean smoking;
    private String guestFrequency; // e.g., "I prefer roommates who rarely have guests"
    private Boolean nightOwl;
    private Integer minAge;
    private Integer maxAge;
    private String gender; // Preferred gender or "no preference"
    private String moreAboutRoommate; // Free-form text for additional roommate preferences

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

    public Boolean isNightOwl() {
        return nightOwl;
    }
    public void setNightOwl(Boolean nightOwl) {
        this.nightOwl = nightOwl;
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

    public String getMoreAboutRoommate() {
        return moreAboutRoommate;
    }
    public void setMoreAboutRoommate(String moreAboutRoommate) {
        this.moreAboutRoommate = moreAboutRoommate;
    }
}
