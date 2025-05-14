package com.classroom.class_backend.controller;

import com.classroom.class_backend.exception.CustomException;
import com.classroom.class_backend.model.User;
import com.classroom.class_backend.service.AuthService;
import com.classroom.class_backend.service.GoogleAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private GoogleAuthService googleAuthService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        return ResponseEntity.ok(authService.login(email, password));
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody User user) {
        return ResponseEntity.ok(authService.signup(user));
    }

    @PostMapping("/google-login")
    public ResponseEntity<Map<String, Object>> googleLogin(@RequestBody Map<String, String> payload) throws IOException {
        String code = payload.get("code");
        return ResponseEntity.ok(googleAuthService.googleLogin(code));
    }

    @PostMapping("/google-signup")
    public ResponseEntity<Map<String, Object>> googleSignup(@RequestBody Map<String, String> payload) throws IOException {
        String code = payload.get("code");
        String role = payload.get("role");
        return ResponseEntity.ok(googleAuthService.googleSignup(code, role));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        return ResponseEntity.ok(authService.forgotPassword(email));
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<Map<String, String>> handleCustomException(CustomException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}