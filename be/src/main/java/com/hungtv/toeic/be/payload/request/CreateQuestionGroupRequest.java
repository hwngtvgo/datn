package com.hungtv.toeic.be.payload.request;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class CreateQuestionGroupRequest {
    
    // Tiêu đề của nhóm câu hỏi
    private String title;
    
    // Kiểu của nhóm câu hỏi - LISTENING hoặc READING
    @NotNull(message = "Loại câu hỏi không được để trống")
    private String questionType;
    
    // URL file audio (nếu là nhóm câu hỏi nghe)
    private String audioUrl;
    
    // URL hình ảnh (sử dụng cho cả hai loại nhóm)
    private String imageUrl;
    
    // Đoạn văn (nếu là nhóm câu hỏi đọc)
    private String passage;
    
    // Danh sách các câu hỏi thuộc nhóm
    @NotEmpty(message = "Danh sách câu hỏi không được để trống")
    private List<CreateQuestionRequest> questions;
    
    // ID bài thi mà nhóm câu hỏi thuộc về
    private Long testId;
    
    // Phần thi (Part 1-7)
    @NotNull(message = "Phần thi không được để trống")
    private Integer part;
    
    // Constructors
    public CreateQuestionGroupRequest() {
    }
    
    public CreateQuestionGroupRequest(String title, String questionType, String audioUrl, String imageUrl, 
                                      String passage, List<CreateQuestionRequest> questions, 
                                      Long testId, Integer part) {
        this.title = title;
        this.questionType = questionType;
        this.audioUrl = audioUrl;
        this.imageUrl = imageUrl;
        this.passage = passage;
        this.questions = questions;
        this.testId = testId;
        this.part = part;
    }
    
    // Getters và Setters
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getQuestionType() {
        return questionType;
    }
    
    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }
    
    public String getAudioUrl() {
        return audioUrl;
    }
    
    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getPassage() {
        return passage;
    }
    
    public void setPassage(String passage) {
        this.passage = passage;
    }
    
    public List<CreateQuestionRequest> getQuestions() {
        return questions;
    }
    
    public void setQuestions(List<CreateQuestionRequest> questions) {
        this.questions = questions;
    }
    
    public Long getTestId() {
        return testId;
    }
    
    public void setTestId(Long testId) {
        this.testId = testId;
    }
    
    public Integer getPart() {
        return part;
    }
    
    public void setPart(Integer part) {
        this.part = part;
    }
}