-- Cập nhật schema cho bảng toeic_questions

-- Đảm bảo cột audio_group đã tồn tại
ALTER TABLE toeic_questions ADD COLUMN IF NOT EXISTS audio_group BIGINT NULL;

-- Đảm bảo cột passage_group đã tồn tại
ALTER TABLE toeic_questions ADD COLUMN IF NOT EXISTS passage_group BIGINT NULL;

-- Đảm bảo cột question_order đã tồn tại (để sắp xếp câu hỏi trong nhóm)
ALTER TABLE toeic_questions ADD COLUMN IF NOT EXISTS question_order INT NULL;

-- Đảm bảo cột image_url đã tồn tại (để lưu đường dẫn hình ảnh chung)
ALTER TABLE toeic_questions ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL;

-- Tạo index để tối ưu tìm kiếm câu hỏi theo nhóm
CREATE INDEX IF NOT EXISTS idx_toeic_questions_audio_group ON toeic_questions(audio_group);
CREATE INDEX IF NOT EXISTS idx_toeic_questions_passage_group ON toeic_questions(passage_group);

-- Tạo index để tối ưu tìm kiếm câu hỏi theo part và type
CREATE INDEX IF NOT EXISTS idx_toeic_questions_part ON toeic_questions(part);
CREATE INDEX IF NOT EXISTS idx_toeic_questions_type ON toeic_questions(type);

-- Tạo index để tối ưu tìm kiếm câu hỏi theo đề thi
CREATE INDEX IF NOT EXISTS idx_toeic_questions_test_id ON toeic_questions(test_id); 