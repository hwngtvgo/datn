# Hướng dẫn tạo options cho câu hỏi từ vựng điền vào chỗ trống

## Tổng quan
Để tạo options (lựa chọn A, B, C, D) cho tất cả câu hỏi từ vựng điền vào chỗ trống từ chủ đề 1-50, chúng ta cần phân chia thành nhiều file nhỏ để tránh file quá lớn và dễ quản lý.

## Cấu trúc thư mục
Chia thành 5 file options tương ứng với 5 file câu hỏi:
1. `vocabulary_options_batch_1.sql`: Options cho chủ đề 1-10
2. `vocabulary_options_batch_2.sql`: Options cho chủ đề 11-20
3. `vocabulary_options_batch_3.sql`: Options cho chủ đề 21-30
4. `vocabulary_options_batch_4.sql`: Options cho chủ đề 31-40
5. `vocabulary_options_batch_5.sql`: Options cho chủ đề 41-50

## Cấu trúc options
Mỗi câu hỏi cần 4 options:
- 1 lựa chọn đúng (is_correct = true)
- 3 lựa chọn sai (is_correct = false)
- Các lựa chọn được đánh dấu A, B, C, D

## Mẫu code tạo options
```sql
-- Thêm options cho câu hỏi 1 của chủ đề X
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'correct_answer', true, id FROM toeic_questions WHERE question = 'question_text' AND question_group_id = X;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'wrong_answer_1', false, id FROM toeic_questions WHERE question = 'question_text' AND question_group_id = X;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'wrong_answer_2', false, id FROM toeic_questions WHERE question = 'question_text' AND question_group_id = X;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'wrong_answer_3', false, id FROM toeic_questions WHERE question = 'question_text' AND question_group_id = X;
```

## Hướng dẫn thực hiện
1. Tạo 5 file SQL riêng biệt cho các options
2. Đối với mỗi câu hỏi, thêm 4 lựa chọn sử dụng câu lệnh INSERT như mẫu ở trên
3. Đảm bảo rằng mỗi câu hỏi có một lựa chọn đúng (đáp án) và ba lựa chọn sai
4. Chạy các file SQL theo thứ tự sau khi đã chạy file câu hỏi tương ứng

## Các lưu ý quan trọng
1. Đảm bảo rằng các câu hỏi đã được thêm vào database trước khi thêm options
2. Cần chọn các options sai có liên quan đến chủ đề để tạo độ khó phù hợp
3. Trong các câu query, thay thế 'question_text' bằng nội dung câu hỏi chính xác và X bằng ID chủ đề
4. Các lựa chọn phải ngắn gọn và rõ ràng, thường chỉ có 1 từ

## Ví dụ cụ thể
```sql
-- Thêm options cho câu hỏi "The company has a business casual dress _____ for employees." thuộc chủ đề 41
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'A', 'code', true, id FROM toeic_questions WHERE question = 'The company has a business casual dress _____ for employees.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'B', 'rule', false, id FROM toeic_questions WHERE question = 'The company has a business casual dress _____ for employees.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'C', 'standard', false, id FROM toeic_questions WHERE question = 'The company has a business casual dress _____ for employees.' AND question_group_id = 41;

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id) 
SELECT 'D', 'guide', false, id FROM toeic_questions WHERE question = 'The company has a business casual dress _____ for employees.' AND question_group_id = 41;
``` 