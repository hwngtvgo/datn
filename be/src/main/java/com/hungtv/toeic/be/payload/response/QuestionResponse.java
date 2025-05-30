package com.hungtv.toeic.be.payload.response;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.hungtv.toeic.be.models.QuestionGroup;
import com.hungtv.toeic.be.models.ToeicQuestion;

public class QuestionResponse {
    private Long id;
    private String type;
    private Integer part;
    private String question;
    private String audioUrl;
    private Long questionGroupId;
    private String passage;
    private String imageUrl;
    private Integer questionOrder;
    private String correctAnswer;
    private String explanation;
    private String difficultyLevel;
    private Long testId;
    private String category;
    private List<OptionResponse> options = new ArrayList<>();
    
    public QuestionResponse() {
    }
    
    public QuestionResponse(ToeicQuestion question) {
        this.id = question.getId();
        
        // Lấy thông tin từ QuestionGroup
        QuestionGroup group = question.getQuestionGroup();
        if (group != null) {
            // Nếu thuộc nhóm, lấy thông tin từ nhóm
            this.type = group.getQuestionType().name();
            this.part = group.getPart();
            this.audioUrl = group.getAudioUrl();
            this.questionGroupId = group.getId();
            this.passage = group.getPassage();
            this.imageUrl = group.getImageUrl();
            
            // Lấy testId từ entity Test nếu có
            if (group.getTest() != null) {
                this.testId = group.getTest().getId();
            }
        } else {
            // Nếu không thuộc group nào, thì set category
            if (question.getCategory() != null) {
                this.category = question.getCategory().name();
            }
        }
        
        // Thông tin về câu hỏi cụ thể
        this.question = question.getQuestion();
        this.questionOrder = question.getQuestionOrder();
        this.correctAnswer = question.getCorrectAnswer();
        this.explanation = question.getExplanation();
        this.difficultyLevel = question.getDifficultyLevel().name();
        
        // Lấy danh sách các tùy chọn
        if (question.getOptions() != null) {
            this.options = question.getOptions().stream()
                    .map(OptionResponse::new)
                    .collect(Collectors.toList());
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public Integer getPart() {
        return part;
    }
    
    public void setPart(Integer part) {
        this.part = part;
    }
    
    public String getQuestion() {
        return question;
    }
    
    public void setQuestion(String question) {
        this.question = question;
    }
    
    public String getAudioUrl() {
        return audioUrl;
    }
    
    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }
    
    public Long getQuestionGroupId() {
        return questionGroupId;
    }
    
    public void setQuestionGroupId(Long questionGroupId) {
        this.questionGroupId = questionGroupId;
    }
    
    public String getPassage() {
        return passage;
    }
    
    public void setPassage(String passage) {
        this.passage = passage;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public Integer getQuestionOrder() {
        return questionOrder;
    }
    
    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
    }
    
    public String getCorrectAnswer() {
        return correctAnswer;
    }
    
    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }
    
    public String getExplanation() {
        return explanation;
    }
    
    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
    
    public String getDifficultyLevel() {
        return difficultyLevel;
    }
    
    public void setDifficultyLevel(String difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }
    
    public Long getTestId() {
        return testId;
    }
    
    public void setTestId(Long testId) {
        this.testId = testId;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public List<OptionResponse> getOptions() {
        return options;
    }
    
    public void setOptions(List<OptionResponse> options) {
        this.options = options;
    }
}