package com.hungtv.toeic.be.payload.response;

import java.time.LocalDateTime;

public class TestResultResponse {
    private Long id;
    private Long testId;
    private String testTitle;
    private Integer listeningScore;
    private Integer readingScore;
    private Integer grammarScore;
    private Integer vocabularyScore;
    private Integer totalScore;
    private Integer listeningScaledScore;
    private Integer readingScaledScore;
    private Integer completionTimeInMinutes;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private LocalDateTime createdAt;
    
    // Constructors
    public TestResultResponse() {
    }
    
    public TestResultResponse(Long id, Long testId, String testTitle, Integer listeningScore, 
                             Integer readingScore, Integer grammarScore, Integer vocabularyScore,
                             Integer totalScore, Integer listeningScaledScore, Integer readingScaledScore,
                             Integer completionTimeInMinutes, Integer correctAnswers, 
                             Integer totalQuestions, LocalDateTime createdAt) {
        this.id = id;
        this.testId = testId;
        this.testTitle = testTitle;
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
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTestId() {
        return testId;
    }

    public void setTestId(Long testId) {
        this.testId = testId;
    }

    public String getTestTitle() {
        return testTitle;
    }

    public void setTestTitle(String testTitle) {
        this.testTitle = testTitle;
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
} 