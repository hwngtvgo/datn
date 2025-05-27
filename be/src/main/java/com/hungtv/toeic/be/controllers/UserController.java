package com.hungtv.toeic.be.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hungtv.toeic.be.models.User;
import com.hungtv.toeic.be.payload.request.CreateUserRequest;
import com.hungtv.toeic.be.payload.request.UpdatePasswordRequest;
import com.hungtv.toeic.be.payload.request.UpdateProfileRequest;
import com.hungtv.toeic.be.payload.request.UpdateUserRequest;
import com.hungtv.toeic.be.payload.response.MessageResponse;
import com.hungtv.toeic.be.payload.response.UserResponse;
import com.hungtv.toeic.be.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Lấy danh sách tất cả người dùng
     * @return Danh sách người dùng
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Lấy thông tin người dùng theo ID
     * @param id ID của người dùng
     * @return Thông tin người dùng
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy người dùng với ID: " + id));
        }
    }

    /**
     * Tạo người dùng mới
     * @param request Thông tin người dùng cần tạo
     * @return Thông tin người dùng đã tạo
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            UserResponse createdUser = userService.createUser(request);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(createdUser);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Cập nhật thông tin người dùng
     * @param id ID của người dùng cần cập nhật
     * @param request Thông tin cập nhật
     * @return Thông tin người dùng đã cập nhật
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, 
                                        @Valid @RequestBody UpdateUserRequest request) {
        try {
            UserResponse updatedUser = userService.updateUser(id, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Xóa người dùng
     * @param id ID của người dùng cần xóa
     * @return Thông báo kết quả
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new MessageResponse("Đã xóa người dùng thành công"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * Lấy thông tin người dùng hiện tại
     * @return Thông tin người dùng hiện tại
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile() {
        try {
            User currentUser = getCurrentUser();
            UserResponse userResponse = userService.getUserById(currentUser.getId());
            return ResponseEntity.ok(userResponse);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * Cập nhật thông tin cá nhân của người dùng hiện tại
     * @param request Thông tin cập nhật
     * @return Thông tin người dùng đã cập nhật
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateCurrentUserProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            User currentUser = getCurrentUser();
            
            UpdateUserRequest updateRequest = new UpdateUserRequest();
            updateRequest.setUsername(currentUser.getUsername()); // Giữ nguyên username
            updateRequest.setEmail(request.getEmail());
            updateRequest.setFullName(request.getFullName());
            // Giữ nguyên role
            String role = "USER";
            if (currentUser.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"))) {
                role = "ADMIN";
            }
            updateRequest.setRole(role);
            
            UserResponse updatedUser = userService.updateCurrentUserProfile(currentUser, updateRequest);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * Cập nhật mật khẩu của người dùng hiện tại
     * @param request Thông tin mật khẩu mới
     * @return Thông báo kết quả
     */
    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody UpdatePasswordRequest request) {
        try {
            User currentUser = getCurrentUser();
            userService.updatePassword(currentUser, request);
            return ResponseEntity.ok(new MessageResponse("Cập nhật mật khẩu thành công"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
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