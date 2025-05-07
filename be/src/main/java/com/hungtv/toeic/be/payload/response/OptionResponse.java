package com.hungtv.toeic.be.payload.response;

import com.hungtv.toeic.be.models.ToeicOption;

public class OptionResponse {
    private Long id;
    private String optionKey;
    private String optionText;
    
    public OptionResponse() {
    }
    
    public OptionResponse(ToeicOption option) {
        this.id = option.getId();
        this.optionKey = option.getOptionKey();
        this.optionText = option.getOptionText();
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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