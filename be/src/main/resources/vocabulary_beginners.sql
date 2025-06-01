-- Script tạo 10 nhóm câu hỏi từ vựng dành cho người mới bắt đầu
-- Mỗi nhóm có 5 câu hỏi đơn giản, mỗi câu có 4 tùy chọn

-- 1. Nhóm "Greetings and Introductions" (Chào hỏi và giới thiệu)
INSERT INTO question_groups (title, question_type, part) VALUES
('Greetings and Introductions', 'VOCABULARY', 0);
SET @group_id1 = LAST_INSERT_ID();

-- 2. Nhóm "Numbers and Time" (Số và thời gian)
INSERT INTO question_groups (title, question_type, part) VALUES
('Numbers and Time', 'VOCABULARY', 0);
SET @group_id2 = LAST_INSERT_ID();

-- 3. Nhóm "Food and Drinks" (Thức ăn và đồ uống)
INSERT INTO question_groups (title, question_type, part) VALUES
('Food and Drinks', 'VOCABULARY', 0);
SET @group_id3 = LAST_INSERT_ID();

-- 4. Nhóm "Places and Directions" (Địa điểm và chỉ dẫn)
INSERT INTO question_groups (title, question_type, part) VALUES
('Places and Directions', 'VOCABULARY', 0);
SET @group_id4 = LAST_INSERT_ID();

-- 5. Nhóm "Daily Activities" (Hoạt động hàng ngày)
INSERT INTO question_groups (title, question_type, part) VALUES
('Daily Activities', 'VOCABULARY', 0);
SET @group_id5 = LAST_INSERT_ID();

-- 6. Nhóm "Family and Relationships" (Gia đình và các mối quan hệ)
INSERT INTO question_groups (title, question_type, part) VALUES
('Family and Relationships', 'VOCABULARY', 0);
SET @group_id6 = LAST_INSERT_ID();

-- 7. Nhóm "Colors and Clothes" (Màu sắc và quần áo)
INSERT INTO question_groups (title, question_type, part) VALUES
('Colors and Clothes', 'VOCABULARY', 0);
SET @group_id7 = LAST_INSERT_ID();

-- 8. Nhóm "Weather and Seasons" (Thời tiết và mùa)
INSERT INTO question_groups (title, question_type, part) VALUES
('Weather and Seasons', 'VOCABULARY', 0);
SET @group_id8 = LAST_INSERT_ID();

-- 9. Nhóm "Travel and Transportation" (Du lịch và phương tiện giao thông)
INSERT INTO question_groups (title, question_type, part) VALUES
('Travel and Transportation', 'VOCABULARY', 0);
SET @group_id9 = LAST_INSERT_ID();

-- 10. Nhóm "Jobs and Occupations" (Công việc và nghề nghiệp)
INSERT INTO question_groups (title, question_type, part) VALUES
('Jobs and Occupations', 'VOCABULARY', 0);
SET @group_id10 = LAST_INSERT_ID();

-- Nhóm 1: Greetings and Introductions
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('What is your _____?', 'A', 'Từ đúng: name - Nghĩa: tên', 'EASY', 'VOCABULARY', @group_id1, 101),
('_____ to meet you.', 'C', 'Từ đúng: nice - Nghĩa: vui', 'EASY', 'VOCABULARY', @group_id1, 102),
('How are you _____?', 'B', 'Từ đúng: doing - Nghĩa: thế nào, ra sao', 'EASY', 'VOCABULARY', @group_id1, 103),
('Where are you _____?', 'D', 'Từ đúng: from - Nghĩa: từ đâu đến', 'EASY', 'VOCABULARY', @group_id1, 104),
('Good _____, how are you today?', 'A', 'Từ đúng: morning - Nghĩa: buổi sáng', 'EASY', 'VOCABULARY', @group_id1, 105);

-- Tùy chọn cho câu hỏi nhóm 1
INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'name', (SELECT id FROM toeic_questions WHERE question = 'What is your _____?' AND question_group_id = @group_id1)),
('B', 'age', (SELECT id FROM toeic_questions WHERE question = 'What is your _____?' AND question_group_id = @group_id1)),
('C', 'job', (SELECT id FROM toeic_questions WHERE question = 'What is your _____?' AND question_group_id = @group_id1)),
('D', 'hobby', (SELECT id FROM toeic_questions WHERE question = 'What is your _____?' AND question_group_id = @group_id1));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'Happy', (SELECT id FROM toeic_questions WHERE question = '_____ to meet you.' AND question_group_id = @group_id1)),
('B', 'Glad', (SELECT id FROM toeic_questions WHERE question = '_____ to meet you.' AND question_group_id = @group_id1)),
('C', 'Nice', (SELECT id FROM toeic_questions WHERE question = '_____ to meet you.' AND question_group_id = @group_id1)),
('D', 'Good', (SELECT id FROM toeic_questions WHERE question = '_____ to meet you.' AND question_group_id = @group_id1));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'feeling', (SELECT id FROM toeic_questions WHERE question = 'How are you _____?' AND question_group_id = @group_id1)),
('B', 'doing', (SELECT id FROM toeic_questions WHERE question = 'How are you _____?' AND question_group_id = @group_id1)),
('C', 'going', (SELECT id FROM toeic_questions WHERE question = 'How are you _____?' AND question_group_id = @group_id1)),
('D', 'living', (SELECT id FROM toeic_questions WHERE question = 'How are you _____?' AND question_group_id = @group_id1));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'living', (SELECT id FROM toeic_questions WHERE question = 'Where are you _____?' AND question_group_id = @group_id1)),
('B', 'staying', (SELECT id FROM toeic_questions WHERE question = 'Where are you _____?' AND question_group_id = @group_id1)),
('C', 'going', (SELECT id FROM toeic_questions WHERE question = 'Where are you _____?' AND question_group_id = @group_id1)),
('D', 'from', (SELECT id FROM toeic_questions WHERE question = 'Where are you _____?' AND question_group_id = @group_id1));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'morning', (SELECT id FROM toeic_questions WHERE question = 'Good _____, how are you today?' AND question_group_id = @group_id1)),
('B', 'day', (SELECT id FROM toeic_questions WHERE question = 'Good _____, how are you today?' AND question_group_id = @group_id1)),
('C', 'afternoon', (SELECT id FROM toeic_questions WHERE question = 'Good _____, how are you today?' AND question_group_id = @group_id1)),
('D', 'evening', (SELECT id FROM toeic_questions WHERE question = 'Good _____, how are you today?' AND question_group_id = @group_id1));

