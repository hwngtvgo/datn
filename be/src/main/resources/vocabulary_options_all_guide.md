# Hướng dẫn tạo options cho câu hỏi từ vựng

## Giới thiệu

Tài liệu này cung cấp hướng dẫn về cách tạo options (lựa chọn) cho 600 câu hỏi từ vựng điền vào chỗ trống từ 50 chủ đề khác nhau. Có hai cách tiếp cận để thêm options:

1. Sử dụng các file SQL riêng biệt cho từng nhóm chủ đề
2. Sử dụng script tự động để tạo options cho tất cả các câu hỏi

## Phương pháp 1: Sử dụng file SQL riêng biệt

### Cấu trúc file

Chúng ta chia các câu hỏi thành 5 file SQL theo nhóm chủ đề:

1. `vocabulary_options_batch_1_10.sql`: Options cho chủ đề 1-10
2. `vocabulary_options_batch_11_20.sql`: Options cho chủ đề 11-20
3. `vocabulary_options_batch_21_30.sql`: Options cho chủ đề 21-30
4. `vocabulary_options_batch_31_40.sql`: Options cho chủ đề 31-40
5. `vocabulary_options_batch_41_50.sql`: Options cho chủ đề 41-50

### Cấu trúc options

Mỗi câu hỏi cần có 4 options (A, B, C, D), trong đó:
- 1 option đúng (is_correct = TRUE)
- 3 options sai (is_correct = FALSE)

Mẫu SQL để thêm options:

```sql
-- Thêm option đúng
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('A', 'correct_answer', TRUE, (SELECT id FROM toeic_questions WHERE question LIKE 'Question text with _____ placeholder%' AND category = 'VOCABULARY' LIMIT 1));

-- Thêm 3 options sai
INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('B', 'wrong_answer_1', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'Question text with _____ placeholder%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('C', 'wrong_answer_2', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'Question text with _____ placeholder%' AND category = 'VOCABULARY' LIMIT 1));

INSERT INTO toeic_options (option_key, option_text, is_correct, question_id)
VALUES ('D', 'wrong_answer_3', FALSE, (SELECT id FROM toeic_questions WHERE question LIKE 'Question text with _____ placeholder%' AND category = 'VOCABULARY' LIMIT 1));
```

### Lưu ý khi tạo options

1. Đảm bảo mỗi câu hỏi có đúng 4 options (A, B, C, D)
2. Chỉ có duy nhất 1 đáp án đúng (is_correct = TRUE)
3. Các options sai nên hợp lý và gần với ngữ cảnh của câu hỏi
4. Options không nên quá dễ phân biệt (như chọn từ loại khác nhau)

## Phương pháp 2: Sử dụng script tự động

File `vocabulary_options_generator_simple.sql` cung cấp cách tiếp cận tự động để tạo options cho tất cả các câu hỏi từ vựng. Script này:

1. Xóa các options hiện có để tránh trùng lặp
2. Tạo bảng tạm chứa tất cả câu hỏi từ vựng
3. Tạo option key ngẫu nhiên cho mỗi câu hỏi (A, B, C, D)
4. Thêm option đúng cho mỗi câu hỏi
5. Thêm 3 options sai bằng cách lấy các câu trả lời đúng từ các câu hỏi khác trong cùng chủ đề

### Ưu điểm của script tự động:

- Tạo options nhanh chóng cho tất cả 600 câu hỏi
- Giảm thời gian viết SQL thủ công
- Đảm bảo các options sai vẫn có ý nghĩa vì chúng là đáp án đúng của các câu hỏi khác

### Hạn chế:

- Options sai có thể không hoàn toàn phù hợp với ngữ cảnh câu hỏi
- Cần kiểm tra và điều chỉnh thủ công sau khi tạo

## Quy trình thực hiện

### Quy trình thủ công:

1. Đảm bảo tất cả câu hỏi từ vựng đã được thêm vào database
2. Thực thi các file SQL theo thứ tự:
   - `vocabulary_options_batch_1_10.sql`
   - `vocabulary_options_batch_11_20.sql`
   - `vocabulary_options_batch_21_30.sql`
   - `vocabulary_options_batch_31_40.sql`
   - `vocabulary_options_batch_41_50.sql`

### Quy trình tự động:

1. Đảm bảo tất cả câu hỏi từ vựng đã được thêm vào database
2. Thực thi file `vocabulary_options_generator_simple.sql`
3. Kiểm tra kết quả và điều chỉnh các options nếu cần

## Kiểm tra kết quả

Để kiểm tra xem tất cả các câu hỏi đã có đủ options chưa, sử dụng câu lệnh SQL sau:

```sql
SELECT 
    tq.id AS question_id,
    tq.question,
    COUNT(to2.id) AS option_count
FROM 
    toeic_questions tq
LEFT JOIN 
    toeic_options to2 ON tq.id = to2.question_id
WHERE 
    tq.category = 'VOCABULARY'
GROUP BY 
    tq.id, tq.question
HAVING 
    COUNT(to2.id) != 4
ORDER BY 
    tq.question_group_id, tq.question_order;
```

Câu lệnh này sẽ hiển thị các câu hỏi không có đủ 4 options. Nếu kết quả trống, tất cả các câu hỏi đã có đủ options.

## Kết luận

Việc tạo options cho 600 câu hỏi từ vựng có thể thực hiện theo hai cách: thủ công hoặc tự động. Cách thủ công cho phép kiểm soát chất lượng tốt hơn nhưng tốn thời gian. Cách tự động nhanh hơn nhưng có thể cần điều chỉnh sau đó.

Chọn phương pháp phù hợp với nguồn lực và thời gian của bạn. Nếu chất lượng là ưu tiên hàng đầu, hãy sử dụng phương pháp thủ công. Nếu thời gian là hạn chế, hãy sử dụng script tự động và kiểm tra sau. 