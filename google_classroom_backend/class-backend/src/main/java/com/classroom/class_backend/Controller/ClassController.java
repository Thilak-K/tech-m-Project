package com.classroom.class_backend.Controller;

import com.classroom.class_backend.dto.ErrorResponse;
import com.classroom.class_backend.dto.SuccessResponse;
import com.classroom.class_backend.dto.ClassRequest;
import com.classroom.class_backend.dto.JoinClassRequest;
import com.classroom.class_backend.dto.LeaveClassRequest;
import com.classroom.class_backend.dto.HomeworkSubmissionRequest;
import com.classroom.class_backend.model.Class;
import com.classroom.class_backend.model.ClassMember;
import com.classroom.class_backend.model.HomeworkSubmission;
import com.classroom.class_backend.model.User;
import com.classroom.class_backend.service.ClassService;
import com.classroom.class_backend.service.UserService;
import com.classroom.class_backend.repository.ClassMemberRepository;
import com.classroom.class_backend.repository.HomeworkSubmissionRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "http://localhost:3000")
public class ClassController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ClassController.class);

    @Autowired
    private ClassService classService;

    @Autowired
    private ClassMemberRepository classMemberRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private HomeworkSubmissionRepository homeworkSubmissionRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createClass(@Valid @RequestBody ClassRequest classRequest) {
        try {
            LOGGER.info("Create class request received for classId: {}, classCode: {}, userId: {}",
                    classRequest.getClassId(), classRequest.getClassCode(), classRequest.getUserId());

            // Check user role
            User user = userService.getUserById(classRequest.getUserId());
            if (user == null) {
                LOGGER.warn("User with ID {} not found.", classRequest.getUserId());
                return ResponseEntity.badRequest().body(new ErrorResponse("User not found."));
            }
            if (!"teacher".equalsIgnoreCase(user.getRole())) {
                LOGGER.warn("User {} is not authorized to create a class. Role: {}", classRequest.getUserId(),
                        user.getRole());
                return ResponseEntity.status(403).body(new ErrorResponse("Only teachers can create classes."));
            }

            Class classEntity = new Class(
                    classRequest.getClassId(),
                    classRequest.getClassCode(),
                    classRequest.getSubjectCode(),
                    classRequest.getSection(),
                    classRequest.getSubject(),
                    classRequest.getTeacherName(),
                    classRequest.getUserId(),
                    null);

            // Save the class using ClassService
            Class savedClass = classService.createClass(classEntity);
            LOGGER.info("Class created successfully with ID: {} and Code: {}",
                    savedClass.getClassId(), savedClass.getClassCode());
            return ResponseEntity.ok(new SuccessResponse("Class created successfully!", savedClass));
        } catch (IllegalArgumentException e) {
            LOGGER.error("Validation error while creating class: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            LOGGER.error("Create class failed. Error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getClassesByUserId(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false, defaultValue = "created") String type) {
        try {
            if (userId == null || userId.trim().isEmpty()) {
                LOGGER.error("User ID is required to fetch classes.");
                return ResponseEntity.badRequest().body(new ErrorResponse("User ID is required."));
            }
            List<Class> classes;
            if ("created".equalsIgnoreCase(type)) {
                LOGGER.info("Fetching classes created by user: {}", userId);
                classes = classService.getClassesByUserId(userId);
            } else if ("joined".equalsIgnoreCase(type)) {
                LOGGER.info("Fetching classes joined by user: {}", userId);
                classes = classService.getJoinedClassesByUserId(userId);
            } else {
                LOGGER.warn("Invalid type parameter: {}. Must be 'created' or 'joined'.", type);
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Invalid type parameter. Must be 'created' or 'joined'."));
            }
            return ResponseEntity.ok(new SuccessResponse("Classes retrieved successfully!", classes));
        } catch (Exception e) {
            LOGGER.error("Failed to fetch classes for user: {}. Error: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/{classId}")
    public ResponseEntity<?> getClassById(@PathVariable String classId) {
        try {
            LOGGER.info("Fetching class details for classId: {}", classId);
            Class classObj = classService.getClassById(classId);
            if (classObj == null) {
                return ResponseEntity.status(404).body(new ErrorResponse("Class not found."));
            }
            return ResponseEntity.ok(new SuccessResponse("Class retrieved successfully!", classObj));
        } catch (Exception e) {
            LOGGER.error("Failed to fetch class details for classId: {}. Error: {}", classId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{classId}")
    public ResponseEntity<?> deleteClass(@PathVariable String classId, @RequestParam String userId) {
        try {
            LOGGER.info("Delete class request received for classId: {} by userId: {}", classId, userId);
            if (userId == null || userId.trim().isEmpty()) {
                LOGGER.warn("User ID is required to delete a class.");
                return ResponseEntity.badRequest().body(new ErrorResponse("User ID is required."));
            }
            Class classObj = classService.getClassById(classId);
            if (classObj == null) {
                LOGGER.warn("Class with ID {} not found.", classId);
                return ResponseEntity.status(404).body(new ErrorResponse("Class not found."));
            }
            if (!classObj.getUserId().equals(userId)) {
                LOGGER.warn("User {} is not authorized to delete class {}", userId, classId);
                return ResponseEntity.status(403)
                        .body(new ErrorResponse("You are not authorized to delete this class."));
            }
            classService.deleteClass(classId);
            LOGGER.info("Class with ID {} deleted successfully by user {}", classId, userId);
            return ResponseEntity.ok(new SuccessResponse("Class deleted successfully!", null));
        } catch (Exception e) {
            LOGGER.error("Failed to delete class with ID: {}. Error: {}", classId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinClass(@Valid @RequestBody JoinClassRequest joinRequest) {
        try {
            String classCode = joinRequest.getClassCode();
            String userId = joinRequest.getUserId();
            LOGGER.info("Join class request received for classCode: {} by userId: {}", classCode, userId);

            Class classObj = classService.getClassByCode(classCode);
            if (classObj == null) {
                LOGGER.warn("Class with code {} not found.", classCode);
                return ResponseEntity.status(404).body(new ErrorResponse("Class not found."));
            }

            if (classObj.getUserId().equals(userId)) {
                LOGGER.warn("User {} is the creator of class {} and cannot join it.", userId, classObj.getClassId());
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("You are the creator of this class and cannot join it."));
            }

            if (classMemberRepository.existsByClassIdAndUserId(classObj.getClassId(), userId)) {
                LOGGER.warn("User {} is already a member of class {}.", userId, classObj.getClassId());
                return ResponseEntity.badRequest().body(new ErrorResponse("You are already a member of this class."));
            }

            ClassMember classMember = new ClassMember(classObj.getClassId(), userId,
                    LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
            classMemberRepository.save(classMember);
            LOGGER.info("User {} successfully joined class {}", userId, classObj.getClassId());
            return ResponseEntity.ok(new SuccessResponse("Successfully joined the class!", classObj));
        } catch (Exception e) {
            LOGGER.error("Failed to join class. Error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/leave")
    public ResponseEntity<?> leaveClass(@Valid @RequestBody LeaveClassRequest leaveRequest) {
        try {
            String classId = leaveRequest.getClassId();
            String userId = leaveRequest.getUserId();
            LOGGER.info("Leave class request received for classId: {} by userId: {}", classId, userId);

            // Check if the class exists
            Class classObj = classService.getClassById(classId);
            if (classObj == null) {
                LOGGER.warn("Class with ID {} not found.", classId);
                return ResponseEntity.status(404).body(new ErrorResponse("Class not found."));
            }

            // Check if the user is the creator
            if (classObj.getUserId().equals(userId)) {
                LOGGER.warn("User {} is the creator of class {} and cannot leave it.", userId, classId);
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(
                                "You are the creator of this class and cannot leave it. Use delete instead."));
            }

            // Check if the user is a member of the class
            if (!classMemberRepository.existsByClassIdAndUserId(classId, userId)) {
                LOGGER.warn("User {} is not a member of class {}.", userId, classId);
                return ResponseEntity.badRequest().body(new ErrorResponse("You are not a member of this class."));
            }

            // Remove the user from the class
            classMemberRepository.deleteByClassIdAndUserId(classId, userId);
            LOGGER.info("User {} successfully left class {}", userId, classId);
            return ResponseEntity.ok(new SuccessResponse("Successfully left the class", null));
        } catch (Exception e) {
            LOGGER.error("Failed to leave class. Error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/homework/submissions")
    public ResponseEntity<?> submitHomework(@Valid @RequestBody HomeworkSubmissionRequest submissionRequest) {
        try {
            String homeworkId = submissionRequest.getHomeworkId();
            String classId = submissionRequest.getClassId();
            String userId = submissionRequest.getUserId();
            String driveLink = submissionRequest.getDriveLink();
            LOGGER.info("Homework submission request received for homeworkId: {}, classId: {}, userId: {}",
                    homeworkId, classId, userId);

            // Validate class and user membership
            Class classObj = classService.getClassById(classId);
            if (classObj == null) {
                LOGGER.warn("Class with ID {} not found.", classId);
                return ResponseEntity.status(404).body(new ErrorResponse("Class not found."));
            }
            if (!classMemberRepository.existsByClassIdAndUserId(classId, userId)) {
                LOGGER.warn("User {} is not a member of class {}.", userId, classId);
                return ResponseEntity.badRequest().body(new ErrorResponse("You are not a member of this class."));
            }

            // Check if the user has already submitted
            if (homeworkSubmissionRepository.existsByHomeworkIdAndUserId(homeworkId, userId)) {
                LOGGER.warn("User {} has already submitted for homework {}.", userId, homeworkId);
                return ResponseEntity.badRequest().body(new ErrorResponse("You have already submitted this homework."));
            }

            // Create and save the submission
            HomeworkSubmission submission = new HomeworkSubmission();
            submission.setId(java.util.UUID.randomUUID().toString());
            submission.setHomeworkId(homeworkId);
            submission.setClassId(classId);
            submission.setUserId(userId);
            submission.setDriveLink(driveLink);
            submission.setSubmittedOn(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
            submission.setStatus("SUBMITTED");

            homeworkSubmissionRepository.save(submission);
            LOGGER.info("Homework submitted successfully by user {} for homework {}", userId, homeworkId);
            return ResponseEntity.ok(new SuccessResponse("Homework submitted successfully!", submission));
        } catch (Exception e) {
            LOGGER.error("Failed to submit homework. Error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/homework/submissions/class/{classId}")
    public ResponseEntity<?> getSubmissionsByClassId(@PathVariable String classId) {
        try {
            LOGGER.info("Fetching submissions for classId: {}", classId);
            List<HomeworkSubmission> submissions = homeworkSubmissionRepository.findByClassId(classId);
            return ResponseEntity.ok(new SuccessResponse("Submissions retrieved successfully!", submissions));
        } catch (Exception e) {
            LOGGER.error("Failed to fetch submissions for classId: {}. Error: {}", classId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }
}