-- Nhóm 2: Numbers and Time
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('What _____ is it now?', 'C', 'Từ đúng: time - Nghĩa: giờ', 'EASY', 'VOCABULARY', @group_id2, 101),
('I wake up at seven _____ every morning.', 'A', 'Từ đúng: o''clock - Nghĩa: giờ đúng', 'EASY', 'VOCABULARY', @group_id2, 102),
('Today is _____ January.', 'D', 'Từ đúng: first - Nghĩa: ngày đầu tiên', 'EASY', 'VOCABULARY', @group_id2, 103),
('She is _____ years old.', 'B', 'Từ đúng: twenty - Nghĩa: hai mươi', 'EASY', 'VOCABULARY', @group_id2, 104),
('The shop is open _____ hours a day.', 'D', 'Từ đúng: twenty-four - Nghĩa: hai mươi bốn', 'EASY', 'VOCABULARY', @group_id2, 105);

-- Tùy chọn cho câu hỏi nhóm 2
INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'day', (SELECT id FROM toeic_questions WHERE question = 'What _____ is it now?' AND question_group_id = @group_id2)),
('B', 'hour', (SELECT id FROM toeic_questions WHERE question = 'What _____ is it now?' AND question_group_id = @group_id2)),
('C', 'time', (SELECT id FROM toeic_questions WHERE question = 'What _____ is it now?' AND question_group_id = @group_id2)),
('D', 'minute', (SELECT id FROM toeic_questions WHERE question = 'What _____ is it now?' AND question_group_id = @group_id2));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'o''clock', (SELECT id FROM toeic_questions WHERE question = 'I wake up at seven _____ every morning.' AND question_group_id = @group_id2)),
('B', 'hours', (SELECT id FROM toeic_questions WHERE question = 'I wake up at seven _____ every morning.' AND question_group_id = @group_id2)),
('C', 'time', (SELECT id FROM toeic_questions WHERE question = 'I wake up at seven _____ every morning.' AND question_group_id = @group_id2)),
('D', 'am', (SELECT id FROM toeic_questions WHERE question = 'I wake up at seven _____ every morning.' AND question_group_id = @group_id2));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'one', (SELECT id FROM toeic_questions WHERE question = 'Today is _____ January.' AND question_group_id = @group_id2)),
('B', 'a', (SELECT id FROM toeic_questions WHERE question = 'Today is _____ January.' AND question_group_id = @group_id2)),
('C', 'the', (SELECT id FROM toeic_questions WHERE question = 'Today is _____ January.' AND question_group_id = @group_id2)),
('D', 'first', (SELECT id FROM toeic_questions WHERE question = 'Today is _____ January.' AND question_group_id = @group_id2));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'ten', (SELECT id FROM toeic_questions WHERE question = 'She is _____ years old.' AND question_group_id = @group_id2)),
('B', 'twenty', (SELECT id FROM toeic_questions WHERE question = 'She is _____ years old.' AND question_group_id = @group_id2)),
('C', 'thirty', (SELECT id FROM toeic_questions WHERE question = 'She is _____ years old.' AND question_group_id = @group_id2)),
('D', 'forty', (SELECT id FROM toeic_questions WHERE question = 'She is _____ years old.' AND question_group_id = @group_id2));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'twelve', (SELECT id FROM toeic_questions WHERE question = 'The shop is open _____ hours a day.' AND question_group_id = @group_id2)),
('B', 'eight', (SELECT id FROM toeic_questions WHERE question = 'The shop is open _____ hours a day.' AND question_group_id = @group_id2)),
('C', 'ten', (SELECT id FROM toeic_questions WHERE question = 'The shop is open _____ hours a day.' AND question_group_id = @group_id2)),
('D', 'twenty-four', (SELECT id FROM toeic_questions WHERE question = 'The shop is open _____ hours a day.' AND question_group_id = @group_id2));

