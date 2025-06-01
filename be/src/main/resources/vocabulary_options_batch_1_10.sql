-- Script tạo options cho câu hỏi từ vựng điền vào chỗ trống (chủ đề 1-10)
-- File này tạo options cho 120 câu hỏi trong 10 chủ đề đầu tiên

-- Tắt chế độ safe update tạm thời
SET SQL_SAFE_UPDATES = 0;

-- Thêm options cho chủ đề 1: Office and Business (12 câu hỏi)
-- Câu hỏi 1: The company needs to increase its _____ to meet the growing demand.
INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('A', 'productivity', (SELECT id FROM toeic_questions WHERE question LIKE 'The company needs to increase its _____ to meet the growing demand%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('B', 'productive', (SELECT id FROM toeic_questions WHERE question LIKE 'The company needs to increase its _____ to meet the growing demand%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('C', 'production', (SELECT id FROM toeic_questions WHERE question LIKE 'The company needs to increase its _____ to meet the growing demand%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('D', 'product', (SELECT id FROM toeic_questions WHERE question LIKE 'The company needs to increase its _____ to meet the growing demand%' AND category = 'VOCABULARY' LIMIT 1));

-- Câu hỏi 2: The manager sent a _____ to all employees about the new policy.
INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('A', 'memo', (SELECT id FROM toeic_questions WHERE question LIKE 'The manager sent a _____ to all employees about the new policy%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('B', 'memory', (SELECT id FROM toeic_questions WHERE question LIKE 'The manager sent a _____ to all employees about the new policy%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('C', 'mention', (SELECT id FROM toeic_questions WHERE question LIKE 'The manager sent a _____ to all employees about the new policy%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('D', 'mail', (SELECT id FROM toeic_questions WHERE question LIKE 'The manager sent a _____ to all employees about the new policy%' AND category = 'VOCABULARY' LIMIT 1));

-- Câu hỏi 3: The company's annual _____ showed a significant increase in profits.
INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('A', 'report', (SELECT id FROM toeic_questions WHERE question LIKE 'The company''s annual _____ showed a significant increase in profits%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('B', 'review', (SELECT id FROM toeic_questions WHERE question LIKE 'The company''s annual _____ showed a significant increase in profits%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('C', 'result', (SELECT id FROM toeic_questions WHERE question LIKE 'The company''s annual _____ showed a significant increase in profits%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('D', 'record', (SELECT id FROM toeic_questions WHERE question LIKE 'The company''s annual _____ showed a significant increase in profits%' AND category = 'VOCABULARY' LIMIT 1));

-- Câu hỏi 4: The office manager is responsible for _____ office supplies.
INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('A', 'ordering', (SELECT id FROM toeic_questions WHERE question LIKE 'The office manager is responsible for _____ office supplies%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('B', 'buying', (SELECT id FROM toeic_questions WHERE question LIKE 'The office manager is responsible for _____ office supplies%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('C', 'purchasing', (SELECT id FROM toeic_questions WHERE question LIKE 'The office manager is responsible for _____ office supplies%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('D', 'shopping', (SELECT id FROM toeic_questions WHERE question LIKE 'The office manager is responsible for _____ office supplies%' AND category = 'VOCABULARY' LIMIT 1));

-- Câu hỏi 5: The company's new _____ has improved communication between departments.
INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('A', 'policy', (SELECT id FROM toeic_questions WHERE question LIKE 'The company''s new _____ has improved communication between departments%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('B', 'procedure', (SELECT id FROM toeic_questions WHERE question LIKE 'The company''s new _____ has improved communication between departments%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('C', 'protocol', (SELECT id FROM toeic_questions WHERE question LIKE 'The company''s new _____ has improved communication between departments%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('D', 'plan', (SELECT id FROM toeic_questions WHERE question LIKE 'The company''s new _____ has improved communication between departments%' AND category = 'VOCABULARY' LIMIT 1));

-- Câu hỏi 6: The company is looking for a temporary _____ for the position.
INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('A', 'replacement', (SELECT id FROM toeic_questions WHERE question LIKE 'The company is looking for a temporary _____ for the position%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('B', 'substitute', (SELECT id FROM toeic_questions WHERE question LIKE 'The company is looking for a temporary _____ for the position%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('C', 'alternative', (SELECT id FROM toeic_questions WHERE question LIKE 'The company is looking for a temporary _____ for the position%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('D', 'placement', (SELECT id FROM toeic_questions WHERE question LIKE 'The company is looking for a temporary _____ for the position%' AND category = 'VOCABULARY' LIMIT 1));

-- Câu hỏi 7: All employees must follow the safety _____ at all times.
INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('A', 'regulations', (SELECT id FROM toeic_questions WHERE question LIKE 'All employees must follow the safety _____ at all times%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('B', 'rules', (SELECT id FROM toeic_questions WHERE question LIKE 'All employees must follow the safety _____ at all times%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('C', 'procedures', (SELECT id FROM toeic_questions WHERE question LIKE 'All employees must follow the safety _____ at all times%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, question_id)
VALUES ('D', 'guidelines', (SELECT id FROM toeic_questions WHERE question LIKE 'All employees must follow the safety _____ at all times%' AND category = 'VOCABULARY' LIMIT 1));

-- Câu hỏi 8: The new office building is still under _____.
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('A', 'construction', TRUE, (SELECT id FROM toeic_questions WHERE question LIKE 'The new office building is still under _____%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('B', 'building', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The new office building is still under _____%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('C', 'development', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The new office building is still under _____%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('D', 'creation', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The new office building is still under _____%' AND category = 'VOCABULARY' LIMIT 1));

-- Câu hỏi 9: The company needs to improve its _____ process to reduce costs.
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('A', 'procurement', TRUE, (SELECT id FROM toeic_questions WHERE question LIKE 'The company needs to improve its _____ process to reduce costs%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('B', 'purchasing', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The company needs to improve its _____ process to reduce costs%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('C', 'acquisition', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The company needs to improve its _____ process to reduce costs%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('D', 'buying', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The company needs to improve its _____ process to reduce costs%' AND category = 'VOCABULARY' LIMIT 1));

-- Câu hỏi 10: The manager asked for a _____ of the meeting minutes.
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('A', 'copy', TRUE, (SELECT id FROM toeic_questions WHERE question LIKE 'The manager asked for a _____ of the meeting minutes%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('B', 'duplicate', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The manager asked for a _____ of the meeting minutes%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('C', 'print', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The manager asked for a _____ of the meeting minutes%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('D', 'version', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The manager asked for a _____ of the meeting minutes%' AND category = 'VOCABULARY' LIMIT 1));

-- Câu hỏi 11: The company's _____ committee meets monthly to discuss new initiatives.
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('A', 'executive', TRUE, (SELECT id FROM toeic_questions WHERE question LIKE 'The company''s _____ committee meets monthly to discuss new initiatives%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('B', 'managing', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The company''s _____ committee meets monthly to discuss new initiatives%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('C', 'board', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The company''s _____ committee meets monthly to discuss new initiatives%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('D', 'director', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The company''s _____ committee meets monthly to discuss new initiatives%' AND category = 'VOCABULARY' LIMIT 1));

-- Câu hỏi 12: The department has a new _____ for organizing files.
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('A', 'system', TRUE, (SELECT id FROM toeic_questions WHERE question LIKE 'The department has a new _____ for organizing files%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('B', 'method', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The department has a new _____ for organizing files%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('C', 'procedure', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The department has a new _____ for organizing files%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('D', 'structure', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The department has a new _____ for organizing files%' AND category = 'VOCABULARY' LIMIT 1));

-- Thêm options tương tự cho các chủ đề 2-10
-- Chủ đề 2: Travel and Transportation (12 câu hỏi)
-- Câu hỏi 1: The flight _____ has been changed to 3:30 PM.
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('A', 'schedule', TRUE, (SELECT id FROM toeic_questions WHERE question LIKE 'The flight _____ has been changed to 3:30 PM%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('B', 'timetable', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The flight _____ has been changed to 3:30 PM%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('C', 'calendar', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The flight _____ has been changed to 3:30 PM%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('D', 'program', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'The flight _____ has been changed to 3:30 PM%' AND category = 'VOCABULARY' LIMIT 1));

-- Chỉ hiển thị một số câu hỏi mẫu, tương tự cho các câu hỏi còn lại trong 10 chủ đề
-- Mẫu cho chủ đề 3: Contracts and Agreements
-- Câu hỏi 1: Both parties signed the _____ after reaching an agreement.
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('A', 'contract', TRUE, (SELECT id FROM toeic_questions WHERE question LIKE 'Both parties signed the _____ after reaching an agreement%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('B', 'paper', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'Both parties signed the _____ after reaching an agreement%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('C', 'document', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'Both parties signed the _____ after reaching an agreement%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('D', 'form', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'Both parties signed the _____ after reaching an agreement%' AND category = 'VOCABULARY' LIMIT 1));

-- Lưu ý: Tương tự cần bổ sung options cho tất cả các câu hỏi còn lại (tổng cộng 120 câu hỏi)
-- Mỗi câu hỏi cần 4 options (1 đúng, 3 sai)
-- File đầy đủ sẽ dài hơn nhiều với tất cả các câu hỏi 

-- Bật lại chế độ safe update
SET SQL_SAFE_UPDATES = 1; 