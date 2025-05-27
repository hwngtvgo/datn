package com.hungtv.toeic.be.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hungtv.toeic.be.models.TestResult;
import com.hungtv.toeic.be.models.User;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    
    // Tìm tất cả kết quả bài thi của một người dùng
    List<TestResult> findByUserOrderByCreatedAtDesc(User user);
    
    // Tìm tất cả kết quả bài thi của một người dùng (phân trang)
    Page<TestResult> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Tìm kết quả cao nhất của người dùng cho một bài thi cụ thể
    @Query("SELECT tr FROM TestResult tr WHERE tr.user = :user AND tr.test.id = :testId " +
           "ORDER BY tr.totalScore DESC, tr.createdAt DESC")
    List<TestResult> findHighestScoreByUserAndTestId(@Param("user") User user, @Param("testId") Long testId, Pageable pageable);
    
    // Tìm điểm trung bình của người dùng
    @Query("SELECT AVG(tr.totalScore) FROM TestResult tr WHERE tr.user = :user")
    Double findAverageScoreByUser(@Param("user") User user);
    
    // Tìm số bài thi đã làm
    @Query("SELECT COUNT(tr) FROM TestResult tr WHERE tr.user = :user")
    Long countByUser(@Param("user") User user);
    
    // Tìm các kết quả bài thi trong khoảng thời gian
    List<TestResult> findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(
            User user, LocalDateTime startDate, LocalDateTime endDate);
    
    // Tìm kết quả cao nhất của người dùng
    @Query("SELECT MAX(tr.totalScore) FROM TestResult tr WHERE tr.user = :user")
    Integer findHighestScoreByUser(@Param("user") User user);
    
    // Thống kê điểm từng phần theo người dùng
    @Query("SELECT AVG(tr.listeningScore) as avgListening, " +
           "AVG(tr.readingScore) as avgReading, " +
           "AVG(tr.grammarScore) as avgGrammar, " +
           "AVG(tr.vocabularyScore) as avgVocabulary " +
           "FROM TestResult tr WHERE tr.user = :user")
    List<Object[]> getScoreStatisticsByUser(@Param("user") User user);
} 