import axios from 'axios';
import { QuestionType, DifficultyLevel, QuestionCategory } from '@/types/toeic';
import { TokenStorage } from '../utils/token-storage';
import { API_URL } from '../config/constants';
import authModule from '../modules/auth';

// API URL với giá trị mặc định để tránh undefined
const API_URL_LOCAL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
console.log('toeicQuestionService - API URL:', API_URL_LOCAL);

// URL gốc của API
const TOEIC_QUESTIONS_API_URL = API_URL ? `${API_URL}/toeic-questions` : API_URL_LOCAL + '/toeic-questions';
// Endpoint cho nhóm câu hỏi đã được cấu hình trong controller
const QUESTION_GROUPS_API_URL = API_URL ? `${API_URL}/question-groups` : API_URL_LOCAL + '/question-groups';

console.log('TOEIC_QUESTIONS_API_URL:', TOEIC_QUESTIONS_API_URL);
console.log('QUESTION_GROUPS_API_URL:', QUESTION_GROUPS_API_URL);

// Lấy token từ localStorage (user data)
const getUserToken = (): string | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      if (userData && userData.accessToken) {
        return userData.accessToken;
      }
    }
    return TokenStorage.getToken();
  } catch (err) {
    console.error('Lỗi khi lấy token:', err);
    return null;
  }
};

