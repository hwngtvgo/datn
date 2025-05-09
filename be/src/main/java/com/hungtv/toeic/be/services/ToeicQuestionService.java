package com.hungtv.toeic.be.services;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hungtv.toeic.be.models.QuestionGroup;
import com.hungtv.toeic.be.models.Test;
import com.hungtv.toeic.be.models.ToeicOption;
import com.hungtv.toeic.be.models.ToeicQuestion;
import com.hungtv.toeic.be.payload.response.QuestionGroupResponse;
import com.hungtv.toeic.be.payload.response.QuestionResponse;
import com.hungtv.toeic.be.repositories.QuestionGroupRepository;
import com.hungtv.toeic.be.repositories.TestRepository;
import com.hungtv.toeic.be.repository.ToeicOptionRepository;
import com.hungtv.toeic.be.repository.ToeicQuestionRepository;

import jakarta.transaction.Transactional;

@Service
public class ToeicQuestionService {

    @Autowired
    private ToeicQuestionRepository questionRepository;
    
    @Autowired
    private QuestionGroupRepository questionGroupRepository;

    @Autowired
    private ToeicOptionRepository optionRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TestRepository testRepository;

    // Lấy tất cả câu hỏi với phân trang
    public Page<QuestionResponse> getAllQuestions(Pageable pageable) {
        return questionRepository.findAll(pageable)
                .map(QuestionResponse::new);
    }

    // Lấy câu hỏi theo ID
    public QuestionResponse getQuestionById(Long id) {
        ToeicQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi với ID: " + id));
        return new QuestionResponse(question);
    }

