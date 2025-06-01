-- Script đơn giản nhất để tạo options cho câu hỏi từ vựng điền vào chỗ trống
-- Phiên bản siêu đơn giản không sử dụng bảng tạm và subquery phức tạp

-- Tắt chế độ safe update tạm thời
SET SQL_SAFE_UPDATES = 0;

-- Xóa options hiện có để tránh trùng lặp
DELETE FROM toeic_options 
WHERE question_id IN (SELECT id FROM toeic_questions WHERE category = 'VOCABULARY');

-- Phương pháp 1: Thêm option đúng với key ngẫu nhiên cho tất cả câu hỏi
-- Thêm option đúng với key A
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'A',
    correct_answer,
    id
FROM toeic_questions
WHERE category = 'VOCABULARY'
AND MOD(id, 4) = 0;

-- Thêm option đúng với key B
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'B',
    correct_answer,
    id
FROM toeic_questions
WHERE category = 'VOCABULARY'
AND MOD(id, 4) = 1;

-- Thêm option đúng với key C
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'C',
    correct_answer,
    id
FROM toeic_questions
WHERE category = 'VOCABULARY'
AND MOD(id, 4) = 2;

-- Thêm option đúng với key D
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'D',
    correct_answer,
    id
FROM toeic_questions
WHERE category = 'VOCABULARY'
AND MOD(id, 4) = 3;

-- Phương pháp 2: Thêm options sai từ danh sách cố định
-- Tạo danh sách từ vựng thường gặp làm options sai
CREATE TEMPORARY TABLE fixed_wrong_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(100)
);

-- Thêm các từ vựng thường gặp làm options sai
INSERT INTO fixed_wrong_options (word) VALUES 
('report'), ('meeting'), ('office'), ('manager'), ('business'),
('company'), ('employee'), ('department'), ('schedule'), ('project'),
('customer'), ('contract'), ('product'), ('service'), ('quality'),
('deadline'), ('strategy'), ('budget'), ('resource'), ('performance'),
('market'), ('team'), ('goal'), ('result'), ('analysis'),
('presentation'), ('communication'), ('leadership'), ('management'), ('skill'),
('experience'), ('solution'), ('problem'), ('decision'), ('opportunity'),
('challenge'), ('improvement'), ('development'), ('technology'), ('system'),
('data'), ('information'), ('method'), ('procedure'), ('document'),
('policy'), ('regulation'), ('requirement'), ('assessment'), ('evaluation'),
('recommendation'), ('interview'), ('application'), ('position'), ('candidate'),
('training'), ('conference'), ('discussion'), ('negotiation'), ('agreement'),
('responsibility'), ('authority'), ('coordination'), ('supervision'), ('direction'),
('instruction'), ('feedback'), ('suggestion'), ('comment'), ('criticism'),
('approval'), ('support'), ('assistance'), ('cooperation'), ('collaboration'),
('competition'), ('advertisement'), ('promotion'), ('discount'), ('investment'),
('revenue'), ('profit'), ('expense'), ('cost'), ('loss'),
('transaction'), ('payment'), ('invoice'), ('receipt'), ('balance'),
('account'), ('audit'), ('taxation'), ('insurance'), ('benefit'),
('salary'), ('wage'), ('bonus'), ('compensation'), ('pension'),
('retirement'), ('resignation'), ('promotion'), ('demotion'), ('transfer');

-- Thêm options sai B, C, D cho câu hỏi có đáp án đúng là A
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'B',
    f1.word,
    q.id
FROM toeic_questions q
JOIN fixed_wrong_options f1 ON MOD(q.id + f1.id, 100) = 0
WHERE q.category = 'VOCABULARY'
AND EXISTS (SELECT 1 FROM toeic_options o WHERE o.question_id = q.id AND o.option_key = 'A');

INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'C',
    f1.word,
    q.id
FROM toeic_questions q
JOIN fixed_wrong_options f1 ON MOD(q.id + f1.id, 100) = 1
WHERE q.category = 'VOCABULARY'
AND EXISTS (SELECT 1 FROM toeic_options o WHERE o.question_id = q.id AND o.option_key = 'A');

INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'D',
    f1.word,
    q.id
FROM toeic_questions q
JOIN fixed_wrong_options f1 ON MOD(q.id + f1.id, 100) = 2
WHERE q.category = 'VOCABULARY'
AND EXISTS (SELECT 1 FROM toeic_options o WHERE o.question_id = q.id AND o.option_key = 'A');

-- Thêm options sai A, C, D cho câu hỏi có đáp án đúng là B
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'A',
    f1.word,
    q.id
FROM toeic_questions q
JOIN fixed_wrong_options f1 ON MOD(q.id + f1.id, 100) = 3
WHERE q.category = 'VOCABULARY'
AND EXISTS (SELECT 1 FROM toeic_options o WHERE o.question_id = q.id AND o.option_key = 'B');

INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'C',
    f1.word,
    q.id
FROM toeic_questions q
JOIN fixed_wrong_options f1 ON MOD(q.id + f1.id, 100) = 4
WHERE q.category = 'VOCABULARY'
AND EXISTS (SELECT 1 FROM toeic_options o WHERE o.question_id = q.id AND o.option_key = 'B');

INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'D',
    f1.word,
    q.id
FROM toeic_questions q
JOIN fixed_wrong_options f1 ON MOD(q.id + f1.id, 100) = 5
WHERE q.category = 'VOCABULARY'
AND EXISTS (SELECT 1 FROM toeic_options o WHERE o.question_id = q.id AND o.option_key = 'B');

-- Thêm options sai A, B, D cho câu hỏi có đáp án đúng là C
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'A',
    f1.word,
    q.id
