package com.hungtv.toeic.be.controllers;

import com.hungtv.toeic.be.payload.request.CreateUserRequest;
import com.hungtv.toeic.be.payload.request.UpdateUserRequest;
import com.hungtv.toeic.be.payload.response.MessageResponse;
import com.hungtv.toeic.be.payload.response.UserResponse;
import com.hungtv.toeic.be.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
} 