package com.hungtv.toeic.be.services;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hungtv.toeic.be.models.QuestionGroup;
import com.hungtv.toeic.be.models.Test;
import com.hungtv.toeic.be.models.TestResult;
import com.hungtv.toeic.be.models.ToeicQuestion;
import com.hungtv.toeic.be.models.User;
import com.hungtv.toeic.be.models.UserAnswer;
import com.hungtv.toeic.be.payload.request.SaveTestResultRequest;
import com.hungtv.toeic.be.payload.response.TestResultResponse;
import com.hungtv.toeic.be.payload.response.UserStatisticsResponse;
import com.hungtv.toeic.be.repositories.TestRepository;
import com.hungtv.toeic.be.repositories.TestResultRepository;
import com.hungtv.toeic.be.repositories.ToeicQuestionRepository;
import com.hungtv.toeic.be.repositories.UserAnswerRepository;
import com.hungtv.toeic.be.repositories.UserRepository;

@Service
public class TestResultService {
    
    @Autowired
    private TestResultRepository testResultRepository;
    
    @Autowired
    private UserAnswerRepository userAnswerRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TestRepository testRepository;
    
    @Autowired
    private ToeicQuestionRepository questionRepository;
    
    /**
     * Lưu kết quả bài thi của người dùng
     * 
     * @param request Thông tin kết quả bài thi
     * @return TestResultResponse
     */
    @Transactional
    public TestResultResponse saveTestResult(SaveTestResultRequest request) {
        User currentUser = getCurrentUser();
        Test test = testRepository.findById(request.getTestId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi với ID: " + request.getTestId()));
        
        // Tạo đối tượng TestResult
        TestResult testResult = new TestResult(currentUser, test);
        testResult.setCompletionTimeInMinutes(request.getCompletionTimeInMinutes());
        
        // Lưu TestResult để có ID
        testResult = testResultRepository.save(testResult);
        
        // Xử lý câu trả lời của người dùng
        if (request.getUserAnswers() != null && !request.getUserAnswers().isEmpty()) {
            // Lấy tất cả câu hỏi trong bài thi
            List<Long> questionIds = request.getUserAnswers().stream()
                    .map(SaveTestResultRequest.UserAnswerRequest::getQuestionId)
                    .collect(Collectors.toList());
            
            Map<Long, ToeicQuestion> questionMap = questionRepository.findAllById(questionIds).stream()
                    .collect(Collectors.toMap(ToeicQuestion::getId, q -> q));
            
            int totalQuestions = request.getUserAnswers().size();
            int correctAnswers = 0;
            
            // Thống kê theo loại câu hỏi
            int listeningCorrect = 0;
            int listeningTotal = 0;
            int readingCorrect = 0;
            int readingTotal = 0;
            int grammarCorrect = 0;
            int grammarTotal = 0;
            int vocabularyCorrect = 0;
            int vocabularyTotal = 0;
            
            // Xử lý từng câu trả lời
            List<UserAnswer> userAnswers = new ArrayList<>();
            for (SaveTestResultRequest.UserAnswerRequest answerRequest : request.getUserAnswers()) {
                ToeicQuestion question = questionMap.get(answerRequest.getQuestionId());
                if (question == null) {
                    continue; // Bỏ qua nếu không tìm thấy câu hỏi
                }
                
                UserAnswer userAnswer = new UserAnswer(testResult, question, answerRequest.getUserAnswer());
                userAnswers.add(userAnswer);
                
                // Cập nhật thống kê
                if (userAnswer.getIsCorrect()) {
                    correctAnswers++;
                    
                    // Phân loại câu hỏi đúng theo loại
                    if (question.getQuestionGroup() != null) {
                        QuestionGroup.QuestionType type = question.getQuestionGroup().getQuestionType();
                        if (QuestionGroup.QuestionType.LISTENING.equals(type)) {
                            listeningCorrect++;
                        } else if (QuestionGroup.QuestionType.READING.equals(type)) {
                            readingCorrect++;
                        }
                    }
                    
                    // Phân loại câu hỏi đúng theo category
                    if (question.getCategory() != null) {
                        if (ToeicQuestion.QuestionCategory.GRAMMAR.equals(question.getCategory())) {
                            grammarCorrect++;
                        } else if (ToeicQuestion.QuestionCategory.VOCABULARY.equals(question.getCategory())) {
                            vocabularyCorrect++;
                        }
                    }
                }
                
                // Đếm tổng số câu hỏi theo loại
                if (question.getQuestionGroup() != null) {
                    QuestionGroup.QuestionType type = question.getQuestionGroup().getQuestionType();
                    if (QuestionGroup.QuestionType.LISTENING.equals(type)) {
                        listeningTotal++;
                    } else if (QuestionGroup.QuestionType.READING.equals(type)) {
                        readingTotal++;
                    }
                }
                
                // Đếm tổng số câu hỏi theo category
                if (question.getCategory() != null) {
                    if (ToeicQuestion.QuestionCategory.GRAMMAR.equals(question.getCategory())) {
                        grammarTotal++;
                    } else if (ToeicQuestion.QuestionCategory.VOCABULARY.equals(question.getCategory())) {
                        vocabularyTotal++;
                    }
                }
            }
            
            // Lưu các câu trả lời
            userAnswerRepository.saveAll(userAnswers);
            
            // Tính điểm và cập nhật TestResult
            int listeningScore = 0;
            if (listeningTotal > 0) {
                listeningScore = (int) Math.round((double) listeningCorrect / listeningTotal * 100);
            }
            
            int readingScore = 0;
            if (readingTotal > 0) {
                readingScore = (int) Math.round((double) readingCorrect / readingTotal * 100);
            }
            
            int grammarScore = 0;
            if (grammarTotal > 0) {
                grammarScore = (int) Math.round((double) grammarCorrect / grammarTotal * 100);
            }
            
            int vocabularyScore = 0;
            if (vocabularyTotal > 0) {
                vocabularyScore = (int) Math.round((double) vocabularyCorrect / vocabularyTotal * 100);
            }
            
            // Tính điểm tổng
            int totalScore = (int) Math.round((double) correctAnswers / totalQuestions * 100);
            
            // Quy đổi sang thang 495
            int listeningScaledScore = (int) Math.round(listeningScore / 100.0 * 495.0);
            int readingScaledScore = (int) Math.round(readingScore / 100.0 * 495.0);
            
            // Cập nhật TestResult
            testResult.setListeningScore(listeningScore);
            testResult.setReadingScore(readingScore);
            testResult.setGrammarScore(grammarScore);
            testResult.setVocabularyScore(vocabularyScore);
            testResult.setTotalScore(totalScore);
            testResult.setListeningScaledScore(listeningScaledScore);
            testResult.setReadingScaledScore(readingScaledScore);
            testResult.setCorrectAnswers(correctAnswers);
            testResult.setTotalQuestions(totalQuestions);
            
            // Lưu lại TestResult với điểm số
            testResult = testResultRepository.save(testResult);
        }
        
        return convertToTestResultResponse(testResult);
    }
    
    /**
     * Lấy lịch sử bài làm của người dùng hiện tại (phân trang)
     * 
     * @param pageable Thông tin phân trang
     * @return Page<TestResultResponse>
     */
    public Page<TestResultResponse> getCurrentUserTestHistory(Pageable pageable) {
        User currentUser = getCurrentUser();
        Page<TestResult> results = testResultRepository.findByUserOrderByCreatedAtDesc(currentUser, pageable);
        return results.map(this::convertToTestResultResponse);
    }
    
    /**
     * Lấy lịch sử bài làm của người dùng theo ID (phân trang)
     * 
     * @param userId ID của người dùng
     * @param pageable Thông tin phân trang
     * @return Page<TestResultResponse>
     */
    public Page<TestResultResponse> getUserTestHistory(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        Page<TestResult> results = testResultRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return results.map(this::convertToTestResultResponse);
    }
    
    /**
     * Lấy chi tiết một kết quả bài thi
     * 
     * @param resultId ID của kết quả bài thi
     * @return TestResultResponse
     */
    public TestResultResponse getTestResultDetail(Long resultId) {
        TestResult result = testResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả bài thi với ID: " + resultId));
        
        // Kiểm tra quyền truy cập - chỉ chủ sở hữu hoặc admin có thể xem
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!result.getUser().getUsername().equals(authentication.getName()) && 
            !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new RuntimeException("Không có quyền truy cập kết quả này");
        }
        
        return convertToTestResultResponse(result);
    }
    