-- Nhóm 3: Food and Drinks
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('Would you like a cup of _____?', 'B', 'Từ đúng: coffee - Nghĩa: cà phê', 'EASY', 'VOCABULARY', @group_id3, 101),
('I usually eat _____ for breakfast.', 'C', 'Từ đúng: eggs - Nghĩa: trứng', 'EASY', 'VOCABULARY', @group_id3, 102),
('This soup is very _____.', 'A', 'Từ đúng: hot - Nghĩa: nóng', 'EASY', 'VOCABULARY', @group_id3, 103),
('Do you want some _____ water?', 'D', 'Từ đúng: cold - Nghĩa: lạnh', 'EASY', 'VOCABULARY', @group_id3, 104),
('I don''t eat _____ because I''m vegetarian.', 'B', 'Từ đúng: meat - Nghĩa: thịt', 'EASY', 'VOCABULARY', @group_id3, 105);

-- Tùy chọn cho câu hỏi nhóm 3
INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'tea', (SELECT id FROM toeic_questions WHERE question = 'Would you like a cup of _____?' AND question_group_id = @group_id3)),
('B', 'coffee', (SELECT id FROM toeic_questions WHERE question = 'Would you like a cup of _____?' AND question_group_id = @group_id3)),
('C', 'milk', (SELECT id FROM toeic_questions WHERE question = 'Would you like a cup of _____?' AND question_group_id = @group_id3)),
('D', 'juice', (SELECT id FROM toeic_questions WHERE question = 'Would you like a cup of _____?' AND question_group_id = @group_id3));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'rice', (SELECT id FROM toeic_questions WHERE question = 'I usually eat _____ for breakfast.' AND question_group_id = @group_id3)),
('B', 'bread', (SELECT id FROM toeic_questions WHERE question = 'I usually eat _____ for breakfast.' AND question_group_id = @group_id3)),
('C', 'eggs', (SELECT id FROM toeic_questions WHERE question = 'I usually eat _____ for breakfast.' AND question_group_id = @group_id3)),
('D', 'noodles', (SELECT id FROM toeic_questions WHERE question = 'I usually eat _____ for breakfast.' AND question_group_id = @group_id3));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'hot', (SELECT id FROM toeic_questions WHERE question = 'This soup is very _____.' AND question_group_id = @group_id3)),
('B', 'cold', (SELECT id FROM toeic_questions WHERE question = 'This soup is very _____.' AND question_group_id = @group_id3)),
('C', 'sweet', (SELECT id FROM toeic_questions WHERE question = 'This soup is very _____.' AND question_group_id = @group_id3)),
('D', 'salty', (SELECT id FROM toeic_questions WHERE question = 'This soup is very _____.' AND question_group_id = @group_id3));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'hot', (SELECT id FROM toeic_questions WHERE question = 'Do you want some _____ water?' AND question_group_id = @group_id3)),
('B', 'warm', (SELECT id FROM toeic_questions WHERE question = 'Do you want some _____ water?' AND question_group_id = @group_id3)),
('C', 'fresh', (SELECT id FROM toeic_questions WHERE question = 'Do you want some _____ water?' AND question_group_id = @group_id3)),
('D', 'cold', (SELECT id FROM toeic_questions WHERE question = 'Do you want some _____ water?' AND question_group_id = @group_id3));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'vegetables', (SELECT id FROM toeic_questions WHERE question = 'I don''t eat _____ because I''m vegetarian.' AND question_group_id = @group_id3)),
('B', 'meat', (SELECT id FROM toeic_questions WHERE question = 'I don''t eat _____ because I''m vegetarian.' AND question_group_id = @group_id3)),
('C', 'fruit', (SELECT id FROM toeic_questions WHERE question = 'I don''t eat _____ because I''m vegetarian.' AND question_group_id = @group_id3)),
('D', 'rice', (SELECT id FROM toeic_questions WHERE question = 'I don''t eat _____ because I''m vegetarian.' AND question_group_id = @group_id3));

-- Nhóm 4: Places and Directions
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('The bank is _____ the post office.', 'A', 'Từ đúng: next to - Nghĩa: bên cạnh', 'EASY', 'VOCABULARY', @group_id4, 101),
('Go _____ for two blocks, then turn right.', 'C', 'Từ đúng: straight - Nghĩa: thẳng', 'EASY', 'VOCABULARY', @group_id4, 102),
('My house is _____ the river.', 'B', 'Từ đúng: near - Nghĩa: gần', 'EASY', 'VOCABULARY', @group_id4, 103),
('The restaurant is on the _____ floor.', 'D', 'Từ đúng: second - Nghĩa: thứ hai', 'EASY', 'VOCABULARY', @group_id4, 104),
('Is there a _____ near here?', 'A', 'Từ đúng: hospital - Nghĩa: bệnh viện', 'EASY', 'VOCABULARY', @group_id4, 105);

