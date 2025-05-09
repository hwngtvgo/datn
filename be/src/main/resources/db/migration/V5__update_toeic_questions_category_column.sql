-- Cập nhật cột category trong bảng toeic_questions để chấp nhận tất cả các giá trị enum

-- Kiểm tra xem cột category đã tồn tại chưa
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'toeic_learning' 
    AND TABLE_NAME = 'toeic_questions' 
    AND COLUMN_NAME = 'category'
);

-- Nếu cột đã tồn tại, thì sửa đổi nó
SET @sql = IF(@column_exists > 0, 
    'ALTER TABLE toeic_questions MODIFY COLUMN category VARCHAR(20)', 
    'ALTER TABLE toeic_questions ADD COLUMN category VARCHAR(20)'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm comment để giải thích thay đổi
-- Cột category bây giờ chấp nhận tất cả các giá trị enum QuestionCategory (GRAMMAR, VOCABULARY, PRACTICE, OTHER)
-- thay vì chỉ giới hạn một số giá trị nhất định 