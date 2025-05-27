import api from './api';
import { API_URL } from '@/config/constants';

// Interface cho response trả về kết quả bài thi
export interface TestResultResponse {
  id: number;
  testId: number;
  testTitle: string;
  listeningScore: number;
  readingScore: number;
  grammarScore: number;
  vocabularyScore: number;
  totalScore: number;
  listeningScaledScore: number;
  readingScaledScore: number;
  completionTimeInMinutes: number;
  correctAnswers: number;
  totalQuestions: number;
  createdAt: string;
}

// Interface cho thống kê người dùng
export interface UserStatisticsResponse {
  userId: number;
  username: string;
  testsTaken: number;
  averageScore: number;
  bestScore: number;
  listeningAvg: number;
  readingAvg: number;
  grammarAvg: number;
  vocabularyAvg: number;
  listeningScaled: number;
  readingScaled: number;
  recentTests: TestResultResponse[];
  testsByMonth: { [key: string]: number };
  scoresByMonth: { [key: string]: number };
}

// Interface cho đáp án người dùng
export interface UserAnswerRequest {
  questionId: number;
  userAnswer: string;
}

// Interface cho request lưu kết quả
export interface SaveTestResultRequest {
  testId: number;
  completionTimeInMinutes: number;
  userAnswers: UserAnswerRequest[];
}

// Lưu kết quả bài thi
export const submitTestResult = async (request: SaveTestResultRequest): Promise<TestResultResponse> => {
  try {
    const response = await api.post(`/test-results/submit`, request);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lưu kết quả bài thi:', error);
    throw error;
  }
};

// Lấy lịch sử bài làm của người dùng hiện tại
export const getMyTestHistory = async (page: number = 0, size: number = 10): Promise<{
  content: TestResultResponse[],
  totalPages: number,
  totalElements: number
}> => {
  try {
    const response = await api.get(`/test-results/my-history`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử bài làm:', error);
    throw error;
  }
};

// Lấy chi tiết một kết quả bài thi
export const getTestResultDetail = async (resultId: number): Promise<TestResultResponse> => {
  try {
    console.log(`Gọi API lấy chi tiết kết quả bài thi ID=${resultId}`);
    const response = await api.get(`/test-results/${resultId}`, {
      withCredentials: true
    });
    console.log('Kết quả API trả về:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Lỗi khi lấy chi tiết kết quả ID=${resultId}:`, error);
    if (error.response) {
      console.error('Thông tin lỗi response:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        console.error('Lỗi xác thực: Người dùng chưa đăng nhập hoặc token đã hết hạn');
      }
    }
    throw error;
  }
};

// Lấy thống kê bài làm của người dùng hiện tại
export const getMyStatistics = async (): Promise<UserStatisticsResponse> => {
  try {
    const response = await api.get(`/test-results/my-statistics`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thống kê bài làm:', error);
    throw error;
  }
};

// Lấy lịch sử bài làm theo bài thi
export const getTestResultsByTestId = async (testId: number): Promise<TestResultResponse[]> => {
  try {
    const response = await api.get(`/test-results/by-test/${testId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy lịch sử bài làm cho bài thi ID=${testId}:`, error);
    throw error;
  }
}; 