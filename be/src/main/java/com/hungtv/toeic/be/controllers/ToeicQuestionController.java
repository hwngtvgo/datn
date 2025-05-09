package com.hungtv.toeic.be.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.hungtv.toeic.be.models.QuestionGroup;
import com.hungtv.toeic.be.models.ToeicQuestion;
import com.hungtv.toeic.be.payload.response.ApiResponse;
import com.hungtv.toeic.be.payload.response.QuestionGroupResponse;
import com.hungtv.toeic.be.payload.response.QuestionResponse;
import com.hungtv.toeic.be.repositories.QuestionGroupRepository;
import com.hungtv.toeic.be.services.ToeicQuestionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/toeic-questions")
public class ToeicQuestionController {

    @Autowired
    private ToeicQuestionService questionService;
    
    @Autowired
    private QuestionGroupRepository questionGroupRepository;

    // Lấy tất cả câu hỏi với phân trang
    @GetMapping
    public ResponseEntity<Page<QuestionResponse>> getAllQuestions(Pageable pageable) {
        return ResponseEntity.ok(questionService.getAllQuestions(pageable));
    }

    // Lấy tất cả nhóm câu hỏi
    @GetMapping("/question-groups")
    public ResponseEntity<List<QuestionGroupResponse>> getAllQuestionGroups() {
        try {
            return ResponseEntity.ok(questionService.getAllQuestionGroups());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Lấy câu hỏi theo ID
    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponse> getQuestionById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(questionService.getQuestionById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Lấy câu hỏi độc lập (không thuộc question group nào)
    @GetMapping("/standalone")
    public ResponseEntity<Page<QuestionResponse>> getStandaloneQuestions(Pageable pageable) {
        return ResponseEntity.ok(questionService.getStandaloneQuestions(pageable));
    }
    
    // Lấy câu hỏi độc lập theo category
    @GetMapping("/standalone/category/{category}")
    public ResponseEntity<Page<QuestionResponse>> getStandaloneQuestionsByCategory(
            @PathVariable ToeicQuestion.QuestionCategory category, Pageable pageable) {
        return ResponseEntity.ok(questionService.getStandaloneQuestionsByCategory(category, pageable));
    }
    
    // Lấy tất cả câu hỏi theo category
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<QuestionResponse>> getQuestionsByCategory(
            @PathVariable ToeicQuestion.QuestionCategory category, Pageable pageable) {
        return ResponseEntity.ok(questionService.getQuestionsByCategory(category, pageable));
    }
    
    // Tìm kiếm câu hỏi độc lập theo từ khóa
    @GetMapping("/standalone/search")
    public ResponseEntity<Page<QuestionResponse>> searchStandaloneQuestions(
            @RequestParam String keyword, Pageable pageable) {
        return ResponseEntity.ok(questionService.searchStandaloneQuestions(keyword, pageable));
    }

    // Tạo câu hỏi mới
    @PostMapping
    public ResponseEntity<QuestionResponse> createQuestion(
            @Valid @RequestBody ToeicQuestion questionRequest,
            @RequestParam(value = "questionGroupId", required = false) Long questionGroupId) {
        try {
            QuestionResponse createdQuestion = questionService.createQuestion(questionRequest, questionGroupId);
            return new ResponseEntity<>(createdQuestion, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Cập nhật câu hỏi
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable Long id, 
            @Valid @RequestBody ToeicQuestion questionRequest,
            @RequestParam(value = "questionGroupId", required = false) Long questionGroupId) {
        try {
            // In ra log để kiểm tra dữ liệu
            System.out.println("ToeicQuestionController.updateQuestion: Đang cập nhật câu hỏi ID=" + id);
            System.out.println("- questionGroupId=" + questionGroupId);
            System.out.println("- category=" + (questionRequest.getCategory() != null ? questionRequest.getCategory().name() : "null"));
            System.out.println("- difficultyLevel=" + (questionRequest.getDifficultyLevel() != null ? questionRequest.getDifficultyLevel().name() : "null"));
            
            QuestionResponse updatedQuestion = questionService.updateQuestion(id, questionRequest, questionGroupId);
            return ResponseEntity.ok(updatedQuestion);
        } catch (RuntimeException e) {
            System.out.println("Lỗi khi cập nhật câu hỏi: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Lỗi khi cập nhật câu hỏi: " + e.getMessage()));
        }
    }

    // Xóa câu hỏi
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        try {
            questionService.deleteQuestion(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa câu hỏi thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }
    
    // Tạo nhóm câu hỏi
    @PostMapping(value = "/create-group", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<QuestionGroupResponse> createQuestionGroup(
            @RequestParam("questionsJson") String questionsJson,
            @RequestParam("part") Integer part,
            @RequestParam(value = "testId", required = false) Long testId,
            @RequestParam(value = "audioFile", required = false) MultipartFile audioFile,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "passage", required = false) String passage) {
        
        try {
            QuestionGroupResponse createdGroupResponse = questionService.createQuestionGroup(
                    questionsJson, audioFile, imageFile, passage, part, testId);
            
            return new ResponseEntity<>(createdGroupResponse, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Lấy câu hỏi theo nhóm ID
    @GetMapping("/question-group/{groupId}")
    public ResponseEntity<QuestionGroupResponse> getQuestionsByGroupId(@PathVariable Long groupId) {
        try {
            return ResponseEntity.ok(questionService.getQuestionsByGroupId(groupId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Lấy câu hỏi theo nhóm listening
    @GetMapping("/listening-group/{groupId}")
    public ResponseEntity<QuestionGroupResponse> getQuestionsByListeningGroup(@PathVariable Long groupId) {
        try {
            return ResponseEntity.ok(questionService.getQuestionsByListeningGroup(groupId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Lấy câu hỏi theo nhóm reading
    @GetMapping("/reading-group/{groupId}")
    public ResponseEntity<QuestionGroupResponse> getQuestionsByReadingGroup(@PathVariable Long groupId) {
        try {
            return ResponseEntity.ok(questionService.getQuestionsByReadingGroup(groupId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Cập nhật nhóm câu hỏi
    @PutMapping(value = "/question-group/{groupId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<QuestionGroupResponse> updateQuestionGroup(
            @PathVariable Long groupId,
            @RequestParam("questionsJson") String questionsJson,
            @RequestParam("part") Integer part,
            @RequestParam(value = "audioFile", required = false) MultipartFile audioFile,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "passage", required = false) String passage) {
        
        try {
            System.out.println("ToeicQuestionController.updateQuestionGroup: Đang cập nhật nhóm câu hỏi ID=" + groupId);
            System.out.println("- part=" + part);
            System.out.println("- passage=" + (passage != null ? "Có dữ liệu, độ dài: " + passage.length() : "null"));
            
            // Kiểm tra chi tiết file âm thanh
            if (audioFile != null) {
                if (audioFile.isEmpty()) {
                    System.out.println("- audioFile: Có nhưng RỖNG");
                    // Đặt audioFile thành null nếu rỗng để logic phía sau hoạt động đúng
                    audioFile = null;
                } else {
                    System.out.println("- audioFile: Có");
                    System.out.println("  + Tên file: " + audioFile.getOriginalFilename());
                    System.out.println("  + Kích thước: " + audioFile.getSize() + " bytes");
                    System.out.println("  + Loại file: " + audioFile.getContentType());
                }
            } else {
                System.out.println("- audioFile: null (không có file được gửi)");
            }
            
            // Kiểm tra chi tiết file hình ảnh
            if (imageFile != null) {
                if (imageFile.isEmpty()) {
                    System.out.println("- imageFile: Có nhưng RỖNG");
                    // Đặt imageFile thành null nếu rỗng để logic phía sau hoạt động đúng
                    imageFile = null;
                } else {
                    System.out.println("- imageFile: Có");
                    System.out.println("  + Tên file: " + imageFile.getOriginalFilename());
                    System.out.println("  + Kích thước: " + imageFile.getSize() + " bytes");
                    System.out.println("  + Loại file: " + imageFile.getContentType());
                }
            } else {
                System.out.println("- imageFile: null (không có file được gửi)");
            }
            
            System.out.println("- questionsJson length=" + (questionsJson != null ? questionsJson.length() : "null"));
            
            // Lấy thông tin nhóm câu hỏi hiện tại để kiểm tra
            QuestionGroup group = questionGroupRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm câu hỏi với ID: " + groupId));
            
            System.out.println("- Hiện tại: audioUrl=" + (group.getAudioUrl() != null ? group.getAudioUrl() : "null"));
            System.out.println("- Hiện tại: imageUrl=" + (group.getImageUrl() != null ? group.getImageUrl() : "null"));
            System.out.println("- Hiện tại: part=" + group.getPart() + ", type=" + group.getQuestionType());
            
            try {
                QuestionGroupResponse updatedGroupResponse = questionService.updateQuestionGroup(
                        groupId, questionsJson, part, audioFile, imageFile, passage);
                
                System.out.println("Cập nhật nhóm câu hỏi thành công, trả về kết quả");
                return ResponseEntity.ok(updatedGroupResponse);
            } catch (Exception e) {
                System.out.println("Lỗi khi xử lý cập nhật nhóm câu hỏi: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
            }
        } catch (Exception e) {
            System.out.println("Lỗi khi nhận request cập nhật nhóm câu hỏi: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(null);
        }
    }
    
    // Xóa nhóm câu hỏi
    @DeleteMapping("/question-group/{groupId}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestionGroup(@PathVariable Long groupId) {
        try {
            questionService.deleteQuestionGroup(groupId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa nhóm câu hỏi thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }
}