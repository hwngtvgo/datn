# API Xác thực

Tài liệu này mô tả các endpoint API liên quan đến xác thực người dùng trong ứng dụng TOEIC.

## 1. Đăng nhập

- **URL**: `/api/auth/login`
- **Method**: POST
- **Content-Type**: application/json
- **Mô tả**: Đăng nhập và nhận JWT token

**Request Body**:
```json
{
  "username": "user",
  "password": "123456"
}
```

**Phản hồi thành công (200 OK)**:
```json
{
  "id": 1,
  "username": "user",
  "email": "user@example.com",
  "roles": ["ROLE_USER"],
  "tokenType": "Bearer",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Phản hồi không thành công (401 Unauthorized)**:
```json
{
  "message": "Sai tên đăng nhập hoặc mật khẩu!",
  "success": false
}
```

## 2. Đăng ký

- **URL**: `/api/auth/register`
- **Method**: POST
- **Content-Type**: application/json
- **Mô tả**: Đăng ký tài khoản mới

**Request Body**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "123456"
}
```

**Phản hồi thành công (200 OK)**:
```json
{
  "message": "Đăng ký thành công!",
  "success": true
}
```

**Phản hồi không thành công (400 Bad Request)**:
```json
{
  "message": "Tên đăng nhập đã tồn tại!",
  "success": false
}
```

## 3. Đăng xuất

- **URL**: `/api/auth/logout`
- **Method**: POST
- **Xác thực**: Yêu cầu JWT token
- **Mô tả**: Đăng xuất người dùng và xóa token

**Phản hồi thành công (200 OK)**:
```json
{
  "message": "Đăng xuất thành công!",
  "success": true
}
```

## 4. Lấy thông tin người dùng hiện tại

- **URL**: `/api/auth/me`
- **Method**: GET
- **Xác thực**: Yêu cầu JWT token
- **Mô tả**: Lấy thông tin người dùng hiện tại

**Phản hồi thành công (200 OK)**:
```json
{
  "username": "user123",
  "authenticated": true,
  "role": "ROLE_USER"
}
```

**Phản hồi chưa đăng nhập**:
```json
{
  "username": null,
  "authenticated": false,
  "role": null
}
```

## 5. Làm mới token

- **URL**: `/api/auth/refresh-token`
- **Method**: POST
- **Xác thực**: Yêu cầu JWT token
- **Mô tả**: Làm mới JWT token

**Phản hồi thành công (200 OK)**:
```json
{
  "message": "Refresh token thành công!",
  "success": true
}
```

## 6. Quên mật khẩu

### 6.1. Yêu cầu đặt lại mật khẩu
- **URL**: `/api/auth/password/reset-request`
- **Method**: POST
- **Content-Type**: application/json
- **Mô tả**: Yêu cầu đặt lại mật khẩu (gửi email)

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Phản hồi thành công (200 OK)**:
```json
{
  "message": "Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn!",
  "success": true
}
```

**Phản hồi không thành công (400 Bad Request)**:
```json
{
  "message": "Email không tồn tại!",
  "success": false
}
```

### 6.2. Xác thực token đặt lại mật khẩu
- **URL**: `/api/auth/password/validate-token`
- **Method**: GET
- **Tham số truy vấn**:
  - `token`: Token đặt lại mật khẩu
- **Mô tả**: Kiểm tra token đặt lại mật khẩu có hợp lệ không

**Phản hồi thành công (200 OK)**:
```json
{
  "message": "Token hợp lệ.",
  "success": true
}
```

**Phản hồi không thành công (400 Bad Request)**:
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn.",
  "success": false
}
```

### 6.3. Đặt lại mật khẩu
- **URL**: `/api/auth/password/reset`
- **Method**: POST
- **Content-Type**: application/json
- **Mô tả**: Đặt lại mật khẩu với token

**Request Body**:
```json
{
  "token": "reset-token-example",
  "newPassword": "newpassword123"
}
```

**Phản hồi thành công (200 OK)**:
```json
{
  "message": "Đặt lại mật khẩu thành công!",
  "success": true
}
```

**Phản hồi không thành công (400 Bad Request)**:
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn.",
  "success": false
}
``` 