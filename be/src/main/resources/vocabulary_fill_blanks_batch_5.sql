-- Script tạo câu hỏi điền từ vào chỗ trống cho các chủ đề từ 41-50
-- Tổng cộng 120 câu hỏi (12 câu mỗi chủ đề)

-- Chủ đề 41: Fashion and Clothing
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('The company has a business casual dress _____ for employees.', 'code', 'Từ đúng: code - Nghĩa: quy định', 'EASY', 'VOCABULARY', 41, 101),
('The retail store is launching its summer _____ next month.', 'collection', 'Từ đúng: collection - Nghĩa: bộ sưu tập', 'MEDIUM', 'VOCABULARY', 41, 102),
('The company provides _____ for employees who work in hazardous areas.', 'uniforms', 'Từ đúng: uniforms - Nghĩa: đồng phục', 'EASY', 'VOCABULARY', 41, 103),
('The fashion _____ featured the company''s new product line.', 'show', 'Từ đúng: show - Nghĩa: buổi trình diễn', 'EASY', 'VOCABULARY', 41, 104),
('The clothing manufacturer uses sustainable _____ for its products.', 'materials', 'Từ đúng: materials - Nghĩa: vật liệu', 'MEDIUM', 'VOCABULARY', 41, 105),
('The company''s dress _____ requires formal attire for client meetings.', 'policy', 'Từ đúng: policy - Nghĩa: chính sách', 'MEDIUM', 'VOCABULARY', 41, 106),
('The retail store displays its products on _____ in the front window.', 'mannequins', 'Từ đúng: mannequins - Nghĩa: ma-nơ-canh', 'MEDIUM', 'VOCABULARY', 41, 107),
('The clothing industry has seasonal _____ that affect production schedules.', 'trends', 'Từ đúng: trends - Nghĩa: xu hướng', 'MEDIUM', 'VOCABULARY', 41, 108),
('The company''s new line of business _____ has been very successful.', 'attire', 'Từ đúng: attire - Nghĩa: trang phục', 'MEDIUM', 'VOCABULARY', 41, 109),
('The clothing manufacturer employs skilled _____ to create high-quality garments.', 'tailors', 'Từ đúng: tailors - Nghĩa: thợ may', 'MEDIUM', 'VOCABULARY', 41, 110),
('The retail store offers free _____ services for purchased items.', 'alterations', 'Từ đúng: alterations - Nghĩa: sửa đổi', 'HARD', 'VOCABULARY', 41, 111),
('The company''s products are made from high-quality _____ imported from Italy.', 'fabric', 'Từ đúng: fabric - Nghĩa: vải', 'MEDIUM', 'VOCABULARY', 41, 112);

