package com.classroom.class_backend.service;

import com.classroom.class_backend.model.PasswordResetToken;
import com.classroom.class_backend.model.User;
import com.classroom.class_backend.repository.PasswordResetTokenRepository;
import com.classroom.class_backend.repository.UserRepository;
import com.classroom.class_backend.dto.LoginResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

@Service
public class UserService {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);
   
    @Value("${spring.data.google.client-id}")
    private String googleClientId;


    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    public User signUp(User user) throws Exception {
        LOGGER.info("Attempting to sign up user with email: {}", user.getEmail());
        if (userRepository.existsByEmail(user.getEmail())) {
            LOGGER.warn("Email already exists: {}", user.getEmail());
            throw new Exception("Email already exists");
        }
        user.setId(UUID.randomUUID().toString()); 
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(user.getPassword()); 
        }
        User savedUser = userRepository.save(user);
        LOGGER.info("User signed up successfully: {}", savedUser.getEmail());
        return savedUser;
    }

    public User login(String email, String password) throws Exception {
        LOGGER.info("Attempting login for email: {}", email);
        User user = userRepository.findByEmail(email);
        if (user == null) {
            LOGGER.warn("User not found for email: {}", email);
            throw new Exception("User not found");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            LOGGER.warn("User {} signed up with Google, cannot login with password", email);
            throw new Exception("User signed up with Google. Please use Google login.");
        }
        if (!user.getPassword().equals(password)) { 
            LOGGER.warn("Invalid password for email: {}", email);
            throw new Exception("Invalid password");
        }
        LOGGER.info("Login successful for email: {}", email);
        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setRole(user.getRole());
        return user;
    }

    public User googleSignIn(String token, String role) throws GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken googleIdToken = verifier.verify(token);
        if (googleIdToken == null) {
            throw new IllegalArgumentException("Invalid Google ID token");
        }

        GoogleIdToken.Payload payload = googleIdToken.getPayload();
        String email = payload.getEmail();
        String name = (String) payload.get("name");

        User existingUser = userRepository.findByEmail(email);
        if (existingUser != null) {
            return existingUser;
        } else if (role != null) {
            if (!role.equalsIgnoreCase("student") && !role.equalsIgnoreCase("teacher")) {
                LOGGER.warn("Invalid role provided: {}", role);
                throw new IllegalArgumentException("Role must be either 'student' or 'teacher'.");
            }
            User newUser = new User();
            newUser.setId(UUID.randomUUID().toString());
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setRole(role.toUpperCase()); // Ensure role is uppercase to match enum
            newUser.setPassword(null);
            return userRepository.save(newUser);
        } else {
            throw new IllegalArgumentException("User not found. Please sign up first.");
        }
    }

    public User getUserById(String userId) {
        LOGGER.info("Fetching user with ID: {}", userId);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            LOGGER.warn("User with ID {} not found.", userId);
        } else {
            LOGGER.info("User found: {}", user.getEmail());
        }
        return user;
    }

    public User updateUser(User user) {
        LOGGER.info("Updating user with ID: {}", user.getId());
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(user.getPassword());
        }
        User updatedUser = userRepository.save(user);
        LOGGER.info("User updated successfully: {}", updatedUser.getEmail());
        return updatedUser;
    }

    public String createPasswordResetToken(String email) {
        LOGGER.info("Creating password reset token for email: {}", email);
        User user = userRepository.findByEmail(email);
        if (user == null) {
            LOGGER.warn("Email not found: {}", email);
            throw new RuntimeException("Email not found.");
        }

        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            LOGGER.warn("User with email {} signed up with Google. Password reset not applicable.", email);
            throw new RuntimeException("User signed up with Google. Password reset is not applicable.");
        }

        PasswordResetToken existingToken = tokenRepository.findByEmail(email);
        if (existingToken != null) {
            tokenRepository.delete(existingToken);
        }

        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(1);
        PasswordResetToken passwordResetToken = new PasswordResetToken(token, email, expiryDate);
        tokenRepository.save(passwordResetToken);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        LOGGER.info("Generated password reset link: {}", resetLink);
        return resetLink;
    }

    public void resetPassword(String token, String newPassword) {
        LOGGER.info("Resetting password with token: {}", token);
        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        if (resetToken == null || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            LOGGER.warn("Invalid or expired token: {}", token);
            throw new RuntimeException("Invalid or expired token.");
        }

        User user = userRepository.findByEmail(resetToken.getEmail());
        if (user == null) {
            LOGGER.warn("User not found for email: {}", resetToken.getEmail());
            throw new RuntimeException("User not found.");
        }

        user.setPassword(newPassword); // Store new password as plain text
        updateUser(user);
        tokenRepository.delete(resetToken);
        LOGGER.info("Password reset successful for email: {}", user.getEmail());
    }
}