-- Script thêm options cho câu hỏi điền từ vào chỗ trống - Chủ đề 41-50

-- Chủ đề 41: Fashion and Clothing
-- Câu hỏi 1
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'code', true, id FROM toeic_questions WHERE question = 'The company has a business casual dress _____ for employees.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'rule', false, id FROM toeic_questions WHERE question = 'The company has a business casual dress _____ for employees.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'standard', false, id FROM toeic_questions WHERE question = 'The company has a business casual dress _____ for employees.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'guide', false, id FROM toeic_questions WHERE question = 'The company has a business casual dress _____ for employees.' AND question_group_id = 41;

-- Câu hỏi 2
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'series', false, id FROM toeic_questions WHERE question = 'The retail store is launching its summer _____ next month.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'collection', true, id FROM toeic_questions WHERE question = 'The retail store is launching its summer _____ next month.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'display', false, id FROM toeic_questions WHERE question = 'The retail store is launching its summer _____ next month.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'assembly', false, id FROM toeic_questions WHERE question = 'The retail store is launching its summer _____ next month.' AND question_group_id = 41;

-- Câu hỏi 3
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'outfits', false, id FROM toeic_questions WHERE question = 'The company provides _____ for employees who work in hazardous areas.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'clothes', false, id FROM toeic_questions WHERE question = 'The company provides _____ for employees who work in hazardous areas.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'uniforms', true, id FROM toeic_questions WHERE question = 'The company provides _____ for employees who work in hazardous areas.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'garments', false, id FROM toeic_questions WHERE question = 'The company provides _____ for employees who work in hazardous areas.' AND question_group_id = 41;

-- Thêm options cho các câu hỏi còn lại của chủ đề 41...

-- Chủ đề 42: Environment and Ecology
-- Câu hỏi 1
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'reduction', true, id FROM toeic_questions WHERE question = 'The company has implemented a waste _____ program to reduce landfill use.' AND question_group_id = 42;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'decrease', false, id FROM toeic_questions WHERE question = 'The company has implemented a waste _____ program to reduce landfill use.' AND question_group_id = 42;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'minimization', false, id FROM toeic_questions WHERE question = 'The company has implemented a waste _____ program to reduce landfill use.' AND question_group_id = 42;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'elimination', false, id FROM toeic_questions WHERE question = 'The company has implemented a waste _____ program to reduce landfill use.' AND question_group_id = 42;

-- Câu hỏi 2
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'purification', false, id FROM toeic_questions WHERE question = 'The factory uses water _____ systems to minimize waste.' AND question_group_id = 42;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'treatment', true, id FROM toeic_questions WHERE question = 'The factory uses water _____ systems to minimize waste.' AND question_group_id = 42;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'cleaning', false, id FROM toeic_questions WHERE question = 'The factory uses water _____ systems to minimize waste.' AND question_group_id = 42;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'filtering', false, id FROM toeic_questions WHERE question = 'The factory uses water _____ systems to minimize waste.' AND question_group_id = 42;

-- Thêm options cho các câu hỏi còn lại của chủ đề 42...

-- Chủ đề 43: Social Media and Digital Marketing
-- Câu hỏi 1
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'platforms', true, id FROM toeic_questions WHERE question = 'The company uses social media _____ to engage with customers.' AND question_group_id = 43;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'networks', false, id FROM toeic_questions WHERE question = 'The company uses social media _____ to engage with customers.' AND question_group_id = 43;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'channels', false, id FROM toeic_questions WHERE question = 'The company uses social media _____ to engage with customers.' AND question_group_id = 43;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'sites', false, id FROM toeic_questions WHERE question = 'The company uses social media _____ to engage with customers.' AND question_group_id = 43;

-- Câu hỏi 2
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'comments', false, id FROM toeic_questions WHERE question = 'The marketing team monitors online _____ of the company''s products.' AND question_group_id = 43;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'reviews', true, id FROM toeic_questions WHERE question = 'The marketing team monitors online _____ of the company''s products.' AND question_group_id = 43;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'ratings', false, id FROM toeic_questions WHERE question = 'The marketing team monitors online _____ of the company''s products.' AND question_group_id = 43;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'feedback', false, id FROM toeic_questions WHERE question = 'The marketing team monitors online _____ of the company''s products.' AND question_group_id = 43;

-- Thêm options cho các câu hỏi còn lại của chủ đề 43...

-- Chủ đề 44: Quality Control
-- Câu hỏi 1
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'control', true, id FROM toeic_questions WHERE question = 'The company has strict quality _____ procedures for all products.' AND question_group_id = 44;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'check', false, id FROM toeic_questions WHERE question = 'The company has strict quality _____ procedures for all products.' AND question_group_id = 44;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'inspection', false, id FROM toeic_questions WHERE question = 'The company has strict quality _____ procedures for all products.' AND question_group_id = 44;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'verification', false, id FROM toeic_questions WHERE question = 'The company has strict quality _____ procedures for all products.' AND question_group_id = 44;

-- Thêm options cho các câu hỏi còn lại của chủ đề 44...

-- Chủ đề 45: Hospitality and Service
-- Câu hỏi 1
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'service', true, id FROM toeic_questions WHERE question = 'The hotel offers 24-hour room _____ for guests.' AND question_group_id = 45;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'assistance', false, id FROM toeic_questions WHERE question = 'The hotel offers 24-hour room _____ for guests.' AND question_group_id = 45;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'help', false, id FROM toeic_questions WHERE question = 'The hotel offers 24-hour room _____ for guests.' AND question_group_id = 45;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'support', false, id FROM toeic_questions WHERE question = 'The hotel offers 24-hour room _____ for guests.' AND question_group_id = 45;

-- Thêm options cho các câu hỏi còn lại của chủ đề 45...

-- Chủ đề 46: Human Resources and Recruitment
-- Chủ đề 47: Sports and Recreation
-- Chủ đề 48: Architecture and Design
-- Chủ đề 49: Engineering and Construction
-- Chủ đề 50: Management and Leadership

-- Lưu ý: File này chỉ chứa một số ví dụ. Trong thực tế, cần bổ sung options cho tất cả câu hỏi của chủ đề 41-50. 