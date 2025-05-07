package com.hungtv.toeic.be.payload.response;

import java.util.Objects;

public class MessageResponse {
    private String message;
    private boolean success;
    
    // Constructors - Không có constructor mặc định vì không cần
    public MessageResponse(String message) {
        this.message = message;
        this.success = true;
    }
    
    public MessageResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }
    
    // Getter/Setter
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    // equals, hashCode và toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MessageResponse that = (MessageResponse) o;
        return success == that.success &&
               Objects.equals(message, that.message);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(message, success);
    }
    
    @Override
    public String toString() {
        return "MessageResponse{" +
               "message='" + message + '\'' +
               ", success=" + success +
               '}';
    }
}