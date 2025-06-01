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
import com.hungtv.toeic.be.models.TestResult;
import com.hungtv.toeic.be.payload.request.CreateTestRequest;
import com.hungtv.toeic.be.payload.response.QuestionGroupResponse;
import com.hungtv.toeic.be.payload.response.TestResponse;
import com.hungtv.toeic.be.repositories.QuestionGroupRepository;
import com.hungtv.toeic.be.repositories.TestRepository;
import com.hungtv.toeic.be.repositories.TestResultRepository;
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
    
    @Autowired
    private TestResultRepository testResultRepository;
    
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
        // Tạo đối tượng Test từ request
        Test test = new Test();
        test.setTitle(request.getTitle());
        test.setDescription(request.getDescription());
        test.setType(request.getType());
        test.setDuration(request.getDuration());
        test.setInstructions(request.getInstructions());
        test.setCreatedAt(LocalDateTime.now());
        test.setDifficulty(request.getDifficulty());
        
        // Lấy thông tin người dùng hiện tại (nếu có)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            test.setCreatedBy(authentication.getName());
        }
        
        // Lưu đối tượng Test vào cơ sở dữ liệu
        test = testRepository.save(test);
        
        // Trả về TestResponse
        return convertToTestResponse(test);
    }
    
    /**
     * Cập nhật thông tin bài thi
     * 
     * @param id ID của bài thi
     * @param request Thông tin mới của bài thi
     * @return TestResponse
     * @throws RuntimeException nếu không tìm thấy bài thi
     */
    @Transactional
    public TestResponse updateTest(Long id, CreateTestRequest request) {
        // Tìm kiếm bài thi theo ID
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi với ID: " + id));
        
        // Cập nhật thông tin
        test.setTitle(request.getTitle());
        test.setDescription(request.getDescription());
        test.setType(request.getType());
        test.setDuration(request.getDuration());
        test.setInstructions(request.getInstructions());
        test.setDifficulty(request.getDifficulty());
        
        // Lưu thông tin đã cập nhật
        test = testRepository.save(test);
        
        // Trả về TestResponse
        return convertToTestResponse(test);
    }
    
    /**
     * Xóa bài thi
     * 
     * @param id ID của bài thi
     * @throws RuntimeException nếu không tìm thấy bài thi
     */
    @Transactional
    public void deleteTest(Long id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi với ID: " + id));
                
        // Tìm tất cả kết quả bài thi liên kết với đề thi này
        List<TestResult> testResults = testResultRepository.findByTest(test);
        
        // Xóa tất cả kết quả bài thi liên kết
        if (!testResults.isEmpty()) {
            testResults.forEach(result -> testResultRepository.delete(result));
            System.out.println("Đã xóa " + testResults.size() + " kết quả bài thi liên kết với đề thi ID: " + id);
        }
        
        // Sau đó xóa đề thi
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
     * Chuyển đổi đối tượng Test thành TestResponse
     * 
     * @param test Đối tượng Test
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
                test.getIsActive(),
                test.getDifficulty());
    }
    
    /**
     * Chuyển đổi đối tượng Test thành TestResponse bao gồm các nhóm câu hỏi
     * 
     * @param test Đối tượng Test
     * @return TestResponse
     */
    private TestResponse convertToTestResponseWithGroups(Test test) {
        List<QuestionGroupResponse> groupResponses = test.getQuestionGroups().stream()
                .map(group -> {
                    QuestionGroupResponse response = new QuestionGroupResponse();
                    response.setId(group.getId());
                    response.setTitle(group.getTitle());
                    response.setQuestionType(group.getQuestionType().name());
                    response.setPart(group.getPart());
                    response.setAudioUrl(group.getAudioUrl());
                    response.setImageUrl(group.getImageUrl());
                    response.setPassage(group.getPassage());
                    response.setTestId(test.getId());
                    
                    // Đếm số lượng câu hỏi trong nhóm
                    long questionCount = questionService.countQuestionsByGroupId(group.getId());
                    response.setQuestionCount(questionCount);
                    
                    return response;
                })
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
                test.getDifficulty(),
                groupResponses);
    }
}
