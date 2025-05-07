package com.hungtv.toeic.be.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hungtv.toeic.be.payload.request.CreateTestRequest;
import com.hungtv.toeic.be.payload.response.ApiResponse;
import com.hungtv.toeic.be.payload.response.MessageResponse;
import com.hungtv.toeic.be.payload.response.QuestionGroupResponse;
import com.hungtv.toeic.be.payload.response.TestResponse;
import com.hungtv.toeic.be.services.ToeicTestService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tests")
public class TestController {
    
    @Autowired
    private ToeicTestService testService;
    
    /**
     * Lấy danh sách tất cả các bài thi (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<TestResponse>> getAllTests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<TestResponse> tests = testService.getAllTests(pageable);
            return ResponseEntity.ok(tests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Lấy danh sách các bài thi đang được kích hoạt
     */
    @GetMapping("/active")
    public ResponseEntity<List<TestResponse>> getActiveTests() {
        try {
            List<TestResponse> tests = testService.getActiveTests();
            return ResponseEntity.ok(tests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Lấy thông tin bài thi theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TestResponse> getTestById(@PathVariable Long id) {
        try {
            TestResponse test = testService.getTestById(id);
            return ResponseEntity.ok(test);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }
    
    /**
     * Tạo bài thi mới (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TestResponse>> createTest(@Valid @RequestBody CreateTestRequest request) {
        try {
            TestResponse createdTest = testService.createTest(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Tạo bài thi thành công", createdTest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi khi tạo bài thi: " + e.getMessage(), null));
        }
    }
    
    /**
     * Cập nhật thông tin bài thi (Admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TestResponse>> updateTest(
            @PathVariable Long id,
            @Valid @RequestBody CreateTestRequest request) {
        
        try {
            TestResponse updatedTest = testService.updateTest(id, request);
            
            // Cập nhật các nhóm câu hỏi nếu có
            if (request.getQuestionGroupIds() != null && !request.getQuestionGroupIds().isEmpty()) {
                // Xóa tất cả các liên kết hiện tại
                testService.removeAllQuestionGroupsFromTest(id);
                
                // Thêm các nhóm câu hỏi mới
                for (Long groupId : request.getQuestionGroupIds()) {
                    testService.addQuestionGroupToTest(id, groupId);
                }
                
                // Lấy lại test đã cập nhật
                updatedTest = testService.getTestById(id);
            }
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật bài thi thành công", updatedTest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi khi cập nhật bài thi: " + e.getMessage(), null));
        }
    }
    
    /**
     * Xóa bài thi (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteTest(@PathVariable Long id) {
        try {
            testService.deleteTest(id);
            return ResponseEntity.ok(new MessageResponse("Xóa bài thi thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Lỗi khi xóa bài thi: " + e.getMessage()));
        }
    }
    
    /**
     * Kích hoạt/vô hiệu hóa bài thi (Admin only)
     */
    @PutMapping("/{id}/active/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TestResponse>> setTestActiveStatus(
            @PathVariable Long id,
            @PathVariable Boolean status) {
        
        try {
            TestResponse updatedTest = testService.setTestActiveStatus(id, status);
            String message = status ? "Kích hoạt bài thi thành công" : "Vô hiệu hóa bài thi thành công";
            return ResponseEntity.ok(new ApiResponse<>(true, message, updatedTest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi khi thay đổi trạng thái bài thi: " + e.getMessage(), null));
        }
    }

    /**
     * Lấy danh sách nhóm câu hỏi của bài thi
     */
    @GetMapping("/{id}/questions")
    public ResponseEntity<List<QuestionGroupResponse>> getTestQuestions(@PathVariable Long id) {
        try {
            List<QuestionGroupResponse> questions = testService.getTestQuestions(id);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Thêm nhóm câu hỏi vào bài thi
     */
    @PostMapping("/{id}/questions/group/{groupId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TestResponse>> addQuestionGroupToTest(
            @PathVariable Long id, 
            @PathVariable Long groupId) {
        try {
            TestResponse updatedTest = testService.addQuestionGroupToTest(id, groupId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Thêm nhóm câu hỏi vào bài thi thành công", updatedTest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi khi thêm nhóm câu hỏi: " + e.getMessage(), null));
        }
    }

    /**
     * Xóa nhóm câu hỏi khỏi bài thi
     */
    @DeleteMapping("/{id}/questions/group/{groupId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> removeQuestionGroupFromTest(
            @PathVariable Long id, 
            @PathVariable Long groupId) {
        try {
            testService.removeQuestionGroupFromTest(id, groupId);
            return ResponseEntity.ok(new MessageResponse("Xóa nhóm câu hỏi khỏi bài thi thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Lỗi khi xóa nhóm câu hỏi: " + e.getMessage()));
        }
    }
} 