    // Tạo câu hỏi mới
    @Transactional
    public QuestionResponse createQuestion(ToeicQuestion questionRequest, Long questionGroupId) {
        try {
            // Kiểm tra trường bắt buộc
            if (questionRequest.getQuestion() == null || questionRequest.getQuestion().isEmpty()) {
                throw new RuntimeException("Câu hỏi không được để trống");
            }
            
            if (questionRequest.getCorrectAnswer() == null || questionRequest.getCorrectAnswer().isEmpty()) {
                throw new RuntimeException("Câu trả lời đúng không được để trống");
            }
            
            // Tìm nhóm câu hỏi
            QuestionGroup questionGroup = null;
            if (questionGroupId != null) {
                questionGroup = questionGroupRepository.findById(questionGroupId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm câu hỏi với ID: " + questionGroupId));
            }
            
            // Tạo câu hỏi mới
            ToeicQuestion question = new ToeicQuestion();
            question.setQuestion(questionRequest.getQuestion());
            question.setQuestionOrder(questionRequest.getQuestionOrder());
            question.setCorrectAnswer(questionRequest.getCorrectAnswer());
            question.setExplanation(questionRequest.getExplanation());
            question.setDifficultyLevel(questionRequest.getDifficultyLevel());
            
            // Nếu câu hỏi không thuộc về nhóm nào, set category
            if (questionGroup == null && questionRequest.getCategory() != null) {
                question.setCategory(questionRequest.getCategory());
            }
            
            // Liên kết với nhóm câu hỏi
            question.setQuestionGroup(questionGroup);
            
            // Lưu câu hỏi
            ToeicQuestion savedQuestion = questionRepository.save(question);
            
            // Lưu các tùy chọn
            if (questionRequest.getOptions() != null && !questionRequest.getOptions().isEmpty()) {
                for (ToeicOption option : questionRequest.getOptions()) {
                    option.setQuestion(savedQuestion);
                    optionRepository.save(option);
                }
            }
            
            return new QuestionResponse(savedQuestion);
            
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo câu hỏi: " + e.getMessage(), e);
        }
    }

    // Cập nhật câu hỏi
    @Transactional
    public QuestionResponse updateQuestion(Long id, ToeicQuestion questionRequest, Long questionGroupId) {
        try {
            // In log chi tiết cho việc debug
            System.out.println("ToeicQuestionService.updateQuestion: Đang cập nhật câu hỏi ID=" + id);
            System.out.println("- Thông tin đầu vào:");
            System.out.println("  - questionGroupId: " + questionGroupId);
            System.out.println("  - category: " + (questionRequest.getCategory() != null ? questionRequest.getCategory().name() : "null"));
            System.out.println("  - difficultyLevel: " + (questionRequest.getDifficultyLevel() != null ? questionRequest.getDifficultyLevel().name() : "null"));
            System.out.println("  - correctAnswer: " + questionRequest.getCorrectAnswer());
            System.out.println("  - số lượng options: " + (questionRequest.getOptions() != null ? questionRequest.getOptions().size() : 0));
            
            // Tìm câu hỏi hiện tại
            ToeicQuestion existingQuestion = questionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi với ID: " + id));
            
            // In log thông tin câu hỏi hiện tại
            System.out.println("- Thông tin câu hỏi hiện tại:");
            System.out.println("  - questionGroup: " + (existingQuestion.getQuestionGroup() != null ? existingQuestion.getQuestionGroup().getId() : "null"));
            System.out.println("  - category: " + (existingQuestion.getCategory() != null ? existingQuestion.getCategory().name() : "null"));
            
            // Cập nhật thông tin
            existingQuestion.setQuestion(questionRequest.getQuestion());
            existingQuestion.setQuestionOrder(questionRequest.getQuestionOrder());
            existingQuestion.setCorrectAnswer(questionRequest.getCorrectAnswer());
            existingQuestion.setExplanation(questionRequest.getExplanation());
            existingQuestion.setDifficultyLevel(questionRequest.getDifficultyLevel());
            
            // Cập nhật category nếu có
            if (questionRequest.getCategory() != null) {
                System.out.println("- Đang cập nhật category thành: " + questionRequest.getCategory().name());
                existingQuestion.setCategory(questionRequest.getCategory());
            } else {
                System.out.println("- Không cập nhật category vì giá trị đầu vào là null");
            }
            
            // Cập nhật nhóm câu hỏi nếu có
            if (questionGroupId != null) {
                System.out.println("- Đang cập nhật question group thành ID: " + questionGroupId);
                QuestionGroup newGroup = questionGroupRepository.findById(questionGroupId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm câu hỏi với ID: " + questionGroupId));
                existingQuestion.setQuestionGroup(newGroup);
            } else {
                // Nếu questionGroupId là null, đây là câu hỏi độc lập
                // Xóa liên kết với nhóm câu hỏi (nếu có)
                System.out.println("- Đang đặt question group thành null (câu hỏi độc lập)");
                existingQuestion.setQuestionGroup(null);
            }
            
            // ===== XỬ LÝ CÁC TÙY CHỌN =====
            // Phương pháp cải tiến: xóa tất cả options cũ và tạo mới options thay vì cập nhật
            
            // Lưu câu hỏi trước để đảm bảo có ID
            System.out.println("- Đang lưu câu hỏi vào database");
            ToeicQuestion updatedQuestion = questionRepository.save(existingQuestion);
            
            // 1. Tạo bản sao của danh sách options hiện tại để tránh lỗi ConcurrentModificationException
            List<ToeicOption> oldOptions = new ArrayList<>(existingQuestion.getOptions());
            
            // 2. Xóa tất cả options khỏi câu hỏi (xóa mối quan hệ)
            System.out.println("- Đang xóa " + oldOptions.size() + " tùy chọn cũ");
            existingQuestion.getOptions().clear();
            // Lưu câu hỏi sau khi xóa các options
            updatedQuestion = questionRepository.save(existingQuestion);
            
            // 3. Xóa các options cũ khỏi database
            for (ToeicOption oldOption : oldOptions) {
                optionRepository.delete(oldOption);
            }
            
            // 4. Tạo và thêm các options mới
            if (questionRequest.getOptions() != null && !questionRequest.getOptions().isEmpty()) {
                System.out.println("- Đang thêm " + questionRequest.getOptions().size() + " tùy chọn mới");
                for (ToeicOption optionRequest : questionRequest.getOptions()) {
                    // Tạo option mới thay vì cập nhật option cũ
                    ToeicOption newOption = new ToeicOption();
                    newOption.setOptionKey(optionRequest.getOptionKey());
                    newOption.setOptionText(optionRequest.getOptionText());
                    newOption.setQuestion(updatedQuestion);
                    
                    // Lưu option mới
                    optionRepository.save(newOption);
                }
            }
            
            // Tải lại câu hỏi từ database để đảm bảo có tất cả dữ liệu mới nhất
            updatedQuestion = questionRepository.findById(id).orElse(updatedQuestion);
            
            System.out.println("- Cập nhật hoàn thành. Câu hỏi sau khi cập nhật:");
            System.out.println("  - ID: " + updatedQuestion.getId());
            System.out.println("  - category: " + (updatedQuestion.getCategory() != null ? updatedQuestion.getCategory().name() : "null"));
            System.out.println("  - questionGroup: " + (updatedQuestion.getQuestionGroup() != null ? updatedQuestion.getQuestionGroup().getId() : "null"));
            
            return new QuestionResponse(updatedQuestion);
            
        } catch (Exception e) {
            System.out.println("- LỖI: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi cập nhật câu hỏi: " + e.getMessage(), e);
        }
    }

    // Xóa câu hỏi
    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy câu hỏi với ID: " + id);
        }
        
        questionRepository.deleteById(id);
    }
    
