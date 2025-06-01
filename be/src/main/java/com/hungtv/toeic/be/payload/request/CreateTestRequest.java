package com.hungtv.toeic.be.payload.request;

import java.util.List;

import com.hungtv.toeic.be.models.Test.DifficultyLevel;
import com.hungtv.toeic.be.models.Test.TestType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateTestRequest {
    
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    
    private String description;
    
    @NotNull(message = "Loại bài thi không được để trống")
    private TestType type;
    
    @NotNull(message = "Thời gian làm bài không được để trống")
    @Min(value = 1, message = "Thời gian làm bài phải lớn hơn 0")
    private Integer duration;
    
    private String instructions;
    
    private DifficultyLevel difficulty = DifficultyLevel.MEDIUM;
    
    // Danh sách ID của các nhóm câu hỏi
    private List<Long> questionGroupIds;
    
    public CreateTestRequest() {
    }
    
    public CreateTestRequest(String title, String description, TestType type, Integer duration, 
                           String instructions, DifficultyLevel difficulty) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.duration = duration;
        this.instructions = instructions;
        this.difficulty = difficulty != null ? difficulty : DifficultyLevel.MEDIUM;
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
    
    public DifficultyLevel getDifficulty() {
        return difficulty;
    }
    
    public void setDifficulty(DifficultyLevel difficulty) {
        this.difficulty = difficulty != null ? difficulty : DifficultyLevel.MEDIUM;
    }
    
    public List<Long> getQuestionGroupIds() {
        return questionGroupIds;
    }
    
    public void setQuestionGroupIds(List<Long> questionGroupIds) {
        this.questionGroupIds = questionGroupIds;
    }
} 