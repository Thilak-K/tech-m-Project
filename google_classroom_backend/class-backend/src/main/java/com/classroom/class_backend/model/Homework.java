package com.classroom.class_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@Document(collection = "homework")
public class Homework {

    @Id
    @Field("_id")
    private String id;

    @Field("classId")
    @NotEmpty(message = "classId is required")
    @Indexed
    private String classId;

    @Field("title")
    @NotEmpty(message = "title is required")
    private String title;

    @Field("description")
    @NotEmpty(message = "description is required")
    private String description;

    @Field("assignedDate")
    @NotNull(message = "assignedDate is required")
    private LocalDateTime assignedDate;

    @Field("dueDate")
    @NotNull(message = "dueDate is required")
    private LocalDateTime dueDate;

    @Field("createdBy")
    @NotEmpty(message = "createdBy is required")
    private String createdBy;

    public Homework() {}

    public Homework(String id, String classId, String title, String description, LocalDateTime assignedDate, LocalDateTime dueDate, String createdBy) {
        this.id = id;
        this.classId = classId;
        this.title = title;
        this.description = description;
        this.assignedDate = assignedDate;
        this.dueDate = dueDate;
        this.createdBy = createdBy;
    }
}