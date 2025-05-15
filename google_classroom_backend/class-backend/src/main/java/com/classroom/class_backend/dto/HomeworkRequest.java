package com.classroom.class_backend.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class HomeworkRequest {
    @NotEmpty(message = "classId is required")
    private String classId;

    @NotEmpty(message = "title is required")
    private String title;

    @NotEmpty(message = "description is required")
    private String description;

    @NotNull(message = "dueDate is required")
    private LocalDateTime dueDate;

    @NotEmpty(message = "createdBy is required")
    private String createdBy;

    // Getters and setters remain unchanged
    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
