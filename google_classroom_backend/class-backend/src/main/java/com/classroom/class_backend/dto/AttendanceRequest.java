package com.classroom.class_backend.dto;

import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.util.List;

@Data
public class AttendanceRequest {

    @NotEmpty(message = "classId is required")
    private String classId;

    @NotEmpty(message = "date is required")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "date must be in YYYY-MM-DD format")
    private String date;

    @NotNull(message = "attendance list is required")
    private List<AttendanceEntry> attendance;

    @Data
    public static class AttendanceEntry {

        @NotEmpty(message = "userId is required")
        private String userId;

        @NotNull(message = "present status is required")
        private Boolean present;
    }
}