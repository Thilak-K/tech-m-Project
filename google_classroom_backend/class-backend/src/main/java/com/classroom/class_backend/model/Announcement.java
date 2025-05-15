package com.classroom.class_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@Document(collection = "announcements")
public class Announcement {

    @Id
    @Field("_id")
    private String id;

    @Field("classId")
    @NotEmpty(message = "classId is required")
    private String classId;

    @Field("title")
    @NotEmpty(message = "title is required")
    private String title;

    @Field("description")
    @NotEmpty(message = "description is required")
    private String description;

    @Field("createdAt")
    @NotNull(message = "createdAt is required")
    private LocalDateTime createdAt;

    @Field("createdBy")
    @NotEmpty(message = "createdBy is required")
    private String createdBy;

    public Announcement() {}

    public Announcement(String id, String classId, String title, String description, LocalDateTime createdAt, String createdBy) {
        this.id = id;
        this.classId = classId;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
    }
}