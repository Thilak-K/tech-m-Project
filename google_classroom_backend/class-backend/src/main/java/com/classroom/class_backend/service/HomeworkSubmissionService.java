package com.classroom.class_backend.service;

import com.classroom.class_backend.model.Homework;
import com.classroom.class_backend.model.HomeworkSubmission;
import com.classroom.class_backend.repository.HomeworkRepository;
import com.classroom.class_backend.repository.HomeworkSubmissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class HomeworkSubmissionService {

    private static final Logger LOGGER = LoggerFactory.getLogger(HomeworkSubmissionService.class);

    @Autowired
    private HomeworkSubmissionRepository submissionRepository;

    @Autowired
    private HomeworkRepository homeworkRepository;

    public HomeworkSubmission submitHomework(HomeworkSubmission submission) {
        LOGGER.info("Submitting homework for homeworkId: {}, userId: {}", submission.getHomeworkId(),
                submission.getUserId());

        validateSubmission(submission);

        Homework homework = homeworkRepository.findById(submission.getHomeworkId())
                .orElseThrow(() -> new IllegalArgumentException("Homework not found."));

        if (!homework.getClassId().equals(submission.getClassId())) {
            throw new IllegalArgumentException("Class ID does not match the homework's class.");
        }

        LocalDateTime dueDate = homework.getDueDate();
        LocalDateTime currentDate = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
        if (dueDate.isBefore(currentDate)) {
            throw new IllegalArgumentException("Cannot submit homework after the due date.");
        }

        if (submissionRepository.existsByHomeworkIdAndUserId(submission.getHomeworkId(), submission.getUserId())) {
            throw new IllegalArgumentException(
                    "You have already submitted this homework. Use reupload to update your submission.");
        }

        submission.setId(UUID.randomUUID().toString());
        submission.setSubmittedOn(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
        submission.setStatus("SUBMITTED");

        HomeworkSubmission savedSubmission = submissionRepository.save(submission);
        LOGGER.info("Homework submission saved successfully with ID: {}", savedSubmission.getId());
        return savedSubmission;
    }

    public HomeworkSubmission updateHomeworkSubmission(HomeworkSubmission submission) {
        LOGGER.info("Updating homework submission for homeworkId: {}, userId: {}", submission.getHomeworkId(),
                submission.getUserId());

        validateSubmission(submission);

        Homework homework = homeworkRepository.findById(submission.getHomeworkId())
                .orElseThrow(() -> new IllegalArgumentException("Homework not found."));

        if (!homework.getClassId().equals(submission.getClassId())) {
            throw new IllegalArgumentException("Class ID does not match the homework's class.");
        }

        LocalDateTime dueDate = homework.getDueDate();
        LocalDateTime currentDate = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
        if (dueDate.isBefore(currentDate)) {
            throw new IllegalArgumentException("Cannot reupload homework after the due date.");
        }

        Optional<HomeworkSubmission> existingSubmission = submissionRepository
                .findByClassIdAndUserId(submission.getClassId(), submission.getUserId())
                .stream()
                .filter(s -> s.getHomeworkId().equals(submission.getHomeworkId()))
                .findFirst();

        if (!existingSubmission.isPresent()) {
            throw new IllegalArgumentException("No submission found to update. Please submit the homework first.");
        }

        HomeworkSubmission updatedSubmission = existingSubmission.get();
        updatedSubmission.setDriveLink(submission.getDriveLink());
        updatedSubmission.setSubmittedOn(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
        updatedSubmission.setStatus("SUBMITTED");

        HomeworkSubmission savedSubmission = submissionRepository.save(updatedSubmission);
        LOGGER.info("Homework submission updated successfully with ID: {}", savedSubmission.getId());
        return savedSubmission;
    }

    public List<HomeworkSubmission> getSubmissionsByClassId(String classId) {
        LOGGER.info("Fetching submissions for classId: {}", classId);
        if (classId == null || classId.isEmpty()) {
            throw new IllegalArgumentException("Class ID is required.");
        }
        return submissionRepository.findByClassId(classId);
    }

    public List<HomeworkSubmission> getSubmissionsByClassIdAndUserId(String classId, String userId) {
        LOGGER.info("Fetching submissions for classId: {}, userId: {}", classId, userId);
        if (classId == null || classId.isEmpty()) {
            throw new IllegalArgumentException("Class ID is required.");
        }
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("User ID is required.");
        }
        return submissionRepository.findByClassIdAndUserId(classId, userId);
    }

    private void validateSubmission(HomeworkSubmission submission) {
        if (submission.getHomeworkId() == null || submission.getHomeworkId().isEmpty()) {
            throw new IllegalArgumentException("Homework ID is required.");
        }
        if (submission.getClassId() == null || submission.getClassId().isEmpty()) {
            throw new IllegalArgumentException("Class ID is required.");
        }
        if (submission.getUserId() == null || submission.getUserId().isEmpty()) {
            throw new IllegalArgumentException("User ID is required.");
        }
        if (submission.getDriveLink() == null || submission.getDriveLink().isEmpty()) {
            throw new IllegalArgumentException("Google Drive link is required.");
        }
    }
}