    // Tạo nhóm câu hỏi
    @Transactional
    public QuestionGroupResponse createQuestionGroup(String questionsJson, 
                                                    MultipartFile audioFile, 
                                                    MultipartFile imageFile,
                                                    String passage,
                                                    Integer part,
                                                    Long testId) {
        try {
            // Parse JSON string to ToeicQuestion list
            List<ToeicQuestion> questionsRequest = objectMapper.readValue(
                    questionsJson, 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ToeicQuestion.class)
            );
            
            if (questionsRequest.isEmpty()) {
                throw new RuntimeException("Cần ít nhất một câu hỏi để tạo nhóm");
            }
            
            // Lấy loại câu hỏi (Listening/Reading) dựa vào part
            QuestionGroup.QuestionType questionType = determineQuestionType(part);
            
            // Validate dựa trên part
            validateByPart(questionsRequest, part, questionType, audioFile, imageFile, passage);
            
            // Upload files nếu có
            String audioUrl = null;
            if (audioFile != null && !audioFile.isEmpty()) {
                audioUrl = fileStorageService.storeFile(audioFile, "audio");
            }
            
            String imageUrl = null;
            if (imageFile != null && !imageFile.isEmpty()) {
                imageUrl = fileStorageService.storeFile(imageFile, "images");
            }
            
            // Tạo và lưu question group
            QuestionGroup questionGroup = new QuestionGroup();
            questionGroup.setQuestionType(questionType);
            questionGroup.setPart(part);
            questionGroup.setAudioUrl(audioUrl);
            questionGroup.setImageUrl(imageUrl);
            questionGroup.setPassage(passage);
            
            // Nếu có testId, liên kết với test
            if (testId != null) {
                // Tìm Test theo ID
                Test test = testRepository.findById(testId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi với ID: " + testId));
                questionGroup.setTest(test);
            }
            
            QuestionGroup savedGroup = questionGroupRepository.save(questionGroup);
            
            // Lưu từng câu hỏi trong nhóm
            List<ToeicQuestion> savedQuestions = new ArrayList<>();
            for (int i = 0; i < questionsRequest.size(); i++) {
                ToeicQuestion question = questionsRequest.get(i);
                
                // Thiết lập thông tin cho câu hỏi
                question.setQuestionGroup(savedGroup);
                question.setQuestionOrder(i + 1);
                
                // Lưu câu hỏi
                ToeicQuestion savedQuestion = questionRepository.save(question);
                
                // Lưu các tùy chọn
                if (question.getOptions() != null && !question.getOptions().isEmpty()) {
                    for (ToeicOption option : question.getOptions()) {
                        option.setQuestion(savedQuestion);
                        optionRepository.save(option);
                    }
                }
                
                savedQuestions.add(savedQuestion);
            }
            
            // Tạo response
            QuestionGroupResponse response = new QuestionGroupResponse();
            response.setId(savedGroup.getId());
            response.setQuestionType(savedGroup.getQuestionType().name());
            response.setPart(savedGroup.getPart());
            response.setAudioUrl(savedGroup.getAudioUrl());
            response.setImageUrl(savedGroup.getImageUrl());
            response.setPassage(savedGroup.getPassage());
            response.setTestId(savedGroup.getTest() != null ? savedGroup.getTest().getId() : null);
            response.setQuestions(savedQuestions.stream()
                    .map(QuestionResponse::new)
                    .collect(Collectors.toList()));
            
            return response;
            
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo nhóm câu hỏi: " + e.getMessage(), e);
        }
    }
    
