import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Award,
  CircleCheck,
  CircleX,
  Info,
  FileAudio,
  BookOpen,
  Headphones,
  Loader2,
  FileText,
  AlertTriangle,
  Volume2,
  Bookmark
} from "lucide-react";
import { getTestResultDetail, getTestResultDetailForReview, TestResultResponse } from "@/services/testResultService";
import * as toeicExamService from "@/services/toeicExamService";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import authModule from "@/modules/auth";
import { API_URL } from "@/config/constants";

// Định nghĩa kiểu dữ liệu cho userAnswers (nếu có)
interface UserAnswer {
  id: number;
  questionId: number;
  questionType: string;
  questionGroupId: number;
  questionOrder: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  questionText?: string;
  explanation?: string;
  audioUrl?: string;
}

// Mở rộng kiểu TestResultResponse để bao gồm userAnswers nếu cần
interface DetailedTestResultResponse extends TestResultResponse {
  userAnswers?: UserAnswer[];
}

// Hàm để xử lý URL audio và image
const getFullUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_URL}/files/view/${url}`;
};

// Hàm để lấy tiêu đề hiển thị của nhóm câu hỏi
const getGroupTitle = (group: any) => {
  if (group.title) {
    return group.title;
  }
  return `Part ${group.part} - ${group.part <= 4 ? 'Listening' : 'Reading'}`;
};

// Hàm sắp xếp các lựa chọn theo thứ tự chuẩn (A, B, C, D)
const sortOptions = (options: any[]) => {
  return [...options].sort((a, b) => {
    // Đảm bảo thứ tự A, B, C, D hoặc a, b, c, d hoặc 1, 2, 3, 4
    const keyA = a.optionKey.toUpperCase();
    const keyB = b.optionKey.toUpperCase();
    
    // Nếu là các chữ cái
    if (['A', 'B', 'C', 'D'].includes(keyA) && ['A', 'B', 'C', 'D'].includes(keyB)) {
      const order = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4};
      return order[keyA] - order[keyB];
    }
    
    // Nếu là các số
    if (!isNaN(Number(keyA)) && !isNaN(Number(keyB))) {
      return Number(keyA) - Number(keyB);
    }
    
    // Các trường hợp khác
    return keyA.localeCompare(keyB);
  });
};

const TestResultDetail: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<DetailedTestResultResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States cho review mode giống như TestPage
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewGroupIndex, setReviewGroupIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [test, setTest] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Kiểm tra đăng nhập trước khi tải dữ liệu
    if (!authModule.isLoggedIn()) {
      setError("Bạn cần đăng nhập để xem kết quả bài thi");
      setIsLoading(false);
      return;
    }
    
    if (!resultId) {
      setError("Không tìm thấy ID bài thi");
      setIsLoading(false);
      return;
    }
    
    loadTestResult(parseInt(resultId));
  }, [resultId]);

  const loadTestResult = async (resultId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Đang tải chi tiết kết quả bài thi với ID: ${resultId}`);
      const response = await getTestResultDetail(resultId);
      console.log('Dữ liệu nhận được từ API:', response);
      
      if (!response) {
        setError("Không có dữ liệu kết quả bài thi");
        return;
      }
      
      setResult(response);
    } catch (error: any) {
      console.error("Lỗi khi tải chi tiết kết quả bài thi:", error);
      
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem kết quả bài thi");
      } else if (error.response?.status === 403) {
        setError("Bạn không có quyền xem kết quả bài thi này");
      } else if (error.response?.status === 404) {
        setError("Không tìm thấy kết quả bài thi");
      } else {
        setError("Không thể tải chi tiết kết quả bài thi. Vui lòng thử lại sau.");
      }
      
      toast.error("Không thể tải chi tiết kết quả bài thi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login', { state: { returnUrl: `/test-result/${resultId}` } });
  };

  const handleBack = () => {
    navigate('/test-history');
  };

  // Load data cho review mode giống như TestPage
  const loadReviewData = async () => {
    if (!result) return;
    
    setIsLoading(true);
    try {
      // Gọi API để lấy chi tiết câu trả lời và bài thi
      const reviewData = await getTestResultDetailForReview(result.id);
       
      // Lấy dữ liệu test và question groups giống như TestPage
      const examData = await toeicExamService.getExamById(result.testId);
      const questionsData = await toeicExamService.getExamQuestions(result.testId);
      
      // Sắp xếp questionGroups theo part giống như TestPage
      const sortedGroups = questionsData.sort((a: any, b: any) => a.part - b.part);
      
      // Tạo dữ liệu test giống như TestPage
      setTest({
        id: examData.id,
        title: examData.title,
        description: examData.description,
        instructions: examData.instructions,
        duration: examData.duration,
        type: examData.type,
        difficulty: examData.difficulty,
        questionGroups: sortedGroups
      });
      
      // Chuyển đổi dữ liệu từ API thành định dạng phù hợp
      const detailedResults: any[] = [];
      
      // Tạo map các câu trả lời của user từ API để tra cứu nhanh
      const userAnswersMap: Record<number, any> = {};
      if (reviewData && reviewData.userAnswers) {
        reviewData.userAnswers.forEach((ua: any) => {
          userAnswersMap[ua.questionId] = ua;
        });
      }
      
      sortedGroups.forEach((group: any) => {
        if (group.questions && group.questions.length > 0) {
          group.questions.forEach((question: any) => {
            // Lấy thông tin câu trả lời từ API nếu có
            let userAnswer = "";
            let isCorrect = false;
            let answered = false;
            
            const userAnswerObj = userAnswersMap[question.id];
            if (userAnswerObj) {
              userAnswer = userAnswerObj.userAnswer;
              isCorrect = userAnswerObj.isCorrect;
              answered = true;
            }
            
            detailedResults.push({
              questionId: question.id,
              question: question.question,
              correctAnswer: question.correctAnswer,
              userAnswer: userAnswer,
              answered: answered,
              selectedOptionId: answered ? question.options?.find((opt: any) => opt.optionKey === userAnswer)?.id : null,
              isCorrect: isCorrect,
              explanation: question.explanation || "Không có giải thích",
              options: question.options,
              part: group.part,
              passage: group.passage,
              imageUrl: group.imageUrl,
              audioUrl: group.audioUrl
            });
          });
        }
      });
      
      setTestResults(detailedResults);
      setIsReviewMode(true);
      setShowSidebar(true);
      setReviewGroupIndex(0);
      
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu review:', error);
      toast.error("Không thể tải dữ liệu xem lại chi tiết");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm để nhảy đến câu hỏi cụ thể giống như TestPage
  const jumpToQuestion = (questionId: number) => {
    if (!test) return;
    
    for (let groupIndex = 0; groupIndex < test.questionGroups.length; groupIndex++) {
      const group = test.questionGroups[groupIndex];
      const questionInGroup = group.questions?.find((q: any) => q.id === questionId);
      if (questionInGroup) {
        setReviewGroupIndex(groupIndex);
        setTimeout(() => {
          const questionElement = document.getElementById(`question-${questionId}`);
          if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return;
      }
    }
  };

  // Hàm để lấy tất cả câu hỏi theo thứ tự giống như TestPage
  const getAllQuestions = () => {
    if (!test) return [];
    
    const allQuestions: Array<{
      id: number;
      question: string;
      part: number;
      groupIndex: number;
      questionIndex: number;
    }> = [];
    
    let globalIndex = 0;
    test.questionGroups.forEach((group: any, groupIndex: number) => {
      group.questions?.forEach((question: any) => {
        allQuestions.push({
          id: question.id,
          question: question.question,
          part: group.part,
          groupIndex,
          questionIndex: globalIndex + 1
        });
        globalIndex++;
      });
    });
    
    return allQuestions;
  };

  // Hàm để lấy trạng thái câu hỏi giống như TestPage
  const getQuestionStatus = (questionId: number) => {
    const questionResult = testResults.find(r => r.questionId === questionId);
    if (!questionResult) return 'unanswered';
    return questionResult.isCorrect ? 'correct' : 'incorrect';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPerformanceText = (score: number) => {
    if (score >= 80) return "Xuất sắc";
    if (score >= 60) return "Tốt";
    if (score >= 40) return "Trung bình";
    return "Cần cải thiện";
  };

  // Các hàm xử lý userAnswers (nếu có)
  const getQuestionAnswers = () => {
    if (!result || !result.userAnswers || !Array.isArray(result.userAnswers)) return [];
    
    // Sắp xếp câu trả lời theo phần và số thứ tự
    return [...result.userAnswers].sort((a, b) => {
      // Sắp xếp theo phần (listening trước, reading sau)
      const partCompare = a.questionType.localeCompare(b.questionType);
      if (partCompare !== 0) return partCompare;
      
      // Sắp xếp theo nhóm câu hỏi
      const groupCompare = a.questionGroupId - b.questionGroupId;
      if (groupCompare !== 0) return groupCompare;
      
      // Sắp xếp theo số thứ tự câu hỏi
      return a.questionOrder - b.questionOrder;
    });
  };

  const getAnswerClasses = (isCorrect: boolean) => {
    return isCorrect 
      ? "bg-green-50 border-green-200 text-green-700"
      : "bg-red-50 border-red-200 text-red-700";
  };

  const groupAnswersByType = () => {
    if (!result || !result.userAnswers || !Array.isArray(result.userAnswers)) return {};
    
    const answers = getQuestionAnswers();
    const grouped: Record<string, UserAnswer[]> = {};
    
    answers.forEach(answer => {
      if (!grouped[answer.questionType]) {
        grouped[answer.questionType] = [];
      }
      grouped[answer.questionType].push(answer);
    });
    
    return grouped;
  };

  const getScoreByType = (type: string) => {
    const grouped = groupAnswersByType();
    if (!grouped[type]) return { correct: 0, total: 0, percent: 0 };
    
    const answers = grouped[type];
    const correct = answers.filter(a => a.isCorrect).length;
    return {
      correct,
      total: answers.length,
      percent: Math.round((correct / answers.length) * 100)
    };
  };

  // Review Mode JSX - copy từ TestPage
  if (isReviewMode && test) {
    const currentGroup = test.questionGroups[reviewGroupIndex];
    
    return (
      <div className="fixed inset-0 bg-background z-50 flex">
        {/* Sidebar giống như TestPage */}
        {showSidebar && (
          <div className="w-80 border-r bg-card">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h2 className="text-lg font-semibold">
                  {test.title}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                >
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {test.questionGroups.map((group: any, groupIdx: number) => (
                    <div key={groupIdx} className="p-4 border-b">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setReviewGroupIndex(groupIdx)}
                      >
                        <span className="font-medium text-sm">
                          {getGroupTitle(group)}
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                      
                      {reviewGroupIndex === groupIdx && (
                        <div className="mt-2 space-y-1">
                          {group.questions?.map((question: any, qIdx: number) => {
                            const questionResult = testResults.find(r => r.questionId === question.id);
                            const isCorrect = questionResult?.isCorrect || false;
                            const hasAnswer = questionResult?.answered || false;
                            
                            return (
                              <div
                                key={qIdx}
                                className={`p-2 rounded text-xs cursor-pointer ${
                                  !hasAnswer
                                    ? 'bg-gray-100 text-gray-700'
                                    : isCorrect 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}
                                onClick={() => jumpToQuestion(question.id)}
                              >
                                Câu {qIdx + 1}: {!hasAnswer ? '-' : (isCorrect ? '✓' : '✗')}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Main Content giống như TestPage */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b p-4 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsReviewMode(false)}
                >
                  ← Quay lại
                </Button>
                
                {!showSidebar && (
                  <Button
                    variant="outline"
                    onClick={() => setShowSidebar(true)}
                  >
                    Hiện thanh bên
                  </Button>
                )}
              </div>
              
              <h1 className="text-xl font-semibold">
                {test.title} - Chi tiết kết quả
              </h1>
            </div>
          </div>
          
          {/* Questions Content giống như TestPage */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">
                {getGroupTitle(currentGroup)}
              </h2>
              
              {/* Group passage/content */}
              {currentGroup.passage && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    {currentGroup.imageUrl && (
                      <img 
                        src={getFullUrl(currentGroup.imageUrl)} 
                        alt="Question content" 
                        className="w-full max-w-md mx-auto mb-4 rounded"
                      />
                    )}
                    
                    {currentGroup.audioUrl && (
                      <div className="mb-4">
                        <audio controls className="w-full">
                          <source src={getFullUrl(currentGroup.audioUrl)} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}
                    
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentGroup.passage }}
                    />
                  </CardContent>
                </Card>
              )}
              
              {/* Questions */}
              {currentGroup.questions?.map((question: any, qIdx: number) => {
                const questionResult = testResults.find(r => r.questionId === question.id);
                const isCorrect = questionResult?.isCorrect || false;
                const hasAnswer = questionResult?.answered || false;
                
                // Tính toán số thứ tự câu hỏi dựa trên vị trí trong tất cả các nhóm
                let questionNumber = qIdx + 1;
                
                // Cộng thêm tổng số câu hỏi từ các nhóm trước đó
                for (let i = 0; i < reviewGroupIndex; i++) {
                  questionNumber += test.questionGroups[i].questions?.length || 0;
                }
                
                return (
                  <Card 
                    key={qIdx} 
                    className={`mb-4 ${
                      !hasAnswer 
                        ? 'border-gray-200 bg-gray-50' 
                        : isCorrect 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                    id={`question-${question.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          !hasAnswer
                            ? 'bg-gray-400'
                            : isCorrect 
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        }`}>
                          {questionNumber}
                        </div>
                        
                        <div className="flex-1">
                          {/* Question content */}
                          {question.imageUrl && (
                            <img 
                              src={getFullUrl(question.imageUrl)} 
                              alt="Question" 
                              className="w-full max-w-md mb-4 rounded"
                            />
                          )}
                          
                          {question.audioUrl && (
                            <div className="flex items-center gap-2 mb-4">
                              <Volume2 className="h-4 w-4" />
                              <audio controls>
                                <source src={getFullUrl(question.audioUrl)} type="audio/mpeg" />
                              </audio>
                            </div>
                          )}
                          
                          <div 
                            className="mb-4 font-medium"
                            dangerouslySetInnerHTML={{ __html: question.question }}
                          />
                          
                          {/* Answer choices giống như TestPage */}
                          <RadioGroup value={questionResult?.answered ? questionResult?.userAnswer : ""} className="space-y-2">
                            {question.options && sortOptions(question.options)
                              .map((option: any) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value={option.optionKey} 
                                  id={`${question.id}-${option.optionKey}`}
                                  disabled
                                />
                                <Label 
                                  htmlFor={`${question.id}-${option.optionKey}`}
                                  className={`flex-1 ${
                                    option.optionKey === question.correctAnswer
                                      ? 'text-green-600 font-medium'
                                      : (option.optionKey === questionResult?.userAnswer && !isCorrect)
                                      ? 'text-red-600'
                                      : ''
                                  }`}
                                >
                                  {option.optionKey}. {option.optionText}
                                  {option.optionKey === question.correctAnswer && (
                                    <span className="ml-2 text-green-600">✓ Đáp án đúng</span>
                                  )}
                                  {questionResult?.answered && option.optionKey === questionResult?.userAnswer && !isCorrect && (
                                    <span className="ml-2 text-red-600">✗ Câu trả lời của bạn</span>
                                  )}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          
                          {/* Chỉ hiện thông báo cho câu chưa trả lời */}
                          {!hasAnswer && (
                            <div className="mt-4 p-3 bg-gray-100 border border-gray-200 rounded">
                              <p className="text-sm text-gray-600">Bạn chưa trả lời câu hỏi này.</p>
                            </div>
                          )}
                          
                          {/* Explanation */}
                          {question.explanation && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-sm font-medium text-blue-800 mb-1">Giải thích:</p>
                              <div 
                                className="text-sm text-blue-700"
                                dangerouslySetInnerHTML={{ __html: question.explanation }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chi tiết kết quả bài thi</CardTitle>
              <CardDescription>
                Thông tin chi tiết về kết quả bài thi TOEIC
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <p className="text-muted-foreground mb-4">{error}</p>
              {error.includes("đăng nhập") ? (
                <Button onClick={handleLogin}>
                  Đăng nhập
                </Button>
              ) : (
                <Button onClick={handleBack}>
                  Xem lịch sử bài thi
                </Button>
              )}
            </div>
          ) : !result ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Không tìm thấy thông tin kết quả bài thi.
              </p>
              <Button onClick={handleBack}>
                Xem lịch sử bài thi
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">{result.testTitle}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Thời gian hoàn thành: {result.completionTimeInMinutes} phút</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Ngày làm bài: {formatDate(result.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tổng quan kết quả</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Tổng điểm</p>
                          <div className="mt-2">
                            <Badge className={`text-lg px-3 py-1 ${getScoreColor(result.totalScore)}`}>
                              {result.totalScore}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {getPerformanceText(result.totalScore)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Điểm Listening</p>
                          <div className="mt-2">
                            <Badge className="text-lg px-3 py-1 bg-blue-100 text-blue-800">
                              {result.listeningScaledScore}/495
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {result.listeningScore}% chính xác
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Điểm Reading</p>
                          <div className="mt-2">
                            <Badge className="text-lg px-3 py-1 bg-green-100 text-green-800">
                              {result.readingScaledScore}/495
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {result.readingScore}% chính xác
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Tỷ lệ đúng</p>
                          <h3 className="text-xl font-bold mt-2">
                            {result.correctAnswers}/{result.totalQuestions}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-2">
                            câu trả lời
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Chi tiết theo kỹ năng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-medium mb-2">Ngữ pháp và Từ vựng</h4>
                      <div className="space-y-4">
                        {result.grammarScore > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">Grammar</span>
                              <span className="text-sm font-medium">{result.grammarScore}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div 
                                className="bg-purple-500 h-2.5 rounded-full" 
                                style={{ width: `${result.grammarScore}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {result.vocabularyScore > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">Vocabulary</span>
                              <span className="text-sm font-medium">{result.vocabularyScore}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div 
                                className="bg-amber-500 h-2.5 rounded-full" 
                                style={{ width: `${result.vocabularyScore}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {result.grammarScore === 0 && result.vocabularyScore === 0 && (
                          <p className="text-sm text-muted-foreground">Không có dữ liệu ngữ pháp và từ vựng</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium mb-2">Kỹ năng TOEIC</h4>
                      <div className="space-y-4">
                        {result.listeningScore > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">Listening</span>
                              <span className="text-sm font-medium">{result.listeningScore}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div 
                                className="bg-blue-500 h-2.5 rounded-full" 
                                style={{ width: `${result.listeningScore}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {result.readingScore > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">Reading</span>
                              <span className="text-sm font-medium">{result.readingScore}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div 
                                className="bg-green-500 h-2.5 rounded-full" 
                                style={{ width: `${result.readingScore}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {result.listeningScore === 0 && result.readingScore === 0 && (
                          <p className="text-sm text-muted-foreground">Không có dữ liệu kỹ năng TOEIC</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Nhận xét và đề xuất</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Dựa trên kết quả bài thi của bạn, đây là một số đề xuất để cải thiện:
                  </p>
                  
                  <div className="space-y-3">
                    {result.listeningScore > 0 && result.listeningScore < 60 && (
                      <div className="p-3 border rounded-md">
                        <p className="font-medium">Cải thiện kỹ năng Listening:</p>
                        <p className="text-sm">Tập trung luyện nghe với các bài tập Part {result.listeningScore < 40 ? '1-2' : '3-4'} và làm quen với các giọng nói khác nhau.</p>
                      </div>
                    )}
                    
                    {result.readingScore > 0 && result.readingScore < 60 && (
                      <div className="p-3 border rounded-md">
                        <p className="font-medium">Cải thiện kỹ năng Reading:</p>
                        <p className="text-sm">Tập trung làm các bài tập Part {result.readingScore < 40 ? '5' : '6-7'} và rèn luyện kỹ năng đọc hiểu nhanh.</p>
                      </div>
                    )}
                    
                    {result.grammarScore > 0 && result.grammarScore < 60 && (
                      <div className="p-3 border rounded-md">
                        <p className="font-medium">Cải thiện ngữ pháp:</p>
                        <p className="text-sm">Ôn lại các cấu trúc ngữ pháp cơ bản và làm thêm các bài tập ngữ pháp.</p>
                      </div>
                    )}
                    
                    {result.vocabularyScore > 0 && result.vocabularyScore < 60 && (
                      <div className="p-3 border rounded-md">
                        <p className="font-medium">Cải thiện từ vựng:</p>
                        <p className="text-sm">Mở rộng vốn từ vựng thông qua các bài đọc và học từ vựng theo chủ đề.</p>
                      </div>
                    )}
                    
                    {result.totalScore >= 60 && (
                      <div className="p-3 border rounded-md border-green-200 bg-green-50">
                        <p className="font-medium text-green-800">Chúc mừng!</p>
                        <p className="text-sm">Bạn đã đạt kết quả tốt. Tiếp tục luyện tập để duy trì và nâng cao trình độ.</p>
                      </div>
                    )}

                    {(result.listeningScore === 0 || result.listeningScore >= 60) && 
                      (result.readingScore === 0 || result.readingScore >= 60) && 
                      (result.grammarScore === 0 || result.grammarScore >= 60) && 
                      (result.vocabularyScore === 0 || result.vocabularyScore >= 60) && 
                      result.totalScore < 60 && (
                      <div className="p-3 border rounded-md">
                        <p className="font-medium">Tiếp tục luyện tập:</p>
                        <p className="text-sm">Hãy làm thêm các bài thi để cải thiện điểm số tổng thể.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={loadReviewData}>
            Xem lịch sử bài thi
          </Button>
          <div className="flex gap-2">
            {/* <Button variant="outline" onClick={loadReviewData}>
              Xem chi tiết từng câu
            </Button> */}
            <Button onClick={() => navigate("/practice-tests")}>
              Làm bài thi mới
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestResultDetail; 