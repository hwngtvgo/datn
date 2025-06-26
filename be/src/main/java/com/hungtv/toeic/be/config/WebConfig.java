package com.hungtv.toeic.be.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    // Local development
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
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Content-Type", "Set-Cookie")
                .allowCredentials(true)
                .maxAge(3600);
    }
} 