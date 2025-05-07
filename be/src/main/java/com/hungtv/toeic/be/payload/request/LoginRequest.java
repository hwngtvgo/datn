package com.hungtv.toeic.be.payload.request;

import java.util.Objects;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
    
    // Constructor mặc định
    public LoginRequest() {
    }
    
    // Constructor đầy đủ tham số
    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }
    
    // Getter/Setter
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    // equals, hashCode và toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LoginRequest that = (LoginRequest) o;
        return Objects.equals(username, that.username) &&
               Objects.equals(password, that.password);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(username, password);
    }
    
    @Override
    public String toString() {
        return "LoginRequest{" +
               "username='" + username + '\'' +
               ", password='[PROTECTED]'" +
               '}';
    }
}