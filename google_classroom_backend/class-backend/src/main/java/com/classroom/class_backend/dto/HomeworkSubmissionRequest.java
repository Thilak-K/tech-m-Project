package com.classroom.class_backend.dto;

import lombok.Data;
import javax.validation.constraints.NotEmpty;

@Data
public class HomeworkSubmissionRequest {

    @NotEmpty(message = "Homework ID is required")
    private String homeworkId;

    @NotEmpty(message = "Class ID is required")
    private String classId;

    @NotEmpty(message = "User ID is required")
    private String userId;

    @NotEmpty(message = "Google Drive URL is required")
    private String driveLink;
}