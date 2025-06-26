package com.hungtv.toeic.be.controllers;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    
    private static final Logger logger = LoggerFactory.getLogger(AIController.class);
    
    @Value("${openai.api.key:}")
    private String openaiApiKey;
    
    private final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    
    // System message để định nghĩa vai trò của AI
    private final String SYSTEM_MESSAGE = "Bạn là một gia sư TOEIC chuyên nghiệp và thân thiện. " +
            "Nhiệm vụ của bạn là giúp học viên học TOEIC hiệu quả. " +
            "Bạn có kiến thức sâu về cấu trúc đề thi TOEIC, các dạng bài tập, và phương pháp học tập. " +
            "Hãy luôn trả lời bằng tiếng Việt một cách rõ ràng, dễ hiểu và hữu ích. " +
            "Khi được hỏi về ngữ pháp hoặc từ vựng, hãy giải thích chi tiết và đưa ra ví dụ cụ thể. " +
            "Hãy khuyến khích và tạo động lực cho học viên trong quá trình học.";
    
    /**
     * Debug endpoint để kiểm tra API key
     */
    @PostMapping("/debug")
    public ResponseEntity<?> debug() {
        return ResponseEntity.ok(Map.of(
            "apiKey", openaiApiKey != null ? openaiApiKey.substring(0, 10) + "..." : "null",
            "isEmpty", openaiApiKey == null || openaiApiKey.isEmpty()
        ));
    }
    
    /**
     * Proxy API cho OpenAI để tránh lỗi CORS
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chatCompletion(@RequestBody Map<String, Object> request) {
        try {
            // Debug log
            logger.info("Received request: " + request);
            logger.info("OpenAI API Key: " + (openaiApiKey != null ? openaiApiKey.substring(0, 10) + "..." : "null"));
            
            // Nếu không có API key, trả về lỗi
            if (openaiApiKey == null || openaiApiKey.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "API key không được cấu hình"));
            }
            
            // Kiểm tra request
            if (request == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Request body không được null"));
            }
            
            // Tạo messages từ request
            Object messagesObj = request.get("messages");
            List<Map<String, Object>> messages = new ArrayList<>();
            
            // Luôn thêm system message vào đầu
            messages.add(Map.of("role", "system", "content", SYSTEM_MESSAGE));
            
            if (messagesObj == null) {
                // Nếu không có messages, tạo từ message đơn lẻ
                String message = (String) request.get("message");
                if (message == null || message.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Cần có 'message' hoặc 'messages' trong request"));
                }
                messages.add(Map.of("role", "user", "content", message));
            } else if (messagesObj instanceof List) {
                List<Map<String, Object>> userMessages = (List<Map<String, Object>>) messagesObj;
                // Thêm các message từ user (bỏ qua system message cũ nếu có)
                for (Map<String, Object> msg : userMessages) {
                    String role = (String) msg.get("role");
                    if (!"system".equals(role)) {
                        messages.add(msg);
                    }
                }
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Field 'messages' phải là array"));
            }
            
            logger.info("Processed messages: " + messages);
            
            // Tạo request cho OpenAI API
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);
            
            // Chuẩn bị request body cho OpenAI
            Map<String, Object> requestBody = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", messages,
                "max_tokens", 1000,
                "temperature", 0.7
            );
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            logger.info("Calling OpenAI API with: " + requestBody);
            
            // Gọi OpenAI API
            ResponseEntity<Map> response = restTemplate.exchange(
                OPENAI_API_URL,
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            logger.info("OpenAI response status: " + response.getStatusCode());
            logger.info("OpenAI response body: " + response.getBody());
            
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
            logger.error("Error calling OpenAI API. Exception type: " + e.getClass().getSimpleName());
            logger.error("Error message: " + e.getMessage());
            logger.error("Full stacktrace: ", e);
            
            // Kiểm tra nếu là RestClientException để xử lý đặc biệt
            if (e instanceof org.springframework.web.client.RestClientException) {
                logger.error("RestClientException details: " + e.toString());
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi gọi OpenAI API: " + e.getClass().getSimpleName() + " - " + e.getMessage()));
        }
    }

    /**
     * Test endpoint không cần OpenAI
     */
    @PostMapping("/test")
    public ResponseEntity<?> testChat(@RequestBody Map<String, Object> request) {
        try {
            logger.info("Received test request: " + request);
            
            // Tạo messages từ request (same logic as chat)
            Object messagesObj = request.get("messages");
            List<Map<String, Object>> messages;
            
            if (messagesObj == null) {
                String message = (String) request.get("message");
                if (message == null || message.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Cần có 'message' hoặc 'messages' trong request"));
                }
                messages = List.of(Map.of("role", "user", "content", message));
            } else if (messagesObj instanceof List) {
                messages = (List<Map<String, Object>>) messagesObj;
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Field 'messages' phải là array"));
            }
            
            // Fake response
            String userMessage = "";
            if (!messages.isEmpty()) {
                Map<String, Object> lastMessage = messages.get(messages.size() - 1);
                userMessage = (String) lastMessage.get("content");
            }
            
            String response = "Đây là response test cho: \"" + userMessage + "\". Code đã hoạt động đúng!";
            
            return ResponseEntity.ok(Map.of("content", response));
            
        } catch (Exception e) {
            logger.error("Error in test endpoint: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi test: " + e.getMessage()));
        }
    }
} 