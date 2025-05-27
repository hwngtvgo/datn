package com.hungtv.toeic.be.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.hungtv.toeic.be.models.NotificationSetting;
import com.hungtv.toeic.be.models.User;

@Repository
public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {

    /**
     * Tìm cài đặt thông báo theo người dùng
     * @param user Đối tượng User
     * @return Optional<NotificationSetting>
     */
    Optional<NotificationSetting> findByUser(User user);
    
    /**
     * Tìm cài đặt thông báo theo ID của người dùng
     * @param userId ID của người dùng
     * @return Optional<NotificationSetting>
     */
    Optional<NotificationSetting> findByUserId(Long userId);
    
    /**
     * Tìm tất cả người dùng đã kích hoạt thông báo email mà chưa nhận được email trong tuần này
     * (cần gửi email vào 7h sáng thứ 2)
     * @return List<NotificationSetting>
     */
    @Query("SELECT ns FROM NotificationSetting ns WHERE ns.emailNotifications = true " +
           "AND (ns.lastEmailSent IS NULL OR ns.lastEmailSent < :weekStart)")
    List<NotificationSetting> findAllForWeeklyEmailNotification(LocalDateTime weekStart);
    
    /**
     * Tìm tất cả người dùng đã kích hoạt nhắc nhở học tập theo giờ cụ thể
     * @param reminderTime Giờ nhắc nhở định dạng 'HH:MM'
     * @return List<NotificationSetting>
     */
    @Query("SELECT ns FROM NotificationSetting ns WHERE ns.studyReminders = true " + 
           "AND ns.studyReminderTime = :reminderTime " +
           "AND (ns.lastReminderSent IS NULL OR DATE(ns.lastReminderSent) < CURRENT_DATE)")  
    List<NotificationSetting> findAllForStudyReminder(String reminderTime);
} 