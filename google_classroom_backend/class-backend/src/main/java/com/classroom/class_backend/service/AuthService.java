package com.classroom.class_backend.service;

import com.classroom.class_backend.config.JwtUtil;
import com.classroom.class_backend.exception.CustomException;
import com.classroom.class_backend.model.User;
import com.classroom.class_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service

public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, Object> login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new CustomException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("role", user.getRole());
        response.put("token", token);
        return response;
    }

    public Map<String, Object> signup(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new CustomException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getRole());
        Map<String, Object> response = new HashMap<>();
        response.put("userId", savedUser.getId());
        response.put("role", savedUser.getRole());
        response.put("token", token);
        return response;
    }

    public Map<String, String> forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found"));

        // Generate a reset token (simplified for now)
        String resetToken = jwtUtil.generateToken(user.getId(), user.getRole());
        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;

        Map<String, String> response = new HashMap<>();
        response.put("message", "Reset link generated.");
        response.put("data", resetLink);
        return response;
    }
}
