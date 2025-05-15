package com.classroom.class_backend.service;

import com.classroom.class_backend.model.Announcement;
import com.classroom.class_backend.repository.AnnouncementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
public class AnnouncementService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AnnouncementService.class);

    @Autowired
    private AnnouncementRepository announcementRepository;

    public Announcement createAnnouncement(Announcement announcement) {
        LOGGER.info("Creating announcement for classId: {}", announcement.getClassId());
        if (announcement.getId() == null || announcement.getId().isEmpty()) {
            announcement.setId(UUID.randomUUID().toString());
        }
        if (announcement.getCreatedAt() == null) {
            announcement.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Kolkata")));
        }

        Announcement savedAnnouncement = announcementRepository.save(announcement);
        LOGGER.info("Announcement created successfully with ID: {}. Details: classId={}, title={}, description={}, createdAt={}, createdBy={}",
                savedAnnouncement.getId(), savedAnnouncement.getClassId(), savedAnnouncement.getTitle(),
                savedAnnouncement.getDescription(), savedAnnouncement.getCreatedAt(), savedAnnouncement.getCreatedBy());
        return savedAnnouncement;
    }

    public List<Announcement> getAnnouncementsByClassId(String classId) {
        LOGGER.info("Fetching announcements for classId: {}", classId);
        if (classId == null || classId.isEmpty()) {
            LOGGER.warn("Class ID is required to fetch announcements.");
            throw new IllegalArgumentException("Class ID is required.");
        }
        List<Announcement> announcementList = announcementRepository.findByClassId(classId);
        LOGGER.info("Found {} announcements for classId: {}", announcementList.size(), classId);
        return announcementList;
    }

    public Announcement getAnnouncementById(String announcementId) {
        LOGGER.info("Fetching announcement with ID: {}", announcementId);
        return announcementRepository.findById(announcementId)
                .orElseThrow(() -> new IllegalArgumentException("Announcement not found."));
    }

    public void deleteAnnouncement(String announcementId) {
        LOGGER.info("Deleting announcement with ID: {}", announcementId);
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new IllegalArgumentException("Announcement not found."));
        announcementRepository.delete(announcement);
        LOGGER.info("Announcement with ID: {} deleted successfully.", announcementId);
    }
}