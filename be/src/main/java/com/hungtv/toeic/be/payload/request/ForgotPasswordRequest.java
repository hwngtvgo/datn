package com.hungtv.toeic.be.payload.request;

import java.util.Objects;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;
    
    // Constructors
    public ForgotPasswordRequest() {
    }
    
    public ForgotPasswordRequest(String email) {
        this.email = email;
    }
    
    // Getter/Setter
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    // equals, hashCode và toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ForgotPasswordRequest that = (ForgotPasswordRequest) o;
        return Objects.equals(email, that.email);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(email);
    }
    
    @Override
    public String toString() {
        return "ForgotPasswordRequest{" +
               "email='" + email + '\'' +
               '}';
    }
}