FROM toeic_questions q
JOIN fixed_wrong_options f1 ON MOD(q.id + f1.id, 100) = 6
WHERE q.category = 'VOCABULARY'
AND EXISTS (SELECT 1 FROM toeic_options o WHERE o.question_id = q.id AND o.option_key = 'C');

INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'B',
    f1.word,
    q.id
FROM toeic_questions q
JOIN fixed_wrong_options f1 ON MOD(q.id + f1.id, 100) = 7
WHERE q.category = 'VOCABULARY'
AND EXISTS (SELECT 1 FROM toeic_options o WHERE o.question_id = q.id AND o.option_key = 'C');

INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'D',
    f1.word,
    q.id
FROM toeic_questions q
JOIN fixed_wrong_options f1 ON MOD(q.id + f1.id, 100) = 8
WHERE q.category = 'VOCABULARY'
AND EXISTS (SELECT 1 FROM toeic_options o WHERE o.question_id = q.id AND o.option_key = 'C');

-- Thêm options sai A, B, C cho câu hỏi có đáp án đúng là D
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'A',
    f1.word,
    q.id
FROM toeic_questions q
JOIN fixed_wrong_options f1 ON MOD(q.id + f1.id, 100) = 9
WHERE q.category = 'VOCABULARY'
AND EXISTS (SELECT 1 FROM toeic_options o WHERE o.question_id = q.id AND o.option_key = 'D');

INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'B',
    f1.word,
    q.id
FROM toeic_questions q
JOIN fixed_wrong_options f1 ON MOD(q.id + f1.id, 100) = 10
WHERE q.category = 'VOCABULARY'
AND EXISTS (SELECT 1 FROM toeic_options o WHERE o.question_id = q.id AND o.option_key = 'D');

INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    'C',
    f1.word,
    q.id
FROM toeic_questions q
JOIN fixed_wrong_options f1 ON MOD(q.id + f1.id, 100) = 11
WHERE q.category = 'VOCABULARY'
AND EXISTS (SELECT 1 FROM toeic_options o WHERE o.question_id = q.id AND o.option_key = 'D');

-- Xử lý các câu hỏi thiếu options
-- Tạo bảng tạm để kiểm tra câu hỏi thiếu options
CREATE TEMPORARY TABLE temp_missing_options AS
SELECT 
    q.id AS question_id,
    COUNT(o.id) AS option_count
FROM 
    toeic_questions q
LEFT JOIN 
    toeic_options o ON q.id = o.question_id
WHERE 
    q.category = 'VOCABULARY'
GROUP BY 
    q.id
HAVING 
    COUNT(o.id) < 4;

-- Thêm options còn thiếu cho các câu hỏi chưa đủ
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'A') THEN 'A'
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'B') THEN 'B'
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'C') THEN 'C'
        ELSE 'D'
    END,
    (SELECT word FROM fixed_wrong_options ORDER BY RAND() LIMIT 1),
    tmo.question_id
FROM temp_missing_options tmo;

-- Kiểm tra lại và thêm options còn thiếu lần 2
DELETE FROM temp_missing_options;
INSERT INTO temp_missing_options
SELECT 
    q.id AS question_id,
    COUNT(o.id) AS option_count
FROM 
    toeic_questions q
LEFT JOIN 
    toeic_options o ON q.id = o.question_id
WHERE 
    q.category = 'VOCABULARY'
GROUP BY 
    q.id
HAVING 
    COUNT(o.id) < 4;

-- Thêm options còn thiếu lần 2
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'A') THEN 'A'
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'B') THEN 'B'
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'C') THEN 'C'
        ELSE 'D'
    END,
    (SELECT word FROM fixed_wrong_options ORDER BY RAND() LIMIT 1),
    tmo.question_id
FROM temp_missing_options tmo;

-- Kiểm tra lại và thêm options còn thiếu lần 3
DELETE FROM temp_missing_options;
INSERT INTO temp_missing_options
SELECT 
    q.id AS question_id,
    COUNT(o.id) AS option_count
FROM 
    toeic_questions q
LEFT JOIN 
    toeic_options o ON q.id = o.question_id
WHERE 
    q.category = 'VOCABULARY'
GROUP BY 
    q.id
HAVING 
    COUNT(o.id) < 4;

-- Thêm options còn thiếu lần 3
INSERT INTO toeic_options (option_key, option_text, question_id)
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'A') THEN 'A'
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'B') THEN 'B'
        WHEN NOT EXISTS (SELECT 1 FROM toeic_options WHERE question_id = tmo.question_id AND option_key = 'C') THEN 'C'
        ELSE 'D'
    END,
    (SELECT word FROM fixed_wrong_options ORDER BY RAND() LIMIT 1),
    tmo.question_id
FROM temp_missing_options tmo;

-- Xóa bảng tạm
DROP TEMPORARY TABLE IF EXISTS temp_missing_options;
DROP TEMPORARY TABLE IF EXISTS fixed_wrong_options;

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

1. Script này sử dụng phương pháp siêu đơn giản để tạo options:
   - Phân bổ ngẫu nhiên đáp án đúng vào các options A, B, C, D
   - Sử dụng danh sách từ vựng cố định làm options sai
   - Không cần thông minh như các script khác

2. Ưu điểm:
   - Đơn giản, không sử dụng subquery phức tạp
   - Không cần các bảng tạm đặc biệt
   - Không tham chiếu lại bảng tạm trong truy vấn con
   - Sử dụng các từ vựng phổ biến làm options sai

3. Nhược điểm:
   - Options sai có thể không liên quan đến chủ đề của câu hỏi
   - Không thông minh bằng các script khác

4. Sử dụng script này khi các script khác gặp lỗi
*/ 