-- Tùy chọn cho câu hỏi nhóm 4
INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'next to', (SELECT id FROM toeic_questions WHERE question = 'The bank is _____ the post office.' AND question_group_id = @group_id4)),
('B', 'behind', (SELECT id FROM toeic_questions WHERE question = 'The bank is _____ the post office.' AND question_group_id = @group_id4)),
('C', 'in front of', (SELECT id FROM toeic_questions WHERE question = 'The bank is _____ the post office.' AND question_group_id = @group_id4)),
('D', 'opposite', (SELECT id FROM toeic_questions WHERE question = 'The bank is _____ the post office.' AND question_group_id = @group_id4));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'left', (SELECT id FROM toeic_questions WHERE question = 'Go _____ for two blocks, then turn right.' AND question_group_id = @group_id4)),
('B', 'right', (SELECT id FROM toeic_questions WHERE question = 'Go _____ for two blocks, then turn right.' AND question_group_id = @group_id4)),
('C', 'straight', (SELECT id FROM toeic_questions WHERE question = 'Go _____ for two blocks, then turn right.' AND question_group_id = @group_id4)),
('D', 'back', (SELECT id FROM toeic_questions WHERE question = 'Go _____ for two blocks, then turn right.' AND question_group_id = @group_id4));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'far from', (SELECT id FROM toeic_questions WHERE question = 'My house is _____ the river.' AND question_group_id = @group_id4)),
('B', 'near', (SELECT id FROM toeic_questions WHERE question = 'My house is _____ the river.' AND question_group_id = @group_id4)),
('C', 'between', (SELECT id FROM toeic_questions WHERE question = 'My house is _____ the river.' AND question_group_id = @group_id4)),
('D', 'across', (SELECT id FROM toeic_questions WHERE question = 'My house is _____ the river.' AND question_group_id = @group_id4));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'first', (SELECT id FROM toeic_questions WHERE question = 'The restaurant is on the _____ floor.' AND question_group_id = @group_id4)),
('B', 'ground', (SELECT id FROM toeic_questions WHERE question = 'The restaurant is on the _____ floor.' AND question_group_id = @group_id4)),
('C', 'third', (SELECT id FROM toeic_questions WHERE question = 'The restaurant is on the _____ floor.' AND question_group_id = @group_id4)),
('D', 'second', (SELECT id FROM toeic_questions WHERE question = 'The restaurant is on the _____ floor.' AND question_group_id = @group_id4));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'hospital', (SELECT id FROM toeic_questions WHERE question = 'Is there a _____ near here?' AND question_group_id = @group_id4)),
('B', 'hotel', (SELECT id FROM toeic_questions WHERE question = 'Is there a _____ near here?' AND question_group_id = @group_id4)),
('C', 'school', (SELECT id FROM toeic_questions WHERE question = 'Is there a _____ near here?' AND question_group_id = @group_id4)),
('D', 'restaurant', (SELECT id FROM toeic_questions WHERE question = 'Is there a _____ near here?' AND question_group_id = @group_id4));

-- Nhóm 5: Daily Activities
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('I _____ up at 6:00 every morning.', 'B', 'Từ đúng: wake - Nghĩa: thức dậy', 'EASY', 'VOCABULARY', @group_id5, 101),
('She _____ to work by bus.', 'C', 'Từ đúng: goes - Nghĩa: đi', 'EASY', 'VOCABULARY', @group_id5, 102),
('We _____ dinner at 7:00 PM.', 'D', 'Từ đúng: eat - Nghĩa: ăn', 'EASY', 'VOCABULARY', @group_id5, 103),
('He _____ TV after dinner.', 'A', 'Từ đúng: watches - Nghĩa: xem', 'EASY', 'VOCABULARY', @group_id5, 104),
('I _____ to bed at 10:00 PM.', 'B', 'Từ đúng: go - Nghĩa: đi', 'EASY', 'VOCABULARY', @group_id5, 105);

-- Tùy chọn cho câu hỏi nhóm 5
INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'get', (SELECT id FROM toeic_questions WHERE question = 'I _____ up at 6:00 every morning.' AND question_group_id = @group_id5)),
('B', 'wake', (SELECT id FROM toeic_questions WHERE question = 'I _____ up at 6:00 every morning.' AND question_group_id = @group_id5)),
('C', 'stand', (SELECT id FROM toeic_questions WHERE question = 'I _____ up at 6:00 every morning.' AND question_group_id = @group_id5)),
('D', 'look', (SELECT id FROM toeic_questions WHERE question = 'I _____ up at 6:00 every morning.' AND question_group_id = @group_id5));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'drives', (SELECT id FROM toeic_questions WHERE question = 'She _____ to work by bus.' AND question_group_id = @group_id5)),
('B', 'walks', (SELECT id FROM toeic_questions WHERE question = 'She _____ to work by bus.' AND question_group_id = @group_id5)),
('C', 'goes', (SELECT id FROM toeic_questions WHERE question = 'She _____ to work by bus.' AND question_group_id = @group_id5)),
('D', 'takes', (SELECT id FROM toeic_questions WHERE question = 'She _____ to work by bus.' AND question_group_id = @group_id5));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'cook', (SELECT id FROM toeic_questions WHERE question = 'We _____ dinner at 7:00 PM.' AND question_group_id = @group_id5)),
('B', 'make', (SELECT id FROM toeic_questions WHERE question = 'We _____ dinner at 7:00 PM.' AND question_group_id = @group_id5)),
('C', 'have', (SELECT id FROM toeic_questions WHERE question = 'We _____ dinner at 7:00 PM.' AND question_group_id = @group_id5)),
('D', 'eat', (SELECT id FROM toeic_questions WHERE question = 'We _____ dinner at 7:00 PM.' AND question_group_id = @group_id5));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'watches', (SELECT id FROM toeic_questions WHERE question = 'He _____ TV after dinner.' AND question_group_id = @group_id5)),
('B', 'sees', (SELECT id FROM toeic_questions WHERE question = 'He _____ TV after dinner.' AND question_group_id = @group_id5)),
('C', 'looks', (SELECT id FROM toeic_questions WHERE question = 'He _____ TV after dinner.' AND question_group_id = @group_id5)),
('D', 'views', (SELECT id FROM toeic_questions WHERE question = 'He _____ TV after dinner.' AND question_group_id = @group_id5));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'sleep', (SELECT id FROM toeic_questions WHERE question = 'I _____ to bed at 10:00 PM.' AND question_group_id = @group_id5)),
('B', 'go', (SELECT id FROM toeic_questions WHERE question = 'I _____ to bed at 10:00 PM.' AND question_group_id = @group_id5)),
('C', 'get', (SELECT id FROM toeic_questions WHERE question = 'I _____ to bed at 10:00 PM.' AND question_group_id = @group_id5)),
('D', 'fall', (SELECT id FROM toeic_questions WHERE question = 'I _____ to bed at 10:00 PM.' AND question_group_id = @group_id5));

