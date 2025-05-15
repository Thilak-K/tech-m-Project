package com.classroom.class_backend.dto;

import lombok.Data;
import javax.validation.constraints.NotEmpty;

@Data
public class LeaveClassRequest {

    @NotEmpty(message = "Class ID is required")
    private String classId;

    @NotEmpty(message = "User ID is required")
    private String userId;
}