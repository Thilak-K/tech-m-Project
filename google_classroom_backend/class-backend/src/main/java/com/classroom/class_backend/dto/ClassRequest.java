package com.classroom.class_backend.dto;

import lombok.Data;
import javax.validation.constraints.NotEmpty;

@Data
public class ClassRequest {

    @NotEmpty(message = "Class ID is required")
    private String classId;

    @NotEmpty(message = "Class code is required")
    private String classCode;

    @NotEmpty(message = "Subject code is required")
    private String subjectCode;

    @NotEmpty(message = "Section is required")
    private String section;

    @NotEmpty(message = "Subject is required")
    private String subject;

    @NotEmpty(message = "Teacher name is required")
    private String teacherName;

    @NotEmpty(message = "User ID is required")
    private String userId;
}