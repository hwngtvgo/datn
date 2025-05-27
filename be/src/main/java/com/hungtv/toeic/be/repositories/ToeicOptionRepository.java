package com.hungtv.toeic.be.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hungtv.toeic.be.models.ToeicOption;

@Repository
public interface ToeicOptionRepository extends JpaRepository<ToeicOption, Long> {
    
    // Tìm tất cả các tùy chọn cho một câu hỏi
    List<ToeicOption> findByQuestionId(Long questionId);
    
    // Xóa tất cả các tùy chọn cho một câu hỏi
    void deleteByQuestionId(Long questionId);
} 