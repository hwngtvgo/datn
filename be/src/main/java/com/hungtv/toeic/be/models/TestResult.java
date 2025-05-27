package com.hungtv.toeic.be.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.data.annotation.CreatedDate;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "test_results")
public class TestResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;
    
    @Column(name = "listening_score")
    private Integer listeningScore;
    
    @Column(name = "reading_score")
    private Integer readingScore;
    
    @Column(name = "grammar_score")
    private Integer grammarScore;
    
    @Column(name = "vocabulary_score")
    private Integer vocabularyScore;
    
    @Column(name = "total_score")
    private Integer totalScore;
    
    @Column(name = "listening_scaled_score")
    private Integer listeningScaledScore;
    
    @Column(name = "reading_scaled_score")
    private Integer readingScaledScore;
    
    @Column(name = "completion_time_in_minutes")
    private Integer completionTimeInMinutes;
    
    @Column(name = "correct_answers")
    private Integer correctAnswers;
    
    @Column(name = "total_questions")
    private Integer totalQuestions;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "testResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAnswer> userAnswers = new ArrayList<>();
    
    // Constructors
    public TestResult() {
        this.createdAt = LocalDateTime.now();
    }
    
    public TestResult(User user, Test test) {
        this.user = user;
        this.test = test;
        this.createdAt = LocalDateTime.now();
    }
    
    public TestResult(Long id, User user, Test test, Integer listeningScore, Integer readingScore,
                     Integer grammarScore, Integer vocabularyScore, Integer totalScore,
                     Integer listeningScaledScore, Integer readingScaledScore,
                     Integer completionTimeInMinutes, Integer correctAnswers, Integer totalQuestions,
                     LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.test = test;
        this.listeningScore = listeningScore;
        this.readingScore = readingScore;
        this.grammarScore = grammarScore;
        this.vocabularyScore = vocabularyScore;
        this.totalScore = totalScore;
        this.listeningScaledScore = listeningScaledScore;
        this.readingScaledScore = readingScaledScore;
        this.completionTimeInMinutes = completionTimeInMinutes;
        this.correctAnswers = correctAnswers;
        this.totalQuestions = totalQuestions;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Test getTest() {
        return test;
    }

    public void setTest(Test test) {
        this.test = test;
    }

    public Integer getListeningScore() {
        return listeningScore;
    }

    public void setListeningScore(Integer listeningScore) {
        this.listeningScore = listeningScore;
    }

    public Integer getReadingScore() {
        return readingScore;
    }

    public void setReadingScore(Integer readingScore) {
        this.readingScore = readingScore;
    }
    
    public Integer getGrammarScore() {
        return grammarScore;
    }

    public void setGrammarScore(Integer grammarScore) {
        this.grammarScore = grammarScore;
    }

    public Integer getVocabularyScore() {
        return vocabularyScore;
    }

    public void setVocabularyScore(Integer vocabularyScore) {
        this.vocabularyScore = vocabularyScore;
    }

    public Integer getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Integer totalScore) {
        this.totalScore = totalScore;
    }
    
    public Integer getListeningScaledScore() {
        return listeningScaledScore;
    }

    public void setListeningScaledScore(Integer listeningScaledScore) {
        this.listeningScaledScore = listeningScaledScore;
    }

    public Integer getReadingScaledScore() {
        return readingScaledScore;
    }

    public void setReadingScaledScore(Integer readingScaledScore) {
        this.readingScaledScore = readingScaledScore;
    }

    public Integer getCompletionTimeInMinutes() {
        return completionTimeInMinutes;
    }

    public void setCompletionTimeInMinutes(Integer completionTimeInMinutes) {
        this.completionTimeInMinutes = completionTimeInMinutes;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<UserAnswer> getUserAnswers() {
        return userAnswers;
    }

    public void setUserAnswers(List<UserAnswer> userAnswers) {
        this.userAnswers = userAnswers;
    }
    
    public void addUserAnswer(UserAnswer userAnswer) {
        userAnswers.add(userAnswer);
        userAnswer.setTestResult(this);
    }
    
    public void removeUserAnswer(UserAnswer userAnswer) {
        userAnswers.remove(userAnswer);
        userAnswer.setTestResult(null);
    }
    
    // equals, hashCode và toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TestResult that = (TestResult) o;
        return Objects.equals(id, that.id) &&
               Objects.equals(user.getId(), that.user.getId()) &&
               Objects.equals(test.getId(), that.test.getId()) &&
               Objects.equals(createdAt, that.createdAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, user.getId(), test.getId(), createdAt);
    }

    @Override
    public String toString() {
        return "TestResult{" +
               "id=" + id +
               ", userId=" + (user != null ? user.getId() : null) +
               ", testId=" + (test != null ? test.getId() : null) +
               ", listeningScore=" + listeningScore +
               ", readingScore=" + readingScore +
               ", totalScore=" + totalScore +
               ", createdAt=" + createdAt +
               '}';
    }
} 