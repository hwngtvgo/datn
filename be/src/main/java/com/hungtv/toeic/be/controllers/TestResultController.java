package com.hungtv.toeic.be.controllers;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hungtv.toeic.be.models.TestResult;
import com.hungtv.toeic.be.models.ToeicQuestion;
import com.hungtv.toeic.be.models.UserAnswer;
import com.hungtv.toeic.be.payload.request.SaveTestResultRequest;
import com.hungtv.toeic.be.payload.response.TestResultResponse;
import com.hungtv.toeic.be.payload.response.UserStatisticsResponse;
import com.hungtv.toeic.be.repositories.TestResultRepository;
import com.hungtv.toeic.be.repositories.UserAnswerRepository;
import com.hungtv.toeic.be.services.TestResultService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/test-results")
public class TestResultController {
    
    @Autowired
    private TestResultService testResultService;
    
    @Autowired
    private TestResultRepository testResultRepository;
    
    @Autowired
    private UserAnswerRepository userAnswerRepository;
    
    /**
     * Lấy chi tiết câu trả lời của một kết quả bài thi để xem review
     * 
     * @param resultId ID của kết quả bài thi
     * @return Map<String, Object> với chi tiết câu trả lời
     */
    @GetMapping("/{resultId}/review")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getTestResultReview(@PathVariable Long resultId) {
        try {
            // Lấy TestResult
            TestResult testResult = testResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả bài thi với ID: " + resultId));
            
            // Lấy danh sách câu trả lời
            List<UserAnswer> userAnswers = userAnswerRepository.findByTestResultOrderByQuestion_QuestionOrder(testResult);
            
            // Chuyển đổi sang DTO để trả về
            List<Map<String, Object>> userAnswersDto = userAnswers.stream()
                .map(answer -> {
                    ToeicQuestion question = answer.getQuestion();
                    Map<String, Object> answerMap = new HashMap<>();
                    answerMap.put("id", answer.getId());
                    answerMap.put("questionId", question.getId());
                    answerMap.put("questionText", question.getQuestion());
                    answerMap.put("questionType", question.getQuestionGroup() != null ? question.getQuestionGroup().getQuestionType().toString() : "");
                    answerMap.put("questionGroupId", question.getQuestionGroup() != null ? question.getQuestionGroup().getId() : 0);
                    answerMap.put("part", question.getQuestionGroup() != null ? question.getQuestionGroup().getPart() : 0);
                    answerMap.put("questionOrder", question.getQuestionOrder());
                    answerMap.put("userAnswer", answer.getUserAnswer());
                    answerMap.put("correctAnswer", question.getCorrectAnswer());
                    answerMap.put("isCorrect", answer.getIsCorrect());
                    answerMap.put("explanation", question.getExplanation());
                    answerMap.put("options", question.getOptions());
                    return answerMap;
                })
                .collect(Collectors.toList());
            
            // Tạo response với dữ liệu cơ bản và chi tiết câu trả lời
            Map<String, Object> response = new HashMap<>();
            response.put("id", testResult.getId());
            response.put("testId", testResult.getTest().getId());
            response.put("testTitle", testResult.getTest().getTitle());
            response.put("totalScore", testResult.getTotalScore());
            response.put("correctAnswers", testResult.getCorrectAnswers());
            response.put("totalQuestions", testResult.getTotalQuestions());
            response.put("completionTimeInMinutes", testResult.getCompletionTimeInMinutes());
            response.put("createdAt", testResult.getCreatedAt());
            response.put("userAnswers", userAnswersDto);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể lấy chi tiết review: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Lưu kết quả bài thi của người dùng
     * 
     * @param request Thông tin kết quả bài thi
     * @return TestResultResponse
     */
    @PostMapping("/submit")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<TestResultResponse> submitTestResult(@Valid @RequestBody SaveTestResultRequest request) {
        TestResultResponse result = testResultService.saveTestResult(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Lấy lịch sử bài làm của người dùng hiện tại
     * 
     * @param page Số trang (mặc định: 0)
     * @param size Kích thước trang (mặc định: 10)
     * @return Page<TestResultResponse>
     */
    @GetMapping("/my-history")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Page<TestResultResponse>> getMyTestHistory(
            @RequestParam(defaultValue = "0") int page, 
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TestResultResponse> results = testResultService.getCurrentUserTestHistory(pageable);
        return ResponseEntity.ok(results);
    }
    
    /**
     * Lấy chi tiết một kết quả bài thi
     * 
     * @param resultId ID của kết quả bài thi
     * @return TestResultResponse
     */
    @GetMapping("/{resultId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<TestResultResponse> getTestResultDetail(@PathVariable Long resultId) {
        TestResultResponse result = testResultService.getTestResultDetail(resultId);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Lấy thống kê bài làm của người dùng hiện tại
     * 
     * @return UserStatisticsResponse
     */
    @GetMapping("/my-statistics")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserStatisticsResponse> getMyStatistics() {
        UserStatisticsResponse statistics = testResultService.getCurrentUserStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Lấy lịch sử bài làm của một bài thi cụ thể
     * 
     * @param testId ID của bài thi
     * @return List<TestResultResponse>
     */
    @GetMapping("/by-test/{testId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<TestResultResponse>> getTestResultsByTestId(@PathVariable Long testId) {
        List<TestResultResponse> results = testResultService.getUserTestResultsByTestId(testId);
        return ResponseEntity.ok(results);
    }
    
    /**
     * (API dành cho Admin) Lấy lịch sử bài làm của một người dùng
     * 
     * @param userId ID của người dùng
     * @param page Số trang (mặc định: 0)
     * @param size Kích thước trang (mặc định: 10)
     * @return Page<TestResultResponse>
     */
    @GetMapping("/user/{userId}/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<TestResultResponse>> getUserTestHistory(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page, 
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TestResultResponse> results = testResultService.getUserTestHistory(userId, pageable);
        return ResponseEntity.ok(results);
    }
    
    /**
     * (API dành cho Admin) Lấy thống kê bài làm của một người dùng
     * 
     * @param userId ID của người dùng
     * @return UserStatisticsResponse
     */
    @GetMapping("/user/{userId}/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserStatisticsResponse> getUserStatistics(@PathVariable Long userId) {
        UserStatisticsResponse statistics = testResultService.getUserStatistics(userId);
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * (API dành cho Admin) Lấy thống kê tổng quát của tất cả người dùng
     * 
     * @return Map chứa thống kê tổng quát
     */
    @GetMapping("/admin/dashboard-statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        Map<String, Object> statistics = testResultService.getAllUsersStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * (API test cho Admin) Test endpoint đơn giản
     */
    @GetMapping("/admin/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> testAdmin() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Admin endpoint working!");
        result.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(result);
    }
} 