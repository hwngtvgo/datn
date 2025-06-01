-- Script tự động tạo options cho tất cả câu hỏi từ vựng (chủ đề 1-50)
-- File này sẽ tạo options cho tất cả 600 câu hỏi từ vựng điền vào chỗ trống

-- Tắt chế độ safe update tạm thời
SET SQL_SAFE_UPDATES = 0;

-- Xóa các bảng tạm nếu đã tồn tại từ lần chạy trước
DROP TEMPORARY TABLE IF EXISTS temp_vocabulary_questions;
DROP TEMPORARY TABLE IF EXISTS temp_random_keys;
DROP TEMPORARY TABLE IF EXISTS temp_missing_options;
DROP TEMPORARY TABLE IF EXISTS temp_answers_1_10;
DROP TEMPORARY TABLE IF EXISTS temp_answers_11_20;
DROP TEMPORARY TABLE IF EXISTS temp_answers_21_30;
DROP TEMPORARY TABLE IF EXISTS temp_answers_31_40;
DROP TEMPORARY TABLE IF EXISTS temp_answers_41_50;
DROP TEMPORARY TABLE IF EXISTS temp_all_answers;

-- Xóa options hiện có để tránh trùng lặp
DELETE FROM toeic_options 
WHERE question_id IN (SELECT id FROM toeic_questions WHERE category = 'VOCABULARY');

-- Tạo bảng tạm chứa tất cả câu hỏi từ vựng
CREATE TEMPORARY TABLE temp_vocabulary_questions AS
SELECT id, question, correct_answer, question_group_id
FROM toeic_questions
WHERE category = 'VOCABULARY'
ORDER BY question_group_id, question_order;

-- Tạo bảng tạm cho các đáp án theo từng chủ đề
CREATE TEMPORARY TABLE temp_answers_1_10 AS
SELECT DISTINCT correct_answer 
FROM temp_vocabulary_questions
WHERE question_group_id BETWEEN 1 AND 10;

CREATE TEMPORARY TABLE temp_answers_11_20 AS
SELECT DISTINCT correct_answer 
FROM temp_vocabulary_questions
WHERE question_group_id BETWEEN 11 AND 20;

CREATE TEMPORARY TABLE temp_answers_21_30 AS
SELECT DISTINCT correct_answer 
FROM temp_vocabulary_questions
WHERE question_group_id BETWEEN 21 AND 30;

CREATE TEMPORARY TABLE temp_answers_31_40 AS
SELECT DISTINCT correct_answer 
FROM temp_vocabulary_questions
WHERE question_group_id BETWEEN 31 AND 40;

CREATE TEMPORARY TABLE temp_answers_41_50 AS
SELECT DISTINCT correct_answer 
FROM temp_vocabulary_questions
WHERE question_group_id BETWEEN 41 AND 50;

-- Tạo bảng tạm cho tất cả đáp án
CREATE TEMPORARY TABLE temp_all_answers AS
SELECT DISTINCT correct_answer FROM temp_vocabulary_questions;

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

