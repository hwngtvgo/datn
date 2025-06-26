package com.hungtv.toeic.be.config;

import java.util.TimeZone;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * Cấu hình múi giờ mặc định của ứng dụng là UTC
 * Lưu ý: Múi giờ cho scheduler được cấu hình riêng trong SchedulerConfig
 */
@Configuration
public class TimeZoneConfig {
    private static final Logger logger = LoggerFactory.getLogger(TimeZoneConfig.class);

    /**
     * Thiết lập múi giờ mặc định của JVM là UTC
     * Đây là cấu hình cho việc lưu trữ dữ liệu trong database
     */
    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        logger.info("Đã thiết lập múi giờ mặc định thành: {}", TimeZone.getDefault().getID());
        logger.info("Múi giờ hiện tại: {}", TimeZone.getDefault().getDisplayName());
    }
} 