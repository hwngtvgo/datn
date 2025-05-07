package com.hungtv.toeic.be.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hungtv.toeic.be.models.QuestionGroup;
import com.hungtv.toeic.be.models.Test;
import com.hungtv.toeic.be.payload.request.CreateTestRequest;
import com.hungtv.toeic.be.payload.response.QuestionGroupResponse;
import com.hungtv.toeic.be.payload.response.TestResponse;
import com.hungtv.toeic.be.repositories.QuestionGroupRepository;
import com.hungtv.toeic.be.repositories.TestRepository;
import com.hungtv.toeic.be.repositories.UserRepository;

@Service
public class ToeicTestService {
    
    @Autowired
    private TestRepository testRepository;
    
    @Autowired
    private QuestionGroupRepository questionGroupRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ToeicQuestionService questionService;
    
    /**
     * Lấy danh sách tất cả các bài thi
     * 
     * @param pageable Thông tin phân trang
     * @return Page<TestResponse>
     */
    public Page<TestResponse> getAllTests(Pageable pageable) {
        Page<Test> tests = testRepository.findAll(pageable);
        return tests.map(this::convertToTestResponse);
    }
    
    /**
     * Lấy danh sách bài thi được kích hoạt
     * 
     * @return List<TestResponse>
     */
    public List<TestResponse> getActiveTests() {
        List<Test> tests = testRepository.findByIsActiveTrue();
        return tests.stream()
                .map(this::convertToTestResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy thông tin bài thi theo ID
     * 
     * @param id ID của bài thi
     * @return TestResponse
     * @throws RuntimeException nếu không tìm thấy bài thi
     */
    public TestResponse getTestById(Long id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi với ID: " + id));
        return convertToTestResponseWithGroups(test);
    }
    
    /**
     * Tạo bài thi mới
     * 
     * @param request Thông tin bài thi
     * @return TestResponse
     */
    @Transactional
    public TestResponse createTest(CreateTestRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        Test test = new Test();
        test.setTitle(request.getTitle());
        test.setDescription(request.getDescription());
        test.setType(request.getType());
        test.setDuration(request.getDuration());
        test.setInstructions(request.getInstructions());
        test.setCreatedAt(LocalDateTime.now());
        test.setCreatedBy(username);
        test.setIsActive(true);
        
        Test savedTest = testRepository.save(test);
        return convertToTestResponse(savedTest);
    }
    
    /**
     * Cập nhật thông tin bài thi
     * 
     * @param id ID của bài thi
     * @param request Thông tin cập nhật
     * @return TestResponse
     * @throws RuntimeException nếu không tìm thấy bài thi
     */
    @Transactional
    public TestResponse updateTest(Long id, CreateTestRequest request) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi với ID: " + id));
        
        test.setTitle(request.getTitle());
        test.setDescription(request.getDescription());
        test.setType(request.getType());
        test.setDuration(request.getDuration());
        test.setInstructions(request.getInstructions());
        
        Test updatedTest = testRepository.save(test);
        return convertToTestResponse(updatedTest);
    }
    
    /**
     * Xóa bài thi
     * 
     * @param id ID của bài thi
     * @throws RuntimeException nếu không tìm thấy bài thi
     */
    @Transactional
    public void deleteTest(Long id) {
        if (!testRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy bài thi với ID: " + id);
        }
        testRepository.deleteById(id);
    }
    
    /**
     * Kích hoạt/vô hiệu hóa bài thi
     * 
     * @param id ID của bài thi
     * @param isActive Trạng thái kích hoạt
     * @return TestResponse
     * @throws RuntimeException nếu không tìm thấy bài thi
     */
    @Transactional
    public TestResponse setTestActiveStatus(Long id, Boolean isActive) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi với ID: " + id));
        
        test.setIsActive(isActive);
        Test updatedTest = testRepository.save(test);
        return convertToTestResponse(updatedTest);
    }

    /**
     * Lấy danh sách nhóm câu hỏi của bài thi
     * 
     * @param testId ID của bài thi
     * @return List<QuestionGroupResponse>
     * @throws RuntimeException nếu không tìm thấy bài thi
     */
    public List<QuestionGroupResponse> getTestQuestions(Long testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi với ID: " + testId));
        
        return test.getQuestionGroups().stream()
                .map(group -> questionService.getQuestionsByGroupId(group.getId()))
                .collect(Collectors.toList());
    }

    /**
     * Thêm nhóm câu hỏi vào bài thi
     * 
     * @param testId ID của bài thi
     * @param groupId ID của nhóm câu hỏi
     * @return TestResponse
     * @throws RuntimeException nếu không tìm thấy bài thi hoặc nhóm câu hỏi
     */
    @Transactional
    public TestResponse addQuestionGroupToTest(Long testId, Long groupId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi với ID: " + testId));
        
        QuestionGroup group = questionGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm câu hỏi với ID: " + groupId));
        
        // Thêm nhóm câu hỏi vào bài thi nếu chưa tồn tại
        test.addQuestionGroup(group);
        Test updatedTest = testRepository.save(test);
        
        return convertToTestResponseWithGroups(updatedTest);
    }

    /**
     * Xóa nhóm câu hỏi khỏi bài thi
     * 
     * @param testId ID của bài thi
     * @param groupId ID của nhóm câu hỏi
     * @throws RuntimeException nếu không tìm thấy bài thi hoặc nhóm câu hỏi
     */
    @Transactional
    public void removeQuestionGroupFromTest(Long testId, Long groupId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi với ID: " + testId));
        
        QuestionGroup group = questionGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm câu hỏi với ID: " + groupId));
        
        // Xóa nhóm câu hỏi khỏi bài thi
        test.removeQuestionGroup(group);
        testRepository.save(test);
    }
    
    /**
     * Xóa tất cả nhóm câu hỏi khỏi bài thi
     * 
     * @param testId ID của bài thi
     * @throws RuntimeException nếu không tìm thấy bài thi
     */
    @Transactional
    public void removeAllQuestionGroupsFromTest(Long testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi với ID: " + testId));
        
        // Lấy danh sách nhóm câu hỏi hiện tại
        List<QuestionGroup> currentGroups = new ArrayList<>(test.getQuestionGroups());
        
        // Xóa từng nhóm câu hỏi
        for (QuestionGroup group : currentGroups) {
            test.removeQuestionGroup(group);
        }
        
        testRepository.save(test);
    }
    
    /**
     * Chuyển đổi từ Test entity sang TestResponse
     * 
     * @param test Test entity
     * @return TestResponse
     */
    private TestResponse convertToTestResponse(Test test) {
        return new TestResponse(
                test.getId(),
                test.getTitle(),
                test.getDescription(),
                test.getType(),
                test.getDuration(),
                test.getInstructions(),
                test.getCreatedAt(),
                test.getCreatedBy(),
                test.getIsActive()
        );
    }
    
    /**
     * Chuyển đổi từ Test entity sang TestResponse kèm theo danh sách QuestionGroup
     * 
     * @param test Test entity
     * @return TestResponse
     */
    private TestResponse convertToTestResponseWithGroups(Test test) {
        List<QuestionGroupResponse> groupResponses = test.getQuestionGroups().stream()
                .map(group -> questionService.getQuestionsByGroupId(group.getId()))
                .collect(Collectors.toList());
        
        return new TestResponse(
                test.getId(),
                test.getTitle(),
                test.getDescription(),
                test.getType(),
                test.getDuration(),
                test.getInstructions(),
                test.getCreatedAt(),
                test.getCreatedBy(),
                test.getIsActive(),
                groupResponses
        );
    }
}
