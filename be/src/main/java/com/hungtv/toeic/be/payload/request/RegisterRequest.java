package com.hungtv.toeic.be.payload.request;

import java.util.Objects;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 20, message = "Tên đăng nhập phải có độ dài từ 3-20 ký tự")
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Size(max = 50, message = "Email không được quá 50 ký tự")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ và tên không được quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 40, message = "Mật khẩu phải có độ dài từ 6-40 ký tự")
    private String password;
    
    // Constructors
    public RegisterRequest() {
    }
    
    public RegisterRequest(String username, String email, String fullName, String password) {
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.password = password;
    }
    
    // Getter/Setter
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
        RegisterRequest that = (RegisterRequest) o;
        return Objects.equals(username, that.username) &&
               Objects.equals(email, that.email) &&
               Objects.equals(fullName, that.fullName) &&
               Objects.equals(password, that.password);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(username, email, fullName, password);
    }
    
    @Override
    public String toString() {
        return "RegisterRequest{" +
               "username='" + username + '\'' +
               ", email='" + email + '\'' +
               ", fullName='" + fullName + '\'' +
               ", password='[PROTECTED]'" +
               '}';
    }
}