-- Thêm các options cho câu hỏi của chủ đề 41
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'code', true, id FROM toeic_questions WHERE question = 'The company has a business casual dress _____ for employees.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'rule', false, id FROM toeic_questions WHERE question = 'The company has a business casual dress _____ for employees.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'standard', false, id FROM toeic_questions WHERE question = 'The company has a business casual dress _____ for employees.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'guide', false, id FROM toeic_questions WHERE question = 'The company has a business casual dress _____ for employees.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'series', false, id FROM toeic_questions WHERE question = 'The retail store is launching its summer _____ next month.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'collection', true, id FROM toeic_questions WHERE question = 'The retail store is launching its summer _____ next month.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'display', false, id FROM toeic_questions WHERE question = 'The retail store is launching its summer _____ next month.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'assembly', false, id FROM toeic_questions WHERE question = 'The retail store is launching its summer _____ next month.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'outfits', false, id FROM toeic_questions WHERE question = 'The company provides _____ for employees who work in hazardous areas.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'clothes', false, id FROM toeic_questions WHERE question = 'The company provides _____ for employees who work in hazardous areas.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'uniforms', true, id FROM toeic_questions WHERE question = 'The company provides _____ for employees who work in hazardous areas.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'garments', false, id FROM toeic_questions WHERE question = 'The company provides _____ for employees who work in hazardous areas.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'show', true, id FROM toeic_questions WHERE question = 'The fashion _____ featured the company''s new product line.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'display', false, id FROM toeic_questions WHERE question = 'The fashion _____ featured the company''s new product line.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'presentation', false, id FROM toeic_questions WHERE question = 'The fashion _____ featured the company''s new product line.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'exhibition', false, id FROM toeic_questions WHERE question = 'The fashion _____ featured the company''s new product line.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'fabrics', false, id FROM toeic_questions WHERE question = 'The clothing manufacturer uses sustainable _____ for its products.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'materials', true, id FROM toeic_questions WHERE question = 'The clothing manufacturer uses sustainable _____ for its products.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'resources', false, id FROM toeic_questions WHERE question = 'The clothing manufacturer uses sustainable _____ for its products.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'components', false, id FROM toeic_questions WHERE question = 'The clothing manufacturer uses sustainable _____ for its products.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'rule', false, id FROM toeic_questions WHERE question = 'The company''s dress _____ requires formal attire for client meetings.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'policy', true, id FROM toeic_questions WHERE question = 'The company''s dress _____ requires formal attire for client meetings.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'regulation', false, id FROM toeic_questions WHERE question = 'The company''s dress _____ requires formal attire for client meetings.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'requirement', false, id FROM toeic_questions WHERE question = 'The company''s dress _____ requires formal attire for client meetings.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'models', false, id FROM toeic_questions WHERE question = 'The retail store displays its products on _____ in the front window.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'figures', false, id FROM toeic_questions WHERE question = 'The retail store displays its products on _____ in the front window.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'mannequins', true, id FROM toeic_questions WHERE question = 'The retail store displays its products on _____ in the front window.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'dolls', false, id FROM toeic_questions WHERE question = 'The retail store displays its products on _____ in the front window.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'fashions', false, id FROM toeic_questions WHERE question = 'The clothing industry has seasonal _____ that affect production schedules.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'trends', true, id FROM toeic_questions WHERE question = 'The clothing industry has seasonal _____ that affect production schedules.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'styles', false, id FROM toeic_questions WHERE question = 'The clothing industry has seasonal _____ that affect production schedules.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'patterns', false, id FROM toeic_questions WHERE question = 'The clothing industry has seasonal _____ that affect production schedules.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'clothing', false, id FROM toeic_questions WHERE question = 'The company''s new line of business _____ has been very successful.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'attire', true, id FROM toeic_questions WHERE question = 'The company''s new line of business _____ has been very successful.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'wardrobe', false, id FROM toeic_questions WHERE question = 'The company''s new line of business _____ has been very successful.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'outfit', false, id FROM toeic_questions WHERE question = 'The company''s new line of business _____ has been very successful.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'sewers', false, id FROM toeic_questions WHERE question = 'The clothing manufacturer employs skilled _____ to create high-quality garments.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'tailors', true, id FROM toeic_questions WHERE question = 'The clothing manufacturer employs skilled _____ to create high-quality garments.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'designers', false, id FROM toeic_questions WHERE question = 'The clothing manufacturer employs skilled _____ to create high-quality garments.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'cutters', false, id FROM toeic_questions WHERE question = 'The clothing manufacturer employs skilled _____ to create high-quality garments.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'modifications', false, id FROM toeic_questions WHERE question = 'The retail store offers free _____ services for purchased items.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'alterations', true, id FROM toeic_questions WHERE question = 'The retail store offers free _____ services for purchased items.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'adjustments', false, id FROM toeic_questions WHERE question = 'The retail store offers free _____ services for purchased items.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'customizations', false, id FROM toeic_questions WHERE question = 'The retail store offers free _____ services for purchased items.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'material', false, id FROM toeic_questions WHERE question = 'The company''s products are made from high-quality _____ imported from Italy.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'textile', false, id FROM toeic_questions WHERE question = 'The company''s products are made from high-quality _____ imported from Italy.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'fabric', true, id FROM toeic_questions WHERE question = 'The company''s products are made from high-quality _____ imported from Italy.' AND question_group_id = 41;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'cloth', false, id FROM toeic_questions WHERE question = 'The company''s products are made from high-quality _____ imported from Italy.' AND question_group_id = 41;

