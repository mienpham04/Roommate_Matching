package com.roommate.manager.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

@Document("users")
public class UserModel {

    @Id
    private String id; // This will be the Clerk user ID

    private String firstName;
    private String lastName;

    @Indexed(unique = true)
    private String email;

    private LocalDate dateOfBirth;
    private String gender;

    private String profileImageUrl;
    private String zipCode;
    private String moreAboutMe; // Free-form text for additional personal information

    private BudgetModel budget;
    private LifestyleModel lifestyle;
    private PreferenceModel preferences;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime lastUpdatedAt;

    // Getters and Setters

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    // Calculate age from date of birth
    public int getAge() {
        if (dateOfBirth == null) {
            return 0;
        }
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }

    public String getGender() {
        return gender;
    }
    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public String getZipCode() {
        return zipCode;
    }
    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getMoreAboutMe() {
        return moreAboutMe;
    }
    public void setMoreAboutMe(String moreAboutMe) {
        this.moreAboutMe = moreAboutMe;
    }

    public BudgetModel getBudget() {
        return budget;
    }
    public void setBudget(BudgetModel budget) {
        this.budget = budget;
    }

    public LifestyleModel getLifestyle() {
        return lifestyle;
    }
    public void setLifestyle(LifestyleModel lifestyle) {
        this.lifestyle = lifestyle;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public PreferenceModel getPreferences() {
        return preferences;
    }
    public void setPreferences(PreferenceModel preferences) {
        this.preferences = preferences;
    }

    public LocalDateTime getLastUpdatedAt() {
        return lastUpdatedAt;
    }
    public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }
}
