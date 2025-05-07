package com.hungtv.toeic.be.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "toeic_options")
public class ToeicOption {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(name = "option_key")
    private String optionKey;
    
    @NotBlank
    @Column(name = "option_text", columnDefinition = "TEXT")
    private String optionText;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    @JsonIgnore
    private ToeicQuestion question;
    
    // Constructors
    public ToeicOption() {
    }
    
    public ToeicOption(String optionKey, String optionText) {
        this.optionKey = optionKey;
        this.optionText = optionText;
    }
    
    // Getters and Setters
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
    
    public ToeicQuestion getQuestion() {
        return question;
    }
    
    public void setQuestion(ToeicQuestion question) {
        this.question = question;
    }
} 