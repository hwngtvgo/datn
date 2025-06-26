import api from './api';
import { API_URL } from '@/config/constants';
import authModule from '@/modules/auth';

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

// Interface cho kết quả bài thi guest (local)
export interface GuestTestResult {
  testId: number;
  testTitle: string;
  listeningScore: number;
  readingScore: number;
  grammarScore: number;
  vocabularyScore: number;
  totalScore: number;
  listeningScaledScore: number;
  readingScaledScore: number;
  correctAnswers: number;
  totalQuestions: number;
  completionTimeInMinutes: number;
  userAnswers: UserAnswerRequest[];
  detailedResults: any[];
  submittedAt: string;
  isGuestResult: true;
}

// Lưu kết quả bài thi cho guest vào localStorage
export const saveGuestTestResult = (result: GuestTestResult): void => {
  try {
    const guestResults = getGuestTestResults();
    guestResults.push(result);
    
    // Giới hạn chỉ lưu 10 kết quả gần nhất
    if (guestResults.length > 10) {
      guestResults.splice(0, guestResults.length - 10);
    }
    
    localStorage.setItem('guestTestResults', JSON.stringify(guestResults));
    console.log('Đã lưu kết quả bài thi guest vào localStorage');
  } catch (error) {
    console.error('Lỗi khi lưu kết quả guest:', error);
  }
};

// Lấy danh sách kết quả bài thi guest từ localStorage
export const getGuestTestResults = (): GuestTestResult[] => {
  try {
    const stored = localStorage.getItem('guestTestResults');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Lỗi khi đọc kết quả guest:', error);
    return [];
  }
};

// Xóa tất cả kết quả guest
export const clearGuestTestResults = (): void => {
  try {
    localStorage.removeItem('guestTestResults');
    console.log('Đã xóa tất cả kết quả guest');
  } catch (error) {
    console.error('Lỗi khi xóa kết quả guest:', error);
  }
};

// Tính toán điểm số TOEIC scaled từ số câu đúng
const calculateScaledScore = (correctAnswers: number, totalQuestions: number, isListening: boolean): number => {
  if (totalQuestions === 0) return 0;
  
  const percentage = correctAnswers / totalQuestions;
  
  if (isListening) {
    // Listening: 5-495 points
    return Math.round(5 + (percentage * 490));
  } else {
    // Reading: 5-495 points  
    return Math.round(5 + (percentage * 490));
  }
};

// Tính toán kết quả bài thi cho guest
export const calculateGuestTestResult = (
  test: any,
  userAnswers: UserAnswerRequest[],
  completionTimeInMinutes: number,
  detailedResults: any[]
): GuestTestResult => {
  let listeningCorrect = 0;
  let readingCorrect = 0;
  let grammarCorrect = 0;
  let vocabularyCorrect = 0;
  
  let listeningTotal = 0;
  let readingTotal = 0;
  let grammarTotal = 0;
  let vocabularyTotal = 0;
  
  // Phân loại và đếm điểm theo từng kỹ năng
  detailedResults.forEach(result => {
    const part = result.part;
    
    if (part >= 1 && part <= 4) {
      // Listening
      listeningTotal++;
      if (result.isCorrect) listeningCorrect++;
    } else if (part >= 5 && part <= 7) {
      // Reading
      readingTotal++;
      if (result.isCorrect) readingCorrect++;
    }
    
    // Phân loại grammar/vocabulary dựa trên question type hoặc content
    if (result.question && (
      result.question.toLowerCase().includes('grammar') ||
      result.question.toLowerCase().includes('ngữ pháp') ||
      (part === 5 || part === 6)
    )) {
      grammarTotal++;
      if (result.isCorrect) grammarCorrect++;
    } else if (result.question && (
      result.question.toLowerCase().includes('vocabulary') ||
      result.question.toLowerCase().includes('từ vựng')
    )) {
      vocabularyTotal++;
      if (result.isCorrect) vocabularyCorrect++;
    }
  });
  
  // Tính scaled scores
  const listeningScaledScore = calculateScaledScore(listeningCorrect, listeningTotal, true);
  const readingScaledScore = calculateScaledScore(readingCorrect, readingTotal, false);
  
  const totalCorrect = detailedResults.filter(r => r.isCorrect).length;
  
  return {
    testId: test.id,
    testTitle: test.title,
    listeningScore: listeningCorrect,
    readingScore: readingCorrect,
    grammarScore: grammarCorrect,
    vocabularyScore: vocabularyCorrect,
    totalScore: listeningScaledScore + readingScaledScore,
    listeningScaledScore,
    readingScaledScore,
    correctAnswers: totalCorrect,
    totalQuestions: detailedResults.length,
    completionTimeInMinutes,
    userAnswers,
    detailedResults,
    submittedAt: new Date().toISOString(),
    isGuestResult: true
  };
};

// Submit test result - hỗ trợ cả user đã đăng nhập và guest
export const submitTestResultWithGuestSupport = async (
  request: SaveTestResultRequest,
  test: any,
  detailedResults: any[]
): Promise<TestResultResponse | GuestTestResult> => {
  try {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const isLoggedIn = authModule.isLoggedIn();
    
    if (isLoggedIn) {
      // Người dùng đã đăng nhập - gửi lên server
      return await submitTestResult(request);
    } else {
      // Guest mode - tính toán và lưu local
      const guestResult = calculateGuestTestResult(
        test,
        request.userAnswers,
        request.completionTimeInMinutes,
        detailedResults
      );
      
      saveGuestTestResult(guestResult);
      return guestResult;
    }
  } catch (error) {
    console.error('Lỗi khi submit test result:', error);
    throw error;
  }
};

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

// Lấy chi tiết câu trả lời của test result để xem lại
export const getTestResultDetailForReview = async (resultId: number) => {
  try {
    console.log(`Gọi API lấy chi tiết review cho result ID=${resultId}`);
    const response = await api.get(`/test-results/${resultId}/review`);
    console.log('Kết quả API review trả về:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Lỗi khi lấy chi tiết review cho result ID=${resultId}:`, error);
    if (error.response) {
      console.error('Thông tin lỗi response:', error.response.status, error.response.data);
    }
    throw error;
  }
}; 