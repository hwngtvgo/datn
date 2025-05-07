package com.hungtv.toeic.be.services;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hungtv.toeic.be.models.ERole;
import com.hungtv.toeic.be.models.Role;
import com.hungtv.toeic.be.models.User;
import com.hungtv.toeic.be.payload.request.CreateUserRequest;
import com.hungtv.toeic.be.payload.request.UpdateUserRequest;
import com.hungtv.toeic.be.payload.response.UserResponse;
import com.hungtv.toeic.be.repositories.RoleRepository;
import com.hungtv.toeic.be.repositories.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Lấy danh sách tất cả người dùng
     * @return Danh sách người dùng dưới dạng UserResponse
     */
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin người dùng theo ID
     * @param id ID của người dùng
     * @return UserResponse nếu tìm thấy, null nếu không tìm thấy
     */
    public UserResponse getUserById(Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        return userOptional.map(this::convertToUserResponse).orElse(null);
    }

    /**
     * Tạo người dùng mới
     * @param request Thông tin người dùng cần tạo
     * @return UserResponse của người dùng đã tạo
     */
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        // Kiểm tra username đã tồn tại chưa
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }

        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // Tạo người dùng mới
        User user = new User(
            request.getUsername(),
            passwordEncoder.encode(request.getPassword()),
            request.getEmail(),
            request.getFullName()
        );
        user.setActive(true);

        // Xác định và thiết lập vai trò
        Set<Role> roles = new HashSet<>();
        if ("ADMIN".equals(request.getRole())) {
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Vai trò Admin không tồn tại"));
            roles.add(adminRole);
        } else {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Vai trò User không tồn tại"));
            roles.add(userRole);
        }
        user.setRoles(roles);

        // Lưu người dùng vào database
        User savedUser = userRepository.save(user);

        return convertToUserResponse(savedUser);
    }

    /**
     * Cập nhật thông tin người dùng
     * @param id ID của người dùng cần cập nhật
     * @param request Thông tin cập nhật
     * @return UserResponse của người dùng đã cập nhật
     */
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        // Kiểm tra xem username mới đã tồn tại chưa (nếu khác username hiện tại)
        if (!user.getUsername().equals(request.getUsername()) && 
                userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }

        // Kiểm tra xem email mới đã tồn tại chưa (nếu khác email hiện tại)
        if (!user.getEmail().equals(request.getEmail()) && 
                userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // Cập nhật thông tin người dùng
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());

        // Cập nhật vai trò nếu có thay đổi
        if (request.getRole() != null) {
            Set<Role> roles = new HashSet<>();
            if ("ADMIN".equals(request.getRole())) {
                Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                        .orElseThrow(() -> new RuntimeException("Vai trò Admin không tồn tại"));
                Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Vai trò User không tồn tại"));
                roles.add(adminRole);
                roles.add(userRole);
            } else {
                Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Vai trò User không tồn tại"));
                roles.add(userRole);
            }
            user.setRoles(roles);
        }

        // Lưu thông tin cập nhật
        User updatedUser = userRepository.save(user);

        return convertToUserResponse(updatedUser);
    }

    /**
     * Xóa người dùng theo ID
     * @param id ID của người dùng cần xóa
     */
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy người dùng với ID: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Chuyển đổi từ User sang UserResponse
     * @param user Đối tượng User
     * @return Đối tượng UserResponse
     */
    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        response.setActive(user.isActive());

        // Xác định vai trò
        String role = "USER";
        for (Role r : user.getRoles()) {
            if (ERole.ROLE_ADMIN.equals(r.getName())) {
                role = "ADMIN";
                break;
            }
        }
        response.setRole(role);

        return response;
    }
} 