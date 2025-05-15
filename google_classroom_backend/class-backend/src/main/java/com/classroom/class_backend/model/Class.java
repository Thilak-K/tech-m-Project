package com.classroom.class_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

@Data
@Document(collection = "classes")
public class Class {

    @Id
    @JsonProperty("classId")
    private String classId;

    private String classCode;

    private String subjectCode;

    private String section;

    private String subject;

    private String teacherName;

    private String userId;

    private LocalDateTime createdAt;

    public Class() {}

    public Class(String classId, String classCode, String subjectCode, String section, String subject, String teacherName, String userId, LocalDateTime createdAt) {
        this.classId = classId;
        this.classCode = classCode;
        this.subjectCode = subjectCode;
        this.section = section;
        this.subject = subject;
        this.teacherName = teacherName;
        this.userId = userId;
        this.createdAt = createdAt;
    }
}