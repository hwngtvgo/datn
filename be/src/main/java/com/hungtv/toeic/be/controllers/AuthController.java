package com.hungtv.toeic.be.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hungtv.toeic.be.payload.request.ForgotPasswordRequest;
import com.hungtv.toeic.be.payload.request.LoginRequest;
import com.hungtv.toeic.be.payload.request.PasswordResetRequest;
import com.hungtv.toeic.be.payload.request.RegisterRequest;
import com.hungtv.toeic.be.payload.response.JwtResponse;
import com.hungtv.toeic.be.payload.response.MessageResponse;
import com.hungtv.toeic.be.payload.response.UserStatusResponse;
import com.hungtv.toeic.be.security.services.UserDetailsImpl;
import com.hungtv.toeic.be.services.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Xác thực", description = "API liên quan đến đăng nhập, đăng ký và quản lý tài khoản")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Operation(
            summary = "Đăng nhập",
            description = "API đăng nhập và trả về JWT token"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Đăng nhập thành công"),
            @ApiResponse(responseCode = "401", description = "Đăng nhập thất bại - sai tên đăng nhập hoặc mật khẩu", ref = "unauthorized"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", ref = "badRequest")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Thông tin đăng nhập",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = LoginRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "Tài khoản thông thường",
                                            summary = "Đăng nhập với tài khoản thông thường",
                                            value = "{ \"username\": \"user\", \"password\": \"123456\" }"
                                    ),
                                    @ExampleObject(
                                            name = "Tài khoản admin",
                                            summary = "Đăng nhập với tài khoản admin",
                                            value = "{ \"username\": \"admin\", \"password\": \"admin123\" }"
                                    )
                            }
                    )
            )
            @Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        ResponseCookie jwtCookie = authService.getJwtCookie();
        
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
            .body(jwtResponse);
    }

    @Operation(
            summary = "Đăng ký tài khoản",
            description = "API đăng ký tài khoản mới"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Đăng ký thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc tài khoản đã tồn tại", ref = "badRequest")
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Thông tin đăng ký",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = RegisterRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "Đăng ký tài khoản",
                                            summary = "Đăng ký tài khoản mới",
                                            value = "{ \"username\": \"newuser\", \"email\": \"newuser@example.com\", \"password\": \"123456\" }"
                                    )
                            }
                    )
            )
            @Valid @RequestBody RegisterRequest registerRequest) {
        MessageResponse response = authService.registerUser(registerRequest);
        
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Đăng xuất",
            description = "API đăng xuất và xóa JWT token",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Đăng xuất thành công")
    })
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = authService.logoutUser();
        
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new MessageResponse("Đăng xuất thành công!"));
    }

    @Operation(
            summary = "Lấy thông tin người dùng hiện tại",
            description = "API lấy thông tin người dùng đang đăng nhập",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "401", description = "Không được phép", ref = "unauthorized")
    })
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.ok()
                .header("Cache-Control", "no-cache, no-store, must-revalidate")
                .header("Pragma", "no-cache") 
                .header("Expires", "0")
                .body(new UserStatusResponse(null, false, null));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority())
                .orElse("ROLE_USER");
        
        System.out.println("Trả về thông tin người dùng cho /me: " + userDetails.getUsername() + ", role: " + role);
        
        // Nếu là user admin, trả về ROLE_ADMIN
        if (userDetails.getUsername().equals("admin")) {
            role = "ROLE_ADMIN";
            System.out.println("Đã điều chỉnh quyền admin cho tài khoản: " + userDetails.getUsername());
        }
        
        return ResponseEntity.ok()
            .header("Cache-Control", "no-cache, no-store, must-revalidate")
            .header("Pragma", "no-cache") 
            .header("Expires", "0")
            .body(new UserStatusResponse(
                userDetails.getUsername(),
                true,
                role
            ));
    }

    @Operation(
            summary = "Làm mới token",
            description = "API làm mới JWT token"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Làm mới token thành công"),
            @ApiResponse(responseCode = "401", description = "Không được phép", ref = "unauthorized")
    })
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken() {
        // Xử lý refresh token (sẽ được cài đặt sau)
        return ResponseEntity.ok(new MessageResponse("Refresh token thành công!"));
    }

    @Operation(
            summary = "Yêu cầu đặt lại mật khẩu",
            description = "API gửi email yêu cầu đặt lại mật khẩu"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Gửi yêu cầu thành công"),
            @ApiResponse(responseCode = "400", description = "Email không tồn tại", ref = "badRequest")
    })
    @PostMapping("/password/reset-request")
    public ResponseEntity<?> requestPasswordReset(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Thông tin email",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ForgotPasswordRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "Yêu cầu đặt lại mật khẩu",
                                            summary = "Gửi yêu cầu đặt lại mật khẩu",
                                            value = "{ \"email\": \"user@example.com\" }"
                                    )
                            }
                    )
            )
            @Valid @RequestBody ForgotPasswordRequest request) {
        MessageResponse response = authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Xác thực token đặt lại mật khẩu",
            description = "API kiểm tra token đặt lại mật khẩu có hợp lệ không"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token hợp lệ"),
            @ApiResponse(responseCode = "400", description = "Token không hợp lệ hoặc đã hết hạn", ref = "badRequest")
    })
    @GetMapping("/password/validate-token")
    public ResponseEntity<?> validatePasswordResetToken(@RequestParam String token) {
        boolean isValid = authService.validatePasswordResetToken(token);
        
        if (!isValid) {
            return ResponseEntity.badRequest().body(
                    new MessageResponse("Token không hợp lệ hoặc đã hết hạn.", false));
        }
        
        return ResponseEntity.ok(new MessageResponse("Token hợp lệ."));
    }

    @Operation(
            summary = "Đặt lại mật khẩu",
            description = "API đặt lại mật khẩu với token hợp lệ"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Đặt lại mật khẩu thành công"),
            @ApiResponse(responseCode = "400", description = "Token không hợp lệ hoặc đã hết hạn", ref = "badRequest")
    })
    @PostMapping("/password/reset")
    public ResponseEntity<?> resetPassword(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Thông tin đặt lại mật khẩu",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = PasswordResetRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "Đặt lại mật khẩu",
                                            summary = "Đặt lại mật khẩu với token",
                                            value = "{ \"token\": \"reset-token-example\", \"newPassword\": \"newpassword123\" }"
                                    )
                            }
                    )
            )
            @Valid @RequestBody PasswordResetRequest request) {
        MessageResponse response = authService.resetPassword(request.getToken(), request.getNewPassword());
        
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }
} 