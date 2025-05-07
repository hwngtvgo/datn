-- Tạo bảng tests
CREATE TABLE tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    duration INT NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Thêm cột question_type vào bảng question_groups
ALTER TABLE question_groups ADD COLUMN question_type VARCHAR(20) NOT NULL DEFAULT 'READING';

-- Cập nhật question_type dựa trên part
UPDATE question_groups SET question_type = 'LISTENING' WHERE part BETWEEN 1 AND 4;
UPDATE question_groups SET question_type = 'READING' WHERE part BETWEEN 5 AND 7;

-- Thay đổi cột test_id thành quan hệ với bảng tests
-- Đầu tiên tạo các bài test tạm thời dựa trên test_id hiện tại
INSERT INTO tests (title, type, duration, created_at)
SELECT DISTINCT CONCAT('Test ', test_id), 'FULL', 120, CURRENT_TIMESTAMP
FROM question_groups
WHERE test_id IS NOT NULL;

-- Cập nhật lại test_id cho các nhóm câu hỏi
ALTER TABLE question_groups DROP FOREIGN KEY IF EXISTS fk_question_group_test;
ALTER TABLE question_groups MODIFY COLUMN test_id BIGINT; 