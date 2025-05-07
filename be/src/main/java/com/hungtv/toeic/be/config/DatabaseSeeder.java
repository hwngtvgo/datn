package com.hungtv.toeic.be.config;

import com.hungtv.toeic.be.models.ERole;
import com.hungtv.toeic.be.models.Role;
import com.hungtv.toeic.be.models.User;
import com.hungtv.toeic.be.repositories.RoleRepository;
import com.hungtv.toeic.be.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DatabaseSeeder implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Bắt đầu khởi tạo dữ liệu ban đầu...");
        
        // Khởi tạo các vai trò
        initRoles();
        
        // Khởi tạo tài khoản admin mặc định (nếu chưa có)
        initAdminAccount();
        
        logger.info("Hoàn tất khởi tạo dữ liệu ban đầu!");
    }

    private void initRoles() {
        // Kiểm tra và tạo các role nếu chưa tồn tại
        if (roleRepository.count() == 0) {
            logger.info("Đang khởi tạo các vai trò...");
            
            Role roleUser = new Role(ERole.ROLE_USER);
            Role roleAdmin = new Role(ERole.ROLE_ADMIN);
            Role roleModerator = new Role(ERole.ROLE_MODERATOR);
            
            roleRepository.save(roleUser);
            roleRepository.save(roleAdmin);
            roleRepository.save(roleModerator);
            
            logger.info("Đã tạo các vai trò: ROLE_USER, ROLE_ADMIN, ROLE_MODERATOR");
        } else {
            logger.info("Các vai trò đã tồn tại, bỏ qua bước khởi tạo.");
        }
    }
    
    private void initAdminAccount() {
        // Kiểm tra xem đã có tài khoản admin chưa
        if (!userRepository.existsByUsername("admin")) {
            logger.info("Đang tạo tài khoản admin mặc định...");
            
            // Tạo tài khoản admin
            User admin = new User(
                    "admin",
                    passwordEncoder.encode("admin123"),
                    "admin@toeiclearning.com",
                    "Admin"
            );
            
            // Gán vai trò ADMIN
            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Lỗi: Role ADMIN không tìm thấy."));
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Lỗi: Role USER không tìm thấy."));
            
            roles.add(adminRole);
            roles.add(userRole);
            admin.setRoles(roles);
            
            userRepository.save(admin);
            
            logger.info("Đã tạo tài khoản admin mặc định: username=admin, password=admin123");
        } else {
            logger.info("Tài khoản admin đã tồn tại, bỏ qua bước khởi tạo.");
        }
    }
} 