package com.hungtv.toeic.be.payload.response;

/**
 * Response DTO cho việc trả về thông tin cài đặt thông báo
 */
public class NotificationSettingResponse {
    
    private Long id;
    private Long userId;
    private Boolean emailNotifications;
    private Boolean studyReminders;
    private String studyReminderTime;
    
    public NotificationSettingResponse() {
    }
    
    public NotificationSettingResponse(Long id, Long userId, Boolean emailNotifications, Boolean studyReminders, 
                                  String studyReminderTime) {
        this.id = id;
        this.userId = userId;
        this.emailNotifications = emailNotifications;
        this.studyReminders = studyReminders;
        this.studyReminderTime = studyReminderTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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