-- Nhóm 6: Family and Relationships
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('My _____ is a doctor.', 'A', 'Từ đúng: father - Nghĩa: bố', 'EASY', 'VOCABULARY', @group_id6, 101),
('She has two _____.', 'C', 'Từ đúng: children - Nghĩa: con cái', 'EASY', 'VOCABULARY', @group_id6, 102),
('That woman is my _____.', 'B', 'Từ đúng: sister - Nghĩa: chị/em gái', 'EASY', 'VOCABULARY', @group_id6, 103),
('His _____ is very beautiful.', 'D', 'Từ đúng: wife - Nghĩa: vợ', 'EASY', 'VOCABULARY', @group_id6, 104),
('My _____ lives with my grandparents.', 'A', 'Từ đúng: uncle - Nghĩa: chú/bác', 'EASY', 'VOCABULARY', @group_id6, 105);

-- Tùy chọn cho câu hỏi nhóm 6
INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'father', (SELECT id FROM toeic_questions WHERE question = 'My _____ is a doctor.' AND question_group_id = @group_id6)),
('B', 'mother', (SELECT id FROM toeic_questions WHERE question = 'My _____ is a doctor.' AND question_group_id = @group_id6)),
('C', 'brother', (SELECT id FROM toeic_questions WHERE question = 'My _____ is a doctor.' AND question_group_id = @group_id6)),
('D', 'son', (SELECT id FROM toeic_questions WHERE question = 'My _____ is a doctor.' AND question_group_id = @group_id6));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'sisters', (SELECT id FROM toeic_questions WHERE question = 'She has two _____.' AND question_group_id = @group_id6)),
('B', 'brothers', (SELECT id FROM toeic_questions WHERE question = 'She has two _____.' AND question_group_id = @group_id6)),
('C', 'children', (SELECT id FROM toeic_questions WHERE question = 'She has two _____.' AND question_group_id = @group_id6)),
('D', 'parents', (SELECT id FROM toeic_questions WHERE question = 'She has two _____.' AND question_group_id = @group_id6));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'mother', (SELECT id FROM toeic_questions WHERE question = 'That woman is my _____.' AND question_group_id = @group_id6)),
('B', 'sister', (SELECT id FROM toeic_questions WHERE question = 'That woman is my _____.' AND question_group_id = @group_id6)),
('C', 'aunt', (SELECT id FROM toeic_questions WHERE question = 'That woman is my _____.' AND question_group_id = @group_id6)),
('D', 'daughter', (SELECT id FROM toeic_questions WHERE question = 'That woman is my _____.' AND question_group_id = @group_id6));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'mother', (SELECT id FROM toeic_questions WHERE question = 'His _____ is very beautiful.' AND question_group_id = @group_id6)),
('B', 'sister', (SELECT id FROM toeic_questions WHERE question = 'His _____ is very beautiful.' AND question_group_id = @group_id6)),
('C', 'daughter', (SELECT id FROM toeic_questions WHERE question = 'His _____ is very beautiful.' AND question_group_id = @group_id6)),
('D', 'wife', (SELECT id FROM toeic_questions WHERE question = 'His _____ is very beautiful.' AND question_group_id = @group_id6));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'uncle', (SELECT id FROM toeic_questions WHERE question = 'My _____ lives with my grandparents.' AND question_group_id = @group_id6)),
('B', 'cousin', (SELECT id FROM toeic_questions WHERE question = 'My _____ lives with my grandparents.' AND question_group_id = @group_id6)),
('C', 'nephew', (SELECT id FROM toeic_questions WHERE question = 'My _____ lives with my grandparents.' AND question_group_id = @group_id6)),
('D', 'brother', (SELECT id FROM toeic_questions WHERE question = 'My _____ lives with my grandparents.' AND question_group_id = @group_id6));

