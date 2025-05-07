package com.hungtv.toeic.be.payload.request;

import jakarta.validation.constraints.NotBlank;

public class CreateOptionRequest {

    @NotBlank(message = "Khóa tùy chọn không được để trống")
    private String optionKey;
    
    @NotBlank(message = "Nội dung tùy chọn không được để trống")
    private String optionText;
    
    // Getters và Setters
    public String getOptionKey() {
        return optionKey;
    }

    public void setOptionKey(String optionKey) {
        this.optionKey = optionKey;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }
} 