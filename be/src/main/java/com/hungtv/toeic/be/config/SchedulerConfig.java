package com.hungtv.toeic.be.config;

import java.util.TimeZone;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;

/**
 * Cấu hình scheduler chạy theo múi giờ GMT+7 (Việt Nam)
 * Giúp đảm bảo các cronjob chạy đúng theo giờ Việt Nam
 */
@Configuration
@EnableScheduling
public class SchedulerConfig implements SchedulingConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(SchedulerConfig.class);
    
    @Bean
    public Executor taskExecutor() {
        // Đặt múi giờ cho scheduler là GMT+7
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Bangkok"));
        logger.info("Đã thiết lập múi giờ cho scheduler thành: {}", TimeZone.getDefault().getID());
        
        return Executors.newScheduledThreadPool(10);
    }
    
    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        taskRegistrar.setScheduler(taskExecutor());
    }
} 