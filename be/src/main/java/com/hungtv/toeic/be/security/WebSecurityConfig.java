package com.hungtv.toeic.be.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.hungtv.toeic.be.security.jwt.AuthEntryPointJwt;
import com.hungtv.toeic.be.security.jwt.AuthTokenFilter;
import com.hungtv.toeic.be.security.services.UserDetailsServiceImpl;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> 
                auth
                    // Các endpoint công khai không cần đăng nhập
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/files/view/**").permitAll()
                    .requestMatchers("/api/files/**").permitAll()
                    .requestMatchers("/swagger-ui/**").permitAll()
                    .requestMatchers("/v3/api-docs/**").permitAll()
                    .requestMatchers("/actuator/**").permitAll()
                    .requestMatchers("/api/cors-test/**").permitAll()
                    .requestMatchers("/api/ai/**").permitAll()
                    .requestMatchers("/error").permitAll()
                    
                    // Cho phép GET (đọc) các câu hỏi và bài thi mà không cần đăng nhập
                    .requestMatchers("GET", "/api/toeic-questions").permitAll()
                    .requestMatchers("GET", "/api/toeic-questions/**").permitAll()
                    .requestMatchers("GET", "/api/question-groups").permitAll()
                    .requestMatchers("GET", "/api/question-groups/**").permitAll()
                    .requestMatchers("GET", "/api/tests").permitAll()
                    .requestMatchers("GET", "/api/tests/**").permitAll()
                    
                    // Cho phép guest mode (không cần đăng nhập)
                    .requestMatchers("/api/tests/guest/**").permitAll()
                    .requestMatchers("/api/test-results/guest/**").permitAll()
                    
                    // Các endpoint cần quyền admin (tạo, sửa, xóa)
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .requestMatchers("POST", "/api/toeic-questions").hasRole("ADMIN")
                    .requestMatchers("PUT", "/api/toeic-questions/**").hasRole("ADMIN")
                    .requestMatchers("DELETE", "/api/toeic-questions/**").hasRole("ADMIN")
                    .requestMatchers("POST", "/api/question-groups").hasRole("ADMIN")
                    .requestMatchers("PUT", "/api/question-groups/**").hasRole("ADMIN")
                    .requestMatchers("DELETE", "/api/question-groups/**").hasRole("ADMIN")
                    .requestMatchers("POST", "/api/tests").hasRole("ADMIN")
                    .requestMatchers("PUT", "/api/tests/**").hasRole("ADMIN")
                    .requestMatchers("DELETE", "/api/tests/**").hasRole("ADMIN")
                    
                    // Các endpoint cần đăng nhập (user hoặc admin)
                    .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "USER")
                    .requestMatchers("/api/test-results/**").hasAnyRole("ADMIN", "USER")
                    
                    // Tất cả các request khác cần authentication
                    .anyRequest().authenticated()
            );
        
        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:8081",
            // VPS IP trực tiếp
            "http://YOUR_VPS_IP",
            "http://YOUR_VPS_IP:80",
            "http://YOUR_VPS_IP:8080",
            "http://YOUR_VPS_IP:8081",
            // Domain names
            "http://www.toeicsoict.me",
            "https://www.toeicsoict.me", 
            "http://toeicsoict.me",
            "https://toeicsoict.me",
            "http://www.toeicsoict.me:8081",
            "https://www.toeicsoict.me:8081",
            "http://toeicsoict.me:8081",
            "https://toeicsoict.me:8081"
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
} 