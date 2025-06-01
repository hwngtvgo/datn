-- Script thêm options cho câu hỏi điền từ vào chỗ trống - Chủ đề 1-10
-- Chủ đề 1: Office and Business

-- Thêm options cho chủ đề 1 (Office and Business)
-- Câu hỏi 1
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'meeting', true, id FROM toeic_questions WHERE question = 'The team will have a _____ to discuss the new project next week.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'party', false, id FROM toeic_questions WHERE question = 'The team will have a _____ to discuss the new project next week.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'session', false, id FROM toeic_questions WHERE question = 'The team will have a _____ to discuss the new project next week.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'gathering', false, id FROM toeic_questions WHERE question = 'The team will have a _____ to discuss the new project next week.' AND question_group_id = 1;

-- Câu hỏi 2
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'schedule', false, id FROM toeic_questions WHERE question = 'She sent an email to confirm the _____ for tomorrow''s conference call.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'plan', false, id FROM toeic_questions WHERE question = 'She sent an email to confirm the _____ for tomorrow''s conference call.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'appointment', true, id FROM toeic_questions WHERE question = 'She sent an email to confirm the _____ for tomorrow''s conference call.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'reservation', false, id FROM toeic_questions WHERE question = 'She sent an email to confirm the _____ for tomorrow''s conference call.' AND question_group_id = 1;

-- Câu hỏi 3
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'deadline', true, id FROM toeic_questions WHERE question = 'The manager reminded everyone about the _____ for submitting the quarterly reports.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'timeline', false, id FROM toeic_questions WHERE question = 'The manager reminded everyone about the _____ for submitting the quarterly reports.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'schedule', false, id FROM toeic_questions WHERE question = 'The manager reminded everyone about the _____ for submitting the quarterly reports.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'date', false, id FROM toeic_questions WHERE question = 'The manager reminded everyone about the _____ for submitting the quarterly reports.' AND question_group_id = 1;

-- Câu hỏi 4
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'cost', false, id FROM toeic_questions WHERE question = 'The company is looking for ways to reduce _____ and increase profits.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'expenses', true, id FROM toeic_questions WHERE question = 'The company is looking for ways to reduce _____ and increase profits.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'bills', false, id FROM toeic_questions WHERE question = 'The company is looking for ways to reduce _____ and increase profits.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'charges', false, id FROM toeic_questions WHERE question = 'The company is looking for ways to reduce _____ and increase profits.' AND question_group_id = 1;

-- Câu hỏi 5
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'desk', false, id FROM toeic_questions WHERE question = 'The new employee was assigned a _____ in the marketing department.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'chair', false, id FROM toeic_questions WHERE question = 'The new employee was assigned a _____ in the marketing department.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'cubicle', true, id FROM toeic_questions WHERE question = 'The new employee was assigned a _____ in the marketing department.' AND question_group_id = 1;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'room', false, id FROM toeic_questions WHERE question = 'The new employee was assigned a _____ in the marketing department.' AND question_group_id = 1;

-- Thêm options cho các câu hỏi còn lại của chủ đề 1...

-- Chủ đề 2: Travel and Transportation
-- Câu hỏi 1
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'ticket', true, id FROM toeic_questions WHERE question = 'She bought a train _____ for her business trip to Boston.' AND question_group_id = 2;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'pass', false, id FROM toeic_questions WHERE question = 'She bought a train _____ for her business trip to Boston.' AND question_group_id = 2;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'fare', false, id FROM toeic_questions WHERE question = 'She bought a train _____ for her business trip to Boston.' AND question_group_id = 2;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'receipt', false, id FROM toeic_questions WHERE question = 'She bought a train _____ for her business trip to Boston.' AND question_group_id = 2;

-- Câu hỏi 2
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'trip', false, id FROM toeic_questions WHERE question = 'The company arranged a business _____ to meet with international clients.' AND question_group_id = 2;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'travel', false, id FROM toeic_questions WHERE question = 'The company arranged a business _____ to meet with international clients.' AND question_group_id = 2;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'journey', false, id FROM toeic_questions WHERE question = 'The company arranged a business _____ to meet with international clients.' AND question_group_id = 2;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'trip', true, id FROM toeic_questions WHERE question = 'The company arranged a business _____ to meet with international clients.' AND question_group_id = 2;

-- Thêm options cho các chủ đề 3-10...

-- Lưu ý: File này chỉ chứa một số ví dụ. Trong thực tế, cần bổ sung options cho tất cả câu hỏi của chủ đề 1-10. 