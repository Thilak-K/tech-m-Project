package com.classroom.class_backend.repository;

import com.classroom.class_backend.model.HomeworkSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeworkSubmissionRepository extends MongoRepository<HomeworkSubmission, String> {
    List<HomeworkSubmission> findByClassId(String classId);
    List<HomeworkSubmission> findByClassIdAndUserId(String classId, String userId);
    boolean existsByHomeworkIdAndUserId(String homeworkId, String userId);
    void deleteByClassId(String classId);
} 