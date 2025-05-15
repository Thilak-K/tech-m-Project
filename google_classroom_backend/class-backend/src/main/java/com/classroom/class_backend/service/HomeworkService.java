package com.classroom.class_backend.service;

import com.classroom.class_backend.model.Homework;
import com.classroom.class_backend.repository.HomeworkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class HomeworkService {

    private static final Logger LOGGER = LoggerFactory.getLogger(HomeworkService.class);

    @Autowired
    private HomeworkRepository homeworkRepository;

    public Homework createHomework(Homework homework) {
        LOGGER.info("Creating homework for classId: {}", homework.getClassId());
        homework.setAssignedDate(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
        Homework savedHomework = homeworkRepository.save(homework);
        LOGGER.info("Homework created successfully with ID: {}", savedHomework.getId());
        LOGGER.debug("Details: classId={}, title={}, description={}, assignedDate={}, dueDate={}",
                savedHomework.getClassId(), savedHomework.getTitle(),
                savedHomework.getDescription(), savedHomework.getAssignedDate(), savedHomework.getDueDate());
        return savedHomework;
    }

    public List<Homework> getHomeworkByClassId(String classId) {
        LOGGER.info("Fetching homework for classId: {}", classId);
        if (classId == null || classId.isEmpty()) {
            LOGGER.warn("Class ID is required to fetch homework.");
            throw new IllegalArgumentException("Class ID is required.");
        }
        List<Homework> homeworkList = homeworkRepository.findByClassId(classId);
        LOGGER.info("Found {} homework assignments for classId: {}", homeworkList.size(), classId);
        return homeworkList;
    }

    public Homework getHomeworkById(String homeworkId) {
        LOGGER.info("Fetching homework with ID: {}", homeworkId);
        if (homeworkId == null || homeworkId.isEmpty()) {
            LOGGER.warn("Homework ID is required.");
            throw new IllegalArgumentException("Homework ID is required.");
        }
        return homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new IllegalArgumentException("Homework not found."));
    }

    public void deleteHomework(String homeworkId) {
        LOGGER.info("Deleting homework with ID: {}", homeworkId);
        if (homeworkId == null || homeworkId.isEmpty()) {
            LOGGER.warn("Homework ID is required for deletion.");
            throw new IllegalArgumentException("Homework ID is required.");
        }
        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new IllegalArgumentException("Homework not found."));
        homeworkRepository.delete(homework);
        LOGGER.info("Homework with ID: {} deleted successfully.", homeworkId);
    }
}