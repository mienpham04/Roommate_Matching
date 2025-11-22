package com.roommate.manager.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "test_collection")
public class TestModel {
    @Id
    private String id;
    private String name;
    public String getId() {
        // TODO Auto-generated method stub
        return id;
    }
    public void setName(String string) {
        this.name = name;
    }
    
}
