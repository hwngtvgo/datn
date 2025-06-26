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
    
    // Tìm điểm trung bình TOEIC của người dùng (loại bỏ điểm 0)
    @Query("SELECT AVG(tr.listeningScaledScore + tr.readingScaledScore) FROM TestResult tr " +
           "WHERE tr.user = :user AND (tr.listeningScaledScore + tr.readingScaledScore) > 0")
    Double findAverageToeicScoreByUser(@Param("user") User user);
    
    // Tìm điểm trung bình của người dùng (giữ lại cho backward compatibility)
    @Query("SELECT AVG(tr.totalScore) FROM TestResult tr WHERE tr.user = :user")
    Double findAverageScoreByUser(@Param("user") User user);
    
    // Tìm số bài thi đã làm
    @Query("SELECT COUNT(tr) FROM TestResult tr WHERE tr.user = :user")
    Long countByUser(@Param("user") User user);
    
    // Tìm các kết quả bài thi trong khoảng thời gian
    List<TestResult> findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(
            User user, LocalDateTime startDate, LocalDateTime endDate);
    
    // Tìm kết quả cao nhất TOEIC của người dùng
    @Query("SELECT MAX(tr.listeningScaledScore + tr.readingScaledScore) FROM TestResult tr " +
           "WHERE tr.user = :user")
    Integer findHighestToeicScoreByUser(@Param("user") User user);
    
    // Tìm kết quả cao nhất của người dùng (giữ lại cho backward compatibility)
    @Query("SELECT MAX(tr.totalScore) FROM TestResult tr WHERE tr.user = :user")
    Integer findHighestScoreByUser(@Param("user") User user);
    
    // Thống kê điểm từng phần theo người dùng
    @Query("SELECT AVG(tr.listeningScore) as avgListening, " +
           "AVG(tr.readingScore) as avgReading, " +
           "AVG(tr.grammarScore) as avgGrammar, " +
           "AVG(tr.vocabularyScore) as avgVocabulary " +
           "FROM TestResult tr WHERE tr.user = :user")
    List<Object[]> getScoreStatisticsByUser(@Param("user") User user);

    /**
     * Đếm số lượng bài thi đã hoàn thành của một người dùng sau một thời điểm nhất định
     * 
     * @param user Người dùng
     * @param date Thời điểm bắt đầu tính
     * @return Số lượng bài thi
     */
    int countByUserAndCreatedAtAfter(User user, LocalDateTime date);
    
    // Tìm tất cả kết quả bài thi liên kết với một đề thi cụ thể
    List<TestResult> findByTest(com.hungtv.toeic.be.models.Test test);
    
    // (Dành cho Admin) Tìm tất cả kết quả trong khoảng thời gian
    List<TestResult> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);
    
    // (Dành cho Admin) Tìm điểm trung bình TOEIC tổng quát của tất cả users (loại bỏ điểm 0)
    @Query("SELECT AVG(tr.listeningScaledScore + tr.readingScaledScore) FROM TestResult tr " +
           "WHERE (tr.listeningScaledScore + tr.readingScaledScore) > 0")
    Double findOverallAverageToeicScore();
    
    // (Dành cho Admin) Tìm điểm trung bình tổng quát của tất cả users (giữ lại cho backward compatibility)
    @Query("SELECT AVG(tr.totalScore) FROM TestResult tr")
    Double findOverallAverageScore();
    
    // (Dành cho Admin) Lấy top users theo điểm trung bình TOEIC (loại bỏ điểm 0)
    @Query("SELECT u.id, u.username, u.fullName, " +
           "AVG(tr.listeningScaledScore + tr.readingScaledScore), " +
           "COUNT(CASE WHEN (tr.listeningScaledScore + tr.readingScaledScore) > 0 THEN 1 ELSE NULL END) " +
           "FROM TestResult tr JOIN tr.user u " +
           "WHERE (tr.listeningScaledScore + tr.readingScaledScore) > 0 " +
           "GROUP BY u.id, u.username, u.fullName " +
           "HAVING COUNT(CASE WHEN (tr.listeningScaledScore + tr.readingScaledScore) > 0 THEN 1 ELSE NULL END) > 0 " +
           "ORDER BY AVG(tr.listeningScaledScore + tr.readingScaledScore) DESC")
    List<Object[]> getTopUsersByAverageToeicScore(Pageable pageable);
    
    // (Dành cho Admin) Lấy top users theo điểm trung bình (giữ lại cho backward compatibility)
    @Query("SELECT u.id, u.username, u.fullName, AVG(tr.totalScore), COUNT(tr) " +
           "FROM TestResult tr JOIN tr.user u " +
           "GROUP BY u.id, u.username, u.fullName " +
           "HAVING COUNT(tr) > 0 " +
           "ORDER BY AVG(tr.totalScore) DESC")
    List<Object[]> getTopUsersByAverageScore(Pageable pageable);
} 