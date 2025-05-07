package com.hungtv.toeic.be.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.hungtv.toeic.be.models.QuestionGroup;

@Repository
public interface QuestionGroupRepository extends JpaRepository<QuestionGroup, Long> {
    
    // Lấy danh sách nhóm câu hỏi theo type
    List<QuestionGroup> findByQuestionType(QuestionGroup.QuestionType type);
    
    // Lấy danh sách nhóm câu hỏi theo part
    List<QuestionGroup> findByPart(Integer part);
    
    // Lấy danh sách nhóm câu hỏi theo type và part
    List<QuestionGroup> findByQuestionTypeAndPart(QuestionGroup.QuestionType type, Integer part);
    
    // Query tùy chỉnh để tìm nhóm câu hỏi có chứa passage
    @Query("SELECT qg FROM QuestionGroup qg WHERE qg.passage IS NOT NULL AND qg.passage <> ''")
    List<QuestionGroup> findAllWithPassage();
}