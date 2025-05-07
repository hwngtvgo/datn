package com.hungtv.toeic.be.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async
    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Yêu cầu đặt lại mật khẩu");

            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            String htmlMsg = "<p>Xin chào,</p>"
                    + "<p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>"
                    + "<p><a href=\"" + resetUrl + "\">Đặt lại mật khẩu</a></p>"
                    + "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.</p>"
                    + "<p>Liên kết sẽ hết hạn sau 30 phút.</p>"
                    + "<p>Trân trọng,<br>Đội ngũ TOEIC Learning</p>";

            helper.setText(htmlMsg, true);
            mailSender.send(message);
            
            logger.info("Email đặt lại mật khẩu đã được gửi đến: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Không thể gửi email đặt lại mật khẩu", e);
        }
    }
} 