-- Chủ đề 1-10
-- Option sai đầu tiên cho chủ đề 1-10
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'B'
        WHEN trk.correct_option_key = 'B' THEN 'A'
        WHEN trk.correct_option_key = 'C' THEN 'A'
        WHEN trk.correct_option_key = 'D' THEN 'A'
    END,
    (SELECT correct_answer FROM temp_answers_1_10 
     WHERE correct_answer != tvq.correct_answer 
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 1 AND 10;

-- Option sai thứ hai cho chủ đề 1-10
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'C'
        WHEN trk.correct_option_key = 'B' THEN 'C'
        WHEN trk.correct_option_key = 'C' THEN 'B'
        WHEN trk.correct_option_key = 'D' THEN 'B'
    END,
    (SELECT correct_answer FROM temp_answers_1_10 
     WHERE correct_answer != tvq.correct_answer 
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'B'
             WHEN trk.correct_option_key = 'B' THEN 'A'
             WHEN trk.correct_option_key = 'C' THEN 'A'
             WHEN trk.correct_option_key = 'D' THEN 'A'
         END
     )
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 1 AND 10;

-- Option sai thứ ba cho chủ đề 1-10
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'D'
        WHEN trk.correct_option_key = 'B' THEN 'D'
        WHEN trk.correct_option_key = 'C' THEN 'D'
        WHEN trk.correct_option_key = 'D' THEN 'C'
    END,
    (SELECT correct_answer FROM temp_answers_1_10 
     WHERE correct_answer != tvq.correct_answer 
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'B'
             WHEN trk.correct_option_key = 'B' THEN 'A'
             WHEN trk.correct_option_key = 'C' THEN 'A'
             WHEN trk.correct_option_key = 'D' THEN 'A'
         END
     )
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'C'
             WHEN trk.correct_option_key = 'B' THEN 'C'
             WHEN trk.correct_option_key = 'C' THEN 'B'
             WHEN trk.correct_option_key = 'D' THEN 'B'
         END
     )
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 1 AND 10;

-- Chủ đề 11-20
-- Option sai đầu tiên cho chủ đề 11-20
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'B'
        WHEN trk.correct_option_key = 'B' THEN 'A'
        WHEN trk.correct_option_key = 'C' THEN 'A'
        WHEN trk.correct_option_key = 'D' THEN 'A'
    END,
    (SELECT correct_answer FROM temp_answers_11_20 
     WHERE correct_answer != tvq.correct_answer 
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 11 AND 20;

-- Option sai thứ hai cho chủ đề 11-20
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'C'
        WHEN trk.correct_option_key = 'B' THEN 'C'
        WHEN trk.correct_option_key = 'C' THEN 'B'
        WHEN trk.correct_option_key = 'D' THEN 'B'
    END,
    (SELECT correct_answer FROM temp_answers_11_20 
     WHERE correct_answer != tvq.correct_answer 
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'B'
             WHEN trk.correct_option_key = 'B' THEN 'A'
             WHEN trk.correct_option_key = 'C' THEN 'A'
             WHEN trk.correct_option_key = 'D' THEN 'A'
         END
     )
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 11 AND 20;

-- Option sai thứ ba cho chủ đề 11-20
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'D'
        WHEN trk.correct_option_key = 'B' THEN 'D'
        WHEN trk.correct_option_key = 'C' THEN 'D'
        WHEN trk.correct_option_key = 'D' THEN 'C'
    END,
    (SELECT correct_answer FROM temp_answers_11_20 
     WHERE correct_answer != tvq.correct_answer 
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'B'
             WHEN trk.correct_option_key = 'B' THEN 'A'
             WHEN trk.correct_option_key = 'C' THEN 'A'
             WHEN trk.correct_option_key = 'D' THEN 'A'
         END
     )
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'C'
             WHEN trk.correct_option_key = 'B' THEN 'C'
             WHEN trk.correct_option_key = 'C' THEN 'B'
             WHEN trk.correct_option_key = 'D' THEN 'B'
         END
     )
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 11 AND 20;

