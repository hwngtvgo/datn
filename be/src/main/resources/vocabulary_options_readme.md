# Hướng dẫn triển khai câu hỏi từ vựng điền vào chỗ trống

## Tổng quan
Hệ thống câu hỏi từ vựng điền vào chỗ trống đã được chia thành nhiều file để dễ quản lý và triển khai. Tổng cộng có hơn 600 câu hỏi từ vựng dạng điền từ vào chỗ trống, được phân bổ theo 50 chủ đề.

## Các file câu hỏi
1. `vocabulary_fill_blanks_batch_1.sql`: Câu hỏi cho các chủ đề 1-10 (120 câu)
2. `vocabulary_fill_blanks_batch_2.sql`: Câu hỏi cho các chủ đề 11-20 (120 câu)
3. `vocabulary_fill_blanks_batch_3.sql`: Câu hỏi cho các chủ đề 21-30 (120 câu)
4. `vocabulary_fill_blanks_batch_4.sql`: Câu hỏi cho các chủ đề 31-40 (120 câu)
5. `vocabulary_fill_blanks_batch_5.sql`: Câu hỏi cho các chủ đề 41-50 (120 câu)

## Các file options (lựa chọn)
1. `vocabulary_options_batch_1.sql`: Options cho chủ đề 1-10
2. `vocabulary_options_batch_2.sql`: Options cho chủ đề 11-20
3. `vocabulary_options_batch_3.sql`: Options cho chủ đề 21-30
4. `vocabulary_options_batch_4.sql`: Options cho chủ đề 31-40
5. `vocabulary_options_batch_5.sql`: Options cho chủ đề 41-50

## Các bước triển khai

### 1. Chuẩn bị môi trường
Đảm bảo rằng database MySQL đã được khởi động và cấu hình đúng trong `application.properties` của ứng dụng Spring Boot.

### 2. Triển khai các chủ đề từ vựng
Trước khi thêm câu hỏi, cần đảm bảo rằng file `vocabulary_topics.sql` đã được thực thi để tạo các chủ đề từ vựng từ 1-50.

```bash
mysql -u username -p database_name < vocabulary_topics.sql
```

### 3. Triển khai các câu hỏi
Thực hiện lần lượt các file câu hỏi theo thứ tự từ 1 đến 5:

```bash
mysql -u username -p database_name < vocabulary_fill_blanks_batch_1.sql
mysql -u username -p database_name < vocabulary_fill_blanks_batch_2.sql
mysql -u username -p database_name < vocabulary_fill_blanks_batch_3.sql
mysql -u username -p database_name < vocabulary_fill_blanks_batch_4.sql
mysql -u username -p database_name < vocabulary_fill_blanks_batch_5.sql
```

### 4. Triển khai các options (lựa chọn)
Sau khi đã thêm các câu hỏi, tiếp tục thêm các options cho mỗi câu hỏi:

```bash
mysql -u username -p database_name < vocabulary_options_batch_1.sql
mysql -u username -p database_name < vocabulary_options_batch_2.sql
mysql -u username -p database_name < vocabulary_options_batch_3.sql
mysql -u username -p database_name < vocabulary_options_batch_4.sql
mysql -u username -p database_name < vocabulary_options_batch_5.sql
```

### 5. Khởi động ứng dụng
Sau khi đã thêm tất cả câu hỏi và options, khởi động ứng dụng Spring Boot với port 8081 (để tránh xung đột với port 8080):

```bash
cd /home/hwngtv/datn/be && mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

## Cấu trúc dữ liệu
### Cấu trúc câu hỏi
Mỗi câu hỏi trong file SQL có cấu trúc sau:
- `question`: Câu hỏi có chứa "\_\_\_\_\_" (5 dấu gạch dưới) đại diện cho chỗ trống cần điền
- `correct_answer`: Từ đáp án đúng cần điền vào chỗ trống
- `explanation`: Giải thích, bao gồm từ đúng và nghĩa tiếng Việt
- `difficulty_level`: Mức độ khó (EASY, MEDIUM, HARD)
- `category`: Loại câu hỏi (VOCABULARY)
- `question_group_id`: ID của nhóm câu hỏi (chủ đề từ vựng)
- `question_order`: Thứ tự của câu hỏi trong nhóm

### Cấu trúc options
Mỗi câu hỏi có 4 options:
- Option A, B, C, D với một option đúng (is_correct = true) và ba options sai (is_correct = false)
- Các options được liên kết với câu hỏi thông qua question_id

## Tùy chỉnh và mở rộng
1. Có thể thêm câu hỏi mới bằng cách thêm vào các file SQL hoặc tạo file SQL mới
2. Có thể điều chỉnh mức độ khó của câu hỏi thông qua trường difficulty_level
3. Nếu muốn thêm nhiều chủ đề, cần cập nhật file vocabulary_topics.sql và tạo các file câu hỏi mới

## Khắc phục sự cố
1. **Lỗi trùng ID**: Đảm bảo rằng question_order không bị trùng lặp
2. **Lỗi chủ đề không tồn tại**: Đảm bảo rằng file vocabulary_topics.sql đã được thực thi trước
3. **Lỗi kết nối database**: Kiểm tra thông tin kết nối trong application.properties

## Lưu ý quan trọng
- **Thứ tự thực hiện**: Luôn thực hiện theo thứ tự: chủ đề -> câu hỏi -> options
- **Sao lưu dữ liệu**: Sao lưu database trước khi thực hiện các thay đổi lớn
- **Kiểm tra dữ liệu**: Kiểm tra ngẫu nhiên một số câu hỏi sau khi thêm để đảm bảo chất lượng

Với hơn 600 câu hỏi từ vựng dạng điền từ vào chỗ trống, người dùng có thể ôn tập hiệu quả và toàn diện cho kỳ thi TOEIC. 