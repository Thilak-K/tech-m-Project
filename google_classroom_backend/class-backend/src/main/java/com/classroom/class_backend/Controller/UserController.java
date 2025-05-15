package com.classroom.class_backend.Controller;

import com.classroom.class_backend.dto.ErrorResponse;
import com.classroom.class_backend.dto.LoginResponse;
import com.classroom.class_backend.dto.UserResponse;
import com.classroom.class_backend.dto.SuccessResponse;
import com.classroom.class_backend.dto.GoogleAuthRequest;
import com.classroom.class_backend.dto.ResetPasswordRequest;
import com.classroom.class_backend.dto.ForgotPasswordRequest;
import com.classroom.class_backend.model.User;
import com.classroom.class_backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody User user) {
        try {
            LOGGER.info("Signup request received for email: {}, role: {}", user.getEmail(), user.getRole());
            User savedUser = userService.signUp(user);
            LOGGER.info("User saved with ID: {}, role: {}", savedUser.getId(), savedUser.getRole());
            LoginResponse response = new LoginResponse();
            response.setUserId(savedUser.getId());
            response.setRole(savedUser.getRole());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LOGGER.error("Signup failed for email: {}. Error: {}", user.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            LOGGER.info("Login request received for email: {}", user.getEmail());
            User loggedInUser = userService.login(user.getEmail(), user.getPassword());
            LoginResponse response = new LoginResponse();
            response.setUserId(loggedInUser.getId());
            response.setRole(loggedInUser.getRole());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LOGGER.error("Login failed for email: {}. Error: {}", user.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleAuthRequest request) {
        try {
            LOGGER.info("Google login request received");
            User user = userService.googleSignIn(request.getToken(), null);
            LoginResponse response = new LoginResponse();
            response.setUserId(user.getId());
            response.setRole(user.getRole());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LOGGER.error("Google login failed. Error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/google-signup")
    public ResponseEntity<?> googleSignup(@RequestBody GoogleAuthRequest request) {
        try {
            LOGGER.info("Google signup request received with role: {}", request.getRole());
            if (request.getRole() == null || request.getRole().isEmpty()) {
                LOGGER.warn("Role is required for Google signup");
                return ResponseEntity.badRequest().body(new ErrorResponse("Role is required for signup."));
            }
            User user = userService.googleSignIn(request.getToken(), request.getRole());
            LoginResponse response = new LoginResponse();
            response.setUserId(user.getId());
            response.setRole(user.getRole());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LOGGER.error("Google signup failed. Error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        try {
            LOGGER.info("Fetching user with ID: {}", userId);
            User user = userService.getUserById(userId);
            if (user == null) {
                LOGGER.warn("User with ID {} not found.", userId);
                return ResponseEntity.badRequest().body(new ErrorResponse("User not found."));
            }
            UserResponse userResponse = new UserResponse();
            userResponse.setId(user.getId());
            userResponse.setEmail(user.getEmail());
            userResponse.setName(user.getName());
            userResponse.setRole(user.getRole());
            userResponse.setSection(user.getSection());
            userResponse.setRollNumber(user.getRollNumber());
            return ResponseEntity.ok(userResponse);
        } catch (Exception e) {
            LOGGER.error("Failed to fetch user with ID: {}. Error: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("An error occurred while fetching user."));
        }
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody User updatedUser) {
        try {
            LOGGER.info("Updating user with ID: {}", userId);
            User existingUser = userService.getUserById(userId);
            if (existingUser == null) {
                LOGGER.warn("User with ID {} not found.", userId);
                return ResponseEntity.badRequest().body(new ErrorResponse("User not found."));
            }

            existingUser.setName(updatedUser.getName());
            existingUser.setSection(updatedUser.getSection());
            existingUser.setRollNumber(updatedUser.getRollNumber());
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                existingUser.setPassword(updatedUser.getPassword());
            }

            User savedUser = userService.updateUser(existingUser);
            LOGGER.info("User updated successfully: {}", savedUser.getEmail());
            UserResponse userResponse = new UserResponse();
            userResponse.setId(savedUser.getId());
            userResponse.setEmail(savedUser.getEmail());
            userResponse.setName(savedUser.getName());
            userResponse.setRole(savedUser.getRole());
            return ResponseEntity.ok(userResponse);
        } catch (Exception e) {
            LOGGER.error("Failed to update user with ID: {}. Error: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("An error occurred while updating user."));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            LOGGER.info("Forgot password request for email: {}", request.getEmail());
            String resetLink = userService.createPasswordResetToken(request.getEmail());
            return ResponseEntity.ok(new SuccessResponse("Password reset link generated.", resetLink));
        } catch (Exception e) {
            LOGGER.error("Forgot password failed for email: {}. Error: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            LOGGER.info("Reset password request with token: {}", request.getToken());

            if (request.getToken() == null || request.getToken().isEmpty()) {
                LOGGER.warn("Token is missing in reset password request");
                return ResponseEntity.badRequest().body(new ErrorResponse("Token is required."));
            }
            if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
                LOGGER.warn("Invalid password in reset password request: Password must be at least 8 characters long");
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Password must be at least 8 characters long."));
            }

            // Delegate to UserService for token validation and password update
            userService.resetPassword(request.getToken(), request.getNewPassword());
            LOGGER.info("Password reset successful for token: {}", request.getToken());
            return ResponseEntity.ok(new SuccessResponse("Password reset successful!"));
        } catch (Exception e) {
            LOGGER.error("Reset password failed for token: {}. Error: {}", request.getToken(), e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
}