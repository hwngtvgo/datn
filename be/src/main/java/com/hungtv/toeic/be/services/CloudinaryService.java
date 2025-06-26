package com.hungtv.toeic.be.services;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.hungtv.toeic.be.exception.FileStorageException;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(@Value("${cloudinary.url}") String cloudinaryUrl) {
        this.cloudinary = new Cloudinary(cloudinaryUrl);
        this.cloudinary.config.secure = true;
    }

    /**
     * Upload file lên Cloudinary
     * @param file File cần upload
     * @param folder Thư mục con trên Cloudinary
     * @return URL public của file đã upload
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            // Tạo tên file ngẫu nhiên để tránh trùng lặp
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String publicId = UUID.randomUUID().toString();
            
            // Cấu hình upload
            Map<String, Object> uploadParams = new HashMap<>();
            uploadParams.put("public_id", publicId);
            uploadParams.put("folder", folder);
            uploadParams.put("resource_type", "auto"); // Tự động xác định loại file
            uploadParams.put("use_filename", false);
            uploadParams.put("unique_filename", true);

            // Upload file
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            
            // Trả về secure URL
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new FileStorageException("Không thể upload file lên Cloudinary: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new FileStorageException("Lỗi không xác định khi upload file: " + e.getMessage(), e);
        }
    }

    /**
     * Xóa file từ Cloudinary
     * @param publicId Public ID của file trên Cloudinary
     * @return true nếu xóa thành công
     */
    public boolean deleteFile(String publicId) {
        try {
            Map<String, Object> result = cloudinary.uploader().destroy(publicId, new HashMap<>());
            return "ok".equals(result.get("result"));
        } catch (IOException e) {
            throw new FileStorageException("Không thể xóa file từ Cloudinary: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new FileStorageException("Lỗi không xác định khi xóa file: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy public ID từ URL Cloudinary
     * @param url URL của file trên Cloudinary
     * @return public ID
     */
    public String extractPublicIdFromUrl(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }
        
        try {
            // URL format: https://res.cloudinary.com/cloud_name/resource_type/upload/v1234567890/folder/public_id.ext
            String[] parts = url.split("/");
            String lastPart = parts[parts.length - 1];
            
            // Bỏ extension nếu có
            if (lastPart.contains(".")) {
                lastPart = lastPart.substring(0, lastPart.lastIndexOf("."));
            }
            
            // Tìm folder nếu có
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].equals("upload") && i + 2 < parts.length) {
                    // Bỏ qua version (v1234567890)
                    String folder = "";
                    for (int j = i + 2; j < parts.length - 1; j++) {
                        if (!folder.isEmpty()) {
                            folder += "/";
                        }
                        folder += parts[j];
                    }
                    return folder.isEmpty() ? lastPart : folder + "/" + lastPart;
                }
            }
            
            return lastPart;
        } catch (Exception e) {
            return null;
        }
    }
} 