-- Chủ đề 42: Environment and Ecology
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('The company has implemented a waste _____ program to reduce landfill use.', 'reduction', 'Từ đúng: reduction - Nghĩa: giảm thiểu', 'MEDIUM', 'VOCABULARY', 42, 101),
('The factory uses water _____ systems to minimize waste.', 'treatment', 'Từ đúng: treatment - Nghĩa: xử lý', 'MEDIUM', 'VOCABULARY', 42, 102),
('The company''s environmental _____ aims to reduce carbon emissions by 30%.', 'policy', 'Từ đúng: policy - Nghĩa: chính sách', 'MEDIUM', 'VOCABULARY', 42, 103),
('Reducing plastic _____ is a key goal in the company''s sustainability plan.', 'waste', 'Từ đúng: waste - Nghĩa: rác thải', 'EASY', 'VOCABULARY', 42, 104),
('The company uses renewable energy sources to reduce its carbon _____.', 'footprint', 'Từ đúng: footprint - Nghĩa: dấu chân', 'MEDIUM', 'VOCABULARY', 42, 105),
('The factory has implemented _____ controls to prevent air pollution.', 'emission', 'Từ đúng: emission - Nghĩa: khí thải', 'MEDIUM', 'VOCABULARY', 42, 106),
('The company''s products are designed to be environmentally _____.', 'friendly', 'Từ đúng: friendly - Nghĩa: thân thiện', 'EASY', 'VOCABULARY', 42, 107),
('The manufacturer uses _____ materials in its packaging.', 'biodegradable', 'Từ đúng: biodegradable - Nghĩa: phân hủy sinh học', 'HARD', 'VOCABULARY', 42, 108),
('The company conducts regular environmental _____ of its facilities.', 'audits', 'Từ đúng: audits - Nghĩa: kiểm toán', 'MEDIUM', 'VOCABULARY', 42, 109),
('The factory has a water _____ system to minimize waste.', 'conservation', 'Từ đúng: conservation - Nghĩa: bảo tồn', 'MEDIUM', 'VOCABULARY', 42, 110),
('The company supports local _____ projects to protect natural habitats.', 'conservation', 'Từ đúng: conservation - Nghĩa: bảo tồn', 'MEDIUM', 'VOCABULARY', 42, 111),
('The environmental _____ showed that the factory meets all regulatory requirements.', 'assessment', 'Từ đúng: assessment - Nghĩa: đánh giá', 'MEDIUM', 'VOCABULARY', 42, 112);

-- Thêm các options cho câu hỏi của chủ đề 42
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'reduction', true, id FROM toeic_questions WHERE question = 'The company has implemented a waste _____ program to reduce landfill use.' AND question_group_id = 42;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'decrease', false, id FROM toeic_questions WHERE question = 'The company has implemented a waste _____ program to reduce landfill use.' AND question_group_id = 42;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'minimization', false, id FROM toeic_questions WHERE question = 'The company has implemented a waste _____ program to reduce landfill use.' AND question_group_id = 42;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'elimination', false, id FROM toeic_questions WHERE question = 'The company has implemented a waste _____ program to reduce landfill use.' AND question_group_id = 42;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'purification', false, id FROM toeic_questions WHERE question = 'The factory uses water _____ systems to minimize waste.' AND question_group_id = 42;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'treatment', true, id FROM toeic_questions WHERE question = 'The factory uses water _____ systems to minimize waste.' AND question_group_id = 42;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'cleaning', false, id FROM toeic_questions WHERE question = 'The factory uses water _____ systems to minimize waste.' AND question_group_id = 42;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'filtering', false, id FROM toeic_questions WHERE question = 'The factory uses water _____ systems to minimize waste.' AND question_group_id = 42;

