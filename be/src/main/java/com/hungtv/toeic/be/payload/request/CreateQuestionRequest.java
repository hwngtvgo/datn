package com.hungtv.toeic.be.payload.request;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class CreateQuestionRequest {

    @NotBlank(message = "Câu hỏi không được để trống")
    private String question;
    
    @NotBlank(message = "Đáp án đúng không được để trống")
    private String correctAnswer;
    
    @NotNull(message = "Mức độ khó không được để trống")
    private String difficultyLevel; // EASY, MEDIUM, HARD
    
    private String explanation;
    
    // Loại câu hỏi (LISTENING hoặc READING)
    @NotNull(message = "Loại câu hỏi không được để trống")
    private String questionType;
    
    // Thứ tự câu hỏi trong nhóm
    private Integer questionOrder;
    
    @NotEmpty(message = "Tùy chọn không được để trống")
    private List<CreateOptionRequest> options;
    
    // Constructors
    public CreateQuestionRequest() {
    }
    
    public CreateQuestionRequest(String question, String correctAnswer, String difficultyLevel, 
                                String explanation, String questionType, 
                                Integer questionOrder, List<CreateOptionRequest> options) {
        this.question = question;
        this.correctAnswer = correctAnswer;
        this.difficultyLevel = difficultyLevel;
        this.explanation = explanation;
        this.questionType = questionType;
        this.questionOrder = questionOrder;
        this.options = options;
    }
    
    // Getters và Setters
    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(String difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public Integer getQuestionOrder() {
        return questionOrder;
    }

    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
    }

    public List<CreateOptionRequest> getOptions() {
        return options;
    }

    public void setOptions(List<CreateOptionRequest> options) {
        this.options = options;
    }
}