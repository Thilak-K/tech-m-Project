package com.classroom.class_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@Data
@Document(collection = "attendance")
public class Attendance {

    @Id
    private String id;

    private String classId;

    private String date;

    private List<AttendanceEntry> attendance;

    public Attendance() {}

    public Attendance(String id, String classId, String date, List<AttendanceEntry> attendance) {
        this.id = id;
        this.classId = classId;
        this.date = date;
        this.attendance = attendance;
    }

    @Data
    public static class AttendanceEntry {

        @JsonProperty("userId")
        private String userId;

        @JsonProperty("present")
        private Boolean present;

        public AttendanceEntry() {}

        public AttendanceEntry(String userId, Boolean present) {
            this.userId = userId;
            this.present = present;
        }
    }
}