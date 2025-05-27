package com.hungtv.toeic.be.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO cho việc cập nhật thông tin cá nhân của người dùng
 */
public class UpdateProfileRequest {
    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 50, message = "Họ tên không được vượt quá 50 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Size(max = 50, message = "Email không được vượt quá 50 ký tự")
    @Email(message = "Email không hợp lệ")
    private String email;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String fullName, String email) {
        this.fullName = fullName;
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
} 