    /**
     * Lấy thống kê bài làm của người dùng hiện tại
     * 
     * @return UserStatisticsResponse
     */
    public UserStatisticsResponse getCurrentUserStatistics() {
        User currentUser = getCurrentUser();
        return getUserStatistics(currentUser.getId());
    }
    
    /**
     * Lấy thống kê bài làm của người dùng theo ID
     * 
     * @param userId ID của người dùng
     * @return UserStatisticsResponse
     */
    public UserStatisticsResponse getUserStatistics(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        
        // Lấy các số liệu thống kê cơ bản
        Long testsTaken = testResultRepository.countByUser(user);
        Double averageScore = testResultRepository.findAverageScoreByUser(user);
        Integer bestScore = testResultRepository.findHighestScoreByUser(user);
        
        // Lấy danh sách kết quả gần đây nhất
        List<TestResult> recentResults = testResultRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().limit(5).collect(Collectors.toList());
        List<TestResultResponse> recentTests = recentResults.stream()
                .map(this::convertToTestResultResponse)
                .collect(Collectors.toList());
        
        // Thống kê điểm trung bình từng phần
        Double listeningAvg = 0.0;
        Double readingAvg = 0.0;
        Double grammarAvg = 0.0;
        Double vocabularyAvg = 0.0;
        Integer listeningScaled = 0;
        Integer readingScaled = 0;
        
        if (!recentResults.isEmpty()) {
            listeningAvg = recentResults.stream()
                    .filter(r -> r.getListeningScore() != null)
                    .mapToDouble(TestResult::getListeningScore)
                    .average()
                    .orElse(0.0);
            
            readingAvg = recentResults.stream()
                    .filter(r -> r.getReadingScore() != null)
                    .mapToDouble(TestResult::getReadingScore)
                    .average()
                    .orElse(0.0);
            
            grammarAvg = recentResults.stream()
                    .filter(r -> r.getGrammarScore() != null)
                    .mapToDouble(TestResult::getGrammarScore)
                    .average()
                    .orElse(0.0);
            
            vocabularyAvg = recentResults.stream()
                    .filter(r -> r.getVocabularyScore() != null)
                    .mapToDouble(TestResult::getVocabularyScore)
                    .average()
                    .orElse(0.0);
            
            // Tính điểm quy đổi thang 495 dựa trên điểm trung bình gần đây
            listeningScaled = (int) Math.round(listeningAvg / 100.0 * 495.0);
            readingScaled = (int) Math.round(readingAvg / 100.0 * 495.0);
        }
        
        // Thống kê theo tháng
        Map<String, Long> testsByMonth = new HashMap<>();
        Map<String, Double> scoresByMonth = new HashMap<>();
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        // Lấy số liệu 6 tháng gần nhất
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusMonths(5).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        
        // Tạo danh sách các tháng trong khoảng thời gian
        List<String> months = new ArrayList<>();
        YearMonth current = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        while (!current.isAfter(end)) {
            months.add(current.format(formatter));
            current = current.plusMonths(1);
        }
        
        // Khởi tạo giá trị mặc định cho mỗi tháng
        for (String month : months) {
            testsByMonth.put(month, 0L);
            scoresByMonth.put(month, 0.0);
        }
        
        // Lấy kết quả trong khoảng thời gian
        List<TestResult> resultsInRange = testResultRepository.findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(
                user, startDate, endDate);
        
        // Thống kê theo tháng
        Map<String, List<TestResult>> resultsByMonth = resultsInRange.stream()
                .collect(Collectors.groupingBy(
                        result -> result.getCreatedAt().format(formatter)
                ));
        
        // Tính số bài thi và điểm trung bình cho mỗi tháng
        for (Map.Entry<String, List<TestResult>> entry : resultsByMonth.entrySet()) {
            String month = entry.getKey();
            List<TestResult> monthResults = entry.getValue();
            
            testsByMonth.put(month, (long) monthResults.size());
            
            Double monthAvgScore = monthResults.stream()
                    .filter(r -> r.getTotalScore() != null)
                    .mapToDouble(TestResult::getTotalScore)
                    .average()
                    .orElse(0.0);
            
            scoresByMonth.put(month, monthAvgScore);
        }
        
        // Tạo và trả về đối tượng thống kê
        return new UserStatisticsResponse(
                user.getId(), 
                user.getUsername(), 
                testsTaken, 
                averageScore, 
                bestScore, 
                listeningAvg, 
                readingAvg, 
                grammarAvg, 
                vocabularyAvg, 
                listeningScaled, 
                readingScaled, 
                recentTests, 
                testsByMonth, 
                scoresByMonth
        );
    }
    
