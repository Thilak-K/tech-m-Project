package com.classroom.class_backend.service;

import com.classroom.class_backend.config.JwtUtil;
import com.classroom.class_backend.exception.CustomException;
import com.classroom.class_backend.model.User;
import com.classroom.class_backend.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class GoogleAuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    public Map<String, Object> googleLogin(String code) throws IOException {
        GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance(),
                "https://oauth2.googleapis.com/token",
                clientId,
                clientSecret,
                code,
                redirectUri
        ).execute();

        String email = tokenResponse.parseIdToken().getPayload().getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found"));

        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("role", user.getRole());
        response.put("token", token);
        return response;
    }

    public Map<String, Object> googleSignup(String code, String role) throws IOException {
        GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance(),
                "https://oauth2.googleapis.com/token",
                clientId,
                clientSecret,
                code,
                redirectUri
        ).execute();

        String email = tokenResponse.parseIdToken().getPayload().getEmail();
        String name = (String) tokenResponse.parseIdToken().getPayload().get("name");

        if (userRepository.existsByEmail(email)) {
            throw new CustomException("Email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setRole(role);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getRole());
        Map<String, Object> response = new HashMap<>();
        response.put("userId", savedUser.getId());
        response.put("role", savedUser.getRole());
        response.put("token", token);
        return response;
    }
}
