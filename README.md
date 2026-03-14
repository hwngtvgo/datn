# TOEIC Learning Platform

Đồ án tốt nghiệp kỳ 20242 — Trường Công nghệ Thông tin và Truyền thông (SOICT), Đại học Bách khoa Hà Nội (HUST).

Ứng dụng học và luyện thi TOEIC trực tuyến, hỗ trợ người dùng ôn luyện từ vựng, ngữ pháp, và làm đề thi mô phỏng theo chuẩn TOEIC.

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Spring Boot 3.4, Java 21, Spring Security, JWT |
| Database | MySQL 8 |
| Storage | Cloudinary (audio, images) |
| AI | OpenAI GPT (chatbot hỗ trợ) |
| Deploy | Docker, Docker Compose |

---

## Tính năng chính

- Đăng ký / đăng nhập, xác thực JWT, đặt lại mật khẩu qua email
- Luyện tập theo chặng trình độ (0–300, 300–600, 600–800+)
- Làm đề thi TOEIC full/mini với bộ đếm thời gian
- Chấm điểm theo thang TOEIC (0–495), phân tích kết quả chi tiết
- Lịch sử thi, thống kê tiến độ theo tháng
- Chatbot AI hỗ trợ giải đáp câu hỏi TOEIC
- Trang quản trị (CRUD đề thi, câu hỏi, người dùng)

---

## Cài đặt

### Yêu cầu

- Docker & Docker Compose
- Node.js 20+ (nếu chạy dev)
- Java 21 (nếu chạy dev)

### Chạy với Docker Compose

```bash
# 1. Copy file cấu hình
cp .env.example .env
cp be/.env.example be/.env

# 2. Điền các giá trị vào .env (xem hướng dẫn bên dưới)

# 3. Khởi động
docker compose up -d
```

Ứng dụng chạy tại:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### Biến môi trường cần thiết

Xem file `.env.example` để biết danh sách đầy đủ. Các biến bắt buộc:

```env
DB_PASSWORD=         # Mật khẩu MySQL
JWT_SECRET=          # Chuỗi bí mật ký JWT (tối thiểu 64 ký tự)
MAIL_USERNAME=       # Gmail dùng gửi email
MAIL_PASSWORD=       # App Password của Gmail
OPENAI_API_KEY=      # API key OpenAI
CLOUDINARY_URL=      # URL Cloudinary
```

### Chạy môi trường dev

```bash
# Backend
cd be
mvn spring-boot:run

# Frontend
cd fe
npm install
npm run dev
```

---

## Cấu trúc thư mục

```
.
├── be/          # Spring Boot backend
├── fe/          # React frontend
├── docker-compose.yml
└── .env.example
```
