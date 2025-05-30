// Enum định nghĩa các mức độ khó
export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

// Enum định nghĩa các loại câu hỏi
export enum QuestionType {
  LISTENING = 'LISTENING',
  READING = 'READING',
  GRAMMAR = 'GRAMMAR',
  VOCABULARY = 'VOCABULARY'
}

// Enum định nghĩa các loại đề thi
export enum ExamType {
  FULL = 'FULL',
  MINI = 'MINI',
  PRACTICE = 'PRACTICE'
}

// Enum định nghĩa các danh mục câu hỏi độc lập
export enum QuestionCategory {
  GRAMMAR = 'GRAMMAR',
  VOCABULARY = 'VOCABULARY',
  LISTENING = 'LISTENING'
}

// Interface định nghĩa cấu trúc một tùy chọn (lựa chọn) cho câu hỏi
export interface ToeicQuestionOption {
  id: number;
  optionKey: string; // A, B, C, D
  optionText: string;
}

// Interface định nghĩa cấu trúc một câu hỏi TOEIC
export interface ToeicQuestion {
  id: number;
  type: QuestionType;
  part: number; // Part 1-7 của TOEIC
  question: string;
  correctAnswer: string;
  difficultyLevel: DifficultyLevel;
  options: ToeicQuestionOption[];
  audioUrl?: string; // URL đến file âm thanh (cho phần Listening)
  imageUrl?: string; // URL đến hình ảnh (nếu có)
  passage?: string; // Đoạn văn (cho phần Reading)
  groupId?: number; // ID nhóm câu hỏi (nếu câu hỏi thuộc một nhóm)
  category?: QuestionCategory; // Danh mục cho câu hỏi độc lập
}

// Interface định nghĩa phản hồi API trả về cho câu hỏi TOEIC
export interface ToeicQuestionDTO {
  id: number;
  type?: QuestionType;
  part?: number;
  question: string;
  correctAnswer: string;
  difficultyLevel: DifficultyLevel;
  options: ToeicQuestionOption[];
  audioUrl?: string;
  imageUrl?: string;
  passage?: string;
  groupId?: number;
  category?: QuestionCategory; // Danh mục cho câu hỏi độc lập
}

// Interface định nghĩa cấu trúc một đề thi TOEIC
export interface ToeicExam {
  id: number;
  title: string;
  description?: string;
  type?: ExamType;
  duration: number;
  difficulty?: DifficultyLevel;
  instructions?: string;
  isActive?: boolean;
  createdAt?: string;
  createdBy?: string;
  maxScore?: number;
  passScore?: number;
}

// Interface định nghĩa kết quả làm bài thi TOEIC
export interface ToeicExamResult {
  id: number;
  userId: number;
  examId: number;
  score: number;
  listeningScore: number;
  readingScore: number;
  completionTime: number; // Thời gian hoàn thành (phút)
  submittedAt: string;
  answers: ToeicExamAnswer[];
}

// Interface định nghĩa câu trả lời cho một câu hỏi trong bài thi
export interface ToeicExamAnswer {
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

// Định nghĩa phản hồi cho nhóm câu hỏi
export interface QuestionGroupResponse {
  id: number;
  title?: string;
  questionType: string;
  part: number;
  passage?: string;
  audioUrl?: string;
  imageUrl?: string;
  testId?: number;
  questions: QuestionResponse[];
  count?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Định nghĩa phản hồi cho câu hỏi
export interface QuestionResponse {
  id: number;
  question: string;
  correctAnswer: string;
  explanation?: string;
  difficultyLevel: DifficultyLevel;
  options: OptionResponse[];
  questionOrder?: number;
  category?: string; // Danh mục cho câu hỏi độc lập
}

// Định nghĩa phản hồi cho lựa chọn câu hỏi
export interface OptionResponse {
  id: number;
  optionKey: string;
  optionText: string;
} 