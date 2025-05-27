package com.hungtv.toeic.be.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hungtv.toeic.be.models.TestResult;
import com.hungtv.toeic.be.models.UserAnswer;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    
    // Tìm tất cả câu trả lời của người dùng trong một bài thi
    List<UserAnswer> findByTestResultOrderByQuestion_QuestionOrder(TestResult testResult);
    
    // Đếm số câu trả lời đúng trong một bài thi
    @Query("SELECT COUNT(ua) FROM UserAnswer ua WHERE ua.testResult = :testResult AND ua.isCorrect = true")
    Long countCorrectAnswersByTestResult(@Param("testResult") TestResult testResult);
    
    // Tính tỷ lệ đúng theo loại câu hỏi
    @Query("SELECT " +
           "SUM(CASE WHEN ua.question.category = 'GRAMMAR' AND ua.isCorrect = true THEN 1 ELSE 0 END) as grammarCorrect, " +
           "COUNT(CASE WHEN ua.question.category = 'GRAMMAR' THEN 1 ELSE NULL END) as grammarTotal, " +
           "SUM(CASE WHEN ua.question.category = 'VOCABULARY' AND ua.isCorrect = true THEN 1 ELSE 0 END) as vocabCorrect, " +
           "COUNT(CASE WHEN ua.question.category = 'VOCABULARY' THEN 1 ELSE NULL END) as vocabTotal " +
           "FROM UserAnswer ua WHERE ua.testResult = :testResult")
    List<Object[]> getAnswerStatsByCategory(@Param("testResult") TestResult testResult);
    
    // Tính tỷ lệ đúng theo phần thi (listening/reading)
    @Query("SELECT " +
           "SUM(CASE WHEN ua.question.questionGroup.questionType = 'LISTENING' AND ua.isCorrect = true THEN 1 ELSE 0 END) as listeningCorrect, " +
           "COUNT(CASE WHEN ua.question.questionGroup.questionType = 'LISTENING' THEN 1 ELSE NULL END) as listeningTotal, " +
           "SUM(CASE WHEN ua.question.questionGroup.questionType = 'READING' AND ua.isCorrect = true THEN 1 ELSE 0 END) as readingCorrect, " +
           "COUNT(CASE WHEN ua.question.questionGroup.questionType = 'READING' THEN 1 ELSE NULL END) as readingTotal " +
           "FROM UserAnswer ua WHERE ua.testResult = :testResult")
    List<Object[]> getAnswerStatsByType(@Param("testResult") TestResult testResult);
} 