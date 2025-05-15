package com.classroom.class_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "user")
public class User {

    @Id
    private String id;

    private String email;

    private String password;

    private String name;

    private String role;

    private String section;

    private Integer rollNumber;

    public User() {}

    public User(String id, String name, String email, String password, String role, String section, Integer rollNumber) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.section = section;
        this.rollNumber = rollNumber;
    }
}