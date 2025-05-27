package com.hungtv.toeic.be.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hungtv.toeic.be.models.User;
import com.hungtv.toeic.be.payload.request.UpdateNotificationSettingRequest;
import com.hungtv.toeic.be.payload.response.MessageResponse;
import com.hungtv.toeic.be.payload.response.NotificationSettingResponse;
import com.hungtv.toeic.be.services.NotificationService;
import com.hungtv.toeic.be.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserService userService;
    
    /**
     * Lấy cài đặt thông báo của người dùng hiện tại
     * @return NotificationSettingResponse
     */
    @GetMapping("/settings")
    public ResponseEntity<?> getNotificationSettings() {
        try {
            User currentUser = getCurrentUser();
            NotificationSettingResponse response = notificationService.getCurrentUserNotificationSetting(currentUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }
    
    /**
     * Cập nhật cài đặt thông báo của người dùng hiện tại
     * @param request Thông tin cập nhật cài đặt thông báo
     * @return NotificationSettingResponse
     */
    @PutMapping("/settings")
    public ResponseEntity<?> updateNotificationSettings(@Valid @RequestBody UpdateNotificationSettingRequest request) {
        try {
            User currentUser = getCurrentUser();
            NotificationSettingResponse response = notificationService.updateNotificationSetting(currentUser, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }
    
    /**
     * Lấy thông tin người dùng hiện tại từ Authentication
     * @return User người dùng hiện tại
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UsernameNotFoundException("Không tìm thấy thông tin người dùng hiện tại");
        }
        
        String username = authentication.getName();
        return userService.getUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));
    }
} 