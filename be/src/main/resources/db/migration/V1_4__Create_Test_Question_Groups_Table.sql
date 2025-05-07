-- Tạo bảng trung gian để quản lý quan hệ many-to-many giữa tests và question_groups
CREATE TABLE IF NOT EXISTS test_question_groups (
    test_id BIGINT NOT NULL,
    question_group_id BIGINT NOT NULL,
    PRIMARY KEY (test_id, question_group_id),
    FOREIGN KEY (test_id) REFERENCES tests (id) ON DELETE CASCADE,
    FOREIGN KEY (question_group_id) REFERENCES question_groups (id) ON DELETE CASCADE
);

-- Di chuyển dữ liệu hiện có từ quan hệ one-to-many sang many-to-many
INSERT INTO test_question_groups (test_id, question_group_id)
SELECT t.id, qg.id FROM question_groups qg
JOIN tests t ON qg.test_id = t.id
WHERE qg.test_id IS NOT NULL;

-- Đánh dấu quan hệ test_id trong question_groups là có thể null trước khi xóa
ALTER TABLE question_groups MODIFY COLUMN test_id BIGINT NULL; 