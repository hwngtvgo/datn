package com.hungtv.toeic.be.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.responses.ApiResponse;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "TOEIC Application API",
                version = "1.0",
                description = "API Documentation for TOEIC Application",
                contact = @Contact(
                        name = "HungTV",
                        email = "hungtvdev@example.com"
                )
        ),
        security = {
                @SecurityRequirement(name = "bearerAuth")
        }
)
@SecurityScheme(
        name = "bearerAuth",
        description = "JWT Authentication - Nhập token không có 'Bearer ' ở phía trước",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components()
                        .addResponses("badRequest", new ApiResponse()
                                .description("Lỗi dữ liệu không hợp lệ")
                                .content(new Content().addMediaType("application/json", new MediaType()
                                        .example("{\"message\": \"Dữ liệu không hợp lệ\"}"))))
                        .addResponses("unauthorized", new ApiResponse()
                                .description("Không có quyền truy cập")
                                .content(new Content().addMediaType("application/json", new MediaType()
                                        .example("{\"message\": \"Không có quyền truy cập\"}"))))
                        .addResponses("internalError", new ApiResponse()
                                .description("Lỗi máy chủ")
                                .content(new Content().addMediaType("application/json", new MediaType()
                                        .example("{\"message\": \"Lỗi máy chủ\"}"))))
                );
    }
} 