-- Chủ đề 21-30
-- Option sai đầu tiên cho chủ đề 21-30
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'B'
        WHEN trk.correct_option_key = 'B' THEN 'A'
        WHEN trk.correct_option_key = 'C' THEN 'A'
        WHEN trk.correct_option_key = 'D' THEN 'A'
    END,
    (SELECT correct_answer FROM temp_answers_21_30 
     WHERE correct_answer != tvq.correct_answer 
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 21 AND 30;

-- Option sai thứ hai cho chủ đề 21-30
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'C'
        WHEN trk.correct_option_key = 'B' THEN 'C'
        WHEN trk.correct_option_key = 'C' THEN 'B'
        WHEN trk.correct_option_key = 'D' THEN 'B'
    END,
    (SELECT correct_answer FROM temp_answers_21_30 
     WHERE correct_answer != tvq.correct_answer 
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'B'
             WHEN trk.correct_option_key = 'B' THEN 'A'
             WHEN trk.correct_option_key = 'C' THEN 'A'
             WHEN trk.correct_option_key = 'D' THEN 'A'
         END
     )
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 21 AND 30;

-- Option sai thứ ba cho chủ đề 21-30
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'D'
        WHEN trk.correct_option_key = 'B' THEN 'D'
        WHEN trk.correct_option_key = 'C' THEN 'D'
        WHEN trk.correct_option_key = 'D' THEN 'C'
    END,
    (SELECT correct_answer FROM temp_answers_21_30 
     WHERE correct_answer != tvq.correct_answer 
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'B'
             WHEN trk.correct_option_key = 'B' THEN 'A'
             WHEN trk.correct_option_key = 'C' THEN 'A'
             WHEN trk.correct_option_key = 'D' THEN 'A'
         END
     )
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'C'
             WHEN trk.correct_option_key = 'B' THEN 'C'
             WHEN trk.correct_option_key = 'C' THEN 'B'
             WHEN trk.correct_option_key = 'D' THEN 'B'
         END
     )
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 21 AND 30;

-- Chủ đề 31-40
-- Option sai đầu tiên cho chủ đề 31-40
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'B'
        WHEN trk.correct_option_key = 'B' THEN 'A'
        WHEN trk.correct_option_key = 'C' THEN 'A'
        WHEN trk.correct_option_key = 'D' THEN 'A'
    END,
    (SELECT correct_answer FROM temp_answers_31_40 
     WHERE correct_answer != tvq.correct_answer 
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 31 AND 40;

-- Option sai thứ hai cho chủ đề 31-40
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'C'
        WHEN trk.correct_option_key = 'B' THEN 'C'
        WHEN trk.correct_option_key = 'C' THEN 'B'
        WHEN trk.correct_option_key = 'D' THEN 'B'
    END,
    (SELECT correct_answer FROM temp_answers_31_40 
     WHERE correct_answer != tvq.correct_answer 
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'B'
             WHEN trk.correct_option_key = 'B' THEN 'A'
             WHEN trk.correct_option_key = 'C' THEN 'A'
             WHEN trk.correct_option_key = 'D' THEN 'A'
         END
     )
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 31 AND 40;

-- Option sai thứ ba cho chủ đề 31-40
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'D'
        WHEN trk.correct_option_key = 'B' THEN 'D'
        WHEN trk.correct_option_key = 'C' THEN 'D'
        WHEN trk.correct_option_key = 'D' THEN 'C'
    END,
    (SELECT correct_answer FROM temp_answers_31_40 
     WHERE correct_answer != tvq.correct_answer 
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'B'
             WHEN trk.correct_option_key = 'B' THEN 'A'
             WHEN trk.correct_option_key = 'C' THEN 'A'
             WHEN trk.correct_option_key = 'D' THEN 'A'
         END
     )
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'C'
             WHEN trk.correct_option_key = 'B' THEN 'C'
             WHEN trk.correct_option_key = 'C' THEN 'B'
             WHEN trk.correct_option_key = 'D' THEN 'B'
         END
     )
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 31 AND 40;