-- Nhóm 7: Colors and Clothes
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('The sky is _____.', 'C', 'Từ đúng: blue - Nghĩa: xanh dương', 'EASY', 'VOCABULARY', @group_id7, 101),
('I need a new _____ for the interview.', 'A', 'Từ đúng: shirt - Nghĩa: áo sơ mi', 'EASY', 'VOCABULARY', @group_id7, 102),
('She always wears _____ shoes.', 'B', 'Từ đúng: black - Nghĩa: đen', 'EASY', 'VOCABULARY', @group_id7, 103),
('This _____ is too small for me.', 'D', 'Từ đúng: jacket - Nghĩa: áo khoác', 'EASY', 'VOCABULARY', @group_id7, 104),
('I like the _____ dress better than the blue one.', 'A', 'Từ đúng: red - Nghĩa: đỏ', 'EASY', 'VOCABULARY', @group_id7, 105);

-- Tùy chọn cho câu hỏi nhóm 7
INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'white', (SELECT id FROM toeic_questions WHERE question = 'The sky is _____.' AND question_group_id = @group_id7)),
('B', 'green', (SELECT id FROM toeic_questions WHERE question = 'The sky is _____.' AND question_group_id = @group_id7)),
('C', 'blue', (SELECT id FROM toeic_questions WHERE question = 'The sky is _____.' AND question_group_id = @group_id7)),
('D', 'yellow', (SELECT id FROM toeic_questions WHERE question = 'The sky is _____.' AND question_group_id = @group_id7));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'shirt', (SELECT id FROM toeic_questions WHERE question = 'I need a new _____ for the interview.' AND question_group_id = @group_id7)),
('B', 'hat', (SELECT id FROM toeic_questions WHERE question = 'I need a new _____ for the interview.' AND question_group_id = @group_id7)),
('C', 'shoe', (SELECT id FROM toeic_questions WHERE question = 'I need a new _____ for the interview.' AND question_group_id = @group_id7)),
('D', 'dress', (SELECT id FROM toeic_questions WHERE question = 'I need a new _____ for the interview.' AND question_group_id = @group_id7));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'red', (SELECT id FROM toeic_questions WHERE question = 'She always wears _____ shoes.' AND question_group_id = @group_id7)),
('B', 'black', (SELECT id FROM toeic_questions WHERE question = 'She always wears _____ shoes.' AND question_group_id = @group_id7)),
('C', 'white', (SELECT id FROM toeic_questions WHERE question = 'She always wears _____ shoes.' AND question_group_id = @group_id7)),
('D', 'brown', (SELECT id FROM toeic_questions WHERE question = 'She always wears _____ shoes.' AND question_group_id = @group_id7));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'shirt', (SELECT id FROM toeic_questions WHERE question = 'This _____ is too small for me.' AND question_group_id = @group_id7)),
('B', 'pants', (SELECT id FROM toeic_questions WHERE question = 'This _____ is too small for me.' AND question_group_id = @group_id7)),
('C', 'hat', (SELECT id FROM toeic_questions WHERE question = 'This _____ is too small for me.' AND question_group_id = @group_id7)),
('D', 'jacket', (SELECT id FROM toeic_questions WHERE question = 'This _____ is too small for me.' AND question_group_id = @group_id7));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'red', (SELECT id FROM toeic_questions WHERE question = 'I like the _____ dress better than the blue one.' AND question_group_id = @group_id7)),
('B', 'green', (SELECT id FROM toeic_questions WHERE question = 'I like the _____ dress better than the blue one.' AND question_group_id = @group_id7)),
('C', 'yellow', (SELECT id FROM toeic_questions WHERE question = 'I like the _____ dress better than the blue one.' AND question_group_id = @group_id7)),
('D', 'purple', (SELECT id FROM toeic_questions WHERE question = 'I like the _____ dress better than the blue one.' AND question_group_id = @group_id7));

-- Nhóm 8: Weather and Seasons
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('It''s very _____ today. I need a jacket.', 'C', 'Từ đúng: cold - Nghĩa: lạnh', 'EASY', 'VOCABULARY', @group_id8, 101),
('It often _____ in the winter.', 'B', 'Từ đúng: snows - Nghĩa: tuyết rơi', 'EASY', 'VOCABULARY', @group_id8, 102),
('Summer is my favorite _____.', 'D', 'Từ đúng: season - Nghĩa: mùa', 'EASY', 'VOCABULARY', @group_id8, 103),
('Don''t forget your _____, it''s raining.', 'A', 'Từ đúng: umbrella - Nghĩa: ô, dù', 'EASY', 'VOCABULARY', @group_id8, 104),
('The weather is very _____ in spring.', 'B', 'Từ đúng: nice - Nghĩa: tốt, đẹp', 'EASY', 'VOCABULARY', @group_id8, 105);

