import axios from 'axios';
import { API_URL } from '../config/constants';
import authModule from '../modules/auth';
import { ToeicExam } from '@/types/toeic';

const TOEIC_EXAM_API_URL = API_URL ? `${API_URL}/tests` : 'http://localhost:8080/api/tests';

// Trả về tất cả TOEIC exams
export async function getAllExams(page = 0, size = 10, sort = 'id,asc') {
  console.log('API_URL:', API_URL);
  console.log('TOEIC_EXAM_API_URL:', TOEIC_EXAM_API_URL);
  try {
    const response = await axios.get(`${TOEIC_EXAM_API_URL}`, {
      params: { page, size, sort },
      ...authModule.createAuthConfig()
    });
    console.log('Kết quả getAllExams:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đề thi:', error);
    throw error;
  }
}

// Lấy các đề thi đang hoạt động
export async function getActiveExams() {
  try {
    const response = await axios.get(`${TOEIC_EXAM_API_URL}/active`, {
      ...authModule.createAuthConfig()
    });
    console.log('Kết quả getActiveExams:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đề thi hoạt động:', error);
    throw error;
  }
}

// Lấy đề thi bằng ID
export async function getExamById(id: number) {
  try {
    const response = await axios.get(`${TOEIC_EXAM_API_URL}/${id}`, {
      ...authModule.createAuthConfig()
    });
    console.log(`Kết quả getExamById(${id}):`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy đề thi ID=${id}:`, error);
    throw error;
  }
}

// Tạo đề thi mới
export async function createExam(exam: ToeicExam, questionGroupIds?: number[]) {
  try {
    console.log('Đang tạo đề thi mới:', exam);
    const requestData = {
      ...exam,
      questionGroupIds: questionGroupIds || []
    };
    
    console.log('API URL:', TOEIC_EXAM_API_URL);
    console.log('Request data:', requestData);
    
    const response = await axios.post(`${TOEIC_EXAM_API_URL}`, requestData, {
      ...authModule.createAuthConfig()
    });
    
    console.log('Kết quả tạo đề thi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo đề thi mới:', error);
    throw error;
  }
}

// Cập nhật đề thi
export async function updateExam(id: number, exam: ToeicExam, questionGroupIds?: number[]) {
  try {
    console.log(`Đang cập nhật đề thi ID=${id}:`, exam);
    console.log('Các nhóm câu hỏi được chọn:', questionGroupIds);
    
    // Tạo payload phù hợp với format yêu cầu của API
    const payload = {
      title: exam.title,
      description: exam.description || "",
      type: exam.type || "FULL",
      duration: exam.duration,
      instructions: exam.instructions || "",
      difficulty: exam.difficulty || "MEDIUM",
      questionGroupIds: questionGroupIds || []
    };
    
    console.log("Payload gửi đi:", payload);
    
    const response = await axios.put(`${TOEIC_EXAM_API_URL}/${id}`, payload, {
      ...authModule.createAuthConfig()
    });
    console.log('Kết quả cập nhật đề thi:', response.data);
    return response.data.data || response.data; // Hỗ trợ cả 2 format response
  } catch (error) {
    console.error(`Lỗi khi cập nhật đề thi ID=${id}:`, error);
    throw error;
  }
}

// Xóa đề thi
export async function deleteExam(id: number) {
  try {
    const response = await axios.delete(`${TOEIC_EXAM_API_URL}/${id}`, {
      ...authModule.createAuthConfig()
    });
    console.log(`Đã xóa đề thi ID=${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa đề thi ID=${id}:`, error);
    throw error;
  }
}

// Cập nhật trạng thái publish
export async function updateExamPublishStatus(id: number, isActive: boolean) {
  try {
    const response = await axios.put(
      `${TOEIC_EXAM_API_URL}/${id}/active/${isActive}`,
      
      {
        ...authModule.createAuthConfig()
      }
    );
    console.log(`Đã cập nhật trạng thái đề thi ID=${id} thành ${isActive ? 'active' : 'inactive'}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật trạng thái đề thi ID=${id}:`, error);
    throw error;
  }
}

// Lấy câu hỏi trong đề thi
export async function getExamQuestions(id: number, page = 0, size = 50, maxQuestions = 300) {
  try {
    // Kiểm tra đề thi có tồn tại không
    try {
      const response = await axios.get(`${TOEIC_EXAM_API_URL}/${id}/questions`, {
        params: { page: 0, size: maxQuestions },
        ...authModule.createAuthConfig(),
        timeout: 60000 // Tăng timeout lên 60 giây
      });
      console.log(`Kết quả getExamQuestions(${id}) - tải tất cả:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`Không thể tải tất cả câu hỏi cùng lúc, chuyển sang phương pháp phân trang`);
      
      // Nếu không thành công, chuyển sang phương pháp phân trang
      let allQuestions = [];
      let currentPage = 0;
      let hasMoreData = true;
      const pageSize = 10; // Giảm kích thước trang xuống 10 để tránh lỗi
      
      while (hasMoreData && currentPage < 30) { // Tăng số trang tối đa lên 30
        try {
          const response = await axios.get(`${TOEIC_EXAM_API_URL}/${id}/questions`, {
            params: { page: currentPage, size: pageSize },
            ...authModule.createAuthConfig(),
            timeout: 30000 // Timeout 30 giây cho mỗi request phân trang
          });
          
          const pageData = response.data;
          console.log(`Kết quả getExamQuestions(${id}) - trang ${currentPage}:`, pageData);
          
          if (Array.isArray(pageData) && pageData.length > 0) {
            allQuestions = [...allQuestions, ...pageData];
            currentPage++;
            
            // Nếu số lượng dữ liệu nhỏ hơn kích thước trang, không còn dữ liệu
            if (pageData.length < pageSize) {
              hasMoreData = false;
            }
          } else {
            hasMoreData = false;
          }
        } catch (error) {
          console.error(`Lỗi khi tải trang ${currentPage} của đề thi ID=${id}:`, error);
          
          // Đợi 2 giây trước khi thử lại trang tiếp theo
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Tăng trang để bỏ qua trang lỗi
          currentPage++;
          
          // Nếu đã thử nhiều trang mà vẫn lỗi, dừng lại
          if (currentPage > 5 && allQuestions.length === 0) {
            hasMoreData = false;
          }
        }
      }
      
      console.log(`Đã tải tổng cộng ${allQuestions.length} nhóm câu hỏi cho đề thi ID=${id}`);
      return allQuestions;
    }
  } catch (error) {
    console.error(`Lỗi khi lấy câu hỏi của đề thi ID=${id}:`, error);
    return [];
  }
}

// Thêm nhóm câu hỏi vào đề thi
export async function addQuestionGroupToExam(examId: number, questionGroupId: number) {
  try {
    const response = await axios.post(
      `${TOEIC_EXAM_API_URL}/${examId}/questions/group/${questionGroupId}`,
      {},
      {
        ...authModule.createAuthConfig()
      }
    );
    console.log(`Đã thêm nhóm câu hỏi ID=${questionGroupId} vào đề thi ID=${examId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi thêm nhóm câu hỏi ID=${questionGroupId} vào đề thi ID=${examId}:`, error);
    throw error;
  }
}

// Xóa nhóm câu hỏi khỏi đề thi
export async function removeQuestionGroupFromExam(examId: number, questionGroupId: number) {
  try {
    const response = await axios.delete(
      `${TOEIC_EXAM_API_URL}/${examId}/questions/group/${questionGroupId}`,
      {
        ...authModule.createAuthConfig()
      }
    );
    console.log(`Đã xóa nhóm câu hỏi ID=${questionGroupId} khỏi đề thi ID=${examId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa nhóm câu hỏi ID=${questionGroupId} khỏi đề thi ID=${examId}:`, error);
    throw error;
  }
} 