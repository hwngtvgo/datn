"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Loader2, ChevronLeft, ChevronRight, Clock, Award, BookOpen, Lightbulb, Volume2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Services
import * as toeicExamService from "@/services/toeicExamService"
import { submitTestResult } from "@/services/testResultService"
import { QuestionGroupResponse, QuestionResponse, DifficultyLevel, ExamType } from "@/types/toeic"
import { API_URL } from "@/config/constants"

// Định nghĩa các interface cần thiết
interface TestData {
  id: number;
  title: string;
  description?: string;
  instructions?: string;
  duration: number;
  type?: string;
  difficulty?: string;
  questionGroups: QuestionGroupResponse[];
}

// Hàm để xử lý URL audio và image
const getFullUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Nếu url chỉ chứa tên file hoặc đường dẫn tương đối, thêm API_URL và endpoint xem file
  return `${API_URL}/files/view/${url}`;
};

// Hiển thị badge cho độ khó
const getDifficultyBadge = (difficulty: string) => {
  // Chuyển đổi về chữ hoa để đảm bảo so sánh chính xác
  const difficultyUpper = difficulty ? difficulty.toUpperCase() : '';
  
  switch (difficultyUpper) {
    case 'EASY':
      return <Badge className="bg-green-500 hover:bg-green-600">Dễ</Badge>;
    case 'MEDIUM':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Trung bình</Badge>;
    case 'HARD':
      return <Badge className="bg-red-500 hover:bg-red-600">Khó</Badge>;
    default:
      return <Badge>Không xác định</Badge>;
  }
};

// Hiển thị badge cho loại đề thi
const getExamTypeBadge = (type: string | undefined) => {
  switch (type) {
    case 'FULL':
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Đầy đủ</Badge>;
    case 'MINI':
      return <Badge variant="outline" className="border-green-500 text-green-500">Mini</Badge>;
    case 'LISTENING_ONLY':
      return <Badge variant="outline" className="border-purple-500 text-purple-500">Chỉ Nghe</Badge>;
    case 'READING_ONLY':
      return <Badge variant="outline" className="border-orange-500 text-orange-500">Chỉ Đọc</Badge>;
    case 'GRAMMAR_ONLY':
      return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Ngữ pháp</Badge>;
    case 'VOCABULARY_ONLY':
      return <Badge variant="outline" className="border-pink-500 text-pink-500">Từ vựng</Badge>;
    case 'PRACTICE':
      return <Badge variant="outline" className="border-teal-500 text-teal-500">Luyện tập</Badge>;
    default:
      return <Badge variant="outline">Khác</Badge>;
  }
};

// Hàm để lấy tiêu đề hiển thị của nhóm câu hỏi
const getGroupTitle = (group: QuestionGroupResponse) => {
  if (group.title) {
    return group.title;
  }
  return `Part ${group.part} - ${group.part <= 4 ? 'Listening' : 'Reading'}`;
};

// Hàm lấy icon phù hợp với loại đề thi
const getExamTypeIcon = (type: string | undefined) => {
  switch (type) {
    case 'LISTENING_ONLY':
      return <Volume2 className="h-5 w-5 text-purple-500" />;
    case 'READING_ONLY':
      return <BookOpen className="h-5 w-5 text-orange-500" />;
    case 'GRAMMAR_ONLY':
      return <BookOpen className="h-5 w-5 text-yellow-500" />;
    case 'VOCABULARY_ONLY':
      return <Lightbulb className="h-5 w-5 text-pink-500" />;
    default:
      return <Award className="h-5 w-5 text-blue-500" />;
  }
};

