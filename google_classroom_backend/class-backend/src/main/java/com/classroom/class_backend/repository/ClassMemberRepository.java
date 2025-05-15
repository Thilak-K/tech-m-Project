package com.classroom.class_backend.repository;

import com.classroom.class_backend.model.ClassMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ClassMemberRepository extends MongoRepository<ClassMember, String> {
    List<ClassMember> findByUserId(String userId);
    List<ClassMember> findByClassId(String classId);
    boolean existsByClassIdAndUserId(String classId, String userId);
    void deleteByClassId(String classId); 
    void deleteByClassIdAndUserId(String classId, String userId);
}