-- Chủ đề 41-50
-- Option sai đầu tiên cho chủ đề 41-50
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'B'
        WHEN trk.correct_option_key = 'B' THEN 'A'
        WHEN trk.correct_option_key = 'C' THEN 'A'
        WHEN trk.correct_option_key = 'D' THEN 'A'
    END,
    (SELECT correct_answer FROM temp_answers_41_50 
     WHERE correct_answer != tvq.correct_answer 
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 41 AND 50;

-- Option sai thứ hai cho chủ đề 41-50
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'C'
        WHEN trk.correct_option_key = 'B' THEN 'C'
        WHEN trk.correct_option_key = 'C' THEN 'B'
        WHEN trk.correct_option_key = 'D' THEN 'B'
    END,
    (SELECT correct_answer FROM temp_answers_41_50 
     WHERE correct_answer != tvq.correct_answer 
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'B'
             WHEN trk.correct_option_key = 'B' THEN 'A'
             WHEN trk.correct_option_key = 'C' THEN 'A'
             WHEN trk.correct_option_key = 'D' THEN 'A'
         END
     )
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 41 AND 50;

-- Option sai thứ ba cho chủ đề 41-50
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN trk.correct_option_key = 'A' THEN 'D'
        WHEN trk.correct_option_key = 'B' THEN 'D'
        WHEN trk.correct_option_key = 'C' THEN 'D'
        WHEN trk.correct_option_key = 'D' THEN 'C'
    END,
    (SELECT correct_answer FROM temp_answers_41_50 
     WHERE correct_answer != tvq.correct_answer 
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'B'
             WHEN trk.correct_option_key = 'B' THEN 'A'
             WHEN trk.correct_option_key = 'C' THEN 'A'
             WHEN trk.correct_option_key = 'D' THEN 'A'
         END
     )
     AND correct_answer != (
         SELECT option_text FROM toeic_options 
         WHERE question_id = tvq.id 
         AND option_key = CASE 
             WHEN trk.correct_option_key = 'A' THEN 'C'
             WHEN trk.correct_option_key = 'B' THEN 'C'
             WHEN trk.correct_option_key = 'C' THEN 'B'
             WHEN trk.correct_option_key = 'D' THEN 'B'
         END
     )
     ORDER BY RAND() LIMIT 1),
    tvq.id
FROM temp_vocabulary_questions tvq
JOIN temp_random_keys trk ON tvq.id = trk.question_id
WHERE tvq.question_group_id BETWEEN 41 AND 50;

-- Xử lý các câu hỏi không có đủ options
CREATE TEMPORARY TABLE temp_missing_options AS
SELECT 
    tq.id AS question_id,
    tq.question,
    tq.question_group_id,
    COUNT(to2.id) AS option_count
FROM 
    toeic_questions tq
LEFT JOIN 
    toeic_options to2 ON tq.id = to2.question_id
WHERE 
    tq.category = 'VOCABULARY'
GROUP BY 
    tq.id, tq.question, tq.question_group_id
HAVING 
    COUNT(to2.id) < 4;

-- Thêm options sai từ các chủ đề khác cho câu hỏi thiếu options
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'A') THEN 'A'
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'B') THEN 'B'
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'C') THEN 'C'
        ELSE 'D'
    END,
    (SELECT correct_answer FROM temp_all_answers 
     WHERE correct_answer NOT IN (SELECT option_text FROM toeic_options WHERE question_id = tmo.question_id)
     ORDER BY RAND() LIMIT 1),
    tmo.question_id
FROM temp_missing_options tmo
WHERE tmo.option_count = 3;

-- Xử lý câu hỏi thiếu 2 options
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'A') THEN 'A'
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'B') THEN 'B'
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'C') THEN 'C'
        ELSE 'D'
    END,
    (SELECT correct_answer FROM temp_all_answers 
     WHERE correct_answer NOT IN (SELECT option_text FROM toeic_options WHERE question_id = tmo.question_id)
     ORDER BY RAND() LIMIT 1),
    tmo.question_id
FROM temp_missing_options tmo
WHERE tmo.option_count = 2;

-- Thêm option thứ hai cho câu hỏi thiếu 2 options
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'A') THEN 'A'
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'B') THEN 'B'
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'C') THEN 'C'
        ELSE 'D'
    END,
    (SELECT correct_answer FROM temp_all_answers 
     WHERE correct_answer NOT IN (SELECT option_text FROM toeic_options WHERE question_id = tmo.question_id)
     ORDER BY RAND() LIMIT 1),
    tmo.question_id
FROM temp_missing_options tmo
WHERE tmo.option_count = 2;