    // Lấy câu hỏi theo nhóm
    public QuestionGroupResponse getQuestionsByGroupId(Long groupId) {
        QuestionGroup group = questionGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm câu hỏi với ID: " + groupId));
        
        List<ToeicQuestion> questions = questionRepository.findByQuestionGroupIdOrderByQuestionOrder(groupId);
        
        // Tạo response
        QuestionGroupResponse response = new QuestionGroupResponse();
        response.setId(group.getId());
        response.setQuestionType(group.getQuestionType().name());
        response.setPart(group.getPart());
        response.setAudioUrl(group.getAudioUrl());
        response.setImageUrl(group.getImageUrl());
        response.setPassage(group.getPassage());
        response.setTestId(group.getTest() != null ? group.getTest().getId() : null);
        response.setQuestions(questions.stream()
                .map(QuestionResponse::new)
                .collect(Collectors.toList()));
        
        return response;
    }
    
    // Lấy câu hỏi theo nhóm listening
    public QuestionGroupResponse getQuestionsByListeningGroup(Long groupId) {
        List<ToeicQuestion> questions = questionRepository.findByListeningGroupOrderByQuestionOrder(groupId);
        if (questions.isEmpty()) {
            throw new RuntimeException("Không tìm thấy nhóm listening với ID: " + groupId);
        }
        
        return getQuestionsByGroupId(groupId);
    }
    
    // Lấy câu hỏi theo nhóm reading
    public QuestionGroupResponse getQuestionsByReadingGroup(Long groupId) {
        List<ToeicQuestion> questions = questionRepository.findByReadingGroupOrderByQuestionOrder(groupId);
        if (questions.isEmpty()) {
            throw new RuntimeException("Không tìm thấy nhóm reading với ID: " + groupId);
        }
        
        return getQuestionsByGroupId(groupId);
    }
    