export default function TestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [test, setTest] = useState<TestData | null>(null)
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(7200) // 2 hours in seconds
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioEnded, setAudioEnded] = useState(false) // Trạng thái phát của audio
  const autoNextRef = useRef<NodeJS.Timeout | null>(null) // Tham chiếu để lưu timeout
  
  // Tham chiếu và state cho việc tải trước
  const nextAudioRef = useRef<HTMLAudioElement>(null)
  const [loadingNextGroup, setLoadingNextGroup] = useState(false)
  const [isPreloaded, setIsPreloaded] = useState<Record<number, boolean>>({})
  const [allGroupsPreloaded, setAllGroupsPreloaded] = useState(false)

  // State để theo dõi quá trình làm bài
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  // State để hiển thị thông tin chi tiết
  const [showInstructions, setShowInstructions] = useState(true)

  // Load test data based on ID và tải trước tất cả dữ liệu
  useEffect(() => {
    const loadTest = async () => {
      if (!id) return
      
      setIsLoading(true)
      try {
        console.log("Đang tải dữ liệu bài thi với ID:", id)
        const examData = await toeicExamService.getExamById(Number(id))
        console.log("Dữ liệu bài thi:", examData)
        
        // Tải dữ liệu câu hỏi
        const questionsData = await toeicExamService.getExamQuestions(Number(id))
        console.log("Dữ liệu câu hỏi:", questionsData)
        
        // Sắp xếp questionGroups theo thứ tự part
        const sortedGroups = questionsData.sort((a: QuestionGroupResponse, b: QuestionGroupResponse) => a.part - b.part)
        
        // Đếm tổng số câu hỏi
        let questionCount = 0;
        sortedGroups.forEach((group: QuestionGroupResponse) => {
          questionCount += group.questions?.length || 0;
        });
        setTotalQuestions(questionCount);
        
        // Thiết lập dữ liệu bài thi
        setTest({
          id: examData.id,
          title: examData.title,
          description: examData.description,
          instructions: examData.instructions,
          duration: examData.duration,
          type: examData.type,
          difficulty: examData.difficulty,
          questionGroups: sortedGroups
        })
        
        // Thiết lập thời gian làm bài nếu có
        if (examData.duration) {
          setTimeLeft(examData.duration * 60) // Chuyển từ phút sang giây
        }
        
        // Bắt đầu tải trước tất cả tài nguyên
        preloadAllResources(sortedGroups);
        
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu bài thi:', error)
        toast.error("Không thể tải dữ liệu bài thi. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTest()
  }, [id])

  // Hàm tải trước tất cả tài nguyên
  const preloadAllResources = async (groups: QuestionGroupResponse[]) => {
    if (!groups || groups.length === 0) return;
    
    try {
      toast.info("Đang tải trước tất cả nội dung bài thi...", {
        duration: 3000,
        position: "bottom-center"
      });
      
      // Tạo một bản sao của isPreloaded để cập nhật
      const preloadedStatus: Record<number, boolean> = {};
      
      // Tải trước tất cả hình ảnh và audio theo thứ tự
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        
        // Tạo promise cho việc tải hình ảnh (nếu có)
        const imagePromise = group.imageUrl 
          ? new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => {
                console.log(`Đã tải xong hình ảnh cho nhóm ${i}: ${group.imageUrl}`);
                resolve();
              };
              img.onerror = () => {
                console.error(`Lỗi khi tải hình ảnh cho nhóm ${i}: ${group.imageUrl}`);
                resolve(); // Vẫn tiếp tục dù có lỗi
              };
              img.src = getFullUrl(group.imageUrl);
            })
          : Promise.resolve();
          
        // Tạo promise cho việc tải audio (nếu có)
        const audioPromise = group.audioUrl
          ? new Promise<void>((resolve) => {
              const audio = new Audio();
              audio.oncanplaythrough = () => {
                console.log(`Đã tải xong audio cho nhóm ${i}: ${group.audioUrl}`);
                resolve();
              };
              audio.onerror = () => {
                console.error(`Lỗi khi tải audio cho nhóm ${i}: ${group.audioUrl}`);
                resolve(); // Vẫn tiếp tục dù có lỗi
              };
              audio.src = getFullUrl(group.audioUrl);
              audio.load();
            })
          : Promise.resolve();
        
        // Đánh dấu nhóm đang được tải để UI cập nhật
        if (i > 0) { // Không phải là nhóm hiện tại
          setLoadingNextGroup(true);
        }
        
        // Tải song song cả hình ảnh và audio
        await Promise.all([imagePromise, audioPromise]);
        
        // Đánh dấu nhóm này đã được tải xong
        preloadedStatus[i] = true;
        
        // Cập nhật trạng thái tải
        if (i === 0) {
          // Nhóm đầu tiên, đã tải xong
          setIsPreloaded(prev => ({...prev, [i]: true}));
        } else if (i === 1) {
          // Nhóm tiếp theo, đã tải xong và sẵn sàng
          setIsPreloaded(prev => ({...prev, [i]: true}));
          setLoadingNextGroup(false);
        } else {
          // Các nhóm khác, cập nhật trạng thái
          setIsPreloaded(prev => ({...prev, [i]: true}));
        }
      }
      
      // Tất cả đã được tải xong
      setAllGroupsPreloaded(true);
      console.log("Đã tải xong tất cả các nhóm câu hỏi");
      toast.success("Đã tải xong tất cả nội dung bài thi!", {
        duration: 2000,
        position: "bottom-center"
      });
      
    } catch (error) {
      console.error("Lỗi khi tải trước tài nguyên:", error);
      toast.error("Có lỗi khi tải trước nội dung bài thi", {
        duration: 2000,
        position: "bottom-center"
      });
    }
  };

  // Xử lý audio khi chuyển nhóm câu hỏi
  useEffect(() => {
    console.log("useEffect cho audio được kích hoạt, currentGroupIndex =", currentGroupIndex);
    
    // Hủy bỏ timeout cũ nếu có
    if (autoNextRef.current) {
      clearTimeout(autoNextRef.current);
      autoNextRef.current = null;
    }
    
    // Reset trạng thái audio khi chuyển nhóm
    setAudioEnded(false);
    
    if (test && test.questionGroups[currentGroupIndex]?.audioUrl && audioRef.current) {
      const audioUrl = getFullUrl(test.questionGroups[currentGroupIndex].audioUrl);
      console.log("Đang thiết lập audio mới:", audioUrl);
      
      // Cập nhật src với URL đầy đủ
      audioRef.current.src = audioUrl;
      audioRef.current.load(); // Tải lại audio với src mới
      
      // Thiết lập onended handler trực tiếp
      audioRef.current.onended = () => {
        console.log("Audio đã kết thúc (từ onended handler)");
        setAudioEnded(true);
        
        // Thông báo audio đã kết thúc
        toast.info("File âm thanh đã phát xong, đang chuyển sang nhóm tiếp theo...", { 
          duration: 2000,
          position: "bottom-center" 
        });
        
        // Tự động chuyển nhóm sau khi audio kết thúc (nếu không phải nhóm cuối)
        if (test && currentGroupIndex < test.questionGroups.length - 1) {
          console.log("Đang chuẩn bị tự động chuyển nhóm sau 2 giây");
          autoNextRef.current = setTimeout(() => {
            console.log("Đang tự động chuyển nhóm");
            setCurrentGroupIndex(prev => prev + 1);
            window.scrollTo(0, 0); // Scroll lên đầu trang
          }, 2000);
        }
      };
      
      // Timeout nhỏ để đảm bảo audio đã tải xong trước khi phát
      setTimeout(() => {
        try {
          console.log("Đang cố gắng phát audio");
          const playPromise = audioRef.current?.play();
          if (playPromise) {
            playPromise.catch(err => {
              console.error("Không thể tự động phát audio:", err);
              setAudioEnded(true); // Nếu không thể phát được, vẫn cho phép chuyển tiếp
            });
          }
        } catch (error) {
          console.error("Lỗi khi phát audio:", error);
          setAudioEnded(true);
        }
      }, 500);
    } else {
      // Không có audio hoặc không phải phần nghe
      console.log("Không có audio hoặc không phải phần nghe");
      setAudioEnded(true);
    }
    
    // Clean up
    return () => {
      if (autoNextRef.current) {
        clearTimeout(autoNextRef.current);
        autoNextRef.current = null;
      }
      
      if (audioRef.current) {
        audioRef.current.onended = null;
      }
    };
  }, [currentGroupIndex, test]);

  // Timer
  useEffect(() => {
    if (isCompleted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          setIsCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isCompleted])

  // Đếm số câu hỏi đã trả lời khi answers thay đổi
  useEffect(() => {
    const answered = Object.keys(answers).length;
    setAnsweredQuestions(answered);
  }, [answers]);

  // Format thời gian từ giây thành MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Tính toán progress
  const calculateProgress = () => {
    if (totalQuestions === 0) return 0;
    return (answeredQuestions / totalQuestions) * 100;
  };

  // Chuyển đến nhóm câu hỏi tiếp theo
  const handleNext = () => {
    if (test && currentGroupIndex < test.questionGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      window.scrollTo(0, 0); // Scroll lên đầu trang
    }
  };

  // Quay lại nhóm câu hỏi trước đó
  const handlePrevious = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
      window.scrollTo(0, 0); // Scroll lên đầu trang
    }
  };

  // Ghi lại câu trả lời của người dùng
  const handleAnswer = (questionId: number, answerId: string) => {
    // Log dữ liệu đáp án để debug
    console.log(`Đã chọn đáp án: ID=${answerId} cho câu hỏi ID=${questionId}`);
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  // Kiểm tra xem tất cả câu hỏi trong nhóm hiện tại đã được trả lời chưa
  const areAllQuestionsInCurrentGroupAnswered = () => {
    if (!test) return false;
    
    const currentGroup = test.questionGroups[currentGroupIndex];
    if (!currentGroup || !currentGroup.questions) return true;
    
    return currentGroup.questions.every(question => answers[question.id] !== undefined);
  };

  // Xử lý khi người dùng nộp bài
  const handleFinishTest = async () => {
    try {
      if (!test) return;
      
      // Tổng hợp kết quả
      const userAnswers = Object.entries(answers).map(([questionId, optionId]) => {
        // Tìm câu hỏi và đáp án tương ứng
        const questionObj = test.questionGroups
          .flatMap(group => group.questions || [])
          .find(q => q.id === parseInt(questionId));
        
        // Lấy optionKey từ optionId đã chọn
        const option = questionObj?.options.find(opt => opt.id.toString() === optionId);
        
        console.log(`Câu ${questionId}: Chọn ${option?.optionKey || ""} (ID: ${optionId}), Đáp án đúng: ${questionObj?.correctAnswer || "không rõ"}`);
        
        return {
        questionId: parseInt(questionId),
          userAnswer: option?.optionKey || ""
        };
      });
      
      // Gửi kết quả làm bài lên server
      const result = await submitTestResult({
        testId: test.id,
        completionTimeInMinutes: (test.duration * 60 - timeLeft) / 60, // Chuyển từ giây sang phút
        userAnswers: userAnswers
      });
      
      console.log("Kết quả làm bài:", result);
      
      // Tính toán số câu đúng
      let correct = 0;
      test.questionGroups.forEach(group => {
        if (group.questions && group.questions.length > 0) {
          group.questions.forEach(question => {
            console.log(`Đáp án đúng của câu hỏi ${question.id}: ${question.correctAnswer}`);
            console.log(`Đáp án đã chọn: ${answers[question.id]}`);
            
            // Tìm option đã chọn dựa trên ID
            const selectedOption = question.options?.find(opt => 
              opt.id.toString() === answers[question.id]
            );
            
            // Lấy optionKey của đáp án đã chọn
            const selectedOptionKey = selectedOption?.optionKey || "";
            
            // So sánh optionKey đã chọn với correctAnswer
            const isCorrect = selectedOptionKey === question.correctAnswer;
            
            console.log(`Đáp án đúng: ${question.correctAnswer}`);
            console.log(`Đáp án đã chọn: ${selectedOptionKey}`);
            console.log(`Đúng: ${isCorrect}`);
            
            if (isCorrect) {
              correct++;
            }
          });
        }
      });
      
      setCorrectAnswers(correct);
      setIsCompleted(true);
      
      // Hiển thị thông báo hoàn thành
      toast.success("Đã hoàn thành bài thi!");
      
    } catch (error) {
      console.error("Lỗi khi nộp bài thi:", error);
      toast.error("Không thể nộp bài thi. Vui lòng thử lại.");
    }
  };

  // Tính toán tỷ lệ % điểm số
  const scorePercentage = totalQuestions > 0 
    ? (correctAnswers / totalQuestions) * 100 
    : 0;

  // Kiểm tra xem có thể chuyển sang nhóm tiếp theo không
  const canProceedToNextGroup = () => {
    // Có thể bỏ qua điều kiện này để cho phép chuyển khi chưa trả lời hết
    return true; // areAllQuestionsInCurrentGroupAnswered();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Đang tải bài thi...</p>
        </div>
      </div>
    )
  }

  if (!test || test.questionGroups.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy bài thi</h1>
            <p className="mb-4">Không thể tải thông tin bài thi hoặc bài thi không có câu hỏi. Vui lòng thử lại sau.</p>
            <Button onClick={() => navigate("/practice-tests")}>Quay lại danh sách bài thi</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Hiển thị kết quả khi hoàn thành bài thi
  if (isCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Kết quả bài thi {test.title}</CardTitle>
              <div className="flex gap-2">
                {getDifficultyBadge(test.difficulty || 'MEDIUM')}
                {getExamTypeBadge(test.type)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-1">Điểm của bạn: {correctAnswers}/{totalQuestions}</h2>
              <p className="text-lg font-medium text-muted-foreground">{scorePercentage.toFixed(1)}%</p>
              
              <div className="mt-4 mb-6">
                <Progress value={scorePercentage} className="h-3" />
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Kết Quả Chi Tiết</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span>Tổng số câu hỏi:</span>
                    <span className="font-medium">{totalQuestions}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Số câu đã trả lời:</span>
                    <span className="font-medium">{answeredQuestions}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Số câu trả lời đúng:</span>
                    <span className="font-medium">{correctAnswers}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span>Tỷ lệ chính xác:</span>
                    <span className="font-medium">{scorePercentage.toFixed(1)}%</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Thời gian còn lại:</span>
                    <span className="font-medium">{formatTime(timeLeft)}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Câu Trả Lời Chi Tiết</h2>
              <div className="space-y-4">
                {test.questionGroups.map((group, groupIndex) => (
                  <div key={group.id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{getGroupTitle(group)}</h3>
                    <div className="space-y-4">
                      {group.questions && group.questions.length > 0 ? (
                        group.questions.map((question, qIndex) => {
                        const userAnswer = answers[question.id] || "";
                          
                          // Tìm option đã chọn dựa trên ID
                          const selectedOption = question.options?.find(opt => 
                            opt.id.toString() === userAnswer
                          );
                          
                          // Lấy optionKey của đáp án đã chọn
                          const selectedOptionKey = selectedOption?.optionKey || "";
                          
                          // So sánh optionKey đã chọn với correctAnswer
                          const isCorrect = selectedOptionKey === question.correctAnswer;
                          
                          const answerClass = userAnswer ? (isCorrect ? "text-green-600" : "text-red-600") : "text-gray-500";
                          
                          // Tính toán số thứ tự câu hỏi liên tục
                          let questionNumber = qIndex + 1;
                          for (let i = 0; i < groupIndex; i++) {
                            questionNumber += test.questionGroups[i].questions?.length || 0;
                          }

                          // Format số câu hỏi thành dạng 001, 002,...
                          const formattedNumber = String(questionNumber).padStart(3, '0');
                        
                        return (
                            <div key={question.id} className="border-t pt-4">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-base">{group.title || `Part ${group.part}`} - Question {formattedNumber}</h4>
                              </div>
                              <div className="flex justify-between mt-1">
                                <p className="font-medium">Câu {questionNumber}</p>
                                <p className={answerClass}>
                                  {userAnswer ? (isCorrect ? "Đúng" : "Sai") : "Không trả lời"}
                                </p>
                              </div>
                              
                              <p className="mt-2 mb-3">{question.question}</p>
                              
                              <div className="space-y-2 pl-4">
                                {question.options && [...question.options]
                                  .sort((a, b) => a.optionKey.localeCompare(b.optionKey))
                                  .map((option) => {
                                    const isSelected = option.id.toString() === userAnswer;
                                    const isCorrectOption = option.optionKey === question.correctAnswer;
                                    
                                    let optionClass = "p-1.5 rounded";
                                    
                                    if (isSelected) {
                                      optionClass += isCorrectOption 
                                        ? " bg-green-100 text-green-800 font-medium" 
                                        : " bg-red-100 text-red-800 font-medium";
                                    } else if (isCorrectOption) {
                                      optionClass += " bg-green-100 text-green-800";
                                    }
                                    
                                    return (
                                      <div key={option.id} className={optionClass}>
                                        <span className="font-medium">{option.optionKey}. </span>
                                        {option.optionText}
                                        {isSelected && isCorrectOption && <span className="ml-2 text-green-600">(Đáp án đúng)</span>}
                                        {isSelected && !isCorrectOption && <span className="ml-2 text-red-600">(Đã chọn)</span>}
                                        {!isSelected && isCorrectOption && <span className="ml-2 text-green-600">(Đáp án đúng)</span>}
                                      </div>
                                    );
                                  })
                                }
                              </div>
                              
                              {question.explanation && (
                                <div className="mt-3 p-2 bg-slate-50 rounded">
                                  <p className="text-sm text-slate-700">
                                    <span className="font-medium">Giải thích: </span>
                                    {question.explanation}
                              </p>
                            </div>
                              )}
                          </div>
                        );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">Không có câu hỏi nào trong nhóm này</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button className="w-full" onClick={() => navigate("/practice-tests")}>
                Quay lại danh sách bài thi
              </Button>
              <Button className="w-full" onClick={() => navigate("/test-history")}>
                Xem lịch sử bài làm
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentGroup = test.questionGroups[currentGroupIndex]
  const isListeningPart = currentGroup.part <= 4
  const isFirstGroup = currentGroupIndex === 0
  const isLastGroup = currentGroupIndex === test.questionGroups.length - 1

  // Màn hình làm bài
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Audio player cho phần nghe */}
      {isListeningPart && currentGroup.audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-3 flex items-center justify-center z-50">
          <div className="w-full max-w-3xl flex items-center gap-4">
            <span className="text-sm font-medium">Audio cho Part {currentGroup.part}:</span>
          <audio 
              ref={audioRef}
              controls
              autoPlay={false}
            preload="auto" 
              className="w-full max-w-md"
              onEnded={() => setAudioEnded(true)}
            >
              <source src={getFullUrl(currentGroup.audioUrl)} type="audio/mpeg" />
              Trình duyệt của bạn không hỗ trợ audio player.
            </audio>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header section */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <div className="flex items-center gap-2">
              {getDifficultyBadge(test.difficulty || 'MEDIUM')}
              {getExamTypeBadge(test.type)}
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-muted p-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
            <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Tiến độ: {answeredQuestions}/{totalQuestions}</span>
              <div className="w-32">
                <Progress value={calculateProgress()} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions section - chỉ hiển thị khi mới bắt đầu và cho phép ẩn đi */}
        {showInstructions && isFirstGroup && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-medium">Hướng dẫn làm bài</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowInstructions(false)}>
                  Ẩn
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{test.instructions || 'Đọc kỹ câu hỏi và chọn đáp án đúng. Bạn có thể di chuyển giữa các phần bài thi bằng các nút chuyển hướng.'}</p>
                
                <div className="mt-3 p-3 bg-secondary rounded-md">
                  <p className="font-medium mb-1">Lưu ý cho đề thi này:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {test.type === 'LISTENING_ONLY' && (
                      <li>Đây là đề thi chỉ có phần nghe. Hãy đảm bảo bạn sử dụng tai nghe hoặc loa.</li>
                    )}
                    {test.type === 'READING_ONLY' && (
                      <li>Đây là đề thi chỉ có phần đọc. Đọc kỹ từng đoạn văn trước khi trả lời.</li>
                    )}
                    {test.type === 'GRAMMAR_ONLY' && (
                      <li>Đây là đề thi tập trung vào ngữ pháp. Hãy chú ý đến cấu trúc câu và quy tắc ngữ pháp.</li>
                    )}
                    {test.type === 'VOCABULARY_ONLY' && (
                      <li>Đây là đề thi tập trung vào từ vựng. Chọn từ phù hợp nhất với ngữ cảnh.</li>
                    )}
                    {test.type === 'MINI' && (
                      <li>Đây là đề thi rút gọn với số lượng câu hỏi ít hơn đề thi đầy đủ.</li>
                    )}
                    {test.type === 'FULL' && (
                      <li>Đây là đề thi đầy đủ bao gồm cả phần nghe và phần đọc.</li>
                    )}
                    <li>Thời gian làm bài: {test.duration} phút.</li>
                    <li>Độ khó: {test.difficulty || 'Trung bình'}.</li>
                  </ul>
                </div>
          </div>
            </CardContent>
          </Card>
        )}

        {/* Question Group Section */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                {getGroupTitle(currentGroup)}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Part {currentGroup.part}</span>
                {isListeningPart ? 
                  <Badge className="bg-blue-500">Nghe</Badge> : 
                  <Badge className="bg-green-500">Đọc</Badge>
                }
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Passage or image */}
            {currentGroup.passage && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-line">{currentGroup.passage}</p>
              </div>
            )}

              {currentGroup.imageUrl && (
              <div className="mb-6 flex justify-center">
                  <img
                    src={getFullUrl(currentGroup.imageUrl)}
                  alt="Question material" 
                  className="max-w-full h-auto rounded-lg shadow-sm"
                  />
              </div>
            )}

            {/* Questions list */}
            <div className="space-y-8">
              {/* Log dữ liệu để debug */}
              {currentGroup.questions && currentGroup.questions.length > 0 ? (
                currentGroup.questions.map((question, index) => {
                  // Tính toán số thứ tự câu hỏi dựa trên vị trí trong tất cả các nhóm
                  let questionNumber = index + 1;
                  
                  // Cộng thêm tổng số câu hỏi từ các nhóm trước đó
                  for (let i = 0; i < currentGroupIndex; i++) {
                    questionNumber += test.questionGroups[i].questions?.length || 0;
                  }
                  
                  return (
                    <div key={question.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-lg">Câu {questionNumber}</h3>
                        {answers[question.id] && (
                          <Badge variant="outline" className="text-primary">Đã trả lời</Badge>
              )}
            </div>

                      <p className="mb-4">{question.question}</p>

            <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) => handleAnswer(question.id, value)}
                      >
                        <div className="space-y-3">
                          {question.options && [...question.options]
                            .sort((a, b) => a.optionKey.localeCompare(b.optionKey))
                            .map((option) => (
                            <div key={option.id} className="flex items-start space-x-2 rounded-md border p-3 hover:bg-accent">
                              <RadioGroupItem value={String(option.id)} id={`option-${option.id}`} />
                              <Label htmlFor={`option-${option.id}`} className="flex-grow cursor-pointer">
                                <span className="font-medium">{option.optionKey}. </span>
                          {option.optionText}
                  </Label>
                      </div>
                    ))}
                        </div>
                  </RadioGroup>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Không tìm thấy câu hỏi nào. Vui lòng kiểm tra lại đề thi.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={isFirstGroup}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>

          <div className="flex gap-2">
            {!isLastGroup ? (
            <Button
              onClick={handleNext}
              disabled={!canProceedToNextGroup()}
              >
                Tiếp theo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleFinishTest}>
                      Nộp bài
          </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Nộp bài và xem kết quả</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
