package com.hungtv.toeic.be.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hungtv.toeic.be.models.QuestionGroup;
import com.hungtv.toeic.be.models.ToeicQuestion;

@Repository
public interface ToeicQuestionRepository extends JpaRepository<ToeicQuestion, Long> {
    
    // Tìm câu hỏi theo questionGroup, sắp xếp theo thứ tự câu hỏi
    List<ToeicQuestion> findByQuestionGroupIdOrderByQuestionOrder(Long questionGroupId);
    
    // Tìm câu hỏi theo questionGroup của loại listening, sắp xếp theo thứ tự câu hỏi
    @Query("SELECT q FROM ToeicQuestion q WHERE q.questionGroup.id = :groupId AND q.questionGroup.questionType = 'LISTENING' ORDER BY q.questionOrder")
    List<ToeicQuestion> findByListeningGroupOrderByQuestionOrder(@Param("groupId") Long groupId);
    
    // Tìm câu hỏi theo questionGroup của loại reading, sắp xếp theo thứ tự câu hỏi
    @Query("SELECT q FROM ToeicQuestion q WHERE q.questionGroup.id = :groupId AND q.questionGroup.questionType = 'READING' ORDER BY q.questionOrder")
    List<ToeicQuestion> findByReadingGroupOrderByQuestionOrder(@Param("groupId") Long groupId);
    
    // Tìm câu hỏi theo phần thi (thông qua questionGroup)
    @Query("SELECT q FROM ToeicQuestion q WHERE q.questionGroup.part = :part")
    Page<ToeicQuestion> findByPart(@Param("part") Integer part, Pageable pageable);
    
    // Tìm câu hỏi theo loại (Listening/Reading) thông qua questionGroup
    @Query("SELECT q FROM ToeicQuestion q WHERE q.questionGroup.questionType = :type")
    Page<ToeicQuestion> findByQuestionType(@Param("type") QuestionGroup.QuestionType type, Pageable pageable);
    
    // Tìm câu hỏi theo mức độ khó
    Page<ToeicQuestion> findByDifficultyLevel(ToeicQuestion.DifficultyLevel level, Pageable pageable);
    
    // Tìm câu hỏi thuộc một bài test (thông qua questionGroup)
    @Query("SELECT q FROM ToeicQuestion q WHERE q.questionGroup.test.id = :testId ORDER BY q.questionOrder")
    List<ToeicQuestion> findByTestIdOrderByQuestionOrder(@Param("testId") Long testId);
}