package com.hungtv.toeic.be.payload.response;

import java.util.List;
import java.util.Map;

public class UserStatisticsResponse {
    private Long userId;
    private String username;
    private Long testsTaken;
    private Double averageScore;
    private Integer bestScore;
    private Double listeningAvg;
    private Double readingAvg;
    private Double grammarAvg;
    private Double vocabularyAvg;
    private Integer listeningScaled;
    private Integer readingScaled;
    private List<TestResultResponse> recentTests;
    private Map<String, Long> testsByMonth;
    private Map<String, Double> scoresByMonth;
    
    // Constructors
    public UserStatisticsResponse() {
    }
    
    public UserStatisticsResponse(Long userId, String username, Long testsTaken, Double averageScore,
                                 Integer bestScore, Double listeningAvg, Double readingAvg,
                                 Double grammarAvg, Double vocabularyAvg, Integer listeningScaled,
                                 Integer readingScaled, List<TestResultResponse> recentTests,
                                 Map<String, Long> testsByMonth, Map<String, Double> scoresByMonth) {
        this.userId = userId;
        this.username = username;
        this.testsTaken = testsTaken;
        this.averageScore = averageScore;
        this.bestScore = bestScore;
        this.listeningAvg = listeningAvg;
        this.readingAvg = readingAvg;
        this.grammarAvg = grammarAvg;
        this.vocabularyAvg = vocabularyAvg;
        this.listeningScaled = listeningScaled;
        this.readingScaled = readingScaled;
        this.recentTests = recentTests;
        this.testsByMonth = testsByMonth;
        this.scoresByMonth = scoresByMonth;
    }
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getTestsTaken() {
        return testsTaken;
    }

    public void setTestsTaken(Long testsTaken) {
        this.testsTaken = testsTaken;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public Integer getBestScore() {
        return bestScore;
    }

    public void setBestScore(Integer bestScore) {
        this.bestScore = bestScore;
    }

    public Double getListeningAvg() {
        return listeningAvg;
    }

    public void setListeningAvg(Double listeningAvg) {
        this.listeningAvg = listeningAvg;
    }

    public Double getReadingAvg() {
        return readingAvg;
    }

    public void setReadingAvg(Double readingAvg) {
        this.readingAvg = readingAvg;
    }

    public Double getGrammarAvg() {
        return grammarAvg;
    }

    public void setGrammarAvg(Double grammarAvg) {
        this.grammarAvg = grammarAvg;
    }

    public Double getVocabularyAvg() {
        return vocabularyAvg;
    }

    public void setVocabularyAvg(Double vocabularyAvg) {
        this.vocabularyAvg = vocabularyAvg;
    }

    public Integer getListeningScaled() {
        return listeningScaled;
    }

    public void setListeningScaled(Integer listeningScaled) {
        this.listeningScaled = listeningScaled;
    }

    public Integer getReadingScaled() {
        return readingScaled;
    }

    public void setReadingScaled(Integer readingScaled) {
        this.readingScaled = readingScaled;
    }

    public List<TestResultResponse> getRecentTests() {
        return recentTests;
    }

    public void setRecentTests(List<TestResultResponse> recentTests) {
        this.recentTests = recentTests;
    }

    public Map<String, Long> getTestsByMonth() {
        return testsByMonth;
    }

    public void setTestsByMonth(Map<String, Long> testsByMonth) {
        this.testsByMonth = testsByMonth;
    }

    public Map<String, Double> getScoresByMonth() {
        return scoresByMonth;
    }

    public void setScoresByMonth(Map<String, Double> scoresByMonth) {
        this.scoresByMonth = scoresByMonth;
    }
} 