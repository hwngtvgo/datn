package com.hungtv.toeic.be.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    
    // Thêm các phương thức hỗ trợ phân trang
    
    // Lấy danh sách nhóm câu hỏi theo type với phân trang
    Page<QuestionGroup> findByQuestionType(QuestionGroup.QuestionType type, Pageable pageable);
    
    // Lấy danh sách nhóm câu hỏi theo part với phân trang
    Page<QuestionGroup> findByPart(Integer part, Pageable pageable);
    
    // Lấy danh sách nhóm câu hỏi theo type và part với phân trang
    Page<QuestionGroup> findByQuestionTypeAndPart(QuestionGroup.QuestionType type, Integer part, Pageable pageable);
    
    // Thêm các phương thức tìm kiếm theo title
    
    // Tìm kiếm nhóm câu hỏi theo title với phân trang
    Page<QuestionGroup> findByTitleContaining(String title, Pageable pageable);
    
    // Tìm kiếm nhóm câu hỏi theo title và type với phân trang
    Page<QuestionGroup> findByTitleContainingAndQuestionType(String title, QuestionGroup.QuestionType type, Pageable pageable);
    
    // Tìm kiếm nhóm câu hỏi theo title và part với phân trang
    Page<QuestionGroup> findByTitleContainingAndPart(String title, Integer part, Pageable pageable);
    
    // Tìm kiếm nhóm câu hỏi theo title, type và part với phân trang
    Page<QuestionGroup> findByTitleContainingAndQuestionTypeAndPart(String title, QuestionGroup.QuestionType type, Integer part, Pageable pageable);
}