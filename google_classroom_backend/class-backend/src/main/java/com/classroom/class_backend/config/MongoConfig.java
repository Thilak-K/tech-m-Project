package com.classroom.class_backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.mongodb.core.index.IndexDefinition;

import jakarta.annotation.PostConstruct;

@Configuration
public class MongoConfig {

    @Autowired
    private MongoTemplate mongoTemplate;

    @PostConstruct
    public void initIndexes() {
        // Index for attendance collection (from previous optimization)
        IndexOperations attendanceIndexOps = mongoTemplate.indexOps("attendance");
        IndexDefinition attendanceIndex = new org.springframework.data.mongodb.core.index.CompoundIndexDefinition(
            new org.bson.Document("classId", 1).append("date", 1)
        );
        attendanceIndexOps.ensureIndex(attendanceIndex);

        // Index for classes collection
        IndexOperations classIndexOps = mongoTemplate.indexOps("classes");
        // Index on userId
        IndexDefinition userIdIndex = new org.springframework.data.mongodb.core.index.Index()
            .on("userId", org.springframework.data.domain.Sort.Direction.ASC);
        classIndexOps.ensureIndex(userIdIndex);
        // Index on classCode
        IndexDefinition classCodeIndex = new org.springframework.data.mongodb.core.index.Index()
            .on("classCode", org.springframework.data.domain.Sort.Direction.ASC)
            .unique();
        classIndexOps.ensureIndex(classCodeIndex);
    }
}