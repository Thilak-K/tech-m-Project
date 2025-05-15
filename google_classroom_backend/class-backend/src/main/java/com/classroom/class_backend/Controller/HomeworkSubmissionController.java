package com.classroom.class_backend.Controller;

import com.classroom.class_backend.dto.ErrorResponse;
import com.classroom.class_backend.dto.SuccessResponse;
import com.classroom.class_backend.model.HomeworkSubmission;
import com.classroom.class_backend.service.HomeworkSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/homework/submissions")
@CrossOrigin(origins = "http://localhost:3000")
public class HomeworkSubmissionController {

    @Autowired
    private HomeworkSubmissionService submissionService;

    // Submit a new homework submission
    @PostMapping
    public ResponseEntity<?> submitHomework(@RequestBody HomeworkSubmission submission) {
        try {
            HomeworkSubmission savedSubmission = submissionService.submitHomework(submission);
            return ResponseEntity.status(201).body(new SuccessResponse("Homework submitted successfully!", savedSubmission));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to save submission: " + e.getMessage()));
        }
    }

    // Update an existing homework submission
    @PutMapping("/{homeworkId}/{userId}")
    public ResponseEntity<?> updateHomeworkSubmission(
            @PathVariable String homeworkId,
            @PathVariable String userId,
            @RequestBody HomeworkSubmission submission) {
        try {
            submission.setHomeworkId(homeworkId);
            submission.setUserId(userId);
            HomeworkSubmission updatedSubmission = submissionService.updateHomeworkSubmission(submission);
            return ResponseEntity.ok(new SuccessResponse("Homework updated successfully!", updatedSubmission));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to update submission: " + e.getMessage()));
        }
    }

    // Get all submissions for a class
    @GetMapping("/class/{classId}")
    public ResponseEntity<?> getSubmissionsByClassId(@PathVariable String classId) {
        try {
            List<HomeworkSubmission> submissions = submissionService.getSubmissionsByClassId(classId);
            return ResponseEntity.ok(new SuccessResponse("Submissions fetched successfully", submissions));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to fetch submissions: " + e.getMessage()));
        }
    }

    // Get submissions for a specific user in a class
    @GetMapping("/class/{classId}/user/{userId}")
    public ResponseEntity<?> getSubmissionsByClassIdAndUserId(@PathVariable String classId, @PathVariable String userId) {
        try {
            List<HomeworkSubmission> submissions = submissionService.getSubmissionsByClassIdAndUserId(classId, userId);
            return ResponseEntity.ok(new SuccessResponse("Submissions fetched successfully", submissions));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to fetch submissions: " + e.getMessage()));
        }
    }
}