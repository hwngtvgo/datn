package com.hungtv.toeic.be.repository;

import com.hungtv.toeic.be.models.ToeicOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ToeicOptionRepository extends JpaRepository<ToeicOption, Long> {
    
    // Tìm tất cả các tùy chọn cho một câu hỏi
    List<ToeicOption> findByQuestionId(Long questionId);
    
    // Xóa tất cả các tùy chọn cho một câu hỏi
    void deleteByQuestionId(Long questionId);
} 