package com.hungtv.toeic.be.payload.request;

import java.util.Objects;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PasswordResetRequest {
    @NotBlank(message = "Token không được để trống")
    private String token;
    
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, max = 40, message = "Mật khẩu phải có độ dài từ 6-40 ký tự")
    private String newPassword;
    
    // Constructors
    public PasswordResetRequest() {
    }
    
    public PasswordResetRequest(String token, String newPassword) {
        this.token = token;
        this.newPassword = newPassword;
    }
    
    // Getter/Setter
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    
    // equals, hashCode và toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PasswordResetRequest that = (PasswordResetRequest) o;
        return Objects.equals(token, that.token) &&
               Objects.equals(newPassword, that.newPassword);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(token, newPassword);
    }
    
    @Override
    public String toString() {
        return "PasswordResetRequest{" +
               "token='" + token + '\'' +
               ", newPassword='[PROTECTED]'" +
               '}';
    }
}