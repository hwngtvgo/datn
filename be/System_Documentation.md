# Tài liệu Kiến trúc Hệ thống TOEIC Application

## 1. Tổng quan hệ thống

TOEIC Application là hệ thống học tập và ôn luyện TOEIC trực tuyến. Hệ thống được xây dựng với kiến trúc client-server:

- **Backend**: Spring Boot 3.4.4, Java 21
- **Database**: MySQL
- **Xác thực**: JWT (JSON Web Token)
- **API Documentation**: Swagger/OpenAPI 3.0

### 1.1. Các module chính

1. **Quản lý người dùng**: Đăng ký, đăng nhập, quản lý thông tin cá nhân
2. **Quản lý câu hỏi TOEIC**: Cơ sở dữ liệu câu hỏi, phân loại
3. **Quản lý bài thi**: Tạo đề thi, làm bài, chấm điểm
4. **File/Media**: Quản lý tệp tin, hình ảnh, âm thanh

## 2. Cấu trúc mã nguồn

### 2.1. Cấu trúc thư mục

```
src/main/java/com/hungtv/toeic/be/
├── config/                  # Cấu hình hệ thống
├── controllers/             # Điều khiển API
├── models/                  # Mô hình dữ liệu
├── repositories/            # Truy cập dữ liệu
├── security/                # Bảo mật, xác thực
│   ├── jwt/                 # Xử lý JWT
│   └── services/            # Dịch vụ bảo mật
├── services/                # Xử lý nghiệp vụ
├── payload/                 # Đối tượng Request/Response
│   ├── request/             # Đối tượng Request
│   └── response/            # Đối tượng Response
└── exception/               # Xử lý ngoại lệ
```

### 2.2. Luồng xử lý chính

```
Client → Controller → Service → Repository → Database
          ↑   ↓
     Security Filter
```

## 3. Cơ chế xác thực và phân quyền

### 3.1. Luồng xác thực

1. **Đăng nhập**: Người dùng gửi `username` và `password` đến `/api/auth/login`
2. **Xác thực**: Hệ thống kiểm tra thông tin đăng nhập
3. **Tạo token**: Nếu thông tin hợp lệ, hệ thống tạo JWT token
4. **Trả về token**: Token được trả về client (cả trong response body và cookie)
5. **Xác thực request**: Client gửi token trong header (`Authorization`) hoặc cookie cho các yêu cầu tiếp theo
6. **Kiểm tra token**: Filter `AuthTokenFilter` kiểm tra và xác thực token, trích xuất thông tin người dùng
7. **Phân quyền**: Kiểm tra quyền truy cập dựa trên role của người dùng

### 3.2. Cấu hình bảo mật

Cấu hình bảo mật được định nghĩa trong `WebSecurityConfig.java`:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {
    // ...
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> 
                auth.requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/public/**").permitAll()
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                    .requestMatchers("/api/files/**").permitAll()
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .anyRequest().authenticated()
            );
        
        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 3.3. Xử lý JWT

JWT được xử lý bởi các lớp trong package `security.jwt`:

- **JwtUtils**: Tạo, xác thực, trích xuất thông tin từ JWT token
- **AuthTokenFilter**: Bộ lọc để xác thực và xử lý JWT trong mỗi request
- **AuthEntryPointJwt**: Xử lý lỗi khi xác thực thất bại

### 3.4. Lưu trữ thông tin người dùng

- **UserDetailsImpl**: Triển khai `UserDetails` của Spring Security, chứa thông tin người dùng
- **UserDetailsServiceImpl**: Nạp thông tin người dùng từ cơ sở dữ liệu

## 4. Đánh giá hiện trạng xác thực và phân quyền

### 4.1. Điểm mạnh

- **Stateless**: Sử dụng JWT cho phép hệ thống không lưu trạng thái (stateless), dễ mở rộng
- **Bảo mật**: Sử dụng BCrypt để mã hóa mật khẩu
- **Phân quyền**: Phân quyền dựa trên role rõ ràng (ROLE_USER, ROLE_ADMIN)
- **Bảo vệ API**: Các API được bảo vệ đúng cách
- **CORS**: Cấu hình CORS rõ ràng, cho phép kiểm soát các domain được phép truy cập

### 4.2. Vấn đề tiềm ẩn và cải tiến

1. **Quản lý token**:
   - Hiện tại chưa có cơ chế rõ ràng để vô hiệu hóa token khi người dùng đổi mật khẩu hoặc bị khóa tài khoản
   - **Cải tiến**: Thêm cơ chế blacklist token hoặc sử dụng token với thời hạn ngắn

2. **Refresh Token**:
   - Endpoint `/api/auth/refresh-token` chưa được triển khai đầy đủ
   - **Cải tiến**: Hoàn thiện việc triển khai refresh token để giảm thời gian sống của access token

3. **Xử lý CSRF**:
   - CSRF protection đang bị tắt (`csrf.disable()`)
   - **Cải tiến**: Đánh giá lại rủi ro CSRF và cân nhắc bật nếu cần thiết

4. **Rate Limiting**:
   - Chưa có cơ chế giới hạn số lượng request (rate limiting)
   - **Cải tiến**: Thêm rate limiting cho các endpoint quan trọng như đăng nhập

5. **Quyền hạn chi tiết**:
   - Hiện tại chỉ có ROLE_USER và ROLE_ADMIN, chưa có quyền chi tiết hơn
   - **Cải tiến**: Cân nhắc sử dụng permissions và method-level security

## 5. Quy trình đánh giá an toàn thông tin

### 5.1. Kiểm tra bảo mật định kỳ

1. **Kiểm tra code**: Sử dụng công cụ phân tích tĩnh (SAST) như SonarQube
2. **Kiểm tra thâm nhập**: Thực hiện các test thâm nhập bảo mật định kỳ
3. **Cập nhật dependencies**: Kiểm tra và cập nhật các thư viện có lỗ hổng bảo mật

### 5.2. Quản lý sự cố

1. **Ghi log**: Đảm bảo ghi log đầy đủ các hoạt động liên quan đến xác thực/phân quyền
2. **Cảnh báo**: Thiết lập cảnh báo cho các hoạt động đáng ngờ
3. **Quy trình phản ứng**: Xây dựng quy trình xử lý khi phát hiện sự cố bảo mật

## 6. Kết luận

Hệ thống xác thực và phân quyền của TOEIC Application được thiết kế tốt, sử dụng các chuẩn hiện đại (JWT, Spring Security). Tuy nhiên, vẫn còn một số điểm cần cải tiến để tăng cường bảo mật và hiệu suất.

Ưu tiên cải tiến trong thời gian tới:
1. Hoàn thiện cơ chế refresh token
2. Thêm cơ chế vô hiệu hóa token
3. Thêm rate limiting cho các endpoint nhạy cảm 