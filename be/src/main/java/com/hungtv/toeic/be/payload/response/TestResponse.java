package com.hungtv.toeic.be.payload.response;

import java.time.LocalDateTime;
import java.util.List;

import com.hungtv.toeic.be.models.Test.TestType;

public class TestResponse {
    private Long id;
    private String title;
    private String description;
    private TestType type;
    private Integer duration;
    private String instructions;
    private LocalDateTime createdAt;
    private String createdBy;
    private Boolean isActive;
    private List<QuestionGroupResponse> questionGroups;
    
    public TestResponse() {
    }
    
    // Constructor với đầy đủ các thông tin
    public TestResponse(Long id, String title, String description, TestType type, Integer duration,
                        String instructions, LocalDateTime createdAt, String createdBy, Boolean isActive) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.duration = duration;
        this.instructions = instructions;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.isActive = isActive;
    }
    
    // Constructor không bao gồm danh sách questionGroups
    public TestResponse(Long id, String title, String description, TestType type, Integer duration,
                        String instructions, LocalDateTime createdAt, String createdBy, Boolean isActive,
                        List<QuestionGroupResponse> questionGroups) {
        this(id, title, description, type, duration, instructions, createdAt, createdBy, isActive);
        this.questionGroups = questionGroups;
    }
    
    // Getters và Setters
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
    
    public TestType getType() {
        return type;
    }
    
    public void setType(TestType type) {
        this.type = type;
    }
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    
    public String getInstructions() {
        return instructions;
    }
    
    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public List<QuestionGroupResponse> getQuestionGroups() {
        return questionGroups;
    }
    
    public void setQuestionGroups(List<QuestionGroupResponse> questionGroups) {
        this.questionGroups = questionGroups;
    }
} 