    /**
     * Lấy chi tiết thống kê một bài thi của người dùng
     * 
     * @param testId ID của bài thi
     * @return List<TestResultResponse>
     */
    public List<TestResultResponse> getUserTestResultsByTestId(Long testId) {
        User currentUser = getCurrentUser();
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi với ID: " + testId));
        
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<TestResult> results = testResultRepository.findHighestScoreByUserAndTestId(currentUser, testId, pageable);
        
        return results.stream()
                .map(this::convertToTestResultResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Chuyển đổi đối tượng TestResult thành TestResultResponse
     * 
     * @param testResult Đối tượng TestResult
     * @return TestResultResponse
     */
    private TestResultResponse convertToTestResultResponse(TestResult testResult) {
        return new TestResultResponse(
                testResult.getId(),
                testResult.getTest().getId(),
                testResult.getTest().getTitle(),
                testResult.getListeningScore(),
                testResult.getReadingScore(),
                testResult.getGrammarScore(),
                testResult.getVocabularyScore(),
                testResult.getTotalScore(),
                testResult.getListeningScaledScore(),
                testResult.getReadingScaledScore(),
                testResult.getCompletionTimeInMinutes(),
                testResult.getCorrectAnswers(),
                testResult.getTotalQuestions(),
                testResult.getCreatedAt()
        );
    }
    
    /**
     * Lấy thông tin người dùng hiện tại
     * 
     * @return User
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng hiện tại"));
    }
} 