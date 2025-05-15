package com.classroom.class_backend.repository;

import com.classroom.class_backend.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    List<Attendance> findByClassIdAndDate(String classId, String date);
    void deleteByClassId(String classId);
    @Query("{ 'classId': ?0, 'date': { $gte: ?1, $lte: ?2 } }")
    List<Attendance> findByClassIdAndDateRange(String classId, String startDate, String endDate);
}