package com.classroom.class_backend.service;

import com.classroom.class_backend.model.Attendance;
import com.classroom.class_backend.repository.AttendanceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class AttendanceService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AttendanceService.class);

    @Autowired
    private AttendanceRepository attendanceRepository;

    public List<Attendance> checkAttendanceExists(String classId, String date) {
        LOGGER.info("Checking if attendance exists for classId: {} on date: {}", classId, date);
        List<Attendance> attendance = attendanceRepository.findByClassIdAndDate(classId, date);
        LOGGER.info("Found {} attendance records for classId: {} on date: {}", attendance.size(), classId, date);
        return attendance;
    }

    public Attendance submitAttendance(Attendance attendance) {
        LOGGER.info("Submitting attendance for classId: {} on date: {}", attendance.getClassId(), attendance.getDate());

        String currentDate = LocalDate.now(ZoneId.of("Asia/Kolkata")).toString();
        if (!attendance.getDate().equals(currentDate)) {
            LOGGER.warn("Attendance submission rejected. Date {} does not match current date {}", attendance.getDate(), currentDate);
            throw new RuntimeException("Attendance can only be submitted for today (" + currentDate + ").");
        }

        List<Attendance> existingAttendance = attendanceRepository.findByClassIdAndDate(
            attendance.getClassId(), attendance.getDate()
        );
        if (!existingAttendance.isEmpty()) {
            LOGGER.warn("Attendance already exists for classId: {} on date: {}", attendance.getClassId(), attendance.getDate());
            throw new RuntimeException("Attendance already submitted for this class on this date.");
        }

        Attendance savedAttendance = attendanceRepository.save(attendance);
        LOGGER.info("Attendance saved successfully with ID: {} for classId: {} on date: {}", 
            savedAttendance.getId(), savedAttendance.getClassId(), savedAttendance.getDate());
        return savedAttendance;
    }

    public List<Attendance> getAttendanceForRange(String classId, String startDate, String endDate) {
        LOGGER.info("Fetching attendance for classId: {} from {} to {}", classId, startDate, endDate);
        List<Attendance> attendanceRecords = attendanceRepository.findByClassIdAndDateRange(classId, startDate, endDate);
        LOGGER.info("Found {} attendance records for classId: {} from {} to {}", attendanceRecords.size(), classId, startDate, endDate);
        return attendanceRecords;
    }
}