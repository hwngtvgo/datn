package com.hungtv.toeic.be.payload.request;

import jakarta.validation.constraints.Pattern;

/**
 * Request DTO cho việc cập nhật cài đặt thông báo
 */
public class UpdateNotificationSettingRequest {
    
    private Boolean emailNotifications;
    
    private Boolean studyReminders;
    
    @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Thời gian phải có định dạng HH:MM")
    private String studyReminderTime;
    
    public UpdateNotificationSettingRequest() {
    }
    
    public UpdateNotificationSettingRequest(Boolean emailNotifications, Boolean studyReminders, String studyReminderTime) {
        this.emailNotifications = emailNotifications;
        this.studyReminders = studyReminders;
        this.studyReminderTime = studyReminderTime;
    }
    
    public Boolean getEmailNotifications() {
        return emailNotifications;
    }
    
    public void setEmailNotifications(Boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }
    
    public Boolean getStudyReminders() {
        return studyReminders;
    }
    
    public void setStudyReminders(Boolean studyReminders) {
        this.studyReminders = studyReminders;
    }
    
    public String getStudyReminderTime() {
        return studyReminderTime;
    }
    
    public void setStudyReminderTime(String studyReminderTime) {
        this.studyReminderTime = studyReminderTime;
    }
} 