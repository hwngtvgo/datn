package com.hungtv.toeic.be.models;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "toeic_questions")
public class ToeicQuestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String question;
    
    @Column(name = "question_order")
    private Integer questionOrder;
    
    @Column(name = "correct_answer")
    private String correctAnswer;
    
    @Column(columnDefinition = "TEXT")
    private String explanation;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level")
    private DifficultyLevel difficultyLevel;
    
    // Thêm trường category cho các câu hỏi không thuộc nhóm
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private QuestionCategory category;
    
    // Quan hệ với QuestionGroup - có thể null
    @ManyToOne(optional = true)
    @JoinColumn(name = "question_group_id", nullable = true)
    private QuestionGroup questionGroup;
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ToeicOption> options = new HashSet<>();
    
    // Enum cho độ khó
    public enum DifficultyLevel {
        EASY, MEDIUM, HARD
    }
    
    // Enum cho phân loại câu hỏi
    public enum QuestionCategory {
        GRAMMAR, VOCABULARY, PRACTICE, OTHER
    }
    
    // Constructors
    public ToeicQuestion() {
    }
    
    public ToeicQuestion(Long id, String question, Integer questionOrder,
                         String correctAnswer, String explanation, DifficultyLevel difficultyLevel,
                         QuestionGroup questionGroup, Set<ToeicOption> options) {
        this.id = id;
        this.question = question;
        this.questionOrder = questionOrder;
        this.correctAnswer = correctAnswer;
        this.explanation = explanation;
        this.difficultyLevel = difficultyLevel;
        this.questionGroup = questionGroup;
        this.options = options;
    }
    
    // Constructor với category
    public ToeicQuestion(Long id, String question, Integer questionOrder, 
                         String correctAnswer, String explanation, DifficultyLevel difficultyLevel,
                         QuestionCategory category, Set<ToeicOption> options) {
        this.id = id;
        this.question = question;
        this.questionOrder = questionOrder;
        this.correctAnswer = correctAnswer;
        this.explanation = explanation;
        this.difficultyLevel = difficultyLevel;
        this.category = category;
        this.options = options;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
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

    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }
    
    public QuestionCategory getCategory() {
        return category;
    }
    
    public void setCategory(QuestionCategory category) {
        this.category = category;
    }

    public QuestionGroup getQuestionGroup() {
        return questionGroup;
    }

    public void setQuestionGroup(QuestionGroup questionGroup) {
        this.questionGroup = questionGroup;
    }

    public Set<ToeicOption> getOptions() {
        return options;
    }

    public void setOptions(Set<ToeicOption> options) {
        this.options = options;
    }
    
    // Thêm/xóa tùy chọn
    public void addOption(ToeicOption option) {
        options.add(option);
        option.setQuestion(this);
    }
    
    public void removeOption(ToeicOption option) {
        options.remove(option);
        option.setQuestion(null);
    }
    
    // equals, hashCode và toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ToeicQuestion that = (ToeicQuestion) o;
        return Objects.equals(id, that.id) &&
               Objects.equals(question, that.question);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, question);
    }

    @Override
    public String toString() {
        return "ToeicQuestion{" +
               "id=" + id +
               ", question='" + question + '\'' +
               ", questionOrder=" + questionOrder +
               ", difficultyLevel=" + difficultyLevel +
               ", category=" + category +
               '}';
    }
}