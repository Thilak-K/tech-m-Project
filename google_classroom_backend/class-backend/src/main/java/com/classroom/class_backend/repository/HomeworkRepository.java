package com.classroom.class_backend.repository;

import com.classroom.class_backend.model.Homework;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HomeworkRepository extends MongoRepository<Homework, String> {
    // Find homework by classId
    @Query("{ 'classId': ?0 }")
    List<Homework> findByClassId(String classId);

    // Find homework due after a specific date
    @Query("{ 'dueDate': { $gt: ?0 } }")
    List<Homework> findByDueDateAfter(LocalDateTime date);

    // Find homework by classId and due date range
    @Query("{ 'classId': ?0, 'dueDate': { $gte: ?1, $lte: ?2 } }")
    List<Homework> findByClassIdAndDueDateBetween(String classId, LocalDateTime start, LocalDateTime end);
}