package com.classroom.class_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "class_members")
public class ClassMember {

    @Id
    private String id;

    private String classId;

    private String userId;

    private LocalDateTime joinedAt;

    public ClassMember() {}

    public ClassMember(String classId, String userId, LocalDateTime joinedAt) {
        this.classId = classId;
        this.userId = userId;
        this.joinedAt = joinedAt;
    }
}