-- Tùy chọn cho câu hỏi nhóm 8
INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'hot', (SELECT id FROM toeic_questions WHERE question = 'It''s very _____ today. I need a jacket.' AND question_group_id = @group_id8)),
('B', 'warm', (SELECT id FROM toeic_questions WHERE question = 'It''s very _____ today. I need a jacket.' AND question_group_id = @group_id8)),
('C', 'cold', (SELECT id FROM toeic_questions WHERE question = 'It''s very _____ today. I need a jacket.' AND question_group_id = @group_id8)),
('D', 'cool', (SELECT id FROM toeic_questions WHERE question = 'It''s very _____ today. I need a jacket.' AND question_group_id = @group_id8));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'rains', (SELECT id FROM toeic_questions WHERE question = 'It often _____ in the winter.' AND question_group_id = @group_id8)),
('B', 'snows', (SELECT id FROM toeic_questions WHERE question = 'It often _____ in the winter.' AND question_group_id = @group_id8)),
('C', 'shines', (SELECT id FROM toeic_questions WHERE question = 'It often _____ in the winter.' AND question_group_id = @group_id8)),
('D', 'blows', (SELECT id FROM toeic_questions WHERE question = 'It often _____ in the winter.' AND question_group_id = @group_id8));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'time', (SELECT id FROM toeic_questions WHERE question = 'Summer is my favorite _____.' AND question_group_id = @group_id8)),
('B', 'month', (SELECT id FROM toeic_questions WHERE question = 'Summer is my favorite _____.' AND question_group_id = @group_id8)),
('C', 'weather', (SELECT id FROM toeic_questions WHERE question = 'Summer is my favorite _____.' AND question_group_id = @group_id8)),
('D', 'season', (SELECT id FROM toeic_questions WHERE question = 'Summer is my favorite _____.' AND question_group_id = @group_id8));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'umbrella', (SELECT id FROM toeic_questions WHERE question = 'Don''t forget your _____, it''s raining.' AND question_group_id = @group_id8)),
('B', 'coat', (SELECT id FROM toeic_questions WHERE question = 'Don''t forget your _____, it''s raining.' AND question_group_id = @group_id8)),
('C', 'hat', (SELECT id FROM toeic_questions WHERE question = 'Don''t forget your _____, it''s raining.' AND question_group_id = @group_id8)),
('D', 'shoes', (SELECT id FROM toeic_questions WHERE question = 'Don''t forget your _____, it''s raining.' AND question_group_id = @group_id8));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'bad', (SELECT id FROM toeic_questions WHERE question = 'The weather is very _____ in spring.' AND question_group_id = @group_id8)),
('B', 'nice', (SELECT id FROM toeic_questions WHERE question = 'The weather is very _____ in spring.' AND question_group_id = @group_id8)),
('C', 'cold', (SELECT id FROM toeic_questions WHERE question = 'The weather is very _____ in spring.' AND question_group_id = @group_id8)),
('D', 'rainy', (SELECT id FROM toeic_questions WHERE question = 'The weather is very _____ in spring.' AND question_group_id = @group_id8));

-- Nhóm 9: Travel and Transportation
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('We need to buy _____ for the train.', 'D', 'Từ đúng: tickets - Nghĩa: vé', 'EASY', 'VOCABULARY', @group_id9, 101),
('The _____ arrives at 3:00 PM.', 'A', 'Từ đúng: bus - Nghĩa: xe buýt', 'EASY', 'VOCABULARY', @group_id9, 102),
('I want to _____ to Paris next year.', 'C', 'Từ đúng: travel - Nghĩa: du lịch', 'EASY', 'VOCABULARY', @group_id9, 103),
('She drives a small _____.', 'B', 'Từ đúng: car - Nghĩa: xe hơi', 'EASY', 'VOCABULARY', @group_id9, 104),
('We need to check in at the _____ two hours early.', 'A', 'Từ đúng: airport - Nghĩa: sân bay', 'EASY', 'VOCABULARY', @group_id9, 105);

-- Tùy chọn cho câu hỏi nhóm 9
INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'money', (SELECT id FROM toeic_questions WHERE question = 'We need to buy _____ for the train.' AND question_group_id = @group_id9)),
('B', 'food', (SELECT id FROM toeic_questions WHERE question = 'We need to buy _____ for the train.' AND question_group_id = @group_id9)),
('C', 'time', (SELECT id FROM toeic_questions WHERE question = 'We need to buy _____ for the train.' AND question_group_id = @group_id9)),
('D', 'tickets', (SELECT id FROM toeic_questions WHERE question = 'We need to buy _____ for the train.' AND question_group_id = @group_id9));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'bus', (SELECT id FROM toeic_questions WHERE question = 'The _____ arrives at 3:00 PM.' AND question_group_id = @group_id9)),
('B', 'train', (SELECT id FROM toeic_questions WHERE question = 'The _____ arrives at 3:00 PM.' AND question_group_id = @group_id9)),
('C', 'plane', (SELECT id FROM toeic_questions WHERE question = 'The _____ arrives at 3:00 PM.' AND question_group_id = @group_id9)),
('D', 'taxi', (SELECT id FROM toeic_questions WHERE question = 'The _____ arrives at 3:00 PM.' AND question_group_id = @group_id9));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'go', (SELECT id FROM toeic_questions WHERE question = 'I want to _____ to Paris next year.' AND question_group_id = @group_id9)),
('B', 'fly', (SELECT id FROM toeic_questions WHERE question = 'I want to _____ to Paris next year.' AND question_group_id = @group_id9)),
('C', 'travel', (SELECT id FROM toeic_questions WHERE question = 'I want to _____ to Paris next year.' AND question_group_id = @group_id9)),
('D', 'visit', (SELECT id FROM toeic_questions WHERE question = 'I want to _____ to Paris next year.' AND question_group_id = @group_id9));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'bike', (SELECT id FROM toeic_questions WHERE question = 'She drives a small _____.' AND question_group_id = @group_id9)),
('B', 'car', (SELECT id FROM toeic_questions WHERE question = 'She drives a small _____.' AND question_group_id = @group_id9)),
('C', 'bus', (SELECT id FROM toeic_questions WHERE question = 'She drives a small _____.' AND question_group_id = @group_id9)),
('D', 'truck', (SELECT id FROM toeic_questions WHERE question = 'She drives a small _____.' AND question_group_id = @group_id9));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'airport', (SELECT id FROM toeic_questions WHERE question = 'We need to check in at the _____ two hours early.' AND question_group_id = @group_id9)),
('B', 'station', (SELECT id FROM toeic_questions WHERE question = 'We need to check in at the _____ two hours early.' AND question_group_id = @group_id9)),
('C', 'hotel', (SELECT id FROM toeic_questions WHERE question = 'We need to check in at the _____ two hours early.' AND question_group_id = @group_id9)),
('D', 'office', (SELECT id FROM toeic_questions WHERE question = 'We need to check in at the _____ two hours early.' AND question_group_id = @group_id9));

