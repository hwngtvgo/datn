package com.hungtv.toeic.be.services;

import com.hungtv.toeic.be.exception.FileStorageException;
import com.hungtv.toeic.be.exception.FileNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Không thể tạo thư mục để lưu trữ file.", ex);
        }
    }

    /**
     * Lưu trữ file với tên ngẫu nhiên trong thư mục được chỉ định
     * @param file File cần lưu trữ
     * @param subdirectory Thư mục con (có thể null)
     * @return Đường dẫn tương đối đến file đã lưu
     */
    public String storeFile(MultipartFile file, String subdirectory) {
        // Chuẩn hóa tên file
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        // Kiểm tra tên file hợp lệ
        if (originalFileName.contains("..")) {
            throw new FileStorageException("Tên file không hợp lệ: " + originalFileName);
        }
        
        // Tạo tên file ngẫu nhiên để tránh trùng lặp
        String fileExtension = "";
        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String randomFileName = UUID.randomUUID().toString() + fileExtension;
        
        // Tạo thư mục con nếu được chỉ định
        Path targetLocation;
        String relativePath;
        
        if (subdirectory != null && !subdirectory.isEmpty()) {
            Path subdirectoryPath = this.fileStorageLocation.resolve(subdirectory);
            try {
                Files.createDirectories(subdirectoryPath);
            } catch (IOException ex) {
                throw new FileStorageException("Không thể tạo thư mục con " + subdirectory, ex);
            }
            targetLocation = subdirectoryPath.resolve(randomFileName);
            relativePath = subdirectory + "/" + randomFileName;
        } else {
            targetLocation = this.fileStorageLocation.resolve(randomFileName);
            relativePath = randomFileName;
        }
        
        try {
            // Sao chép file vào vị trí đích
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Trả về đường dẫn tương đối (sử dụng cho URL)
            return relativePath;
        } catch (IOException ex) {
            throw new FileStorageException("Không thể lưu file " + originalFileName, ex);
        }
    }
    
    /**
     * Tải file dưới dạng Resource để trả về trong response
     * @param filePath Đường dẫn tương đối đến file
     * @return Resource đại diện cho file
     */
    public Resource loadFileAsResource(String filePath) {
        System.out.println("Đang tải file: " + filePath);
        try {
            // Kiểm tra xem đường dẫn có phải là URL không
            if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
                System.out.println("Đây là URL bên ngoài: " + filePath);
                // Nếu là URL, trả về UrlResource từ URL đó
                return new UrlResource(filePath);
            }
            
            // URL decode đường dẫn
            String decodedPath = java.net.URLDecoder.decode(filePath, "UTF-8").replace("%2F", "/");
            System.out.println("Đường dẫn sau khi decode: " + decodedPath);
            
            // Chuẩn hóa đường dẫn để tránh các lỗi Path Traversal
            String normalizedPath = decodedPath.replace("../", "").replace("./", "");
            System.out.println("Đường dẫn sau khi chuẩn hóa: " + normalizedPath);
            
            Path fullPath = this.fileStorageLocation.resolve(normalizedPath).normalize();
            System.out.println("Đường dẫn đầy đủ: " + fullPath);
            
            // Kiểm tra xem đường dẫn có nằm trong thư mục lưu trữ không
            if (!fullPath.startsWith(this.fileStorageLocation)) {
                System.out.println("Lỗi: Đường dẫn file nằm ngoài thư mục cho phép");
                throw new FileStorageException("Đường dẫn file không hợp lệ: " + filePath);
            }
            
            // Kiểm tra file có tồn tại không
            if (!Files.exists(fullPath)) {
                System.out.println("Lỗi: File không tồn tại tại đường dẫn " + fullPath);
                throw new FileNotFoundException("Không tìm thấy file: " + filePath);
            }
            
            // Kiểm tra đây có phải là file thường không
            if (!Files.isRegularFile(fullPath)) {
                System.out.println("Lỗi: Đường dẫn không phải là file thường: " + fullPath);
                throw new FileStorageException("Đường dẫn không hợp lệ, không phải là file: " + filePath);
            }
            
            System.out.println("Đã tìm thấy file tại: " + fullPath);
            Resource resource = new UrlResource(fullPath.toUri());
            return resource;
        } catch (MalformedURLException ex) {
            System.out.println("Lỗi URL không hợp lệ: " + ex.getMessage());
            throw new FileNotFoundException("Không tìm thấy file: " + filePath, ex);
        } catch (FileNotFoundException e) {
            System.out.println("Lỗi không tìm thấy file: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.out.println("Lỗi khác khi tải file: " + e.getMessage());
            throw new FileStorageException("Không thể tải file: " + filePath, e);
        }
    }
    
    /**
     * Xóa file dựa trên đường dẫn tương đối
     * @param filePath Đường dẫn tương đối đến file
     * @return true nếu xóa thành công, false nếu ngược lại
     */
    public boolean deleteFile(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return false;
        }
        
        try {
            Path targetPath = this.fileStorageLocation.resolve(filePath).normalize();
            
            // Kiểm tra xem file có tồn tại không
            if (!Files.exists(targetPath)) {
                return false;
            }
            
            // Kiểm tra xem đây có phải là file không
            if (!Files.isRegularFile(targetPath)) {
                return false;
            }
            
            // Xóa file
            return Files.deleteIfExists(targetPath);
        } catch (IOException ex) {
            throw new FileStorageException("Không thể xóa file " + filePath, ex);
        }
    }
    
    /**
     * Kiểm tra xem file có tồn tại không
     * @param filePath Đường dẫn tương đối đến file
     * @return true nếu file tồn tại, false nếu ngược lại
     */
    public boolean fileExists(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return false;
        }
        
        try {
            Path targetPath = this.fileStorageLocation.resolve(filePath).normalize();
            return Files.exists(targetPath) && Files.isRegularFile(targetPath);
        } catch (Exception ex) {
            return false;
        }
    }
}