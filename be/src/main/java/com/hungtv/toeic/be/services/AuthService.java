package com.hungtv.toeic.be.services;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hungtv.toeic.be.models.ERole;
import com.hungtv.toeic.be.models.PasswordResetToken;
import com.hungtv.toeic.be.models.Role;
import com.hungtv.toeic.be.models.User;
import com.hungtv.toeic.be.payload.request.LoginRequest;
import com.hungtv.toeic.be.payload.request.RegisterRequest;
import com.hungtv.toeic.be.payload.response.JwtResponse;
import com.hungtv.toeic.be.payload.response.MessageResponse;
import com.hungtv.toeic.be.repositories.PasswordResetTokenRepository;
import com.hungtv.toeic.be.repositories.RoleRepository;
import com.hungtv.toeic.be.repositories.UserRepository;
import com.hungtv.toeic.be.security.jwt.JwtUtils;
import com.hungtv.toeic.be.security.services.UserDetailsImpl;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private EmailService emailService;
    
    @Value("${app.password-reset.expiration-minutes}")
    private int passwordResetExpirationMinutes;
    
    // Thêm biến lưu trữ cookie JWT gần nhất
    private ResponseCookie latestJwtCookie;
    
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Tạo và lưu cookie
        this.latestJwtCookie = jwtUtils.generateJwtCookie(userDetails);
        
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        
        return new JwtResponse( 
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getFullName(),
                roles,
                this.latestJwtCookie.getValue(),
                "Bearer"
        );
    }
    
    // Phương thức lấy cookie JWT gần nhất
    public ResponseCookie getJwtCookie() {
        return this.latestJwtCookie;
    }
    
    @Transactional
    public MessageResponse registerUser(RegisterRequest registerRequest) {
        // Kiểm tra username đã tồn tại
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return new MessageResponse("Lỗi: Tên đăng nhập đã được sử dụng!", false);
        }
        
        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return new MessageResponse("Lỗi: Email đã được sử dụng!", false);
        }
        
        // Tạo tài khoản mới
        User user = new User(
                registerRequest.getUsername(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getEmail(),
                registerRequest.getFullName()
        );
        
        // Mặc định là ROLE_USER
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Lỗi: Role không tìm thấy."));
        roles.add(userRole);
        
        user.setRoles(roles);
        userRepository.save(user);
        
        return new MessageResponse("Đăng ký tài khoản thành công!");
    }
    
    public ResponseCookie logoutUser() {
        return jwtUtils.getCleanJwtCookie();
    }
    
    public MessageResponse requestPasswordReset(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (!userOptional.isPresent()) {
            // Không thông báo cho front-end biết email không tồn tại (bảo mật)
            return new MessageResponse("Email đặt lại mật khẩu đã được gửi nếu email này đã đăng ký trong hệ thống.");
        }
        
        User user = userOptional.get();
        
        // Tạo token
        String token = UUID.randomUUID().toString();
        
        // Lưu token vào database
        createPasswordResetTokenForUser(user, token);
        
        // Gửi email cho người dùng
        emailService.sendPasswordResetEmail(user.getEmail(), token);
        
        return new MessageResponse("Email đặt lại mật khẩu đã được gửi.");
    }
    
    public boolean validatePasswordResetToken(String token) {
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepository.findByToken(token);
        
        if (!tokenOptional.isPresent()) {
            return false;
        }
        
        PasswordResetToken resetToken = tokenOptional.get();
        
        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            return false;
        }
        
        return true;
    }
    
    @Transactional
    public MessageResponse resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepository.findByToken(token);
        
        if (!tokenOptional.isPresent()) {
            return new MessageResponse("Token không hợp lệ hoặc đã hết hạn.", false);
        }
        
        PasswordResetToken resetToken = tokenOptional.get();
        
        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            return new MessageResponse("Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.", false);
        }
        
        // Lấy thông tin user
        User user = resetToken.getUser();
        
        // Cập nhật mật khẩu
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Xóa token đã sử dụng
        passwordResetTokenRepository.delete(resetToken);
        
        return new MessageResponse("Đặt lại mật khẩu thành công.");
    }
    
    private void createPasswordResetTokenForUser(User user, String token) {
        // Xóa token cũ nếu có
        passwordResetTokenRepository.findByUser(user).ifPresent(oldToken -> {
            passwordResetTokenRepository.delete(oldToken);
        });
        
        // Tạo token mới
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setUser(user);
        passwordResetToken.setToken(token);
        passwordResetToken.setExpiryDate(LocalDateTime.now().plusMinutes(passwordResetExpirationMinutes));
        
        passwordResetTokenRepository.save(passwordResetToken);
    }
    
    // Lấy thông tin người dùng đang đăng nhập
    public UserDetailsImpl getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getPrincipal())) {
            return (UserDetailsImpl) authentication.getPrincipal();
        }
        
        return null;
    }
} 