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
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "question_groups")
public class QuestionGroup {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "question_type")
    private QuestionType questionType;
    
    @NotNull
    private Integer part;
    
    @Column(name = "audio_url")
    private String audioUrl;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(columnDefinition = "TEXT")
    private String passage;
    
    @ManyToOne
    @JoinColumn(name = "test_id")
    private Test test;
    
    @OneToMany(mappedBy = "questionGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ToeicQuestion> questions = new HashSet<>();
    
    // Enum cho phân loại listening/reading
    public enum QuestionType {
        LISTENING, READING
    }
    
    // Constructors
    public QuestionGroup() {
    }
    
    public QuestionGroup(Long id, QuestionType questionType, Integer part, String audioUrl, 
                        String imageUrl, String passage, Test test, Set<ToeicQuestion> questions) {
        this.id = id;
        this.questionType = questionType;
        this.part = part;
        this.audioUrl = audioUrl;
        this.imageUrl = imageUrl;
        this.passage = passage;
        this.test = test;
        this.questions = questions;
    }
    
    // Getters và Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    
    public QuestionType getQuestionType() {
        return questionType;
    }

    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }

    public Integer getPart() {
        return part;
    }

    public void setPart(Integer part) {
        this.part = part;
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

    public Test getTest() {
        return test;
    }

    public void setTest(Test test) {
        this.test = test;
    }

    public Set<ToeicQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(Set<ToeicQuestion> questions) {
        this.questions = questions;
    }
    
    // Phương thức tiện ích để thêm/xóa câu hỏi
    public void addQuestion(ToeicQuestion question) {
        questions.add(question);
        question.setQuestionGroup(this);
    }
    
    public void removeQuestion(ToeicQuestion question) {
        questions.remove(question);
        question.setQuestionGroup(null);
    }
    
    // equals, hashCode và toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        QuestionGroup that = (QuestionGroup) o;
        return Objects.equals(id, that.id) &&
               questionType == that.questionType &&
               Objects.equals(part, that.part);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, questionType, part);
    }

    @Override
    public String toString() {
        return "QuestionGroup{" +
               "id=" + id +
               ", questionType=" + questionType +
               ", part=" + part +
               ", audioUrl='" + audioUrl + '\'' +
               ", imageUrl='" + imageUrl + '\'' +
               ", test=" + (test != null ? test.getId() : null) +
               '}';
    }
}