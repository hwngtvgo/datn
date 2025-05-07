package com.hungtv.toeic.be.config;

import com.hungtv.toeic.be.models.ERole;
import com.hungtv.toeic.be.models.Role;
import com.hungtv.toeic.be.models.User;
import com.hungtv.toeic.be.repositories.RoleRepository;
import com.hungtv.toeic.be.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Tạo các role nếu chưa tồn tại
        if (roleRepository.count() == 0) {
            Role roleAdmin = new Role();
            roleAdmin.setName(ERole.ROLE_ADMIN);
            roleRepository.save(roleAdmin);

            Role roleUser = new Role();
            roleUser.setName(ERole.ROLE_USER);
            roleRepository.save(roleUser);

            Role roleModerator = new Role();
            roleModerator.setName(ERole.ROLE_MODERATOR);
            roleRepository.save(roleModerator);

            System.out.println("=== Đã khởi tạo các vai trò ===");
        }

        // Tạo tài khoản admin nếu chưa tồn tại
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@toeic-app.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setFullName("Administrator");
            admin.setActive(true);

            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Role ADMIN is not found."));
            roles.add(adminRole);
            admin.setRoles(roles);

            userRepository.save(admin);
            System.out.println("=== Đã tạo tài khoản admin ===");
        }
    }
} 