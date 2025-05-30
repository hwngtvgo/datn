package com.hungtv.toeic.be.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "tests")
public class Test {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    private TestType type;
    
    @NotNull
    private Integer duration; // Thời gian làm bài (phút)
    
    @Column(columnDefinition = "TEXT")
    private String instructions; // Hướng dẫn làm bài
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @ManyToMany
    @JoinTable(
        name = "test_question_groups",
        joinColumns = @JoinColumn(name = "test_id"),
        inverseJoinColumns = @JoinColumn(name = "question_group_id")
    )
    private List<QuestionGroup> questionGroups = new ArrayList<>();
    
    // Enum cho loại bài thi
    public enum TestType {
        FULL, LISTENING_ONLY, READING_ONLY, CUSTOM, MINI, PRACTICE, GRAMMAR_ONLY, VOCABULARY_ONLY
    }
    
    // Constructors
    public Test() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Test(Long id, String title, String description, TestType type, Integer duration, 
                String instructions, LocalDateTime createdAt, String createdBy, Boolean isActive) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.duration = duration;
        this.instructions = instructions;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.createdBy = createdBy;
        this.isActive = isActive != null ? isActive : true;
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
    
    public List<QuestionGroup> getQuestionGroups() {
        return questionGroups;
    }

    public void setQuestionGroups(List<QuestionGroup> questionGroups) {
        this.questionGroups = questionGroups;
    }
    
    // Phương thức tiện ích để thêm/xóa QuestionGroup
    public void addQuestionGroup(QuestionGroup questionGroup) {
        if (!questionGroups.contains(questionGroup)) {
            questionGroups.add(questionGroup);
        }
    }
    
    public void removeQuestionGroup(QuestionGroup questionGroup) {
        questionGroups.remove(questionGroup);
    }
    
    // equals, hashCode và toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Test test = (Test) o;
        return Objects.equals(id, test.id) &&
                Objects.equals(title, test.title) &&
                type == test.type;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, type);
    }

    @Override
    public String toString() {
        return "Test{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", type=" + type +
                ", duration=" + duration +
                ", createdAt=" + createdAt +
                ", isActive=" + isActive +
                '}';
    }
}