    // Phương thức updateQuestionGroup cải tiến
    @Transactional
    public QuestionGroupResponse updateQuestionGroup(Long groupId, String questionsJson, Integer part,
                                                    MultipartFile audioFile, MultipartFile imageFile, String passage) {
        try {
            // Lấy thông tin nhóm câu hỏi hiện tại
            QuestionGroup group = questionGroupRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm câu hỏi với ID: " + groupId));
            
            // Cập nhật part nếu được cung cấp
            if (part != null) {
                group.setPart(part);
                // Cập nhật questionType dựa trên part mới
                group.setQuestionType(determineQuestionType(part));
            }
            
            // Parse JSON string to ToeicQuestion list
            List<ToeicQuestion> questionsRequest;
            try {
                questionsRequest = objectMapper.readValue(
                    questionsJson, 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ToeicQuestion.class)
            );
                System.out.println("Đã parse " + questionsRequest.size() + " câu hỏi từ JSON");
            } catch (Exception e) {
                System.out.println("Lỗi khi parse JSON: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Không thể xử lý dữ liệu câu hỏi: " + e.getMessage());
            }
            
            QuestionGroup.QuestionType questionType = group.getQuestionType();
            Integer groupPart = group.getPart();
            
            // Validate dựa trên part
            System.out.println("Kiểm tra validate trước khi cập nhật...");
            validateByPart(questionsRequest, groupPart, questionType, audioFile, imageFile, passage, group.getAudioUrl());
            System.out.println("Validate thành công, tiếp tục cập nhật...");
            
            // Upload files nếu có
            String audioUrl = group.getAudioUrl();
            if (audioFile != null && !audioFile.isEmpty()) {
                System.out.println("Đang upload file âm thanh mới...");
                audioUrl = fileStorageService.storeFile(audioFile, "audio");
                System.out.println("Upload thành công, audioUrl mới: " + audioUrl);
            } else {
                System.out.println("Giữ nguyên audioUrl cũ: " + audioUrl);
            }
            
            String imageUrl = group.getImageUrl();
            if (imageFile != null && !imageFile.isEmpty()) {
                System.out.println("Đang upload file hình ảnh mới...");
                imageUrl = fileStorageService.storeFile(imageFile, "images");
                System.out.println("Upload thành công, imageUrl mới: " + imageUrl);
            } else {
                System.out.println("Giữ nguyên imageUrl cũ: " + imageUrl);
            }
            
            // Cập nhật thông tin group
            group.setAudioUrl(audioUrl);
            group.setImageUrl(imageUrl);
            if (passage != null) {
                group.setPassage(passage);
            }
            
            // Lưu group đã cập nhật
            QuestionGroup savedGroup = questionGroupRepository.save(group);
            System.out.println("Đã lưu thông tin nhóm câu hỏi với ID=" + savedGroup.getId());
            
            // Lấy danh sách câu hỏi hiện có 
            List<ToeicQuestion> existingQuestions = questionRepository.findByQuestionGroupIdOrderByQuestionOrder(groupId);
            System.out.println("Đã tìm thấy " + existingQuestions.size() + " câu hỏi hiện có");
            
            // Tạo map ID -> câu hỏi hiện có để dễ tìm kiếm
            Map<Long, ToeicQuestion> existingQuestionMap = existingQuestions.stream()
                    .collect(Collectors.toMap(ToeicQuestion::getId, Function.identity()));
            
            // Danh sách câu hỏi đã xử lý
            List<ToeicQuestion> savedQuestions = new ArrayList<>();
            Set<Long> processedQuestionIds = new HashSet<>();
            
            for (int i = 0; i < questionsRequest.size(); i++) {
                ToeicQuestion questionRequest = questionsRequest.get(i);
                
                // Thiết lập thông tin chung cho câu hỏi
                questionRequest.setQuestionGroup(savedGroup);
                questionRequest.setQuestionOrder(i + 1);
                
                ToeicQuestion savedQuestion;
                
                if (questionRequest.getId() != null && existingQuestionMap.containsKey(questionRequest.getId())) {
                    // Câu hỏi đã tồn tại, cập nhật
                    Long questionId = questionRequest.getId();
                    ToeicQuestion existingQuestion = existingQuestionMap.get(questionId);
                    System.out.println("Cập nhật câu hỏi hiện có ID=" + existingQuestion.getId());
                    
                    // Cập nhật thông tin cơ bản
                    existingQuestion.setQuestion(questionRequest.getQuestion());
                    existingQuestion.setCorrectAnswer(questionRequest.getCorrectAnswer());
                    existingQuestion.setExplanation(questionRequest.getExplanation());
                    existingQuestion.setDifficultyLevel(questionRequest.getDifficultyLevel());
                    existingQuestion.setQuestionOrder(i + 1);
                    
                    // Lưu câu hỏi đã cập nhật
                    savedQuestion = questionRepository.save(existingQuestion);
                    System.out.println("Đã lưu cập nhật câu hỏi ID=" + savedQuestion.getId());
                    
                    // Xóa các tùy chọn cũ và thêm các tùy chọn mới
                    // QUAN TRỌNG: Cần tạo danh sách mới để tránh lỗi ConcurrentModificationException
                    if (existingQuestion.getOptions() != null && !existingQuestion.getOptions().isEmpty()) {
                        List<ToeicOption> optionsToDelete = new ArrayList<>(existingQuestion.getOptions());
                        System.out.println("Xóa " + optionsToDelete.size() + " tùy chọn cũ");
                        
                        // Xóa khỏi entity trước
                        existingQuestion.getOptions().clear();
                        
                        // Sau đó xóa khỏi database
                        for (ToeicOption option : optionsToDelete) {
                            optionRepository.delete(option);
                        }
                    }
                    
                    // Thêm các tùy chọn mới
                    if (questionRequest.getOptions() != null && !questionRequest.getOptions().isEmpty()) {
                        System.out.println("Thêm " + questionRequest.getOptions().size() + " tùy chọn mới");
                        for (ToeicOption optionRequest : questionRequest.getOptions()) {
                            // Tạo mới tùy chọn thay vì sử dụng tùy chọn từ request
                            ToeicOption newOption = new ToeicOption();
                            newOption.setOptionKey(optionRequest.getOptionKey());
                            newOption.setOptionText(optionRequest.getOptionText());
                            newOption.setQuestion(savedQuestion);
                            
                            // Lưu tùy chọn mới
                            optionRepository.save(newOption);
                        }
                    }
                    
                    processedQuestionIds.add(questionId);
                } else {
                    // Câu hỏi mới hoặc ID không tồn tại, tạo mới
                    // Đảm bảo ID là null để tránh xung đột
                    questionRequest.setId(null);
                    System.out.println("Tạo mới câu hỏi");
                    
                    // Lưu câu hỏi mới
                    savedQuestion = questionRepository.save(questionRequest);
                    System.out.println("Đã tạo mới câu hỏi với ID=" + savedQuestion.getId());
                    
                    // Tạo các tùy chọn mới
                    if (questionRequest.getOptions() != null && !questionRequest.getOptions().isEmpty()) {
                        for (ToeicOption optionRequest : questionRequest.getOptions()) {
                            // Đảm bảo ID của tùy chọn là null
                            optionRequest.setId(null);
                            optionRequest.setQuestion(savedQuestion);
                            
                            // Lưu tùy chọn mới
                            optionRepository.save(optionRequest);
                        }
                    }
                }
                
                savedQuestions.add(savedQuestion);
            }
            
            // Xóa các câu hỏi không còn trong request
            for (ToeicQuestion existingQuestion : existingQuestions) {
                if (!processedQuestionIds.contains(existingQuestion.getId())) {
                    System.out.println("Xóa câu hỏi không còn sử dụng ID=" + existingQuestion.getId());
                    deleteQuestion(existingQuestion.getId());
                }
            }
            
            // Tạo response
            QuestionGroupResponse response = new QuestionGroupResponse();
            response.setId(savedGroup.getId());
            response.setQuestionType(savedGroup.getQuestionType().name());
            response.setPart(savedGroup.getPart());
            response.setAudioUrl(savedGroup.getAudioUrl());
            response.setImageUrl(savedGroup.getImageUrl());
            response.setPassage(savedGroup.getPassage());
            response.setTestId(savedGroup.getTest() != null ? savedGroup.getTest().getId() : null);
            
            // Làm mới danh sách câu hỏi để đảm bảo dữ liệu mới nhất
            List<ToeicQuestion> refreshedQuestions = questionRepository.findByQuestionGroupIdOrderByQuestionOrder(groupId);
            response.setQuestions(refreshedQuestions.stream()
                    .map(QuestionResponse::new)
                    .collect(Collectors.toList()));
            
            System.out.println("Cập nhật nhóm câu hỏi thành công với " + refreshedQuestions.size() + " câu hỏi");
            return response;
            
        } catch (Exception e) {
            System.out.println("Lỗi chi tiết khi cập nhật nhóm câu hỏi: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi cập nhật nhóm câu hỏi: " + e.getMessage(), e);
        }
    }
    
    // Xóa nhóm câu hỏi
    @Transactional
    public void deleteQuestionGroup(Long groupId) {
        // Lấy nhóm câu hỏi
        QuestionGroup group = questionGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm câu hỏi với ID: " + groupId));
        
        // Lấy danh sách câu hỏi trong nhóm
        List<ToeicQuestion> questions = questionRepository.findByQuestionGroupIdOrderByQuestionOrder(groupId);
        
        // Lấy danh sách bài thi chứa nhóm câu hỏi này
        List<Test> relatedTests = testRepository.findByQuestionGroupsContaining(group);
        
        // Xóa mối quan hệ giữa nhóm câu hỏi và các bài thi
        for (Test test : relatedTests) {
            // Xóa nhóm câu hỏi khỏi bài thi
            test.removeQuestionGroup(group);
            testRepository.save(test);
        }
        
        // Xóa từng câu hỏi
        questions.forEach(q -> deleteQuestion(q.getId()));
        
        // Xóa nhóm
        questionGroupRepository.deleteById(groupId);
    }
    
    // Lấy tất cả nhóm câu hỏi
    public List<QuestionGroupResponse> getAllQuestionGroups() {
        List<QuestionGroup> groups = questionGroupRepository.findAll();
        
        return groups.stream()
                .map(group -> {
                    List<ToeicQuestion> questions = questionRepository.findByQuestionGroupIdOrderByQuestionOrder(group.getId());
                    
                    QuestionGroupResponse response = new QuestionGroupResponse();
                    response.setId(group.getId());
                    response.setQuestionType(group.getQuestionType().name());
                    response.setPart(group.getPart());
                    response.setAudioUrl(group.getAudioUrl());
                    response.setImageUrl(group.getImageUrl());
                    response.setPassage(group.getPassage());
                    response.setTestId(group.getTest() != null ? group.getTest().getId() : null);
                    response.setQuestions(questions.stream()
                            .map(QuestionResponse::new)
                            .collect(Collectors.toList()));
                    
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    // Lấy câu hỏi độc lập (standalone) theo phân trang
    public Page<QuestionResponse> getStandaloneQuestions(Pageable pageable) {
        return questionRepository.findStandaloneQuestions(pageable)
                .map(QuestionResponse::new);
    }
    
    // Lấy câu hỏi độc lập theo category với phân trang
    public Page<QuestionResponse> getStandaloneQuestionsByCategory(ToeicQuestion.QuestionCategory category, Pageable pageable) {
        return questionRepository.findStandaloneQuestionsByCategory(category, pageable)
                .map(QuestionResponse::new);
    }
    
    // Lấy tất cả câu hỏi theo category với phân trang
    public Page<QuestionResponse> getQuestionsByCategory(ToeicQuestion.QuestionCategory category, Pageable pageable) {
        return questionRepository.findByCategory(category, pageable)
                .map(QuestionResponse::new);
    }
    
    // Tìm kiếm câu hỏi độc lập theo từ khóa
    public Page<QuestionResponse> searchStandaloneQuestions(String keyword, Pageable pageable) {
        return questionRepository.searchStandaloneQuestions(keyword, pageable)
                .map(QuestionResponse::new);
    }
    
    // Helper methods
    
    private void validateByPart(List<ToeicQuestion> questions, int part, QuestionGroup.QuestionType questionType, 
                               MultipartFile audioFile, MultipartFile imageFile, String passage, String existingAudioUrl) {
        System.out.println("validateByPart: part=" + part + ", questionType=" + questionType);
        System.out.println("- audioFile: " + (audioFile != null ? "Có" : "Không có"));
        System.out.println("- audioFile isEmpty: " + (audioFile != null ? (audioFile.isEmpty() ? "Rỗng" : "Có nội dung") : "N/A"));
        System.out.println("- existingAudioUrl: " + (existingAudioUrl != null ? existingAudioUrl : "Không có"));
        System.out.println("- passage: " + (passage != null ? "Có" : "Không có"));
        
        // Phần 1-4 là Listening, phần 5-7 là Reading
        if (part >= 1 && part <= 4 && questionType != QuestionGroup.QuestionType.LISTENING) {
            throw new RuntimeException("Phần " + part + " phải có loại LISTENING");
        }
        
        if (part >= 5 && part <= 7 && questionType != QuestionGroup.QuestionType.READING) {
            throw new RuntimeException("Phần " + part + " phải có loại READING");
        }
        
        // Kiểm tra các yêu cầu theo từng part
        boolean hasNewAudioFile = audioFile != null && !audioFile.isEmpty();
        boolean hasExistingAudioFile = existingAudioUrl != null && !existingAudioUrl.isEmpty();
        boolean hasAudioFile = hasNewAudioFile || hasExistingAudioFile;
        
        System.out.println("- hasNewAudioFile: " + hasNewAudioFile);
        System.out.println("- hasExistingAudioFile: " + hasExistingAudioFile);
        System.out.println("- hasAudioFile (tổng hợp): " + hasAudioFile);
        
        if ((part == 1 || part == 2) && !hasAudioFile) {
            throw new RuntimeException("Part 1 và 2 yêu cầu phải có file âm thanh");
        }
        
        if ((part == 3 || part == 4) && !hasAudioFile) {
            throw new RuntimeException("Part 3 và 4 yêu cầu phải có file âm thanh chung");
        }
        
        // Chỉ kiểm tra passage cho part 6-7 nếu đây là lần tạo mới, hoặc nếu passage rỗng
        if ((part == 6 || part == 7) && (passage == null || passage.isEmpty())) {
            throw new RuntimeException("Part 6 và 7 yêu cầu phải có đoạn văn chung");
        }
        
        // Kiểm tra số lượng câu hỏi
        if ((part == 3 || part == 4) && questions.size() < 3) {
            throw new RuntimeException("Part 3 và 4 yêu cầu phải có ít nhất 3 câu hỏi");
        }
        
        if ((part == 6 || part == 7) && questions.size() < 2) {
            throw new RuntimeException("Part 6 và 7 yêu cầu phải có ít nhất 2 câu hỏi");
        }
    }
    
    // Phương thức overload cho trường hợp không có audioUrl sẵn (dành cho tạo mới)
    private void validateByPart(List<ToeicQuestion> questions, int part, QuestionGroup.QuestionType questionType, 
                               MultipartFile audioFile, MultipartFile imageFile, String passage) {
        System.out.println("Gọi validateByPart không có existingAudioUrl (tạo mới)");
        validateByPart(questions, part, questionType, audioFile, imageFile, passage, null);
    }
    
    // Xác định loại câu hỏi (Listening/Reading) dựa vào phần thi
    private QuestionGroup.QuestionType determineQuestionType(int part) {
        if (part >= 1 && part <= 4) {
            return QuestionGroup.QuestionType.LISTENING;
        } else if (part >= 5 && part <= 7) {
            return QuestionGroup.QuestionType.READING;
        } else {
            throw new RuntimeException("Phần thi không hợp lệ: " + part);
        }
    }
}