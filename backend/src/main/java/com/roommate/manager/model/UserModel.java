package com.roommate.manager.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document("users")
public class UserModel {

    @Id
    private String id;

    private String firstName;
    private String lastName;
    private String email;

    private int age;
    private String gender;

    private String profileImageUrl;
    private String zipCode;

    private BudgetModel budget;
    private LifestyleModel lifestyle;

    private LocalDateTime createdAt;

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

    public int getAge() {
        return age;
    }
    public void setAge(int age) {
        this.age = age;
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
}
