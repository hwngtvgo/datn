package com.hungtv.toeic.be.models;

import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_answers")
public class UserAnswer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "test_result_id", nullable = false)
    private TestResult testResult;
    
    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private ToeicQuestion question;
    
    @Column(name = "user_answer")
    private String userAnswer;
    
    @Column(name = "is_correct")
    private Boolean isCorrect;
    
    // Constructors
    public UserAnswer() {
    }
    
    public UserAnswer(TestResult testResult, ToeicQuestion question, String userAnswer) {
        this.testResult = testResult;
        this.question = question;
        this.userAnswer = userAnswer;
        this.isCorrect = Objects.equals(userAnswer, question.getCorrectAnswer());
    }
    
    public UserAnswer(Long id, TestResult testResult, ToeicQuestion question, String userAnswer, Boolean isCorrect) {
        this.id = id;
        this.testResult = testResult;
        this.question = question;
        this.userAnswer = userAnswer;
        this.isCorrect = isCorrect != null ? isCorrect : Objects.equals(userAnswer, question.getCorrectAnswer());
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TestResult getTestResult() {
        return testResult;
    }

    public void setTestResult(TestResult testResult) {
        this.testResult = testResult;
    }

    public ToeicQuestion getQuestion() {
        return question;
    }

    public void setQuestion(ToeicQuestion question) {
        this.question = question;
    }

    public String getUserAnswer() {
        return userAnswer;
    }

    public void setUserAnswer(String userAnswer) {
        this.userAnswer = userAnswer;
        if (question != null) {
            this.isCorrect = Objects.equals(userAnswer, question.getCorrectAnswer());
        }
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }
    
    // equals, hashCode và toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserAnswer that = (UserAnswer) o;
        return Objects.equals(id, that.id) &&
               Objects.equals(testResult.getId(), that.testResult.getId()) &&
               Objects.equals(question.getId(), that.question.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, testResult.getId(), question.getId());
    }

    @Override
    public String toString() {
        return "UserAnswer{" +
               "id=" + id +
               ", testResultId=" + (testResult != null ? testResult.getId() : null) +
               ", questionId=" + (question != null ? question.getId() : null) +
               ", userAnswer='" + userAnswer + '\'' +
               ", isCorrect=" + isCorrect +
               '}';
    }
} 