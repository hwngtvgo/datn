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
import {
  ChevronLeft,
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
  AlertTriangle
} from "lucide-react";
import { getTestResultDetail, TestResultResponse } from "@/services/testResultService";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import authModule from "@/modules/auth";

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

const TestResultDetail: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<DetailedTestResultResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <Button variant="outline" onClick={handleBack}>
            Xem lịch sử bài thi
          </Button>
          <Button onClick={() => navigate("/practice-tests")}>
            Làm bài thi mới
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestResultDetail; 