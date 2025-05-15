package com.classroom.class_backend.service;

import com.classroom.class_backend.model.Class;
import com.classroom.class_backend.model.ClassMember;
import com.classroom.class_backend.repository.ClassRepository;
import com.classroom.class_backend.repository.ClassMemberRepository;
import com.classroom.class_backend.repository.AttendanceRepository;
import com.classroom.class_backend.repository.HomeworkSubmissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClassService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ClassService.class);

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private ClassMemberRepository classMemberRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private HomeworkSubmissionRepository homeworkSubmissionRepository;

    public Class createClass(Class classObj) {
        // Validate classId
        if (classRepository.existsById(classObj.getClassId())) {
            LOGGER.error("Class with ID {} already exists", classObj.getClassId());
            throw new IllegalArgumentException("Class with this ID already exists.");
        }

        // Validate classCode format
        if (!classObj.getClassCode().matches("^[A-Z0-9]{8}$")) {
            LOGGER.error("Invalid class code: {}. Must be 8 uppercase alphanumeric characters.", classObj.getClassCode());
            throw new IllegalArgumentException("Class code must be 8 uppercase alphanumeric characters.");
        }

        // Check for duplicate classCode
        if (classRepository.existsByClassCode(classObj.getClassCode())) {
            LOGGER.error("Class with code {} already exists", classObj.getClassCode());
            throw new IllegalArgumentException("Class with this code already exists.");
        }

        classObj.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));

        LOGGER.info("Creating class with ID: {} and Code: {} by user: {}", 
            classObj.getClassId(), classObj.getClassCode(), classObj.getUserId());
        return classRepository.save(classObj);
    }

    public List<Class> getClassesByUserId(String userId) {
        LOGGER.info("Fetching classes for user: {}", userId);
        List<Class> classes = classRepository.findByUserId(userId);
        LOGGER.info("Found {} classes for user: {}", classes.size(), userId);
        return classes;
    }

    public List<Class> getJoinedClassesByUserId(String userId) {
        LOGGER.info("Fetching joined classes for user: {}", userId);
        List<ClassMember> classMembers = classMemberRepository.findByUserId(userId);
        List<String> classIds = classMembers.stream()
            .map(ClassMember::getClassId)
            .collect(Collectors.toList());
        List<Class> joinedClasses = classRepository.findAllById(classIds)
            .stream()
            .filter(classObj -> !classObj.getUserId().equals(userId))
            .collect(Collectors.toList());
        LOGGER.info("Found {} joined classes for user: {}", joinedClasses.size(), userId);
        return joinedClasses;
    }

    public Class getClassById(String classId) {
        LOGGER.info("Fetching class with ID: {}", classId);
        Class classObj = classRepository.findById(classId).orElse(null);
        if (classObj == null) {
            LOGGER.warn("Class with ID {} not found.", classId);
        } else {
            LOGGER.info("Class found: {}", classObj.getSubjectCode());
        }
        return classObj;
    }

    public Class getClassByCode(String classCode) {
        LOGGER.info("Fetching class with code: {}", classCode);
        Class classObj = classRepository.findByClassCode(classCode).orElse(null);
        if (classObj == null) {
            LOGGER.warn("Class with code {} not found.", classCode);
        } else {
            LOGGER.info("Class found: {}", classObj.getSubjectCode());
        }
        return classObj;
    }

    public void deleteClass(String classId) {
        LOGGER.info("Deleting class with ID: {}", classId);

        // Delete associated ClassMember entries
        classMemberRepository.deleteByClassId(classId);
        LOGGER.info("Deleted associated ClassMember entries for class ID: {}", classId);

        // Delete associated Attendance entries
        attendanceRepository.deleteByClassId(classId);
        LOGGER.info("Deleted associated Attendance entries for class ID: {}", classId);

        // Delete associated HomeworkSubmission entries
        homeworkSubmissionRepository.deleteByClassId(classId);
        LOGGER.info("Deleted associated HomeworkSubmission entries for class ID: {}", classId);

        // Delete the class
        classRepository.deleteById(classId);
        LOGGER.info("Class with ID {} deleted successfully.", classId);
    }

    @PostConstruct
    public void migrateExistingClasses() {
        try {
            LOGGER.info("Starting migration of existing classes to add userId and createdAt");
            List<Class> classes = classRepository.findAll();
            if (classes.isEmpty()) {
                LOGGER.info("No classes found to migrate");
                return;
            }
            for (Class classObj : classes) {
                boolean updated = false;
                if (classObj.getUserId() == null) {
                    LOGGER.warn("Class with ID {} has no userId. Please assign a userId manually.", classObj.getClassId());
                    updated = true;
                }
                if (classObj.getCreatedAt() == null) {
                    classObj.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
                    LOGGER.info("Set createdAt for class {} to {}", classObj.getClassId(), classObj.getCreatedAt());
                    updated = true;
                }
                if (updated) {
                    classRepository.save(classObj);
                }
            }
            LOGGER.info("Migration completed for {} classes", classes.size());
        } catch (Exception e) {
            LOGGER.error("Migration failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to migrate existing classes: " + e.getMessage(), e);
        }
    }
}