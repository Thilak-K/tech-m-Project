package com.classroom.class_backend.Controller;

import com.classroom.class_backend.dto.ErrorResponse;
import com.classroom.class_backend.dto.SuccessResponse;
import com.classroom.class_backend.model.Class;
import com.classroom.class_backend.model.Homework;
import com.classroom.class_backend.service.ClassService;
import com.classroom.class_backend.service.HomeworkService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/homework")
@CrossOrigin(origins = "http://localhost:3000")
public class HomeworkController {

    private static final Logger LOGGER = LoggerFactory.getLogger(HomeworkController.class);

    @Autowired
    private ClassService classService;

    @Autowired
    private HomeworkService homeworkService;

    @PostMapping
    public ResponseEntity<?> createHomework(@Valid @RequestBody HomeworkRequest homeworkRequest) {
        try {
            LOGGER.info("Received request to create homework for classId: {}", homeworkRequest.getClassId());
            LOGGER.debug("Homework request payload: classId={}, title={}, description={}, dueDate={}, createdBy={}",
                    homeworkRequest.getClassId(), homeworkRequest.getTitle(), homeworkRequest.getDescription(),
                    homeworkRequest.getDueDate(), homeworkRequest.getCreatedBy());

            // Validate class existence
            Class classObj = classService.getClassById(homeworkRequest.getClassId());
            if (classObj == null) {
                LOGGER.warn("Class not found for classId: {}", homeworkRequest.getClassId());
                return ResponseEntity.badRequest().body(new ErrorResponse("Class not found."));
            }

            // Validate due date (must be in the future)
            if (homeworkRequest.getDueDate().isBefore(LocalDateTime.now(ZoneId.of("Asia/Kolkata")))) {
                LOGGER.warn("Due date is in the past: {}", homeworkRequest.getDueDate());
                return ResponseEntity.badRequest().body(new ErrorResponse("Due date must be in the future."));
            }

            // Validate createdBy (already handled by @NotEmpty in HomeworkRequest)
            // Create homework object
            Homework homework = new Homework();
            homework.setClassId(homeworkRequest.getClassId());
            homework.setTitle(homeworkRequest.getTitle());
            homework.setDescription(homeworkRequest.getDescription());
            homework.setAssignedDate(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
            homework.setDueDate(homeworkRequest.getDueDate());
            homework.setCreatedBy(homeworkRequest.getCreatedBy());
            Homework createdHomework = homeworkService.createHomework(homework);

            LOGGER.info("Homework created successfully with ID: {}", createdHomework.getId());
            SuccessResponse response = new SuccessResponse("Homework created successfully.", createdHomework);
            return ResponseEntity.status(201).body(response); // 201 Created
        } catch (IllegalArgumentException e) {
            LOGGER.error("Validation error while creating homework: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            LOGGER.error("Failed to create homework. Error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<?> getHomeworkByClassId(@PathVariable String classId) {
        try {
            LOGGER.info("Fetching homework for classId: {}", classId);
            List<Homework> homeworkList = homeworkService.getHomeworkByClassId(classId);
            LOGGER.info("Found {} homework assignments for classId: {}", homeworkList.size(), classId);
            SuccessResponse response = new SuccessResponse("Homework fetched successfully.", homeworkList);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            LOGGER.error("Validation error while fetching homework for classId: {}. Error: {}", classId, e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            LOGGER.error("Failed to fetch homework for classId: {}. Error: {}", classId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/{homeworkId}")
    public ResponseEntity<?> getHomeworkById(@PathVariable String homeworkId) {
        try {
            LOGGER.info("Fetching homework details for homeworkId: {}", homeworkId);
            Homework homework = homeworkService.getHomeworkById(homeworkId);
            return ResponseEntity.ok(new SuccessResponse("Homework retrieved successfully!", homework));
        } catch (IllegalArgumentException e) {
            LOGGER.error("Homework not found for homeworkId: {}. Error: {}", homeworkId, e.getMessage());
            return ResponseEntity.status(404).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            LOGGER.error("Failed to fetch homework for homeworkId: {}. Error: {}", homeworkId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{homeworkId}")
    public ResponseEntity<?> deleteHomework(@PathVariable String homeworkId, @RequestHeader("userId") String userId) {
        try {
            LOGGER.info("Received request to delete homework with ID: {} by userId: {}", homeworkId, userId);

            // Validate userId
            if (userId == null || userId.isEmpty()) {
                LOGGER.warn("User ID is required for deleting homework.");
                return ResponseEntity.status(401).body(new ErrorResponse("User ID is required."));
            }

            // Fetch the homework
            Homework homework = homeworkService.getHomeworkById(homeworkId);

            // Authorization check: Ensure the user deleting the homework is the creator
            if (!homework.getCreatedBy().equals(userId)) {
                LOGGER.warn("User {} is not authorized to delete homework with ID: {}", userId, homeworkId);
                return ResponseEntity.status(403).body(new ErrorResponse("You are not authorized to delete this homework."));
            }

            // Delete the homework
            homeworkService.deleteHomework(homeworkId);
            LOGGER.info("Homework with ID: {} deleted successfully by userId: {}", homeworkId, userId);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (IllegalArgumentException e) {
            LOGGER.error("Failed to delete homework with ID: {}. Error: {}", homeworkId, e.getMessage());
            return ResponseEntity.status(404).body(new ErrorResponse("Homework not found: " + e.getMessage()));
        } catch (Exception e) {
            LOGGER.error("Failed to delete homework with ID: {}. Error: {}", homeworkId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }
}

class HomeworkRequest {
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