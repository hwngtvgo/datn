package com.hungtv.toeic.be.models;

import java.time.LocalDateTime;
import java.util.Objects;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Entity class lưu trữ cài đặt thông báo của người dùng
 */
@Entity
@Table(name = "notification_settings")
@EntityListeners(AuditingEntityListener.class)
public class NotificationSetting {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "email_notifications", nullable = false)
    private Boolean emailNotifications = true;
    
    @Column(name = "study_reminders", nullable = false)
    private Boolean studyReminders = true;
    
    @Column(name = "study_reminder_time", length = 5)
    private String studyReminderTime = "18:00";
    
    @Column(name = "last_email_sent")
    private LocalDateTime lastEmailSent;
    
    @Column(name = "last_reminder_sent")
    private LocalDateTime lastReminderSent;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public NotificationSetting() {
    }
    
    public NotificationSetting(User user) {
        this.user = user;
    }
    
    public NotificationSetting(User user, Boolean emailNotifications, Boolean studyReminders, String studyReminderTime) {
        this.user = user;
        this.emailNotifications = emailNotifications;
        this.studyReminders = studyReminders;
        this.studyReminderTime = studyReminderTime;
    }

    // Getter và Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
    
    public LocalDateTime getLastEmailSent() {
        return lastEmailSent;
    }

    public void setLastEmailSent(LocalDateTime lastEmailSent) {
        this.lastEmailSent = lastEmailSent;
    }

    public LocalDateTime getLastReminderSent() {
        return lastReminderSent;
    }

    public void setLastReminderSent(LocalDateTime lastReminderSent) {
        this.lastReminderSent = lastReminderSent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // equals, hashCode và toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NotificationSetting that = (NotificationSetting) o;
        return Objects.equals(id, that.id) &&
               Objects.equals(user.getId(), that.user.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, user.getId());
    }

    @Override
    public String toString() {
        return "NotificationSetting{" +
               "id=" + id +
               ", userId=" + (user != null ? user.getId() : null) +
               ", emailNotifications=" + emailNotifications +
               ", studyReminders=" + studyReminders +
               ", studyReminderTime='" + studyReminderTime + '\'' +
               ", lastEmailSent=" + lastEmailSent +
               ", lastReminderSent=" + lastReminderSent +
               ", createdAt=" + createdAt +
               ", updatedAt=" + updatedAt +
               '}';
    }
} 