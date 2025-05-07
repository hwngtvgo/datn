package com.hungtv.toeic.be.controllers;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.hungtv.toeic.be.exception.FileNotFoundException;
import com.hungtv.toeic.be.payload.response.ApiResponse;
import com.hungtv.toeic.be.payload.response.FileUploadResponse;
import com.hungtv.toeic.be.services.FileStorageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/files")
@Tag(name = "File API", description = "API để quản lý file uploads và downloads")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;
    
    @Value("${file.allowed-extensions:jpg,jpeg,png,gif,pdf,mp3,mp4,wav}")
    private String allowedExtensions;
    
    @Value("${file.max-file-size:10485760}")  // 10MB default
    private long maxFileSize;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')") 
    @Operation(summary = "Upload một file", description = "Upload file vào server", security = {@SecurityRequirement(name = "bearerAuth")})
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Upload file thành công",
                content = @Content(schema = @Schema(implementation = FileUploadResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa xác thực")
    })
    public ResponseEntity<?> uploadFile(
            @Parameter(description = "File cần upload") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Thư mục con (không bắt buộc)") @RequestParam(value = "folder", required = false) String folder) {
        
        // Kiểm tra file trống
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Vui lòng chọn file để upload"));
        }
        
        // Kiểm tra kích thước file
        if (file.getSize() > maxFileSize) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Kích thước file vượt quá giới hạn cho phép (" + (maxFileSize / 1024 / 1024) + "MB)"));
        }
        
        // Kiểm tra loại file
        String fileName = file.getOriginalFilename();
        String fileExtension = "";
        if (fileName != null && fileName.contains(".")) {
            fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        }
        
        List<String> allowedExtensionsList = Arrays.asList(allowedExtensions.split(","));
        if (!allowedExtensionsList.contains(fileExtension)) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Định dạng file không được hỗ trợ. Các định dạng được hỗ trợ: " + allowedExtensions));
        }
        
        try {
            // Lưu file vào thư mục được chỉ định
            String storedFilePath = fileStorageService.storeFile(file, folder);
            
            // Tạo public URL để download file
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/files/")
                    .path(storedFilePath.startsWith("/") ? storedFilePath.substring(1) : storedFilePath)
                    .toUriString();
            
            // Tạo URL để xem file
            String fileViewUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/files/view/")
                    .path(storedFilePath.startsWith("/") ? storedFilePath.substring(1) : storedFilePath)
                    .toUriString();
            
            return ResponseEntity.ok(new FileUploadResponse(
                    fileName,
                    fileDownloadUri,
                    fileViewUri, 
                    file.getContentType(),
                    file.getSize(),
                    storedFilePath
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Không thể upload file: " + e.getMessage()));
        }
    }
    
    @PostMapping("/upload/multiple")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Upload nhiều file", description = "Upload nhiều file vào server", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<?> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "folder", required = false) String folder) {
        
        if (files.length == 0) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Vui lòng chọn ít nhất một file để upload"));
        }
        
        try {
            List<FileUploadResponse> responses = Arrays.stream(files)
                    .map(file -> {
                        try {
                            // Kiểm tra file
                            if (file.isEmpty() || file.getSize() > maxFileSize) {
                                return new FileUploadResponse(
                                        file.getOriginalFilename(),
                                        null,
                                        null,
                                        file.getContentType(),
                                        file.getSize(),
                                        null,
                                        false,
                                        "File trống hoặc vượt quá kích thước cho phép"
                                );
                            }
                            
                            // Kiểm tra định dạng file
                            String fileName = file.getOriginalFilename();
                            String fileExtension = "";
                            if (fileName != null && fileName.contains(".")) {
                                fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
                            }
                            
                            List<String> allowedExtensionsList = Arrays.asList(allowedExtensions.split(","));
                            if (!allowedExtensionsList.contains(fileExtension)) {
                                return new FileUploadResponse(
                                        file.getOriginalFilename(),
                                        null,
                                        null,
                                        file.getContentType(),
                                        file.getSize(),
                                        null,
                                        false,
                                        "Định dạng file không được hỗ trợ"
                                );
                            }
                            
                            // Lưu file
                            String storedFilePath = fileStorageService.storeFile(file, folder);
                            
                            // Tạo URL
                            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                                    .path("/api/files/")
                                    .path(storedFilePath.startsWith("/") ? storedFilePath.substring(1) : storedFilePath)
                                    .toUriString();
                            
                            String fileViewUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                                    .path("/api/files/view/")
                                    .path(storedFilePath.startsWith("/") ? storedFilePath.substring(1) : storedFilePath)
                                    .toUriString();
                            
                            return new FileUploadResponse(
                                    fileName,
                                    fileDownloadUri,
                                    fileViewUri,
                                    file.getContentType(),
                                    file.getSize(),
                                    storedFilePath,
                                    true,
                                    "Upload thành công"
                            );
                        } catch (Exception e) {
                            return new FileUploadResponse(
                                    file.getOriginalFilename(),
                                    null,
                                    null,
                                    file.getContentType(),
                                    file.getSize(),
                                    null,
                                    false,
                                    e.getMessage()
                            );
                        }
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Không thể upload files: " + e.getMessage()));
        }
    }

    @GetMapping("/**")
    @Operation(summary = "Download file", description = "Tải file từ server")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Resource> downloadFile(HttpServletRequest request) {
        try {
            // Lấy đường dẫn đầy đủ từ URL
            String requestPath = request.getRequestURI();
            
            // Trích xuất đường dẫn file từ URL (bỏ /api/files/)
            String filePath = requestPath.substring("/api/files/".length());
            
            System.out.println("Đang tải xuống file: " + filePath);
            
            // Tải file như một Resource
            Resource resource = fileStorageService.loadFileAsResource(filePath);

            // Xác định kiểu nội dung (MIME type)
            String contentType = null;
            try {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            } catch (IOException ex) {
                // Mặc định là octet-stream nếu không xác định được loại
            }

            // Mặc định là octet-stream
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Trả về file tải xuống
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (com.hungtv.toeic.be.exception.FileNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header("X-Error", "File not found: " + request.getRequestURI())
                    .build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("X-Error", "Error accessing file: " + e.getMessage())
                    .build();
        }
    }
    
    @GetMapping("/view/**")
    @Operation(summary = "Xem file", description = "Xem file trực tiếp trên trình duyệt")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Resource> viewFile(
            HttpServletRequest request) {
        try {
            // Lấy đường dẫn đầy đủ từ URL
            String requestPath = request.getRequestURI();
            
            // Trích xuất đường dẫn file từ URL
            String filePathWithPrefix = requestPath.substring(requestPath.indexOf("/view/") + 6);
            
            System.out.println("Đang truy cập file: " + filePathWithPrefix);
            
            // Tải file như một Resource
            Resource resource = fileStorageService.loadFileAsResource(filePathWithPrefix);

            // Xác định kiểu nội dung (MIME type)
            String contentType = null;
            try {
                // Thử xác định loại từ phần mở rộng trước
                if (resource.getFilename() != null) {
                    String extension = resource.getFilename().substring(resource.getFilename().lastIndexOf(".") + 1).toLowerCase();
                    switch (extension) {
                        case "jpg":
                        case "jpeg":
                            contentType = "image/jpeg";
                            break;
                        case "png":
                            contentType = "image/png";
                            break;
                        case "gif":
                            contentType = "image/gif";
                            break;
                        case "mp3":
                            contentType = "audio/mpeg";
                            break;
                        case "mp4":
                            contentType = "video/mp4";
                            break;
                        case "pdf":
                            contentType = "application/pdf";
                            break;
                        case "wav":
                            contentType = "audio/wav";
                            break;
                        default:
                            contentType = request.getServletContext().getMimeType(filePathWithPrefix);
                            break;
                    }
                } else {
                    contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
                }
            } catch (IOException ex) {
                // Mặc định là octet-stream nếu không xác định được loại
            }

            // Mặc định là octet-stream
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Trả về file để xem trực tiếp (không tải xuống)
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (com.hungtv.toeic.be.exception.FileNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header("X-Error", "File not found: " + request.getRequestURI())
                    .build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("X-Error", "Error accessing file: " + e.getMessage())
                    .build();
        }
    }
    
    @DeleteMapping("/{fileName:.+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa file", description = "Xóa file khỏi server", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @Parameter(description = "Tên file để xóa") @PathVariable String fileName) {
        try {
            boolean deleted = fileStorageService.deleteFile(fileName);
            if (deleted) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Xóa file thành công"));
            } else {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Không thể xóa file"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Không thể xóa file: " + e.getMessage()));
        }
    }
}