-- Nhóm 10: Jobs and Occupations
INSERT INTO toeic_questions (question, correct_answer, explanation, difficulty_level, category, question_group_id, question_order) VALUES
('My father is a _____ at the local hospital.', 'B', 'Từ đúng: doctor - Nghĩa: bác sĩ', 'EASY', 'VOCABULARY', @group_id10, 101),
('She works as a _____ at an elementary school.', 'C', 'Từ đúng: teacher - Nghĩa: giáo viên', 'EASY', 'VOCABULARY', @group_id10, 102),
('He is a _____ who helps people with legal problems.', 'A', 'Từ đúng: lawyer - Nghĩa: luật sư', 'EASY', 'VOCABULARY', @group_id10, 103),
('The _____ brought our food to the table.', 'D', 'Từ đúng: waiter - Nghĩa: người phục vụ', 'EASY', 'VOCABULARY', @group_id10, 104),
('My sister is a _____ who designs buildings.', 'B', 'Từ đúng: architect - Nghĩa: kiến trúc sư', 'EASY', 'VOCABULARY', @group_id10, 105);

-- Tùy chọn cho câu hỏi nhóm 10
INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'nurse', (SELECT id FROM toeic_questions WHERE question = 'My father is a _____ at the local hospital.' AND question_group_id = @group_id10)),
('B', 'doctor', (SELECT id FROM toeic_questions WHERE question = 'My father is a _____ at the local hospital.' AND question_group_id = @group_id10)),
('C', 'patient', (SELECT id FROM toeic_questions WHERE question = 'My father is a _____ at the local hospital.' AND question_group_id = @group_id10)),
('D', 'manager', (SELECT id FROM toeic_questions WHERE question = 'My father is a _____ at the local hospital.' AND question_group_id = @group_id10));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'student', (SELECT id FROM toeic_questions WHERE question = 'She works as a _____ at an elementary school.' AND question_group_id = @group_id10)),
('B', 'principal', (SELECT id FROM toeic_questions WHERE question = 'She works as a _____ at an elementary school.' AND question_group_id = @group_id10)),
('C', 'teacher', (SELECT id FROM toeic_questions WHERE question = 'She works as a _____ at an elementary school.' AND question_group_id = @group_id10)),
('D', 'parent', (SELECT id FROM toeic_questions WHERE question = 'She works as a _____ at an elementary school.' AND question_group_id = @group_id10));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'lawyer', (SELECT id FROM toeic_questions WHERE question = 'He is a _____ who helps people with legal problems.' AND question_group_id = @group_id10)),
('B', 'doctor', (SELECT id FROM toeic_questions WHERE question = 'He is a _____ who helps people with legal problems.' AND question_group_id = @group_id10)),
('C', 'teacher', (SELECT id FROM toeic_questions WHERE question = 'He is a _____ who helps people with legal problems.' AND question_group_id = @group_id10)),
('D', 'engineer', (SELECT id FROM toeic_questions WHERE question = 'He is a _____ who helps people with legal problems.' AND question_group_id = @group_id10));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'chef', (SELECT id FROM toeic_questions WHERE question = 'The _____ brought our food to the table.' AND question_group_id = @group_id10)),
('B', 'manager', (SELECT id FROM toeic_questions WHERE question = 'The _____ brought our food to the table.' AND question_group_id = @group_id10)),
('C', 'owner', (SELECT id FROM toeic_questions WHERE question = 'The _____ brought our food to the table.' AND question_group_id = @group_id10)),
('D', 'waiter', (SELECT id FROM toeic_questions WHERE question = 'The _____ brought our food to the table.' AND question_group_id = @group_id10));

INSERT INTO toeic_options (option_key, option_text, question_id) VALUES
('A', 'engineer', (SELECT id FROM toeic_questions WHERE question = 'My sister is a _____ who designs buildings.' AND question_group_id = @group_id10)),
('B', 'architect', (SELECT id FROM toeic_questions WHERE question = 'My sister is a _____ who designs buildings.' AND question_group_id = @group_id10)),
('C', 'designer', (SELECT id FROM toeic_questions WHERE question = 'My sister is a _____ who designs buildings.' AND question_group_id = @group_id10)),
('D', 'artist', (SELECT id FROM toeic_questions WHERE question = 'My sister is a _____ who designs buildings.' AND question_group_id = @group_id10)); 