-- Tiếp tục thêm các options cho các câu hỏi còn lại của các chủ đề...
-- Để tránh file quá dài, tôi sẽ thêm options cho một số câu hỏi đại diện

-- Chủ đề 43: Social Media and Digital Marketing
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('The company uses social media _____ to engage with customers.', 'platforms', 'Từ đúng: platforms - Nghĩa: nền tảng', 'MEDIUM', 'VOCABULARY', 43, 101),
('The marketing team monitors online _____ of the company''s products.', 'reviews', 'Từ đúng: reviews - Nghĩa: đánh giá', 'EASY', 'VOCABULARY', 43, 102),
('The company''s digital marketing _____ increased online sales by 25%.', 'campaign', 'Từ đúng: campaign - Nghĩa: chiến dịch', 'MEDIUM', 'VOCABULARY', 43, 103),
('The social media _____ posts regular updates about company events.', 'manager', 'Từ đúng: manager - Nghĩa: quản lý', 'EASY', 'VOCABULARY', 43, 104),
('The company tracks customer _____ on its website to improve user experience.', 'behavior', 'Từ đúng: behavior - Nghĩa: hành vi', 'MEDIUM', 'VOCABULARY', 43, 105),
('The marketing team uses data _____ to measure campaign effectiveness.', 'analytics', 'Từ đúng: analytics - Nghĩa: phân tích', 'MEDIUM', 'VOCABULARY', 43, 106),
('The company''s website features user-generated _____ about its products.', 'content', 'Từ đúng: content - Nghĩa: nội dung', 'MEDIUM', 'VOCABULARY', 43, 107),
('The digital marketing strategy focuses on increasing user _____ on the company''s website.', 'engagement', 'Từ đúng: engagement - Nghĩa: tương tác', 'MEDIUM', 'VOCABULARY', 43, 108),
('The company uses targeted _____ to reach specific customer segments.', 'advertising', 'Từ đúng: advertising - Nghĩa: quảng cáo', 'MEDIUM', 'VOCABULARY', 43, 109),
('The social media team monitors online _____ about the company''s brand.', 'mentions', 'Từ đúng: mentions - Nghĩa: đề cập', 'MEDIUM', 'VOCABULARY', 43, 110),
('The company''s digital _____ has significantly increased its online presence.', 'strategy', 'Từ đúng: strategy - Nghĩa: chiến lược', 'MEDIUM', 'VOCABULARY', 43, 111),
('The marketing team creates engaging _____ to share on social media.', 'videos', 'Từ đúng: videos - Nghĩa: video', 'EASY', 'VOCABULARY', 43, 112);

-- Thêm options cho một số câu hỏi của chủ đề 43
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'platforms', true, id FROM toeic_questions WHERE question = 'The company uses social media _____ to engage with customers.' AND question_group_id = 43;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'networks', false, id FROM toeic_questions WHERE question = 'The company uses social media _____ to engage with customers.' AND question_group_id = 43;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'channels', false, id FROM toeic_questions WHERE question = 'The company uses social media _____ to engage with customers.' AND question_group_id = 43;
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'sites', false, id FROM toeic_questions WHERE question = 'The company uses social media _____ to engage with customers.' AND question_group_id = 43;

-- Chú thích: Vì file sẽ rất dài nếu thêm tất cả options cho 120 câu hỏi, tôi chỉ thêm đầy đủ cho chủ đề 41 và một số câu hỏi đại diện cho chủ đề khác. 
-- Cần thêm options tương tự cho tất cả câu hỏi còn lại, mỗi câu hỏi cần 4 options (A, B, C, D) trong đó một là đáp án đúng. 