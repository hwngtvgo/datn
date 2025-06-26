# Hướng dẫn tích hợp Cloudinary

## Tổng quan
Dự án đã được cập nhật để sử dụng Cloudinary thay cho việc lưu trữ file local. Cloudinary cung cấp dịch vụ lưu trữ và xử lý file trên cloud với nhiều tính năng nâng cao.

## Cấu hình

### 1. Dependency Maven
Đã thêm dependency Cloudinary vào `pom.xml`:
```xml
<dependency>
    <groupId>com.cloudinary</groupId>
    <artifactId>cloudinary-http44</artifactId>
    <version>1.34.0</version>
</dependency>
```

### 2. Cấu hình application.properties
Đã thêm cấu hình Cloudinary URL:
```properties
cloudinary.url=cloudinary://732421283418323:81TBMgZUiGytDP196GaH4pObfj8@dscl5hwyq
```

## Thay đổi trong code

### 1. CloudinaryService
- Tạo mới `CloudinaryService` để thay thế `FileStorageService`
- Cung cấp các method:
  - `uploadFile(MultipartFile file, String folder)`: Upload file lên Cloudinary
  - `deleteFile(String publicId)`: Xóa file từ Cloudinary
  - `extractPublicIdFromUrl(String url)`: Lấy public ID từ URL

### 2. FileController
- Cập nhật để sử dụng `CloudinaryService`
- File sẽ được upload lên Cloudinary và trả về URL public
- Các API download và view giữ nguyên để tương thích, nhưng sẽ trả về thông báo chuyển hướng

### 3. ToeicQuestionService
- Cập nhật để sử dụng `CloudinaryService.uploadFile()` thay vì `FileStorageService.storeFile()`
- Audio files sẽ được lưu trong folder "audio"
- Image files sẽ được lưu trong folder "images"

## Tính năng mới

### 1. Upload trực tiếp lên cloud
- Files không còn lưu trữ local
- Trả về URL public có thể truy cập trực tiếp
- Hỗ trợ CDN tự động

### 2. Quản lý thư mục
- Files được tổ chức theo thư mục: audio, images, toeic-uploads
- Tự động tạo tên file unique để tránh trùng lặp

### 3. Xóa file
- Hỗ trợ xóa file từ Cloudinary bằng public ID hoặc URL

## Cách sử dụng

### Upload file đơn
```bash
POST /api/files/upload
Content-Type: multipart/form-data

file: [your-file]
folder: audio (optional)
```

### Upload nhiều file
```bash
POST /api/files/upload/multiple
Content-Type: multipart/form-data

files: [array-of-files]
folder: images (optional)
```

### Xóa file
```bash
DELETE /api/files/{publicId-or-url}
```

## Response format
```json
{
  "fileName": "example.mp3",
  "fileDownloadUri": "https://res.cloudinary.com/dscl5hwyq/...",
  "fileViewUri": "https://res.cloudinary.com/dscl5hwyq/...",
  "fileType": "audio/mpeg",
  "size": 1024000,
  "filePath": "https://res.cloudinary.com/dscl5hwyq/..."
}
```

## Lợi ích
1. **Hiệu suất**: Files được phục vụ từ CDN toàn cầu
2. **Bảo mật**: Cloudinary xử lý HTTPS và security
3. **Dung lượng**: Không giới hạn lưu trữ local
4. **Xử lý**: Hỗ trợ resize, format chuyển đổi tự động
5. **Backup**: Cloudinary tự động backup và replicate

## Migration từ local storage
- File cũ trong thư mục `uploads/` vẫn có thể truy cập
- Files mới sẽ được upload lên Cloudinary
- Cần migrate data cũ nếu muốn hoàn toàn chuyển sang cloud 