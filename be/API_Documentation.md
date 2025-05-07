# Tài liệu API - TOEIC Application

## Giới thiệu

Tài liệu này mô tả các API của ứng dụng TOEIC Application, bao gồm các endpoint, phương thức truy cập, dữ liệu mẫu, yêu cầu xác thực và các kết quả trả về.

---

## Xác thực và Phân quyền

Hệ thống sử dụng JWT (JSON Web Token) cho xác thực. Các API bảo mật yêu cầu token trong header:
- `Authorization: Bearer YOUR_JWT_TOKEN`

### Các Role trong hệ thống
- `ROLE_USER`: Người dùng thông thường
- `ROLE_ADMIN`: Quản trị viên

---

## 1. Nhóm API Xác thực (Auth)

Base URL: `/api/auth`

### 1.1. Đăng nhập

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth**: Không yêu cầu
- **Mô tả**: Đăng nhập và lấy token xác thực

#### Request Body

```json
{
  "username": "user",
  "password": "123456"
}
```

Hoặc:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### Response (200 OK)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "user",
  "email": "user@example.com",
  "roles": ["ROLE_USER"]
}
```

---

### 1.2. Đăng ký

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth**: Không yêu cầu
- **Mô tả**: Đăng ký tài khoản mới

#### Request Body

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "123456"
}
```

#### Response (200 OK)

```json
{
  "message": "Đăng ký thành công!",
  "success": true
}
```

#### Response (400 Bad Request)

```json
{
  "message": "Tên người dùng đã tồn tại!",
  "success": false
}
```

---

### 1.3. Đăng xuất

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Auth**: Yêu cầu JWT
- **Mô tả**: Đăng xuất và hủy JWT token

#### Response (200 OK)

```json
{
  "message": "Đăng xuất thành công!"
}
```

---

### 1.4. Thông tin người dùng hiện tại

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Auth**: Yêu cầu JWT
- **Mô tả**: Lấy thông tin người dùng đang đăng nhập

#### Response (200 OK - đã đăng nhập)

```json
{
  "username": "user",
  "authenticated": true,
  "role": "ROLE_USER"
}
```

#### Response (200 OK - chưa đăng nhập)

```json
{
  "username": null,
  "authenticated": false,
  "role": null
}
```

---

### 1.5. Làm mới token

- **URL**: `/api/auth/refresh-token`
- **Method**: `POST`
- **Auth**: Yêu cầu JWT Refresh Token
- **Mô tả**: Làm mới JWT token

#### Response (200 OK)

```json
{
  "message": "Refresh token thành công!"
}
```

---

### 1.6. Yêu cầu đặt lại mật khẩu

- **URL**: `/api/auth/password/reset-request`
- **Method**: `POST`
- **Auth**: Không yêu cầu
- **Mô tả**: Gửi yêu cầu đặt lại mật khẩu vào email

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Response (200 OK)

```json
{
  "message": "Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu",
  "success": true
}
```

---

### 1.7. Kiểm tra token đặt lại mật khẩu

- **URL**: `/api/auth/password/validate-token`
- **Method**: `GET`
- **Auth**: Không yêu cầu
- **Mô tả**: Kiểm tra token đặt lại mật khẩu có hợp lệ không

#### Query Params

`token`: Token đặt lại mật khẩu

#### Response (200 OK)

```json
{
  "message": "Token hợp lệ."
}
```

#### Response (400 Bad Request)

```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn.",
  "success": false
}
```

---

### 1.8. Đặt lại mật khẩu

- **URL**: `/api/auth/password/reset`
- **Method**: `POST`
- **Auth**: Không yêu cầu
- **Mô tả**: Đặt lại mật khẩu với token hợp lệ

#### Request Body

```json
{
  "token": "reset-token-example",
  "newPassword": "newpassword123"
}
```

#### Response (200 OK)

```json
{
  "message": "Đặt lại mật khẩu thành công",
  "success": true
}
```

#### Response (400 Bad Request)

```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "success": false
}
```

---

## 2. Nhóm API Ví dụ (Examples)

Base URL: `/api/examples`

### 2.1. Endpoint công khai

- **URL**: `/api/examples/public`
- **Method**: `GET`
- **Auth**: Không yêu cầu
- **Mô tả**: API công khai, không yêu cầu xác thực

#### Response (200 OK)

```json
{
  "message": "Đây là một endpoint công khai"
}
```

---

### 2.2. Endpoint được bảo vệ

- **URL**: `/api/examples/secured`
- **Method**: `GET`
- **Auth**: Yêu cầu JWT
- **Mô tả**: API yêu cầu xác thực JWT

#### Response (200 OK)

```json
{
  "message": "Đây là một endpoint được bảo vệ"
}
```

---

### 2.3. Gửi dữ liệu

- **URL**: `/api/examples/submit`
- **Method**: `POST`
- **Auth**: Yêu cầu JWT
- **Mô tả**: API nhận dữ liệu và yêu cầu xác thực JWT

#### Request Body

```json
{
  "name": "Nguyễn Văn A",
  "email": "example@example.com",
  "message": "Xin chào"
}
```

#### Response (200 OK)

```json
{
  "status": "success",
  "message": "Dữ liệu đã được nhận",
  "data": {
    "name": "Nguyễn Văn A",
    "email": "example@example.com",
    "message": "Xin chào"
  }
}
```

---

### 2.4. Lấy thông tin theo ID

- **URL**: `/api/examples/{id}`
- **Method**: `GET`
- **Auth**: Yêu cầu JWT
- **Mô tả**: API lấy thông tin dựa trên ID và yêu cầu xác thực JWT

#### Path Parameters

`id`: ID của dữ liệu cần lấy

#### Response (200 OK)

```json
{
  "id": 1,
  "name": "Dữ liệu mẫu 1",
  "description": "Đây là dữ liệu mẫu cho ID: 1"
}
```

---

## 3. Hướng dẫn test với Swagger UI

1. Truy cập Swagger UI tại: `http://localhost:8080/swagger-ui/index.html`
2. Đăng nhập qua `/api/auth/login` để lấy JWT token
3. Nhấn nút "Authorize" ở phía trên phải của Swagger UI
4. Nhập JWT token (không bao gồm tiền tố "Bearer ")
5. Nhấn "Authorize" để lưu token
6. Bây giờ bạn có thể sử dụng các API yêu cầu xác thực

## 4. Hướng dẫn test với Postman

1. Tạo một request POST đến `/api/auth/login` với body là thông tin đăng nhập
2. Lưu JWT token từ response
3. Tạo request đến API cần test
4. Thêm header `Authorization: Bearer YOUR_JWT_TOKEN`
5. Gửi request và kiểm tra response 