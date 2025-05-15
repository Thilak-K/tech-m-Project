package com.classroom.class_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "homework_submissions")
public class HomeworkSubmission {

    @Id
    private String id;

    private String homeworkId;

    private String classId;

    private String userId;

    private String driveLink;

    private LocalDateTime submittedOn;

    private String status;

    public HomeworkSubmission() {}

    public HomeworkSubmission(String id, String homeworkId, String classId, String userId, String driveLink, LocalDateTime submittedOn, String status) {
        this.id = id;
        this.homeworkId = homeworkId;
        this.classId = classId;
        this.userId = userId;
        this.driveLink = driveLink;
        this.submittedOn = submittedOn;
        this.status = status;
    }
}