// Tạo một instance axios không sử dụng interceptor và bỏ qua xác thực
const noAuthAxios = axios.create({
  baseURL: API_URL_LOCAL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interface cho phân trang
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    }
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// Interface cho tùy chọn của câu hỏi TOEIC
export interface ToeicOptionDTO {
  id?: number;
  optionKey: string;
  optionText: string;
}

// Interface cho câu hỏi TOEIC
export interface ToeicQuestionDTO {
  id?: number;
  type?: QuestionType;
  part?: number;
  question: string;
  correctAnswer: string;
  difficultyLevel: DifficultyLevel;
  explanation?: string;
  questionOrder?: number;
  questionGroupId?: number;
  audioUrl?: string;
  imageUrl?: string;
  passage?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: QuestionCategory;
  options: ToeicOptionDTO[];
}

// Interface cho nhóm câu hỏi
export interface QuestionGroupDTO {
  id?: number;
  title?: string;
  type: QuestionType;
  part: number;
  passage?: string;
  audioUrl?: string;
  imageUrl?: string;
  questions: ToeicQuestionDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionGroupResponse {
  id: number;
  title?: string;
  type: string;
  part: number;
  passage?: string;
  audioUrl?: string;
  imageUrl?: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

// Interface cho response của câu hỏi
export interface QuestionResponse {
  id: number;
  question: string;
  correctAnswer: string;
  explanation?: string;
  difficultyLevel: DifficultyLevel;
  category?: QuestionCategory;
  options: ToeicOptionDTO[];
}

// Hàm thiết lập header xác thực
export const setAuthHeader = (token: string) => {
  if (!token) {
    console.warn('Token không tồn tại. Vui lòng đăng nhập lại.');
    return {};
  }
  console.log('Đang sử dụng token:', token.substring(0, 15) + '...');
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axios.defaults.withCredentials = true;
};

// Tạo config tiêu chuẩn cho axios
const createConfig = (token?: string) => {
  const config: {
    headers: {
      'Content-Type': string;
      'Authorization'?: string;
    };
    withCredentials: boolean;
  } = {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  };
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
};

// Lấy tất cả câu hỏi
export const getAllQuestions = async (): Promise<any> => {
  try {
    const response = await axios.get(TOEIC_QUESTIONS_API_URL);
    console.log("Dữ liệu câu hỏi từ API:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách câu hỏi TOEIC:", error);
    return [];
  }
};

// Lấy câu hỏi theo ID
export const getQuestionById = async (id: number): Promise<ToeicQuestionDTO> => {
  try {
    const response = await axios.get(`${TOEIC_QUESTIONS_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy câu hỏi TOEIC ID=${id}:`, error);
    throw error;
  }
};

// Lấy câu hỏi theo phần
export const getQuestionsByPart = async (part: number): Promise<ToeicQuestionDTO[]> => {
  try {
    const response = await axios.get(`${TOEIC_QUESTIONS_API_URL}/part/${part}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy câu hỏi TOEIC phần ${part}:`, error);
    throw error;
  }
};

// Lấy câu hỏi theo loại
export const getQuestionsByType = async (type: QuestionType): Promise<ToeicQuestionDTO[]> => {
  try {
    const response = await axios.get(`${TOEIC_QUESTIONS_API_URL}/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy câu hỏi TOEIC loại ${type}:`, error);
    throw error;
  }
};

// Lấy tất cả nhóm câu hỏi - phương thức tương thích với code hiện tại
export const getAllQuestionGroups = async (): Promise<any> => {
  try {
    console.log("Đang lấy tất cả nhóm câu hỏi từ API...");
    const response = await axios.get(`${TOEIC_QUESTIONS_API_URL}/question-groups`, {
      ...authModule.createAuthConfig()
    });
    console.log("Kết quả API getAllQuestionGroups:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tất cả nhóm câu hỏi:", error);
    throw error;
  }
};

// Lấy tất cả nhóm câu hỏi
export const getQuestionGroups = async (): Promise<QuestionGroupResponse[]> => {
  try {
    console.log("Đang lấy dữ liệu nhóm câu hỏi từ API");
    // Cần sử dụng endpoint /toeic-questions/question-groups
    const response = await axios.get(`${TOEIC_QUESTIONS_API_URL}/question-groups`, {
      ...authModule.createAuthConfig()
    });
    console.log("Dữ liệu nhóm câu hỏi nhận được:", response.data);
    
    // Xử lý dữ liệu API trả về - đảm bảo luôn trả về mảng kể cả khi API có cấu trúc khác
    let questionGroups: QuestionGroupResponse[] = [];
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        // Nếu là mảng, sử dụng trực tiếp
        questionGroups = response.data;
      } else if (response.data.content && Array.isArray(response.data.content)) {
        // Nếu là dạng paged response có thuộc tính content
        questionGroups = response.data.content;
      } else {
        console.warn("Cấu trúc dữ liệu không như mong đợi:", response.data);
      }
    }
    
    return questionGroups;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhóm câu hỏi:", error);
    return [];
  }
};

// Lấy nhóm câu hỏi theo ID
export const getQuestionGroupById = async (id: number): Promise<QuestionGroupDTO> => {
  try {
    // Cần sử dụng endpoint /toeic-questions/question-group/{id} theo controller
    const response = await axios.get(`${TOEIC_QUESTIONS_API_URL}/question-group/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy nhóm câu hỏi ID=${id}:`, error);
    throw error;
  }
};

// Tạo nhóm câu hỏi mới
export const createQuestionGroup = async (
  questionGroup: QuestionGroupDTO, 
  audioFile?: File, 
  imageFile?: File
): Promise<QuestionGroupDTO> => {
  try {
    const formData = new FormData();
    
    // Thêm các file nếu có
    if (audioFile) {
      formData.append('audioFile', audioFile);
    }
    
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }
    
    // Thêm thông tin nhóm câu hỏi
    formData.append('part', questionGroup.part.toString());
    
    // Thêm title nếu có
    if (questionGroup.title) {
      formData.append('title', questionGroup.title);
    }
    
    if (questionGroup.passage) {
      formData.append('passage', questionGroup.passage);
    }
    
    // Thêm câu hỏi
    formData.append('questionsJson', JSON.stringify(questionGroup.questions));
    
    console.log("Đang gửi dữ liệu tạo nhóm câu hỏi:", {
      title: questionGroup.title || 'Không có tiêu đề',
      part: questionGroup.part,
      hasAudioFile: !!audioFile,
      hasImageFile: !!imageFile,
      passage: questionGroup.passage ? '...' : null,
      questionsCount: questionGroup.questions.length
    });
    
    // Cần sử dụng endpoint /toeic-questions/create-group theo controller
    const response = await noAuthAxios.post(`${TOEIC_QUESTIONS_API_URL}/create-group`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo nhóm câu hỏi:", error);
    throw error;
  }
};

// Cập nhật nhóm câu hỏi
export const updateQuestionGroup = async (
  groupData: QuestionGroupDTO,
  files?: { audioFile?: File; imageFile?: File }
): Promise<QuestionGroupResponse> => {
  console.log("Đang chuẩn bị cập nhật nhóm câu hỏi ID=" + groupData.id);
  
  // Tạo FormData để gửi multipart/form-data
  const formData = new FormData();
  
  // Thêm part
  if (groupData.part) {
    formData.append("part", groupData.part.toString());
    console.log("part: " + groupData.part);
  } else {
    console.error("Lỗi: thiếu part khi cập nhật nhóm câu hỏi");
    throw new Error("Part là bắt buộc");
  }
  
  // Thêm title nếu có
  if (groupData.title) {
    formData.append("title", groupData.title);
    console.log("title: " + groupData.title);
  }
  
  // Thêm passage nếu có
  if (groupData.passage) {
    formData.append("passage", groupData.passage);
    console.log("passage: " + groupData.passage);
  }
  
  // Thêm file âm thanh mới nếu có
  if (files?.audioFile) {
    // Kiểm tra xem file có rỗng không
    if (files.audioFile.size > 0) {
      formData.append("audioFile", files.audioFile);
      console.log("Đã thêm file âm thanh mới, kích thước: " + files.audioFile.size + " bytes");
    } else {
      console.log("File âm thanh rỗng, không gửi");
    }
  } else {
    console.log("Không có file âm thanh mới, giữ nguyên file cũ");
  }
  
  // Thêm file hình ảnh mới nếu có
  if (files?.imageFile) {
    // Kiểm tra xem file có rỗng không
    if (files.imageFile.size > 0) {
      formData.append("imageFile", files.imageFile);
      console.log("Đã thêm file hình ảnh mới, kích thước: " + files.imageFile.size + " bytes");
    } else {
      console.log("File hình ảnh rỗng, không gửi");
    }
  } else {
    console.log("Không có file hình ảnh mới, giữ nguyên file cũ");
  }
  
  // Chuẩn bị câu hỏi JSON
  // Đảm bảo giữ lại ID cho các câu hỏi hiện có
  const questionsToSend = groupData.questions.map(q => {
    // Giữ ID của câu hỏi nếu có
    if (q.id) {
      console.log("Giữ nguyên ID=" + q.id + " cho câu hỏi: " + q.question.substring(0, 20) + "...");
    }
    
    // Xử lý các tùy chọn - không bao gồm ID của tùy chọn để tránh xung đột
    const processedOptions = q.options.map(option => ({
      optionKey: option.optionKey,
      optionText: option.optionText
      // ID của tùy chọn sẽ không được gửi đi
    }));
    
    return {
      ...q,
      options: processedOptions
    };
  });
  
  const questionsJson = JSON.stringify(questionsToSend);
  console.log("questionsJson: [JSON string với độ dài " + questionsJson.length + "]");
  formData.append("questionsJson", questionsJson);
  
  // Log tất cả các entry trong FormData
  console.log("FormData entries:");
  
  // Kiểm tra nội dung FormData trước khi gửi
  for (const pair of formData.entries()) {
    if (pair[0] === "questionsJson") {
      console.log(pair[0] + ": [JSON string với độ dài " + (pair[1] as string).length + "]");
    } else if (pair[0] === "audioFile" || pair[0] === "imageFile") {
      console.log(pair[0] + ": [File]");
    } else {
      console.log(pair[0] + ": " + pair[1]);
    }
  }
  
  try {
    const response = await axios.put<QuestionGroupResponse>(
      `${API_URL_LOCAL}/toeic-questions/question-group/${groupData.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    
    console.log("Cập nhật nhóm câu hỏi thành công");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật nhóm câu hỏi ID=" + groupData.id + ":", error);
    
    if (axios.isAxiosError(error)) {
      console.log("Status:", error.response?.status);
      console.log("Data:", error.response?.data);
      console.log("Headers:", error.response?.headers);
      console.log("Config:", error.config);
      
      // Trả về thông tin lỗi chi tiết hơn
      if (error.response?.data?.message) {
        throw new Error(`Lỗi: ${error.response.data.message}`);
      } else if (error.response?.status === 400) {
        throw new Error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các thông tin bắt buộc.");
      }
    }
    
    throw error;
  }
};

// Xóa nhóm câu hỏi
export const deleteQuestionGroup = async (id: number): Promise<void> => {
  try {
    // Cần sử dụng endpoint /toeic-questions/question-group/{id} theo controller
    await axios.delete(`${TOEIC_QUESTIONS_API_URL}/question-group/${id}`);
  } catch (error) {
    console.error(`Lỗi khi xóa nhóm câu hỏi ID=${id}:`, error);
    throw error;
  }
};

// Lấy danh sách câu hỏi độc lập (không thuộc nhóm nào)
export const getStandaloneQuestions = async (params: any): Promise<Page<ToeicQuestionDTO>> => {
  try {
    const response = await axios.get(`${API_URL}/toeic-questions/standalone`, { params });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách câu hỏi độc lập:', error);
    throw error;
  }
};

// Lấy danh sách câu hỏi độc lập theo category
export const getStandaloneQuestionsByCategory = async (category: QuestionCategory, params: any): Promise<Page<ToeicQuestionDTO>> => {
  try {
    const response = await axios.get(`${API_URL}/toeic-questions/standalone/category/${category}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách câu hỏi độc lập theo category ${category}:`, error);
    throw error;
  }
};

// Lấy danh sách câu hỏi theo category
export const getQuestionsByCategory = async (category: QuestionCategory, params: any): Promise<Page<ToeicQuestionDTO>> => {
  try {
    const response = await axios.get(`${API_URL}/toeic-questions/category/${category}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách câu hỏi theo category ${category}:`, error);
    throw error;
  }
};

// Tìm kiếm câu hỏi độc lập
export const searchStandaloneQuestions = async (keyword: string, params: any): Promise<Page<ToeicQuestionDTO>> => {
  try {
    const response = await axios.get(`${API_URL}/toeic-questions/standalone/search`, { 
      params: { ...params, keyword } 
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi tìm kiếm câu hỏi độc lập với từ khóa "${keyword}":`, error);
    throw error;
  }
};

// Cập nhật câu hỏi
export async function updateQuestion(question: ToeicQuestionDTO): Promise<QuestionResponse> {
  console.log('Dữ liệu gửi đi khi cập nhật câu hỏi:', JSON.stringify(question, null, 2));
  
  // Đảm bảo category được gửi đúng cách
  const requestData: any = { ...question };
  
  // Luôn gửi questionGroupId trong params, ngay cả khi nó là null
  const questionGroupId = question.questionGroupId === undefined ? null : question.questionGroupId;
  console.log('questionGroupId được gửi:', questionGroupId);
  
  try {
    const response = await axios.put(
      `${TOEIC_QUESTIONS_API_URL}/${question.id}?questionGroupId=${questionGroupId}`, 
      requestData,
      authModule.createAuthConfig()
    );
    console.log('Phản hồi từ server khi cập nhật câu hỏi:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi cập nhật câu hỏi:', error);
    console.error('Chi tiết lỗi:', error.response?.data);
    throw error;
  }
}

// Service cho ToeicQuestion
class ToeicQuestionService {
  private baseUrl: string;
  private groupUrl: string;
  
  constructor() {
    this.baseUrl = `${API_URL}/toeic-questions`;
    this.groupUrl = `${API_URL}/toeic-questions/question-groups`;
  }
  
  // Lấy danh sách các câu hỏi
  async getQuestions(params?: any): Promise<ToeicQuestionDTO[]> {
    const response = await axios.get(this.baseUrl, { params });
    return response.data;
  }
  
  // Lấy chi tiết một câu hỏi
  async getQuestion(id: number): Promise<ToeicQuestionDTO> {
    const response = await axios.get(`${this.baseUrl}/${id}`);
    return response.data;
  }
  
  // Thêm câu hỏi mới
  async createQuestion(question: ToeicQuestionDTO): Promise<ToeicQuestionDTO> {
    const response = await axios.post(this.baseUrl, question);
    return response.data;
  }
  
  // Cập nhật câu hỏi
  async updateQuestion(question: ToeicQuestionDTO): Promise<ToeicQuestionDTO> {
    if (!question.id) {
      throw new Error('Câu hỏi cần có ID để cập nhật');
    }
    
    try {
      // Kiểm tra các giá trị enum trước khi gửi
      const validCategories = Object.values(QuestionCategory);
      const validDifficulties = Object.values(DifficultyLevel);
      
      // Clone để tránh thay đổi tham chiếu gốc
      const cleanedQuestion = { ...question };
      
      // Đảm bảo category là giá trị hợp lệ
      if (!cleanedQuestion.category || !validCategories.includes(cleanedQuestion.category as QuestionCategory)) {
        cleanedQuestion.category = QuestionCategory.GRAMMAR;
        console.log(`Đã sửa category thành giá trị mặc định: ${cleanedQuestion.category}`);
      }
      
      // Đảm bảo difficultyLevel là giá trị hợp lệ
      if (!cleanedQuestion.difficultyLevel || !validDifficulties.includes(cleanedQuestion.difficultyLevel as DifficultyLevel)) {
        cleanedQuestion.difficultyLevel = DifficultyLevel.MEDIUM;
        console.log(`Đã sửa difficultyLevel thành giá trị mặc định: ${cleanedQuestion.difficultyLevel}`);
      }
      
      console.log('Dữ liệu câu hỏi đã được làm sạch trước khi gửi:', JSON.stringify(cleanedQuestion, null, 2));
      
      // Tạo URL có thể chứa questionGroupId trong query parameters nếu có
      let url = `${this.baseUrl}/${cleanedQuestion.id}`;
      let queryParams: Record<string, any> = {};
      
      // Luôn gửi questionGroupId trong params, kể cả khi nó là null
      // Như vậy backend sẽ nhận được questionGroupId=null cho câu hỏi độc lập
      queryParams.questionGroupId = cleanedQuestion.questionGroupId || null;
      console.log(`Đã thêm questionGroupId=${queryParams.questionGroupId} vào params`);
      
      console.log(`Gửi PUT request đến: ${url}`, { queryParams });
      
      const response = await axios.put(url, cleanedQuestion, { params: queryParams });
      console.log('Cập nhật thành công, phản hồi:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật câu hỏi ID=${question.id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Chi tiết lỗi:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  }
  
  // Xóa câu hỏi
  async deleteQuestion(id: number): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }
  
  // Lấy danh sách nhóm câu hỏi
  async getQuestionGroups(params?: any): Promise<QuestionGroupResponse[]> {
    const response = await axios.get(this.groupUrl, { params });
    return response.data;
  }
  
  // Lấy chi tiết một nhóm câu hỏi
  async getQuestionGroup(id: number): Promise<QuestionGroupDTO> {
    const response = await axios.get(`${this.baseUrl}/question-group/${id}`);
    return response.data;
  }
  
  // Lấy câu hỏi theo nhóm
  async getQuestionsByGroup(groupId: number): Promise<ToeicQuestionDTO[]> {
    const response = await axios.get(`${this.groupUrl}/${groupId}/questions`);
    return response.data;
  }
  
  // Tạo mới nhóm câu hỏi
  async createQuestionGroup(
    data: QuestionGroupDTO, 
    files?: { audioFile?: File, imageFile?: File }
  ): Promise<QuestionGroupDTO> {
    const formData = new FormData();
    
    // Thêm các file nếu có
    if (files?.audioFile) {
      formData.append('audioFile', files.audioFile);
    }
    
    if (files?.imageFile) {
      formData.append('imageFile', files.imageFile);
    }
    
    // Thêm thông tin nhóm câu hỏi
    formData.append('part', data.part.toString());
    
    // Thêm title nếu có
    if (data.title) {
      formData.append('title', data.title);
    }
    
    if (data.passage) {
      formData.append('passage', data.passage);
    }
    
    // Thêm câu hỏi
    formData.append('questionsJson', JSON.stringify(data.questions));
    
    console.log("Đang gửi dữ liệu tạo nhóm câu hỏi:", {
      title: data.title || 'Không có tiêu đề',
      part: data.part,
      hasAudioFile: !!files?.audioFile,
      hasImageFile: !!files?.imageFile,
      passage: data.passage ? '...' : null,
      questionsCount: data.questions.length
    });
    
    const response = await axios.post(`${this.baseUrl}/create-group`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
  
  // Cập nhật nhóm câu hỏi
  async updateQuestionGroup(
    data: QuestionGroupDTO,
    files?: { audioFile?: File, imageFile?: File }
  ): Promise<QuestionGroupDTO> {
    if (!data.id) throw new Error('Group ID is required for updating');
    
    const formData = new FormData();
    
    // Thêm các file nếu có
    if (files?.audioFile) {
      console.log('Đang thêm file âm thanh mới');
      formData.append('audioFile', files.audioFile);
    } else {
      console.log('Không có file âm thanh mới, giữ nguyên file cũ');
    }
    
    if (files?.imageFile) {
      console.log('Đang thêm file hình ảnh mới');
      formData.append('imageFile', files.imageFile);
    } else {
      console.log('Không có file hình ảnh mới, giữ nguyên file cũ');
    }
    
    // Thêm thông tin nhóm câu hỏi
    if (!data.part) {
      console.error('Part không được để trống cho updateQuestionGroup');
      throw new Error('Part không được để trống cho cập nhật nhóm câu hỏi');
    }
    
    // Thêm title nếu có
    if (data.title) {
      formData.append('title', data.title);
      console.log('title: ' + data.title);
    }
    
    // Đảm bảo part là số nguyên và chuyển thành chuỗi
    const partValue = typeof data.part === 'number' ? data.part.toString() : String(data.part);
    formData.append('part', partValue);
    
    if (data.passage) {
      formData.append('passage', data.passage);
    }
    
    // Đảm bảo các ID của câu hỏi được giữ nguyên nếu có
    const questions = data.questions.map(q => {
      // Nếu câu hỏi có ID, giữ nguyên ID đó để backend biết đây là câu hỏi cần cập nhật
      if (q.id) {
        console.log(`Giữ nguyên ID=${q.id} cho câu hỏi: ${q.question.substring(0, 30)}...`);
      } else {
        console.log(`Câu hỏi mới không có ID: ${q.question.substring(0, 30)}...`);
      }
      return q;
    });
    
    // Thêm câu hỏi
    const questionsJson = JSON.stringify(questions);
    formData.append('questionsJson', questionsJson);
    
    console.log(`Đang gửi dữ liệu cập nhật nhóm câu hỏi ID=${data.id}:`, {
      title: data.title || 'Không có tiêu đề',
      part: data.part,
      partAsString: partValue,
      hasNewAudioFile: !!files?.audioFile,
      hasNewImageFile: !!files?.imageFile,
      passage: data.passage ? (data.passage.length > 50 ? data.passage.substring(0, 50) + '...' : data.passage) : null,
      questionsJsonLength: questionsJson.length,
      existingAudioUrl: data.audioUrl,
      existingImageUrl: data.imageUrl,
      questionsCount: data.questions.length,
      questionsWithIds: data.questions.filter(q => q.id).length
    });
    
    // In ra tất cả các keys trong FormData để debug
    console.log('FormData entries:');
    for (const pair of formData.entries()) {
      if (pair[0] === 'questionsJson') {
        console.log(`${pair[0]}: [JSON string với độ dài ${pair[1].toString().length}]`);
      } else if (pair[0] === 'audioFile' || pair[0] === 'imageFile') {
        const file = pair[1] as File;
        console.log(`${pair[0]}: File ${file.name} (${file.size} bytes)`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
    
    try {
      // Đảm bảo khớp với đường dẫn endpoint trong backend controller
      const response = await axios.put(`${this.baseUrl}/question-group/${data.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Kết quả cập nhật nhóm câu hỏi:", response.status);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật nhóm câu hỏi ID=${data.id}:`, error);
      if (axios.isAxiosError(error)) {
        console.log('Status:', error.response?.status);
        console.log('Data:', error.response?.data);
        console.log('Headers:', error.response?.headers);
        console.log('Config:', error.config);
      }
      throw error;
    }
  }
  
  // Xóa nhóm câu hỏi
  async deleteQuestionGroup(id: number): Promise<void> {
    await axios.delete(`${this.groupUrl}/${id}`);
  }

  // Lấy danh sách câu hỏi độc lập
  async getStandaloneQuestions(params: any = {}): Promise<Page<ToeicQuestionDTO>> {
    const response = await axios.get(`${this.baseUrl}/standalone`, { params });
    return response.data;
  }

  // Lấy danh sách câu hỏi độc lập theo category
  async getStandaloneQuestionsByCategory(category: QuestionCategory, params: any = {}): Promise<Page<ToeicQuestionDTO>> {
    const response = await axios.get(`${this.baseUrl}/standalone/category/${category}`, { params });
    return response.data;
  }

  // Lấy danh sách câu hỏi theo category
  async getQuestionsByCategory(category: QuestionCategory, params: any = {}): Promise<Page<ToeicQuestionDTO>> {
    const response = await axios.get(`${this.baseUrl}/category/${category}`, { params });
    return response.data;
  }

  // Tìm kiếm câu hỏi độc lập
  async searchStandaloneQuestions(keyword: string, params: any = {}): Promise<Page<ToeicQuestionDTO>> {
    const response = await axios.get(`${this.baseUrl}/standalone/search`, { 
      params: { ...params, keyword } 
    });
    return response.data;
  }
}

export default new ToeicQuestionService();
