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
            // Lấy tất cả câu hỏi trong bài thi để tính tổng số câu hỏi chính xác
            List<ToeicQuestion> allQuestionsInExam = questionRepository.findByTestIdOrderByQuestionOrder(request.getTestId());
            
            // Debug: In ra số lượng câu hỏi tìm được
            System.out.println("=== DEBUG SCORING ===");
            System.out.println("Test ID: " + request.getTestId());
            System.out.println("Questions found by findByTestIdOrderByQuestionOrder: " + allQuestionsInExam.size());
            if (allQuestionsInExam.isEmpty()) {
                System.out.println("❌ Không tìm thấy câu hỏi nào cho bài thi ID: " + request.getTestId());
                
                // Thử phương án khác: tìm qua questionGroups
                Test testForDebug = testRepository.findById(request.getTestId()).orElse(null);
                if (testForDebug != null && testForDebug.getQuestionGroups() != null) {
                    System.out.println("Số QuestionGroups trong test: " + testForDebug.getQuestionGroups().size());
                    for (QuestionGroup group : testForDebug.getQuestionGroups()) {
                        List<ToeicQuestion> questionsInGroup = questionRepository.findByQuestionGroupIdOrderByQuestionOrder(group.getId());
                        System.out.println("Group " + group.getId() + " (" + group.getTitle() + ") có " + questionsInGroup.size() + " câu hỏi");
                        allQuestionsInExam.addAll(questionsInGroup);
                    }
                    System.out.println("Tổng câu hỏi sau khi tìm qua groups: " + allQuestionsInExam.size());
                }
            }
            
            // Kiểm tra xem bài thi có câu hỏi không
            if (allQuestionsInExam.isEmpty()) {
                // Nếu không có câu hỏi nào, set giá trị mặc định
                testResult.setTotalQuestions(0);
                testResult.setCorrectAnswers(0);
                testResult.setTotalScore(0);
                testResult.setListeningScore(0);
                testResult.setReadingScore(0);
                testResult.setGrammarScore(0);
                testResult.setVocabularyScore(0);
                testResult.setListeningScaledScore(0);
                testResult.setReadingScaledScore(0);
                testResult = testResultRepository.save(testResult);
                return convertToTestResultResponse(testResult);
            }
            
            // Đếm tổng số câu hỏi thực tế theo loại trong bài thi
            int totalListeningInExam = 0;
            int totalReadingInExam = 0;
            int totalGrammarInExam = 0;
            int totalVocabularyInExam = 0;
            
            for (ToeicQuestion question : allQuestionsInExam) {
                if (question.getQuestionGroup() != null) {
                    QuestionGroup.QuestionType type = question.getQuestionGroup().getQuestionType();
                    if (QuestionGroup.QuestionType.LISTENING.equals(type)) {
                        totalListeningInExam++;
                    } else if (QuestionGroup.QuestionType.READING.equals(type)) {
                        totalReadingInExam++;
                    } else if (QuestionGroup.QuestionType.GRAMMAR.equals(type)) {
                        totalGrammarInExam++;
                    } else if (QuestionGroup.QuestionType.VOCABULARY.equals(type)) {
                        totalVocabularyInExam++;
                    }
                }
                
                if (question.getCategory() != null) {
                    if (ToeicQuestion.QuestionCategory.GRAMMAR.equals(question.getCategory())) {
                        totalGrammarInExam++;
                    } else if (ToeicQuestion.QuestionCategory.VOCABULARY.equals(question.getCategory())) {
                        totalVocabularyInExam++;
                    } else if (ToeicQuestion.QuestionCategory.LISTENING.equals(question.getCategory())) {
                        totalListeningInExam++;
                    }
                }
            }
            
            // Lấy tất cả câu hỏi trong bài thi
            List<Long> questionIds = request.getUserAnswers().stream()
                    .map(SaveTestResultRequest.UserAnswerRequest::getQuestionId)
                    .collect(Collectors.toList());
            
            Map<Long, ToeicQuestion> questionMap = questionRepository.findAllById(questionIds).stream()
                    .collect(Collectors.toMap(ToeicQuestion::getId, q -> q));
            
            int totalQuestions = allQuestionsInExam.size(); // Dùng tổng số câu thực tế trong bài thi
            int correctAnswers = 0;
            
            // Thống kê theo loại câu hỏi - chỉ đếm câu trả lời đúng
            int listeningCorrect = 0;
            int readingCorrect = 0;
            int grammarCorrect = 0;
            int vocabularyCorrect = 0;
            
            // Xử lý từng câu trả lời
            List<UserAnswer> userAnswers = new ArrayList<>();
            for (SaveTestResultRequest.UserAnswerRequest answerRequest : request.getUserAnswers()) {
                ToeicQuestion question = questionMap.get(answerRequest.getQuestionId());
                if (question == null) {
                    continue; // Bỏ qua nếu không tìm thấy câu hỏi
                }
                
                UserAnswer userAnswer = new UserAnswer(testResult, question, answerRequest.getUserAnswer());
                userAnswers.add(userAnswer);
                
                // Cập nhật thống kê chỉ khi trả lời đúng
                if (userAnswer.getIsCorrect()) {
                    correctAnswers++;
                    
                    // Phân loại câu hỏi đúng theo loại QuestionGroup.QuestionType
                    if (question.getQuestionGroup() != null) {
                        QuestionGroup.QuestionType type = question.getQuestionGroup().getQuestionType();
                        if (QuestionGroup.QuestionType.LISTENING.equals(type)) {
                            listeningCorrect++;
                        } else if (QuestionGroup.QuestionType.READING.equals(type)) {
                            readingCorrect++;
                        } else if (QuestionGroup.QuestionType.GRAMMAR.equals(type)) {
                            grammarCorrect++;
                        } else if (QuestionGroup.QuestionType.VOCABULARY.equals(type)) {
                            vocabularyCorrect++;
                        }
                    }
                    
                    // Phân loại câu hỏi đúng theo category
                    if (question.getCategory() != null) {
                        if (ToeicQuestion.QuestionCategory.GRAMMAR.equals(question.getCategory())) {
                            grammarCorrect++;
                        } else if (ToeicQuestion.QuestionCategory.VOCABULARY.equals(question.getCategory())) {
                            vocabularyCorrect++;
                        } else if (ToeicQuestion.QuestionCategory.LISTENING.equals(question.getCategory())) {
                            listeningCorrect++;
                        }
                    }
                }
            }
            
            // Lưu các câu trả lời
            userAnswerRepository.saveAll(userAnswers);
            
            // Tính điểm dựa trên tổng số câu thực tế trong bài thi, không phải chỉ câu trả lời
            int listeningScore = 0;
            if (totalListeningInExam > 0) {
                listeningScore = (int) Math.round((double) listeningCorrect / totalListeningInExam * 100);
            }
            
            int readingScore = 0;
            if (totalReadingInExam > 0) {
                readingScore = (int) Math.round((double) readingCorrect / totalReadingInExam * 100);
            }
            
            int grammarScore = 0;
            if (totalGrammarInExam > 0) {
                grammarScore = (int) Math.round((double) grammarCorrect / totalGrammarInExam * 100);
            }
            
            int vocabularyScore = 0;
            if (totalVocabularyInExam > 0) {
                vocabularyScore = (int) Math.round((double) vocabularyCorrect / totalVocabularyInExam * 100);
            }
            
            // Tính điểm tổng dựa trên tổng số câu thực tế
            int totalScore = 0;
            if (totalQuestions > 0) {
                totalScore = (int) Math.round((double) correctAnswers / totalQuestions * 100);
            }
            
            // Quy đổi sang thang 495 - chỉ cho điểm tối thiểu 5 khi có trả lời câu hỏi
            int listeningScaledScore = 0;
            if (totalListeningInExam > 0) {
                listeningScaledScore = (int) Math.round(Math.max(5, listeningScore / 100.0 * 495.0));
            }
            
            int readingScaledScore = 0;
            if (totalReadingInExam > 0) {
                readingScaledScore = (int) Math.round(Math.max(5, readingScore / 100.0 * 495.0));
            }
            
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
        } else {
            // Trường hợp không có câu trả lời nào
            testResult.setTotalQuestions(0);
            testResult.setCorrectAnswers(0);
            testResult.setTotalScore(0);
            testResult.setListeningScore(0);
            testResult.setReadingScore(0);
            testResult.setGrammarScore(0);
            testResult.setVocabularyScore(0);
            testResult.setListeningScaledScore(0);
            testResult.setReadingScaledScore(0);
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
     * (Dành cho Admin) Lấy thống kê tổng quát của tất cả người dùng
     * 
     * @return Map chứa thống kê tổng quát
     */
    public Map<String, Object> getAllUsersStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        // Thống kê tổng quan - sử dụng điểm TOEIC thay vì phần trăm
        Long totalUsers = userRepository.count();
        Long totalTests = testResultRepository.count();
        Double overallAverageToeicScore = testResultRepository.findOverallAverageToeicScore();
        
        statistics.put("totalUsers", totalUsers);
        statistics.put("totalTests", totalTests);
        statistics.put("overallAverageScore", overallAverageToeicScore != null ? overallAverageToeicScore : 0.0);
        
        // Thống kê số bài test hoàn thành theo tháng (của tất cả users)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        // Lấy số liệu 6 tháng gần nhất
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusMonths(5).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        
        // Tạo danh sách các tháng trong khoảng thời gian
        Map<String, Long> testsByMonth = new HashMap<>();
        Map<String, Double> scoresByMonth = new HashMap<>();
        
        YearMonth current = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        while (!current.isAfter(end)) {
            String monthKey = current.format(formatter);
            testsByMonth.put(monthKey, 0L);
            scoresByMonth.put(monthKey, 0.0);
            current = current.plusMonths(1);
        }
        
        // Lấy tất cả kết quả trong khoảng thời gian
        List<TestResult> allResultsInRange = testResultRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate);
        
        // Thống kê theo tháng cho tất cả users
        Map<String, List<TestResult>> resultsByMonth = allResultsInRange.stream()
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
        
        statistics.put("testsByMonth", testsByMonth);
        statistics.put("scoresByMonth", scoresByMonth);
        
        // Top 5 users với điểm TOEIC cao nhất (loại bỏ điểm 0)
        List<Object[]> topUsers = testResultRepository.getTopUsersByAverageToeicScore(PageRequest.of(0, 5));
        List<Map<String, Object>> topUsersData = new ArrayList<>();
        
        for (Object[] row : topUsers) {
            Map<String, Object> userData = new HashMap<>();
            userData.put("userId", row[0]);
            userData.put("username", row[1]);
            userData.put("fullName", row[2]);
            userData.put("averageScore", row[3]); // Điểm TOEIC trung bình (thang 990)
            userData.put("totalTests", row[4]); // Số bài thi có điểm > 0
            topUsersData.add(userData);
        }
        
        statistics.put("topUsers", topUsersData);
        
        return statistics;
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