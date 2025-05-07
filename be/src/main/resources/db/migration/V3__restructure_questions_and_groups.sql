-- Tạo bảng question_groups
CREATE TABLE question_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_type VARCHAR(20) NOT NULL,
    part INT NOT NULL,
    audio_url VARCHAR(255),
    image_url VARCHAR(255),
    passage TEXT,
    test_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Thêm cột question_group_id vào bảng toeic_questions
ALTER TABLE toeic_questions ADD COLUMN question_group_id BIGINT;

-- Thêm khóa ngoại
ALTER TABLE toeic_questions 
ADD CONSTRAINT fk_question_group 
FOREIGN KEY (question_group_id) REFERENCES question_groups (id);

-- Di chuyển dữ liệu từ audio_group sang question_groups
-- 1. Tạo nhóm câu hỏi audio từ các nhóm hiện tại
INSERT INTO question_groups (group_type, part, audio_url, image_url, test_id)
SELECT 'AUDIO', part, audio_url, image_url, test_id
FROM toeic_questions
WHERE audio_group IS NOT NULL
GROUP BY audio_group;

-- 2. Cập nhật question_group_id cho các câu hỏi thuộc audio_group
UPDATE toeic_questions t1
JOIN question_groups qg ON qg.audio_url = t1.audio_url AND qg.group_type = 'AUDIO' AND qg.part = t1.part
SET t1.question_group_id = qg.id
WHERE t1.audio_group IS NOT NULL;

-- 3. Di chuyển dữ liệu từ passage_group sang question_groups
INSERT INTO question_groups (group_type, part, passage, image_url, test_id)
SELECT 'PASSAGE', part, passage, image_url, test_id
FROM toeic_questions
WHERE passage_group IS NOT NULL
GROUP BY passage_group;

-- 4. Cập nhật question_group_id cho các câu hỏi thuộc passage_group
UPDATE toeic_questions t1
JOIN question_groups qg ON qg.passage = t1.passage AND qg.group_type = 'PASSAGE' AND qg.part = t1.part
SET t1.question_group_id = qg.id
WHERE t1.passage_group IS NOT NULL;

-- Sau khi di chuyển dữ liệu xong, ta có thể xóa các cột không cần thiết nữa
ALTER TABLE toeic_questions
DROP COLUMN audio_url,
DROP COLUMN audio_group,
DROP COLUMN passage,
DROP COLUMN passage_group,
DROP COLUMN image_url;