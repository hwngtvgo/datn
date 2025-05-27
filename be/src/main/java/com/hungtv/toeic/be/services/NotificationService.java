package com.hungtv.toeic.be.services;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hungtv.toeic.be.models.NotificationSetting;
import com.hungtv.toeic.be.models.User;
import com.hungtv.toeic.be.payload.request.UpdateNotificationSettingRequest;
import com.hungtv.toeic.be.payload.response.NotificationSettingResponse;
import com.hungtv.toeic.be.repositories.NotificationSettingRepository;
import com.hungtv.toeic.be.repositories.TestResultRepository;
import com.hungtv.toeic.be.repositories.UserRepository;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationSettingRepository notificationSettingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TestResultRepository testResultRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Lấy cài đặt thông báo của người dùng hiện tại
     * @param currentUser Người dùng hiện tại
     * @return NotificationSettingResponse
     */
    public NotificationSettingResponse getCurrentUserNotificationSetting(User currentUser) {
        NotificationSetting setting = getOrCreateNotificationSetting(currentUser);
        return convertToResponse(setting);
    }

    /**
     * Cập nhật cài đặt thông báo của người dùng hiện tại
     * @param currentUser Người dùng hiện tại
     * @param request Thông tin cập nhật
     * @return NotificationSettingResponse
     */
    @Transactional
    public NotificationSettingResponse updateNotificationSetting(User currentUser, UpdateNotificationSettingRequest request) {
        NotificationSetting setting = getOrCreateNotificationSetting(currentUser);
        
        if (request.getEmailNotifications() != null) {
            setting.setEmailNotifications(request.getEmailNotifications());
        }
        
        if (request.getStudyReminders() != null) {
            setting.setStudyReminders(request.getStudyReminders());
        }
        
        if (request.getStudyReminderTime() != null) {
            setting.setStudyReminderTime(request.getStudyReminderTime());
        }
        
        NotificationSetting savedSetting = notificationSettingRepository.save(setting);
        return convertToResponse(savedSetting);
    }

    /**
     * Lấy hoặc tạo mới cài đặt thông báo cho người dùng
     * @param user Người dùng
     * @return NotificationSetting
     */
    private NotificationSetting getOrCreateNotificationSetting(User user) {
        return notificationSettingRepository.findByUser(user).orElseGet(() -> {
            NotificationSetting newSetting = new NotificationSetting(user);
            return notificationSettingRepository.save(newSetting);
        });
    }

    /**
     * Chuyển đổi từ NotificationSetting sang NotificationSettingResponse
     * @param setting NotificationSetting
     * @return NotificationSettingResponse
     */
    private NotificationSettingResponse convertToResponse(NotificationSetting setting) {
        return new NotificationSettingResponse(
            setting.getId(),
            setting.getUser().getId(),
            setting.getEmailNotifications(),
            setting.getStudyReminders(),
            setting.getStudyReminderTime()
        );
    }
    
    /**
     * Gửi email thông báo hoạt động tài khoản hàng tuần, chạy vào 7 giờ sáng mỗi thứ 2
     */
    @Scheduled(cron = "0 0 7 * * MON")
    @Transactional
    public void sendWeeklyActivityEmails() {
        logger.info("Bắt đầu gửi email thông báo hoạt động tài khoản hàng tuần");
        
        // Lấy thời điểm đầu tuần trước để kiểm tra các email đã gửi
        LocalDateTime weekStart = LocalDate.now().with(TemporalAdjusters.previous(DayOfWeek.MONDAY)).atStartOfDay();
        
        // Lấy danh sách người dùng cần gửi email
        List<NotificationSetting> settingsToNotify = notificationSettingRepository.findAllForWeeklyEmailNotification(weekStart);
        
        for (NotificationSetting setting : settingsToNotify) {
            try {
                User user = setting.getUser();
                
                // Lấy thông tin hoạt động trong tuần qua
                int testsCompletedLastWeek = testResultRepository.countByUserAndCreatedAtAfter(user, weekStart);
                
                // Gửi email tổng kết hoạt động
                sendWeeklyActivityEmail(user, testsCompletedLastWeek);
                
                // Cập nhật thời gian gửi email gần nhất
                setting.setLastEmailSent(LocalDateTime.now());
                notificationSettingRepository.save(setting);
                
                logger.info("Đã gửi email thông báo hoạt động hàng tuần cho người dùng: {}", user.getUsername());
            } catch (Exception e) {
                logger.error("Lỗi khi gửi email thông báo hoạt động cho userId: " + setting.getUser().getId(), e);
            }
        }
        
        logger.info("Hoàn thành gửi email thông báo hoạt động hàng tuần");
    }
    
    /**
     * Gửi nhắc nhở học tập hàng ngày, chạy mỗi giờ
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void sendStudyReminders() {
        // Lấy giờ hiện tại theo định dạng HH:00
        String currentHour = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:00"));
        logger.info("Bắt đầu gửi nhắc nhở học tập cho giờ: {}", currentHour);
        
        // Lấy danh sách người dùng cần gửi nhắc nhở cho giờ hiện tại
        List<NotificationSetting> settingsToNotify = notificationSettingRepository.findAllForStudyReminder(currentHour);
        
        for (NotificationSetting setting : settingsToNotify) {
            try {
                User user = setting.getUser();
                
                // Gửi email nhắc nhở học tập
                sendStudyReminderEmail(user);
                
                // Cập nhật thời gian gửi nhắc nhở gần nhất
                setting.setLastReminderSent(LocalDateTime.now());
                notificationSettingRepository.save(setting);
                
                logger.info("Đã gửi nhắc nhở học tập cho người dùng: {}", user.getUsername());
            } catch (Exception e) {
                logger.error("Lỗi khi gửi nhắc nhở học tập cho userId: " + setting.getUser().getId(), e);
            }
        }
        
        logger.info("Hoàn thành gửi nhắc nhở học tập cho giờ: {}", currentHour);
    }
    
    /**
     * Gửi email thông báo hoạt động hàng tuần cho người dùng
     * @param user Người dùng
     * @param testsCompletedLastWeek Số bài thi đã hoàn thành trong tuần qua
     */
    private void sendWeeklyActivityEmail(User user, int testsCompletedLastWeek) {
        String subject = "Báo cáo hoạt động hàng tuần - TOEIC Learning";
        
        String content = "<p>Chào " + user.getFullName() + ",</p>"
                + "<p>Dưới đây là thông tin hoạt động của bạn trên TOEIC Learning trong tuần qua:</p>"
                + "<ul>"
                + "<li>Số bài thi đã hoàn thành: " + testsCompletedLastWeek + "</li>"
                + "</ul>"
                + "<p>Hãy tiếp tục rèn luyện để đạt kết quả tốt nhất!</p>"
                + "<p>Trân trọng,<br>Đội ngũ TOEIC Learning</p>";
        
        emailService.sendHtmlEmail(user.getEmail(), subject, content);
    }
    
    /**
     * Gửi email nhắc nhở học tập cho người dùng
     * @param user Người dùng
     */
    private void sendStudyReminderEmail(User user) {
        String subject = "Nhắc nhở học tập - TOEIC Learning";
        
        String content = "<p>Chào " + user.getFullName() + ",</p>"
                + "<p>Đây là lời nhắc nhở bạn nên dành thời gian để học tập và luyện tập TOEIC ngay bây giờ.</p>"
                + "<p>Việc học đều đặn mỗi ngày sẽ giúp bạn cải thiện kỹ năng nhanh chóng.</p>"
                + "<p><a href=\"http://localhost:5173/practice-tests\">Bắt đầu làm bài ngay</a></p>"
                + "<p>Trân trọng,<br>Đội ngũ TOEIC Learning</p>";
        
        emailService.sendHtmlEmail(user.getEmail(), subject, content);
    }
}