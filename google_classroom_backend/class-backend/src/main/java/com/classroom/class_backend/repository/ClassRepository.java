package com.classroom.class_backend.repository;

import com.classroom.class_backend.model.Class;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ClassRepository extends MongoRepository<Class, String> {
    boolean existsByClassId(String classId);
    boolean existsByClassCode(String classCode);
    List<Class> findByUserId(String userId);
    Optional<Class> findByClassCode(String classCode);
}