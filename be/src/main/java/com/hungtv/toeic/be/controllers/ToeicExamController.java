package com.hungtv.toeic.be.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/toeic-exams")
public class ToeicExamController {

    @GetMapping
    public ResponseEntity<List<ToeicExamDTO>> getAllExams() {
        // Tạm thời trả về danh sách rỗng - sẽ được cài đặt sau khi có model và service
        return ResponseEntity.ok(new ArrayList<>());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ToeicExamDTO> getExamById(@PathVariable Long id) {
        // Tạm thời trả về null - sẽ được cài đặt sau khi có model và service
        return ResponseEntity.ok(new ToeicExamDTO());
    }
    
    // DTO tạm thời để làm việc với frontend
    public static class ToeicExamDTO {
        private Long id;
        private String title;
        private String description;
        
        public ToeicExamDTO() {
            // Constructor mặc định
        }
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
    }
} 