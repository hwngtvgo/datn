package com.hungtv.toeic.be.controllers;

import java.util.List;

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

import com.hungtv.toeic.be.payload.request.SaveTestResultRequest;
import com.hungtv.toeic.be.payload.response.TestResultResponse;
import com.hungtv.toeic.be.payload.response.UserStatisticsResponse;
import com.hungtv.toeic.be.services.TestResultService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/test-results")
public class TestResultController {
    
    @Autowired
    private TestResultService testResultService;
    
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
} 