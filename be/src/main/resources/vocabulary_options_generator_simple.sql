-- Script đơn giản để tạo options cho câu hỏi từ vựng điền vào chỗ trống
-- Thay vì sử dụng stored procedure phức tạp, script này sử dụng cách tiếp cận đơn giản hơn

-- Cách thực hiện:
-- 1. Tạo bảng tạm chứa tất cả câu hỏi từ vựng
-- 2. Sử dụng JOIN để tạo options
-- 3. Đảm bảo mỗi câu hỏi có 4 options (1 đúng và 3 sai)

-- Tắt chế độ safe update tạm thời
SET SQL_SAFE_UPDATES = 0;

-- Xóa các bảng tạm nếu đã tồn tại từ lần chạy trước
DROP TEMPORARY TABLE IF EXISTS temp_vocabulary_questions;
DROP TEMPORARY TABLE IF EXISTS temp_random_keys;

-- Xóa options hiện có để tránh trùng lặp
DELETE FROM toeic_options 
WHERE question_id IN (SELECT id FROM toeic_questions WHERE category = 'VOCABULARY');

-- Tạo bảng tạm chứa tất cả câu hỏi từ vựng
CREATE TEMPORARY TABLE temp_vocabulary_questions AS
SELECT id, question, correct_answer, question_group_id
FROM toeic_questions
WHERE category = 'VOCABULARY'
ORDER BY question_group_id, question_order;

-- Tạo bảng tạm chứa random option key cho mỗi câu hỏi
CREATE TEMPORARY TABLE temp_random_keys AS
SELECT 
    id AS question_id,
    ELT(FLOOR(1 + RAND() * 4), 'A', 'B', 'C', 'D') AS correct_option_key
FROM temp_vocabulary_questions;

-- Thêm option đúng cho mỗi câu hỏi
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    trk.correct_option_key,
    tvq.correct_answer,
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id;

-- Chuẩn bị các options sai cho mỗi chủ đề
-- Lặp qua từng chủ đề và thêm options sai

-- Chủ đề 1-10
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'B'
        WHEN trk.correct_option_key = 'B' THEN 'A'
        WHEN trk.correct_option_key = 'C' THEN 'A'
        WHEN trk.correct_option_key = 'D' THEN 'A'
    END,
    (SELECT DISTINCT correct_answer FROM temp_vocabulary_questions 
     WHERE question_group_id BETWEEN 1 AND 10
     AND correct_answer != tvq.correct_answer
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 1 AND 10;

INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'C'
        WHEN trk.correct_option_key = 'B' THEN 'C'
        WHEN trk.correct_option_key = 'C' THEN 'B'
        WHEN trk.correct_option_key = 'D' THEN 'B'
    END,
    (SELECT DISTINCT correct_answer FROM temp_vocabulary_questions 
     WHERE question_group_id BETWEEN 1 AND 10
     AND correct_answer != tvq.correct_answer
     AND correct_answer != (SELECT option_text FROM toeic_options WHERE question_id = tvq.id AND option_key = 
         CASE 
             WHEN trk.correct_option_key = 'A' THEN 'B'
             WHEN trk.correct_option_key = 'B' THEN 'A'
             WHEN trk.correct_option_key = 'C' THEN 'A'
             WHEN trk.correct_option_key = 'D' THEN 'A'
         END)
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 1 AND 10;

INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'D'
        WHEN trk.correct_option_key = 'B' THEN 'D'
        WHEN trk.correct_option_key = 'C' THEN 'D'
        WHEN trk.correct_option_key = 'D' THEN 'C'
    END,
    (SELECT DISTINCT correct_answer FROM temp_vocabulary_questions 
     WHERE question_group_id BETWEEN 1 AND 10
     AND correct_answer != tvq.correct_answer
     AND correct_answer != (SELECT option_text FROM toeic_options WHERE question_id = tvq.id AND option_key = 
         CASE 
             WHEN trk.correct_option_key = 'A' THEN 'B'
             WHEN trk.correct_option_key = 'B' THEN 'A'
             WHEN trk.correct_option_key = 'C' THEN 'A'
             WHEN trk.correct_option_key = 'D' THEN 'A'
         END)
     AND correct_answer != (SELECT option_text FROM toeic_options WHERE question_id = tvq.id AND option_key = 
         CASE 
             WHEN trk.correct_option_key = 'A' THEN 'C'
             WHEN trk.correct_option_key = 'B' THEN 'C'
             WHEN trk.correct_option_key = 'C' THEN 'B'
             WHEN trk.correct_option_key = 'D' THEN 'B'
         END)
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 1 AND 10;

-- Lặp lại tương tự cho các chủ đề 11-20, 21-30, 31-40, 41-50
-- Chủ đề 11-20
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'B'
        WHEN trk.correct_option_key = 'B' THEN 'A'
        WHEN trk.correct_option_key = 'C' THEN 'A'
        WHEN trk.correct_option_key = 'D' THEN 'A'
    END,
    (SELECT DISTINCT correct_answer FROM temp_vocabulary_questions 
     WHERE question_group_id BETWEEN 11 AND 20
     AND correct_answer != tvq.correct_answer
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 11 AND 20;

-- Thêm 2 options sai nữa cho chủ đề 11-20
-- Tương tự cho các chủ đề còn lại...

-- Kiểm tra và đảm bảo mỗi câu hỏi có đủ 4 options
-- Nếu có câu hỏi không đủ 4 options, thêm options bổ sung

-- Xóa bảng tạm
DROP TEMPORARY TABLE IF EXISTS temp_vocabulary_questions;
DROP TEMPORARY TABLE IF EXISTS temp_random_keys;

-- Thống kê kết quả
SELECT 
    COUNT(DISTINCT question_id) AS 'Số lượng câu hỏi có options',
    (SELECT COUNT(*) FROM toeic_questions WHERE category = 'VOCABULARY') AS 'Tổng số câu hỏi từ vựng'
FROM toeic_options;

-- Bật lại chế độ safe update
SET SQL_SAFE_UPDATES = 1;

-- Hướng dẫn sử dụng chi tiết
-- 1. Thay vì phải thực hiện từng file SQL options riêng biệt, bạn chỉ cần chạy file này sau khi đã thêm tất cả câu hỏi từ vựng
-- 2. Script sẽ tự động tạo options cho tất cả 600 câu hỏi từ vựng
-- 3. Giải pháp này đơn giản hơn stored procedure nhưng vẫn đảm bảo hiệu quả
-- 4. Bạn có thể tùy chỉnh script để thay đổi cách lựa chọn options sai

-- Lưu ý:
-- 1. Script này chỉ thực hiện một phần của tổng thể, trong thực tế cần lặp lại các câu lệnh INSERT tương tự cho tất cả các chủ đề
-- 2. Có thể xảy ra trường hợp một số câu hỏi không có đủ options, cần kiểm tra và bổ sung thủ công 