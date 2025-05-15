package com.classroom.class_backend.repository;

import com.classroom.class_backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByIdInAndRole(List<String> ids, String role);
}