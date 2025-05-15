package com.classroom.class_backend.dto;

import lombok.Data;
import javax.validation.constraints.NotEmpty;

@Data
public class JoinClassRequest {

    @NotEmpty(message = "Class code is required")
    private String classCode;

    @NotEmpty(message = "User ID is required")
    private String userId;
}