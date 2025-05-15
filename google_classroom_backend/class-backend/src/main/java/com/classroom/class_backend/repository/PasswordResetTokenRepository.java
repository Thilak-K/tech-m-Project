package com.classroom.class_backend.repository;

import com.classroom.class_backend.model.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    PasswordResetToken findByEmail(String email);
    PasswordResetToken findByToken(String token);
}