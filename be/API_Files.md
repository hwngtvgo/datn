# API Quản lý tệp tin

Tài liệu này mô tả các endpoint API liên quan đến quản lý tệp tin trong ứng dụng TOEIC.

## 1. Upload tệp tin

### 1.1 Upload một tệp tin
- **URL**: `/api/files/upload`
- **Method**: POST
- **Xác thực**: Yêu cầu JWT token với quyền USER hoặc ADMIN
- **Content-Type**: multipart/form-data
- **Mô tả**: Upload một tệp tin lên hệ thống

**Form Data**:
- `file`: Tệp tin cần upload

**Phản hồi thành công (200 OK)**:
```json
{
  "id": 1,
  "name": "example.pdf",
  "url": "/api/files/example.pdf",
  "type": "application/pdf",
  "size": 2048,
  "uploadDate": "2023-07-15T10:30:00Z",
  "message": "Upload tệp tin thành công"
}
```

**Phản hồi lỗi (400 Bad Request)**:
```json
{
  "message": "Kích thước tệp tin vượt quá giới hạn",
  "success": false
}
```

### 1.2 Upload nhiều tệp tin
- **URL**: `/api/files/upload/multiple`
- **Method**: POST
- **Xác thực**: Yêu cầu JWT token với quyền USER hoặc ADMIN
- **Content-Type**: multipart/form-data
- **Mô tả**: Upload nhiều tệp tin cùng lúc lên hệ thống

**Form Data**:
- `files`: Danh sách các tệp tin cần upload

**Phản hồi thành công (200 OK)**:
```json
{
  "fileInfos": [
    {
      "id": 1,
      "name": "document1.pdf",
      "url": "/api/files/document1.pdf",
      "type": "application/pdf",
      "size": 2048,
      "uploadDate": "2023-07-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "image1.jpg",
      "url": "/api/files/image1.jpg",
      "type": "image/jpeg",
      "size": 1024,
      "uploadDate": "2023-07-15T10:30:00Z"
    }
  ],
  "message": "Upload tệp tin thành công"
}
```

## 2. Tải xuống tệp tin

### 2.1 Tải xuống tệp tin theo tên
- **URL**: `/api/files/{fileName}`
- **Method**: GET
- **Mô tả**: Tải xuống tệp tin theo tên

**Tham số đường dẫn**:
- `fileName`: Tên tệp tin cần tải xuống

**Phản hồi thành công**:
- Content-Type: Theo loại tệp tin
- Body: Dữ liệu của tệp tin

**Phản hồi lỗi (404 Not Found)**:
```json
{
  "message": "Không tìm thấy tệp tin",
  "success": false
}
```

### 2.2 Xem tệp tin trực tiếp
- **URL**: `/api/files/view/{fileName}`
- **Method**: GET
- **Mô tả**: Xem tệp tin trực tiếp trên trình duyệt

**Tham số đường dẫn**:
- `fileName`: Tên tệp tin cần xem

**Phản hồi thành công**:
- Content-Type: Theo loại tệp tin
- Body: Dữ liệu của tệp tin

## 3. Quản lý thông tin tệp tin

### 3.1 Lấy danh sách tệp tin
- **URL**: `/api/files`
- **Method**: GET
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Mô tả**: Lấy danh sách tất cả các tệp tin có phân trang

**Tham số truy vấn**:
- `page`: Số trang (mặc định: 0)
- `size`: Số tệp tin trên mỗi trang (mặc định: 10)

**Phản hồi thành công (200 OK)**:
```json
{
  "content": [
    {
      "id": 1,
      "name": "document1.pdf",
      "url": "/api/files/document1.pdf",
      "type": "application/pdf",
      "size": 2048,
      "uploadDate": "2023-07-15T10:30:00Z",
      "uploadedBy": "user1"
    },
    {
      "id": 2,
      "name": "image1.jpg",
      "url": "/api/files/image1.jpg",
      "type": "image/jpeg",
      "size": 1024,
      "uploadDate": "2023-07-15T10:30:00Z",
      "uploadedBy": "admin"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": []
  },
  "totalElements": 30,
  "totalPages": 3,
  "last": false,
  "first": true,
  "size": 10,
  "number": 0,
  "numberOfElements": 2,
  "empty": false
}
```

### 3.2 Xóa tệp tin
- **URL**: `/api/files/{id}`
- **Method**: DELETE
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Mô tả**: Xóa một tệp tin khỏi hệ thống

**Tham số đường dẫn**:
- `id`: ID của tệp tin cần xóa

**Phản hồi thành công (200 OK)**:
```json
{
  "message": "Xóa tệp tin thành công",
  "success": true
}
```

**Phản hồi lỗi (404 Not Found)**:
```json
{
  "message": "Không tìm thấy tệp tin với id 999",
  "success": false
}
```