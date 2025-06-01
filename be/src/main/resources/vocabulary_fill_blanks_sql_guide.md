# Hướng dẫn sử dụng các file SQL tạo câu hỏi Điền từ vào chỗ trống

## Tổng quan
Bộ câu hỏi điền từ vào chỗ trống được chia thành nhiều file SQL để dễ quản lý và thực thi. Tổng cộng có hơn 600 câu hỏi từ vựng dạng điền từ vào chỗ trống, được phân bổ theo 50 chủ đề từ vựng.

## Danh sách các file
1. `vocabulary_fill_blanks_batch_1.sql`: Câu hỏi cho các chủ đề 1-10 (120 câu)
2. `vocabulary_fill_blanks_batch_2.sql`: Câu hỏi cho các chủ đề 11-20 (120 câu)
3. `vocabulary_fill_blanks_batch_3.sql`: Câu hỏi cho các chủ đề 21-30 (120 câu)
4. `vocabulary_fill_blanks_batch_4.sql`: Câu hỏi cho các chủ đề 31-40 (120 câu)
5. `vocabulary_fill_blanks_batch_5.sql`: Câu hỏi cho các chủ đề 41-50 (120 câu)
6. `vocabulary_fill_blanks_from_topics.sql`: File gốc với các câu hỏi mẫu (50 câu)
7. `vocabulary_fill_blanks_simple.sql`: Phiên bản đơn giản với ít câu hỏi hơn (30 câu)

## Cách sử dụng
1. Đảm bảo đã chạy file `vocabulary_topics.sql` trước để tạo các chủ đề từ vựng cơ bản
2. Thực thi các file SQL theo thứ tự từ 1-5 để thêm tất cả các câu hỏi vào cơ sở dữ liệu
3. Để chạy backend trên port 8081 (tránh xung đột với port 8080), sử dụng lệnh:
   ```
   cd /home/hwngtv/datn/be && mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
   ```

## Cấu trúc dữ liệu
Mỗi câu hỏi trong file SQL có cấu trúc sau:
- `question`: Câu hỏi có chứa "\_\_\_\_\_" (5 dấu gạch dưới) đại diện cho chỗ trống cần điền
- `correct_answer`: Từ đáp án đúng cần điền vào chỗ trống
- `explanation`: Giải thích, bao gồm từ đúng và nghĩa tiếng Việt
- `difficulty_level`: Mức độ khó (EASY, MEDIUM, HARD)
- `category`: Loại câu hỏi (VOCABULARY)
- `question_group_id`: ID của nhóm câu hỏi (chủ đề từ vựng)
- `question_order`: Thứ tự của câu hỏi trong nhóm

Mỗi câu hỏi có 4 tùy chọn (A, B, C, D), trong đó một tùy chọn là đáp án đúng.

## Tổng quan các chủ đề
1-10: Chủ đề cơ bản (văn phòng, du lịch, việc làm, tiếp thị, tài chính, sức khỏe, công nghệ, sản xuất, giải trí, ẩm thực)
11-20: Chủ đề mở rộng (bán lẻ, dịch vụ khách hàng, bất động sản, hợp đồng, họp và thuyết trình, giáo dục, thư tín, sân bay, khách sạn, nhân sự)
21-30: Chủ đề chuyên ngành (máy tính, điện thoại, sự kiện, năng lượng, thời gian, thể thao, thời tiết, xây dựng, nông nghiệp, ô tô)
31-40: Chủ đề nâng cao (thương mại quốc tế, bảo hiểm, chính phủ, khoa học, luật pháp, kế toán, y tế, du lịch, nghệ thuật, truyền thông)
41-50: Chủ đề chuyên sâu (thời trang, môi trường, mạng xã hội, kiểm soát chất lượng, dịch vụ khách sạn, tuyển dụng, thể thao, kiến trúc, kỹ thuật, quản lý)

## Mẹo
- Có thể chạy từng file một để kiểm tra hiệu suất và tránh tải quá nhiều dữ liệu cùng lúc
- Sử dụng port 8081 cho backend để tránh xung đột với các ứng dụng khác đang chạy trên port 8080
- Có thể tùy chỉnh các câu hỏi theo nhu cầu trước khi thực thi

## Lưu ý
- Các câu hỏi đã được đánh số thứ tự từ 101 trở đi để tránh xung đột với các câu hỏi hiện có
- Các file có thể được thực thi độc lập với nhau tùy theo nhu cầu
- Tổng cộng có 600 câu hỏi từ vựng dạng điền từ vào chỗ trống (5 file x 120 câu) 