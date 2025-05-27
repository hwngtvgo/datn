package com.hungtv.toeic.be.payload.request;

import java.util.List;

import jakarta.validation.constraints.NotNull;

public class SaveTestResultRequest {
    
    @NotNull(message = "ID bài thi không được để trống")
    private Long testId;
    
    private Integer completionTimeInMinutes;
    
    private List<UserAnswerRequest> userAnswers;
    
    // Constructors
    public SaveTestResultRequest() {
    }
    
    public SaveTestResultRequest(Long testId, Integer completionTimeInMinutes, List<UserAnswerRequest> userAnswers) {
        this.testId = testId;
        this.completionTimeInMinutes = completionTimeInMinutes;
        this.userAnswers = userAnswers;
    }
    
    // Getters and Setters
    public Long getTestId() {
        return testId;
    }
    
    public void setTestId(Long testId) {
        this.testId = testId;
    }
    
    public Integer getCompletionTimeInMinutes() {
        return completionTimeInMinutes;
    }
    
    public void setCompletionTimeInMinutes(Integer completionTimeInMinutes) {
        this.completionTimeInMinutes = completionTimeInMinutes;
    }
    
    public List<UserAnswerRequest> getUserAnswers() {
        return userAnswers;
    }
    
    public void setUserAnswers(List<UserAnswerRequest> userAnswers) {
        this.userAnswers = userAnswers;
    }
    
    // DTO cho câu trả lời của người dùng
    public static class UserAnswerRequest {
        
        @NotNull(message = "ID câu hỏi không được để trống")
        private Long questionId;
        
        private String userAnswer;
        
        public UserAnswerRequest() {
        }
        
        public UserAnswerRequest(Long questionId, String userAnswer) {
            this.questionId = questionId;
            this.userAnswer = userAnswer;
        }
        
        public Long getQuestionId() {
            return questionId;
        }
        
        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }
        
        public String getUserAnswer() {
            return userAnswer;
        }
        
        public void setUserAnswer(String userAnswer) {
            this.userAnswer = userAnswer;
        }
    }
} 