# API Quản lý người dùng

Tài liệu này mô tả các endpoint API liên quan đến quản lý người dùng trong ứng dụng TOEIC.

## 1. API Thông tin người dùng

### 1.1 Lấy thông tin người dùng hiện tại
- **URL**: `/api/auth/me`
- **Method**: GET
- **Xác thực**: Yêu cầu JWT token
- **Mô tả**: Lấy thông tin của người dùng đang đăng nhập

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

## 2. API Quản lý người dùng (Admin)

### 2.1 Lấy danh sách người dùng
- **URL**: `/api/users`
- **Method**: GET
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Mô tả**: Lấy danh sách tất cả người dùng

**Phản hồi thành công (200 OK)**:
```json
[
  {
    "id": 1,
    "username": "user1",
    "email": "user1@example.com",
    "roles": ["ROLE_USER"]
  },
  {
    "id": 2,
    "username": "admin",
    "email": "admin@example.com",
    "roles": ["ROLE_ADMIN"]
  }
]
```

### 2.2 Lấy thông tin người dùng theo ID
- **URL**: `/api/users/{id}`
- **Method**: GET
- **Xác thực**: Yêu cầu JWT token
- **Tham số đường dẫn**:
  - `id`: ID của người dùng cần lấy thông tin

**Phản hồi thành công (200 OK)**:
```json
{
  "id": 1,
  "username": "user1",
  "email": "user1@example.com",
  "roles": ["ROLE_USER"]
}
```

**Phản hồi không tìm thấy (404 Not Found)**:
```json
{
  "message": "Không tìm thấy người dùng với id 999",
  "success": false
}
```

### 2.3 Tạo người dùng mới
- **URL**: `/api/users`
- **Method**: POST
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Content-Type**: application/json

**Request Body**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "roles": ["ROLE_USER"]
}
```

**Phản hồi thành công (201 Created)**:
```json
{
  "id": 3,
  "username": "newuser",
  "email": "newuser@example.com",
  "roles": ["ROLE_USER"]
}
```

**Phản hồi lỗi (400 Bad Request)**:
```json
{
  "message": "Tên đăng nhập đã tồn tại",
  "success": false
}
```

### 2.4 Cập nhật thông tin người dùng
- **URL**: `/api/users/{id}`
- **Method**: PUT
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Content-Type**: application/json
- **Tham số đường dẫn**:
  - `id`: ID của người dùng cần cập nhật

**Request Body**:
```json
{
  "username": "updateduser",
  "email": "updated@example.com",
  "password": "newpassword123",
  "roles": ["ROLE_USER"]
}
```

**Phản hồi thành công (200 OK)**:
```json
{
  "id": 3,
  "username": "updateduser",
  "email": "updated@example.com",
  "roles": ["ROLE_USER"]
}
```

**Phản hồi lỗi (400 Bad Request)**:
```json
{
  "message": "Tên đăng nhập đã tồn tại",
  "success": false
}
```

### 2.5 Xóa người dùng
- **URL**: `/api/users/{id}`
- **Method**: DELETE
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Tham số đường dẫn**:
  - `id`: ID của người dùng cần xóa

**Phản hồi thành công (200 OK)**:
```json
{
  "message": "Xóa người dùng thành công",
  "success": true
}
```

**Phản hồi lỗi (400 Bad Request)**:
```json
{
  "message": "Không thể xóa người dùng",
  "success": false
}
```

## 3. Thống kê người dùng

### 3.1. Thống kê hoạt động của người dùng

- **URL**: `/api/admin/users/{id}/statistics`
- **Method**: `GET`
- **Auth**: Yêu cầu JWT (ROLE_ADMIN)
- **Mô tả**: Lấy thống kê hoạt động của người dùng

#### Path Parameters

- `id`: ID của người dùng

#### Response (200 OK)

```json
{
  "userId": 1,
  "username": "user1",
  "testsTaken": 15,
  "averageScore": 78.5,
  "bestScore": 95,
  "testHistory": [
    {
      "testId": 1,
      "title": "TOEIC Practice Test 1",
      "score": 85,
      "completedAt": "2023-07-15T11:45:00Z"
    },
    {
      "testId": 2,
      "title": "Reading Practice Set",
      "score": 75,
      "completedAt": "2023-07-10T09:30:00Z"
    }
  ],
  "loginHistory": [
    {
      "loginTime": "2023-07-20T10:15:00Z",
      "ipAddress": "192.168.1.100",
      "device": "Chrome on Windows"
    },
    {
      "loginTime": "2023-07-18T14:30:00Z",
      "ipAddress": "192.168.1.101",
      "device": "Safari on macOS"
    }
  ],
  "activityByMonth": [
    {
      "month": "2023-07",
      "testsTaken": 5,
      "averageScore": 80.2
    },
    {
      "month": "2023-06",
      "testsTaken": 8,
      "averageScore": 76.8
    }
  ]
}
```

---

### 3.2. Thống kê tổng quan người dùng

- **URL**: `/api/admin/users/statistics`
- **Method**: `GET`
- **Auth**: Yêu cầu JWT (ROLE_ADMIN)
- **Mô tả**: Lấy thống kê tổng quan về người dùng trong hệ thống

#### Response (200 OK)

```json
{
  "totalUsers": 50,
  "activeUsers": 45,
  "newUsersThisMonth": 10,
  "usersByRole": {
    "ROLE_USER": 48,
    "ROLE_ADMIN": 2
  },
  "userRegistrationByMonth": [
    {
      "month": "2023-07",
      "count": 10
    },
    {
      "month": "2023-06",
      "count": 15
    },
    {
      "month": "2023-05",
      "count": 25
    }
  ],
  "activeUsersByMonth": [
    {
      "month": "2023-07",
      "count": 40
    },
    {
      "month": "2023-06",
      "count": 35
    }
  ]
}
``` 