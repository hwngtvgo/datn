package com.hungtv.toeic.be.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/ai")
public class AIController {
    
    @Value("${openai.api.key:}")
    private String openaiApiKey;
    
    private final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    
    /**
     * Proxy API cho OpenAI để tránh lỗi CORS
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chatCompletion(@RequestBody Map<String, Object> request) {
        try {
            // Nếu không có API key, trả về lỗi
            if (openaiApiKey == null || openaiApiKey.isEmpty()) {
                // Thử lấy từ header
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "API key không được cấu hình"));
            }
            
            // Tạo request cho OpenAI API
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);
            
            // Chuẩn bị request body cho OpenAI
            Map<String, Object> requestBody = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", request.get("messages"),
                "max_tokens", 1000,
                "temperature", 0.7
            );
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Gọi OpenAI API
            ResponseEntity<Map> response = restTemplate.exchange(
                OPENAI_API_URL,
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            // Xử lý response
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    return ResponseEntity.ok(Map.of("content", content));
                }
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Không nhận được phản hồi hợp lệ từ OpenAI"));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi gọi OpenAI API: " + e.getMessage()));
        }
    }
} 