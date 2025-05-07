package com.hungtv.toeic.be.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hungtv.toeic.be.models.Test;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {
    List<Test> findByType(Test.TestType type);
    List<Test> findByIsActiveTrue();
    List<Test> findByCreatedBy(String createdBy);
    List<Test> findByTitleContainingIgnoreCase(String title);
} 