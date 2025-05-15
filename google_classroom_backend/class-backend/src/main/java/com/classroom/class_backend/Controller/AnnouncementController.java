package com.classroom.class_backend.Controller;

import com.classroom.class_backend.dto.AnnouncementRequest;
import com.classroom.class_backend.dto.ErrorResponse;
import com.classroom.class_backend.dto.SuccessResponse;
import com.classroom.class_backend.model.Announcement;
import com.classroom.class_backend.service.AnnouncementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "http://localhost:3000")
public class AnnouncementController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AnnouncementController.class);

    @Autowired
    private AnnouncementService announcementService;

    @PostMapping
    public ResponseEntity<?> createAnnouncement(@Valid @RequestBody AnnouncementRequest announcementRequest) {
        try {
            LOGGER.info("Received request to create announcement for classId: {}", announcementRequest.getClassId());
            LOGGER.debug("Announcement request payload: classId={}, title={}, description={}, userId={}",
                    announcementRequest.getClassId(), announcementRequest.getTitle(),
                    announcementRequest.getDescription(), announcementRequest.getUserId());

            if (announcementRequest.getUserId() == null || announcementRequest.getUserId().isEmpty()) {
                LOGGER.warn("User ID is required for creating announcement.");
                return ResponseEntity.badRequest().body(new ErrorResponse("User ID is required."));
            }

            Announcement announcement = new Announcement();
            announcement.setClassId(announcementRequest.getClassId());
            announcement.setTitle(announcementRequest.getTitle());
            announcement.setDescription(announcementRequest.getDescription());
            announcement.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
            announcement.setCreatedBy(announcementRequest.getUserId());
            Announcement createdAnnouncement = announcementService.createAnnouncement(announcement);

            LOGGER.info("Announcement created successfully with ID: {}", createdAnnouncement.getId());
            SuccessResponse response = new SuccessResponse("Announcement created successfully!", createdAnnouncement);
            return ResponseEntity.status(201).body(response);
        } catch (IllegalArgumentException e) {
            LOGGER.error("Validation error while creating announcement: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            LOGGER.error("Failed to create announcement. Error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<?> getAnnouncementsByClassId(@PathVariable String classId) {
        try {
            LOGGER.info("Fetching announcements for classId: {}", classId);
            List<Announcement> announcementList = announcementService.getAnnouncementsByClassId(classId);
            LOGGER.info("Found {} announcements for classId: {}", announcementList.size(), classId);
            SuccessResponse response = new SuccessResponse("Announcements fetched successfully.", announcementList);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            LOGGER.error("Validation error while fetching announcements for classId: {}. Error: {}", classId,
                    e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            LOGGER.error("Failed to fetch announcements for classId: {}. Error: {}", classId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{announcementId}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable String announcementId,
            @RequestHeader("userId") String userId) {
        try {
            LOGGER.info("Received request to delete announcement with ID: {} by userId: {}", announcementId, userId);

            if (userId == null || userId.isEmpty()) {
                LOGGER.warn("User ID is required for deleting announcement.");
                return ResponseEntity.status(401).body(new ErrorResponse("User ID is required."));
            }

            Announcement announcement = announcementService.getAnnouncementById(announcementId);

            if (announcement.getCreatedBy() == null || announcement.getCreatedBy().isEmpty()) {
                LOGGER.warn("Announcement with ID: {} has no createdBy field. Denying deletion.", announcementId);
                return ResponseEntity.status(403)
                        .body(new ErrorResponse("Cannot delete announcement: Creator information is missing."));
            }

            if (!announcement.getCreatedBy().equals(userId)) {
                LOGGER.warn("User {} is not authorized to delete announcement with ID: {}", userId, announcementId);
                return ResponseEntity.status(403)
                        .body(new ErrorResponse("You are not authorized to delete this announcement."));
            }

            announcementService.deleteAnnouncement(announcementId);
            LOGGER.info("Announcement with ID: {} deleted successfully by userId: {}", announcementId, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            LOGGER.error("Failed to delete announcement with ID: {}. Error: {}", announcementId, e.getMessage());
            return ResponseEntity.status(404).body(new ErrorResponse("Announcement not found: " + e.getMessage()));
        } catch (Exception e) {
            LOGGER.error("Failed to delete announcement with ID: {}. Error: {}", announcementId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }
}