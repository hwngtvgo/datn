# Tài liệu API - Ứng dụng TOEIC

Tài liệu này cung cấp thông tin về các API trong ứng dụng TOEIC.

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Xác thực và Phân quyền](#xác-thực-và-phân-quyền)
3. [Danh sách API theo Module](#danh-sách-api-theo-module)
4. [Sử dụng Swagger UI](#sử-dụng-swagger-ui)
5. [Quy ước mã lỗi](#quy-ước-mã-lỗi)
6. [Ví dụ sử dụng API với cURL](#ví-dụ-sử-dụng-api-với-curl)

## Tổng quan

Backend API của ứng dụng TOEIC được xây dựng trên:
- Java 21
- Spring Boot 3.4.4
- Spring Security + JWT
- MySQL Database

Tất cả API được bảo vệ bởi JWT (JSON Web Token) ngoại trừ các endpoint đăng nhập, đăng ký, và một số endpoint công khai khác.

## Xác thực và Phân quyền

Hệ thống sử dụng JWT để xác thực người dùng. Token được trả về sau khi đăng nhập thành công và phải được gửi kèm trong header của mỗi request đến API được bảo vệ.

```
Authorization: Bearer {jwt_token}
```

Phân quyền trong hệ thống:
- `ROLE_USER`: Người dùng thông thường, có thể làm bài thi, xem kết quả
- `ROLE_ADMIN`: Quản trị viên, có thể quản lý người dùng, câu hỏi, đề thi

## Danh sách API theo Module

### 1. API Xác thực
Chi tiết tại: [API_Authentication.md](API_Authentication.md)
- Đăng nhập (`POST /api/auth/login`)
- Đăng ký (`POST /api/auth/register`)
- Đăng xuất (`POST /api/auth/logout`)
- Lấy thông tin người dùng hiện tại (`GET /api/auth/me`)
- Làm mới token (`POST /api/auth/refresh-token`)
- Quên mật khẩu (`POST /api/auth/password/reset-request`)
- Đặt lại mật khẩu (`POST /api/auth/password/reset`)

### 2. API Quản lý người dùng
Chi tiết tại: [API_Users.md](API_Users.md)
- Lấy danh sách người dùng (`GET /api/users`)
- Lấy thông tin người dùng theo ID (`GET /api/users/{id}`)
- Tạo người dùng mới (`POST /api/users`)
- Cập nhật thông tin người dùng (`PUT /api/users/{id}`)
- Xóa người dùng (`DELETE /api/users/{id}`)

### 3. API Quản lý câu hỏi TOEIC
Chi tiết tại: [API_Questions.md](API_Questions.md)
- Lấy danh sách câu hỏi (`GET /api/toeic-questions`)
- Lấy chi tiết câu hỏi (`GET /api/toeic-questions/{id}`)
- Tạo câu hỏi mới (`POST /api/toeic-questions`)
- Cập nhật câu hỏi (`PUT /api/toeic-questions/{id}`)
- Xóa câu hỏi (`DELETE /api/toeic-questions/{id}`)
- Quản lý nhóm câu hỏi

### 4. API Quản lý tệp tin
Chi tiết tại: [API_Files.md](API_Files.md)
- Upload tệp tin (`POST /api/files/upload`)
- Upload nhiều tệp tin (`POST /api/files/upload/multiple`)
- Tải xuống tệp tin (`GET /api/files/{fileName}`)
- Xem tệp tin trực tiếp (`GET /api/files/view/{fileName}`)
- Lấy danh sách tệp tin (`GET /api/files`)
- Xóa tệp tin (`DELETE /api/files/{id}`)

## Sử dụng Swagger UI

Ứng dụng tích hợp Swagger UI để dễ dàng kiểm tra và sử dụng API:

1. Truy cập Swagger UI tại: `http://localhost:8080/swagger-ui.html`
2. Đăng nhập để lấy JWT token
3. Authorize bằng cách nhấp vào nút "Authorize" và nhập token với định dạng: `Bearer {jwt_token}`
4. Thử nghiệm các API bằng cách nhấp vào endpoint mong muốn và nhấn "Try it out"

## Quy ước mã lỗi

| Mã HTTP | Mô tả |
|---------|-------|
| 200 | Thành công |
| 201 | Tạo thành công |
| 400 | Dữ liệu không hợp lệ |
| 401 | Chưa xác thực |
| 403 | Không có quyền truy cập |
| 404 | Không tìm thấy tài nguyên |
| 500 | Lỗi máy chủ |

## Ví dụ sử dụng API với cURL

### Đăng nhập và lấy token

```bash
curl -X POST "http://localhost:8080/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"admin", "password":"admin123"}'
```

### Lấy danh sách câu hỏi (với JWT token)

```bash
curl -X GET "http://localhost:8080/api/toeic-questions" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Upload tệp tin

```bash
curl -X POST "http://localhost:8080/api/files/upload" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     -F "file=@/đường/dẫn/đến/file.pdf"
```