-- Xử lý câu hỏi thiếu 3 options
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'B',
    (SELECT correct_answer FROM temp_all_answers 
     WHERE correct_answer != (SELECT correct_answer FROM toeic_questions WHERE id = tmo.question_id)
     ORDER BY RAND() LIMIT 1),
    tmo.question_id
FROM temp_missing_options tmo
WHERE tmo.option_count = 1;

INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'C',
    (SELECT correct_answer FROM temp_all_answers 
     WHERE correct_answer != (SELECT correct_answer FROM toeic_questions WHERE id = tmo.question_id)
     AND correct_answer != (SELECT option_text FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'B')
     ORDER BY RAND() LIMIT 1),
    tmo.question_id
FROM temp_missing_options tmo
WHERE tmo.option_count = 1;

INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'D',
    (SELECT correct_answer FROM temp_all_answers 
     WHERE correct_answer != (SELECT correct_answer FROM toeic_questions WHERE id = tmo.question_id)
     AND correct_answer != (SELECT option_text FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'B')
     AND correct_answer != (SELECT option_text FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'C')
     ORDER BY RAND() LIMIT 1),
    tmo.question_id
FROM temp_missing_options tmo
WHERE tmo.option_count = 1;

-- Xóa tất cả bảng tạm
DROP TEMPORARY TABLE IF EXISTS temp_vocabulary_questions;
DROP TEMPORARY TABLE IF EXISTS temp_random_keys;
DROP TEMPORARY TABLE IF EXISTS temp_missing_options;
DROP TEMPORARY TABLE IF EXISTS temp_answers_1_10;
DROP TEMPORARY TABLE IF EXISTS temp_answers_11_20;
DROP TEMPORARY TABLE IF EXISTS temp_answers_21_30;
DROP TEMPORARY TABLE IF EXISTS temp_answers_31_40;
DROP TEMPORARY TABLE IF EXISTS temp_answers_41_50;
DROP TEMPORARY TABLE IF EXISTS temp_all_answers;

-- Thống kê kết quả
SELECT 
    COUNT(DISTINCT question_id) AS 'Số lượng câu hỏi có options',
    (SELECT COUNT(*) FROM toeic_questions WHERE category = 'VOCABULARY') AS 'Tổng số câu hỏi từ vựng'
FROM toeic_options;

-- Kiểm tra câu hỏi thiếu options
SELECT 
    tq.id AS question_id,
    tq.question,
    tq.question_group_id,
    COUNT(to2.id) AS option_count
FROM 
    toeic_questions tq
LEFT JOIN 
    toeic_options to2 ON tq.id = to2.question_id
WHERE 
    tq.category = 'VOCABULARY'
GROUP BY 
    tq.id, tq.question, tq.question_group_id
HAVING 
    COUNT(to2.id) != 4
ORDER BY 
    tq.question_group_id, tq.id;

-- Bật lại chế độ safe update
SET SQL_SAFE_UPDATES = 1;

-- Hướng dẫn sử dụng
/*
Hướng dẫn sử dụng:

1. Đảm bảo đã thêm tất cả câu hỏi từ vựng vào database sử dụng các file:
   - vocabulary_fill_blanks_batch_1.sql
   - vocabulary_fill_blanks_batch_2.sql
   - vocabulary_fill_blanks_batch_3.sql
   - vocabulary_fill_blanks_batch_4.sql
   - vocabulary_fill_blanks_batch_5.sql

2. Chạy file này để tự động tạo options cho tất cả 600 câu hỏi

3. Kiểm tra kết quả sử dụng câu lệnh SELECT ở cuối file

4. Nếu có câu hỏi thiếu options, thêm thủ công hoặc điều chỉnh script

Ưu điểm của script này:
- Tự động tạo options cho tất cả câu hỏi chỉ với một file SQL
- Xử lý trường hợp thiếu options
- Đảm bảo mỗi câu hỏi có đủ 4 options (A, B, C, D)
- Đảm bảo mỗi câu hỏi chỉ có 1 đáp án đúng
*/ 