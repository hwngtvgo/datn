package com.hungtv.toeic.be.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateUserRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 20, message = "Tên đăng nhập phải từ 3-20 ký tự")
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Size(max = 50, message = "Email không được vượt quá 50 ký tự")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 50, message = "Họ tên không được vượt quá 50 ký tự")
    private String fullName;

    private String role;

    public UpdateUserRequest() {
    }

    public UpdateUserRequest(String username, String email, String fullName, String role) {
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
} 