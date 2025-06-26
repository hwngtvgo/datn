-- Thay đổi kiểu dữ liệu của cột explanation trong bảng toeic_questions từ TEXT thành MEDIUMTEXT
ALTER TABLE toeic_questions MODIFY explanation MEDIUMTEXT;

-- Thay đổi kiểu dữ liệu của cột question trong bảng toeic_questions từ TEXT thành MEDIUMTEXT
ALTER TABLE toeic_questions MODIFY question MEDIUMTEXT;

-- Nếu có bảng question_groups với cột passage, thay đổi kiểu dữ liệu từ TEXT thành MEDIUMTEXT
ALTER TABLE question_groups MODIFY passage MEDIUMTEXT;

-- Nếu cần thiết, có thể thay đổi thành LONGTEXT cho những trường hợp cực kỳ dài
-- ALTER TABLE toeic_questions MODIFY explanation LONGTEXT;
-- ALTER TABLE toeic_questions MODIFY question LONGTEXT;
-- ALTER TABLE question_groups MODIFY passage LONGTEXT; 