package com.hungtv.toeic.be.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/examples")
@Tag(name = "Example API", description = "API ví dụ cho việc sử dụng Swagger")
public class SwaggerExampleController {

    @Operation(summary = "API công khai", description = "API này không yêu cầu xác thực")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ", ref = "badRequest"),
            @ApiResponse(responseCode = "500", description = "Lỗi máy chủ", ref = "internalError")
    })
    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> publicEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đây là một endpoint công khai");
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "API yêu cầu xác thực", 
            description = "API này yêu cầu xác thực JWT",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "401", description = "Không được phép", ref = "unauthorized"),
            @ApiResponse(responseCode = "500", description = "Lỗi máy chủ", ref = "internalError")
    })
    @GetMapping("/secured")
    public ResponseEntity<Map<String, String>> securedEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đây là một endpoint được bảo vệ");
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Gửi dữ liệu", 
            description = "API này nhận dữ liệu và yêu cầu xác thực JWT",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ", ref = "badRequest"),
            @ApiResponse(responseCode = "401", description = "Không được phép", ref = "unauthorized"),
            @ApiResponse(responseCode = "500", description = "Lỗi máy chủ", ref = "internalError")
    })
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitData(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Dữ liệu gửi lên",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ExampleRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "Ví dụ cơ bản",
                                            summary = "Yêu cầu cơ bản",
                                            value = "{ \"name\": \"Nguyễn Văn A\", \"email\": \"example@example.com\", \"message\": \"Xin chào\" }"
                                    )
                            }
                    )
            )
            @RequestBody ExampleRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Dữ liệu đã được nhận");
        response.put("data", request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Lấy thông tin theo ID", 
            description = "API này lấy thông tin dựa trên ID và yêu cầu xác thực JWT",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ", ref = "badRequest"),
            @ApiResponse(responseCode = "401", description = "Không được phép", ref = "unauthorized"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy"),
            @ApiResponse(responseCode = "500", description = "Lỗi máy chủ", ref = "internalError")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(
            @Parameter(description = "ID của dữ liệu cần lấy", required = true)
            @PathVariable("id") Long id) {
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", id);
        response.put("name", "Dữ liệu mẫu " + id);
        response.put("description", "Đây là dữ liệu mẫu cho ID: " + id);
        return ResponseEntity.ok(response);
    }

    public static class ExampleRequest {
        private String name;
        private String email;
        private String message;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
} 