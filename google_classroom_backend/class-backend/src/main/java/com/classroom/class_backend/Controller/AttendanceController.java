package com.classroom.class_backend.Controller;

import com.classroom.class_backend.dto.AttendanceRequest;
import com.classroom.class_backend.model.Attendance;
import com.classroom.class_backend.model.ClassMember;
import com.classroom.class_backend.model.User;
import com.classroom.class_backend.repository.ClassMemberRepository;
import com.classroom.class_backend.repository.UserRepository;
import com.classroom.class_backend.service.AttendanceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:3000")
public class AttendanceController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AttendanceController.class);

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private ClassMemberRepository classMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/class/{classId}/date/{date}")
    public ResponseEntity<Map<String, Object>> checkAttendanceExists(
        @PathVariable String classId,
        @PathVariable String date
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            LOGGER.info("Checking attendance for classId: {} on date: {}", classId, date);
            List<Attendance> attendance = attendanceService.checkAttendanceExists(classId, date);
            response.put("message", "Attendance check completed successfully!");
            response.put("data", attendance);
            LOGGER.info("Found {} attendance records for classId: {} on date: {}", attendance.size(), classId, date);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LOGGER.error("Failed to check attendance for classId: {} on date: {}. Error: {}", classId, date, e.getMessage(), e);
            response.put("message", "Failed to check attendance: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{classId}/students")
    public ResponseEntity<Map<String, Object>> getStudentsByClassId(@PathVariable String classId) {
        Map<String, Object> response = new HashMap<>();
        try {
            LOGGER.info("Fetching students for classId: {}", classId);
            List<ClassMember> classMembers = classMemberRepository.findByClassId(classId);
            if (classMembers.isEmpty()) {
                LOGGER.info("No students found for classId: {}", classId);
                response.put("message", "No students found for the class.");
                response.put("data", List.of());
                return ResponseEntity.ok(response);
            }

            List<String> studentIds = classMembers.stream()
                .map(ClassMember::getUserId)
                .collect(Collectors.toList());

            List<User> students = userRepository.findByIdInAndRole(studentIds, "STUDENT");
            students.sort((a, b) -> a.getRollNumber().compareTo(b.getRollNumber()));

            LOGGER.info("Found {} students for classId: {}", students.size(), classId);
            response.put("message", "Students fetched successfully!");
            response.put("data", students);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LOGGER.error("Failed to fetch students for classId: {}. Error: {}", classId, e.getMessage(), e);
            response.put("message", "Failed to fetch students: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitAttendance(@Valid @RequestBody AttendanceRequest attendanceRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            LOGGER.info("Submitting attendance for classId: {} on date: {}", attendanceRequest.getClassId(), attendanceRequest.getDate());

            // Map AttendanceRequest to Attendance entity
            Attendance attendance = new Attendance();
            attendance.setClassId(attendanceRequest.getClassId());
            attendance.setDate(attendanceRequest.getDate());
            attendance.setAttendance(attendanceRequest.getAttendance().stream()
                .map(entry -> new Attendance.AttendanceEntry(entry.getUserId(), entry.getPresent()))
                .collect(Collectors.toList()));

            Attendance savedAttendance = attendanceService.submitAttendance(attendance);
            response.put("message", "Attendance submitted successfully!");
            response.put("data", savedAttendance);
            LOGGER.info("Attendance submitted successfully for classId: {} on date: {}", savedAttendance.getClassId(), savedAttendance.getDate());
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            LOGGER.error("Failed to submit attendance for classId: {}. Error: {}", attendanceRequest.getClassId(), e.getMessage(), e);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            LOGGER.error("Failed to submit attendance for classId: {}. Error: {}", attendanceRequest.getClassId(), e.getMessage(), e);
            response.put("message", "Failed to submit attendance: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/class/{classId}/range")
    public ResponseEntity<Map<String, Object>> getAttendanceForRange(
        @PathVariable String classId,
        @RequestParam String startDate,
        @RequestParam String endDate
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            LOGGER.info("Fetching attendance for classId: {} from {} to {}", classId, startDate, endDate);
            List<Attendance> attendanceRecords = attendanceService.getAttendanceForRange(classId, startDate, endDate);
            response.put("message", "Attendance records fetched successfully!");
            response.put("data", attendanceRecords);
            LOGGER.info("Found {} attendance records for classId: {} from {} to {}", attendanceRecords.size(), classId, startDate, endDate);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LOGGER.error("Failed to fetch attendance for classId: {} from {} to {}. Error: {}", classId, startDate, endDate, e.getMessage(), e);
            response.put("message", "Failed to fetch attendance records: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}