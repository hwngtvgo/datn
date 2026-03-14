"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Loader2, ChevronLeft, ChevronRight, Volume2, Award, BookOpen, Lightbulb } from "lucide-react"
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
import { submitTestResultWithGuestSupport } from "@/services/testResultService"
import { QuestionGroupResponse, QuestionResponse, DifficultyLevel, ExamType } from "@/types/toeic"
import { API_URL } from "@/config/constants"

// Components
import TestHeader from "@/components/test/TestHeader"
import QuestionTestMode from "@/components/test/QuestionTestMode"
import TestResults from "@/components/test/TestResults"
import ReviewMode from "@/components/test/ReviewMode"
import TestFinishingScreen from "@/components/test/TestFinishingScreen"

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
  return `${API_URL}/files/view/${url}`;
};

// Hàm để hiển thị badge độ khó
const getDifficultyBadge = (difficulty: string) => {
  switch(difficulty) {
    case DifficultyLevel.EASY:
      return <Badge className="bg-green-500">Dễ</Badge>;
    case DifficultyLevel.HARD:
      return <Badge className="bg-red-500">Khó</Badge>;
    case DifficultyLevel.MEDIUM:
    default:
      return <Badge className="bg-yellow-500">Trung bình</Badge>;
  }
};

// Hàm để hiển thị badge loại đề thi
const getExamTypeBadge = (type: string | undefined) => {
  switch(type) {
    case ExamType.FULL:
      return <Badge className="bg-purple-500">Đề thi đầy đủ</Badge>;
    case ExamType.MINI:
      return <Badge className="bg-blue-500">Đề thi rút gọn</Badge>;
    case ExamType.LISTENING_ONLY:
      return <Badge className="bg-indigo-500">Chỉ phần nghe</Badge>;
    case ExamType.READING_ONLY:
      return <Badge className="bg-green-500">Chỉ phần đọc</Badge>;
    case ExamType.GRAMMAR_ONLY:
      return <Badge className="bg-orange-500">Ngữ pháp</Badge>;
    case ExamType.VOCABULARY_ONLY:
      return <Badge className="bg-pink-500">Từ vựng</Badge>;
    default:
      return <Badge className="bg-gray-500">Khác</Badge>;
  }
};

import authModule from "@/modules/auth/authModule"

export default function TestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [test, setTest] = useState<TestData | null>(null)
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  // Audio states
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false)
  const [audioEnded, setAudioEnded] = useState(false)
  const [manualPlayRequired, setManualPlayRequired] = useState(false)
  
  // Test phases
  const [currentPhase, setCurrentPhase] = useState<'listening' | 'reading'>('listening')
  const [listeningCompleted, setListeningCompleted] = useState(false)
  const [readingStarted, setReadingStarted] = useState(false)
  
  // State để theo dõi quá trình làm bài
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  // State để hiển thị thông tin chi tiết
  const [showInstructions, setShowInstructions] = useState(true)
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set())
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [reviewGroupIndex, setReviewGroupIndex] = useState(0)
  const [showSidebar, setShowSidebar] = useState(false)

  // Thêm state để theo dõi trạng thái kết thúc bài thi
  const [isFinishing, setIsFinishing] = useState(false)
  const [finishCountdown, setFinishCountdown] = useState(5)

  // Thêm state để theo dõi trạng thái xử lý kết quả
  const [isProcessingResult, setIsProcessingResult] = useState(false)

  // Hàm kiểm tra xem một nhóm câu hỏi có phải là phần nghe hay không
  const isListeningGroup = (group: QuestionGroupResponse) => {
    // Kiểm tra part và questionType để xác định phần nghe
    if (group.part !== null && group.part !== undefined) {
      if (group.part <= 4 && group.part > 0) {
        return true;
      }
    }
    
    // Kiểm tra questionType để xác định phần nghe
    if (group.questionType === 'LISTENING') {
      return true;
    }
    
    return false;
  };
  
  // Hàm kiểm tra xem một nhóm câu hỏi có phải là phần đọc, từ vựng hoặc ngữ pháp
  const isReadingGroup = (group: QuestionGroupResponse) => {
    // Kiểm tra part và questionType để xác định phần đọc/từ vựng/ngữ pháp
    if (group.part !== null && group.part !== undefined) {
      if (group.part > 4 || group.part === 0) {
        return true;
      }
    } else {
      // Nếu part là null hoặc undefined, kiểm tra questionType
      if (group.questionType === 'READING' || 
          group.questionType === 'GRAMMAR' || 
          group.questionType === 'VOCABULARY') {
        return true;
      }
    }
    
    return false;
  }

  // Load test data
  useEffect(() => {
    const loadTest = async () => {
      if (!id) return
      
      setIsLoading(true)
      try {
        console.log("Đang tải dữ liệu bài thi với ID:", id)
        const examData = await toeicExamService.getExamById(Number(id))
        console.log("Dữ liệu bài thi:", examData)
        
        const questionsData = await toeicExamService.getExamQuestions(Number(id))
        console.log("Dữ liệu câu hỏi:", questionsData)
        
        // Sắp xếp các nhóm câu hỏi theo thứ tự part
        const sortedGroups = [...questionsData].sort((a: QuestionGroupResponse, b: QuestionGroupResponse) => {
          // Xử lý trường hợp part là null hoặc undefined
          const partA = a.part !== null && a.part !== undefined ? a.part : 
                       a.questionType === 'GRAMMAR' ? 100 : 
                       a.questionType === 'VOCABULARY' ? 101 : 102;
          const partB = b.part !== null && b.part !== undefined ? b.part : 
                       b.questionType === 'GRAMMAR' ? 100 : 
                       b.questionType === 'VOCABULARY' ? 101 : 102;
          
          return partA - partB;
        });
        
        // Kiểm tra xem bài thi có phải chỉ có phần nghe không
        const hasListening = sortedGroups.some(group => isListeningGroup(group));
        const hasReading = sortedGroups.some(group => isReadingGroup(group));
        
        // Nếu bài thi chỉ có phần nghe, thêm một nhóm câu hỏi "giả" ở cuối
        if (hasListening && !hasReading && examData.type === ExamType.LISTENING_ONLY) {
          console.log("Bài thi chỉ có phần nghe, thêm nhóm câu hỏi giả ở cuối");
          
          // Tạo một nhóm câu hỏi giả với part = 0 để nó không hiển thị
          const fakeGroup: QuestionGroupResponse = {
            id: -1,
            part: 0,
            questionType: 'READING',
            title: "Kết thúc bài thi",
            questions: []
          };
          
          // Thêm vào cuối danh sách
          sortedGroups.push(fakeGroup);
        }
        
        let questionCount = 0;
        sortedGroups.forEach((group: QuestionGroupResponse) => {
          questionCount += group.questions?.length || 0;
        });
        setTotalQuestions(questionCount);
        
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
        
        // Kiểm tra xem bài thi có phần nghe không
        if (hasListening) {
          setCurrentPhase('listening');
        } else if (hasReading) {
          setCurrentPhase('reading');
          setReadingStarted(true);
          if (examData.duration) {
            setTimeLeft(examData.duration * 60);
          }
        }
        
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu bài thi:', error)
        toast.error("Không thể tải dữ liệu bài thi. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTest()
  }, [id])

  // Xử lý audio khi chuyển nhóm câu hỏi
  useEffect(() => {
    if (test && currentGroupIndex < test.questionGroups.length) {
      const currentGroup = test.questionGroups[currentGroupIndex];
      
      // Kiểm tra xem có phải là nhóm câu hỏi giả không
      if (currentGroup.id === -1) {
        console.log("Đã đến nhóm câu hỏi giả, bắt đầu kết thúc bài thi...");
        // Chuyển sang màn hình kết thúc bài thi
        handleFinishTest();
        return;
      }
      
      const isListeningPart = isListeningGroup(currentGroup);
      
      setAudioEnded(false);
      setIsPlayingQuestion(false);
      setManualPlayRequired(false); // Reset trạng thái phát thủ công
      
      if (isListeningPart && currentPhase === 'listening' && currentGroup.audioUrl && audioRef.current) {
        const audioUrl = getFullUrl(currentGroup.audioUrl);
        console.log("Đang thiết lập audio câu hỏi:", audioUrl);
        
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      
        audioRef.current.onended = () => {
          console.log("Audio câu hỏi đã kết thúc");
          setAudioEnded(true);
          setIsPlayingQuestion(false);
          
          // Kiểm tra xem đây có phải là nhóm câu hỏi cuối cùng không
          const isLastGroup = currentGroupIndex === test.questionGroups.length - 1;
          // Kiểm tra xem nhóm tiếp theo (nếu có) có phải là phần nghe không
          const hasNextListeningGroup = !isLastGroup && 
            isListeningGroup(test.questionGroups[currentGroupIndex + 1]);
          
          // Nếu là nhóm cuối cùng hoặc nhóm tiếp theo không phải phần nghe, đợi lâu hơn
          const waitTime = (isLastGroup || !hasNextListeningGroup) ? 2000 : 1000;
          
          // Hiển thị thông báo phù hợp
          toast.success("✅ Đã phát xong. Đang chuyển sang phần tiếp theo...", {
            duration: waitTime,
            position: "top-center"
          });
          
          setTimeout(() => {
            if (currentGroupIndex < test.questionGroups.length - 1) {
              // Kiểm tra xem nhóm câu hỏi tiếp theo có phải là phần nghe không
              const nextGroup = test.questionGroups[currentGroupIndex + 1];
              if (isListeningGroup(nextGroup) || nextGroup.id === -1) {
                // Chuyển đến nhóm tiếp theo, bao gồm cả nhóm giả
                setCurrentGroupIndex(prev => prev + 1);
              } else {
                // Nếu nhóm tiếp theo không phải phần nghe, chuyển sang phần đọc hoặc kết thúc
                handleStartReading();
              }
            } else {
              // Đã đến nhóm câu hỏi cuối cùng, chuyển sang phần đọc hoặc kết thúc
              handleStartReading();
            }
            window.scrollTo(0, 0);
          }, waitTime);
        };
      
        // Thêm xử lý lỗi khi không thể tải audio
        audioRef.current.onerror = (e) => {
          console.error("Lỗi khi tải audio:", e);
          toast.error("Không thể tải file âm thanh. Vui lòng thử lại sau.", { 
            duration: 3000,
            position: "top-center" 
          });
          
          // Đánh dấu cần phát thủ công
          setManualPlayRequired(true);
          setAudioEnded(false);
          setIsPlayingQuestion(false);
        };
      
        setTimeout(() => {
          setIsPlayingQuestion(true);
          audioRef.current?.play().catch(err => {
            console.error("Không thể tự động phát audio câu hỏi:", err);
            toast.error("Không thể phát audio tự động. Vui lòng nhấn nút phát để nghe.", {
              duration: 5000,
              position: "top-center"
            });
            
            // Hiển thị nút phát thủ công
            setManualPlayRequired(true);
            setAudioEnded(false);
            setIsPlayingQuestion(false);
          });
        }, 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGroupIndex, test, currentPhase]);

  // Chuyển sang phần đọc
  const handleStartReading = () => {
    if (!test) return;
    
    // Tìm nhóm câu hỏi đầu tiên thuộc phần đọc/từ vựng/ngữ pháp
    const readingGroupIndex = test.questionGroups.findIndex(group => isReadingGroup(group) && group.id !== -1);
    
    if (readingGroupIndex !== -1) {
      setCurrentPhase('reading');
      setListeningCompleted(true);
      setReadingStarted(true);
      setCurrentGroupIndex(readingGroupIndex);
      setShowSidebar(true);
      
      if (test.duration) {
        setTimeLeft(test.duration * 60);
      }
      
      // Dừng audio nếu đang phát
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      toast.success("Đã hoàn thành phần nghe! Bắt đầu phần đọc.", {
        duration: 3000,
        position: "top-center"
      });
    } else {
      // Tìm nhóm câu hỏi giả (nếu có)
      const fakeGroupIndex = test.questionGroups.findIndex(group => group.id === -1);
      
      if (fakeGroupIndex !== -1) {
        // Nếu có nhóm câu hỏi giả, chuyển đến nhóm đó
        console.log("Không có phần đọc, chuyển đến nhóm câu hỏi giả");
        setCurrentGroupIndex(fakeGroupIndex);
      } else {
        // Nếu không có phần đọc và không có nhóm giả, tự động nộp bài
        console.log("Bài thi chỉ có phần nghe, đang nộp bài...");
        
        // Đánh dấu đang xử lý kết quả
        setIsProcessingResult(true);
        
        // Nộp bài ngay lập tức
        handleFinishTest();
      }
    }
  };

  // Xử lý đếm ngược thời gian
  useEffect(() => {
    if (!test || !readingStarted || timeLeft <= 0 || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTimeLeft = prev - 1;
        // Khi hết thời gian, tự động nộp bài
        if (newTimeLeft <= 0) {
          clearInterval(timer);
          handleFinishTest();
          return 0;
        }
        return newTimeLeft;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, readingStarted, timeLeft, isCompleted]);

  // Đếm số câu hỏi đã trả lời
  useEffect(() => {
    const answered = Object.keys(answers).length;
    setAnsweredQuestions(answered);
  }, [answers]);

  // Theo dõi câu trả lời để debug
  useEffect(() => {
    console.log("DEBUG - Câu trả lời hiện tại:", answers);
    console.log("DEBUG - Số câu trả lời:", Object.keys(answers).length);
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
    if (test && currentGroupIndex < test.questionGroups.length - 1 && currentPhase === 'reading') {
      setCurrentGroupIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  // Quay lại nhóm câu hỏi trước đó
  const handlePrevious = () => {
    if (currentGroupIndex > 0 && currentPhase === 'reading') {
      const prevGroup = test?.questionGroups[currentGroupIndex - 1];
      if (prevGroup && isReadingGroup(prevGroup)) {
        setCurrentGroupIndex(prev => prev - 1);
        window.scrollTo(0, 0);
      }
    }
  };

  // Ghi lại câu trả lời của người dùng
  const handleAnswer = (questionId: number, answerId: string) => {
    console.log(`Đã chọn đáp án: ID=${answerId} cho câu hỏi ID=${questionId}`);
    
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: answerId
      };
      
      // Cập nhật số câu đã trả lời ngay lập tức
      setAnsweredQuestions(Object.keys(newAnswers).length);
      
      // Lưu câu trả lời vào localStorage ngay lập tức
      try {
        // Tạo key duy nhất cho bài thi hiện tại
        const storageKey = `test_answers_${id}`;
        localStorage.setItem(storageKey, JSON.stringify(newAnswers));
        console.log(`Đã lưu câu trả lời vào localStorage với key ${storageKey}`);
      } catch (error) {
        console.error("Không thể lưu câu trả lời vào localStorage:", error);
      }
      
      return newAnswers;
    });
  };

  // Xử lý khi người dùng nộp bài
  const handleFinishTest = () => {
    // Nếu đang ở trạng thái kết thúc hoặc đang xử lý, không làm gì thêm
    if (isFinishing || isProcessingResult) return;
    
    // Hiển thị màn hình kết thúc
    setIsFinishing(true);
  };

  // Hàm để đánh dấu câu hỏi cần xem lại
  const toggleMarkQuestion = (questionId: number) => {
    setMarkedQuestions(prev => {
      const newMarked = new Set(prev);
      if (newMarked.has(questionId)) {
        newMarked.delete(questionId);
      } else {
        newMarked.add(questionId);
      }
      return newMarked;
    });
  };

  // Hàm để nhảy đến câu hỏi cụ thể
  const jumpToQuestion = (questionId: number) => {
    if (isReviewMode) {
      for (let groupIndex = 0; groupIndex < test!.questionGroups.length; groupIndex++) {
        const group = test!.questionGroups[groupIndex];
        const questionInGroup = group.questions?.find(q => q.id === questionId);
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
    } else {
      for (let groupIndex = 0; groupIndex < test!.questionGroups.length; groupIndex++) {
        const group = test!.questionGroups[groupIndex];
        const questionInGroup = group.questions?.find(q => q.id === questionId);
        if (questionInGroup) {
          setCurrentGroupIndex(groupIndex);
          setTimeout(() => {
            const questionElement = document.getElementById(`question-${questionId}`);
            if (questionElement) {
              questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
          return;
        }
      }
    }
  };

  // Hàm để lấy tất cả câu hỏi theo thứ tự
  const getAllQuestions = () => {
    if (!test) return [];
    
    const allQuestions: Array<{
      id: number;
      question: string;
      part: number | null;
      questionType?: string;
      groupIndex: number;
      questionIndex: number;
    }> = [];
    
    let globalIndex = 0;
    test.questionGroups.forEach((group, groupIndex) => {
      group.questions?.forEach((question, localIndex) => {
        allQuestions.push({
          id: question.id,
          question: question.question,
          part: group.part,
          questionType: group.questionType,
          groupIndex,
          questionIndex: globalIndex + 1
        });
        globalIndex++;
      });
    });
    
    return allQuestions;
  };

  // Hàm để lấy trạng thái câu hỏi
  const getQuestionStatus = (questionId: number) => {
    if (answers[questionId]) return 'answered';
    if (markedQuestions.has(questionId)) return 'marked';
    return 'unanswered';
  };

  // Hàm xử lý khi TestFinishingScreen hoàn thành
  const handleTestComplete = (results: any) => {
    setTestResults(results.detailedResults);
    setTotalQuestions(results.totalQuestions);
    setAnsweredQuestions(results.answeredQuestions);
    setCorrectAnswers(results.correctAnswers);
    setIsCompleted(true);
    setIsProcessingResult(false);
    setIsFinishing(false);
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
  
  if (isFinishing) {
    return (
      <TestFinishingScreen
        test={test!}
        answers={answers}
        onComplete={handleTestComplete}
        timeLeft={timeLeft}
        readingStarted={readingStarted}
      />
    )
  }

  if (isProcessingResult) {
    return (
      <div className="container mx-auto px-4 py-8 h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Đang xử lý kết quả bài thi...</p>
          <p className="text-sm text-muted-foreground">Vui lòng đợi trong giây lát</p>
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
  if (isCompleted && !isReviewMode) {
    return (
      <TestResults
        test={test}
        correctAnswers={correctAnswers}
        totalQuestions={totalQuestions}
        answeredQuestions={answeredQuestions}
        timeLeft={timeLeft}
        isGuestMode={!authModule.isLoggedIn()}
        formatTime={formatTime}
        getDifficultyBadge={getDifficultyBadge}
        getExamTypeBadge={getExamTypeBadge}
        onStartReview={() => {
          setReviewGroupIndex(0);
          setIsReviewMode(true);
          setShowSidebar(true);
        }}
      />
    );
  }

  // Hiển thị chế độ xem lại chi tiết
  if (isCompleted && isReviewMode) {
    return (
      <ReviewMode
        test={test}
        testResults={testResults}
        reviewGroupIndex={reviewGroupIndex}
        correctAnswers={correctAnswers}
        totalQuestions={totalQuestions}
        showSidebar={showSidebar}
        onSetReviewGroupIndex={setReviewGroupIndex}
        onSetShowSidebar={setShowSidebar}
        onJumpToQuestion={jumpToQuestion}
        onExitReview={() => setIsReviewMode(false)}
        getAllQuestions={getAllQuestions}
        getDifficultyBadge={getDifficultyBadge}
        getExamTypeBadge={getExamTypeBadge}
      />
    );
  }

  const currentGroup = test.questionGroups[currentGroupIndex]
  const isListeningPart = isListeningGroup(currentGroup)
  const isFirstGroup = currentGroupIndex === 0
  const isLastGroup = currentGroupIndex === test.questionGroups.length - 1

  // Màn hình làm bài
  return (
    <div className="container mx-auto px-4 py-8">
      <audio ref={audioRef} preload="auto" />

      <div className="max-w-3xl mx-auto">
        {/* Header section */}
        <TestHeader
          test={test}
          currentPhase={currentPhase}
          timeLeft={timeLeft}
          answeredQuestions={answeredQuestions}
          totalQuestions={totalQuestions}
          formatTime={formatTime}
          calculateProgress={calculateProgress}
          getDifficultyBadge={getDifficultyBadge}
          getExamTypeBadge={getExamTypeBadge}
          onFinishTest={handleFinishTest}
        />

        {/* Instructions section */}
        {showInstructions && currentPhase === 'listening' && isFirstGroup && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-medium">Hướng dẫn làm bài - Phần Nghe</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowInstructions(false)}>
                  Ẩn
                </Button>
          </div>
              <div className="text-sm text-muted-foreground">
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <p className="font-medium mb-2">📢 Hướng dẫn phần nghe:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Mỗi part sẽ có hướng dẫn riêng được phát trước</li>
                    <li>Part 1 & 2: Chỉ hiển thị đáp án, không hiển thị câu hỏi</li>
                    <li>Part 3 & 4: Hiển thị cả câu hỏi và đáp án</li>
                    <li>Audio sẽ tự động chuyển sang part tiếp theo</li>
                    <li>Phần nghe không tính thời gian</li>
                  </ul>
          </div>
        </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions section cho phần đọc */}
        {showInstructions && currentPhase === 'reading' && currentGroup.part === 5 && (
        <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-medium">Hướng dẫn làm bài - Phần Đọc</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowInstructions(false)}>
                  Ẩn
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="mt-3 p-3 bg-green-50 rounded-md">
                  <p className="font-medium mb-2">📖 Hướng dẫn phần đọc:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Thời gian làm bài: {test.duration} phút</li>
                    <li>Có thể quay lại câu hỏi trước đó</li>
                    <li>Đọc kỹ từng đoạn văn trước khi trả lời</li>
                    <li>Chú ý đến từ khóa trong câu hỏi</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hiển thị trạng thái audio cho phần nghe */}
        {isListeningPart && currentPhase === 'listening' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-700">Part {currentGroup.part}</span>
            </div>
            {isPlayingQuestion && (
              <p className="text-sm text-blue-600">🎵 Đang phát câu hỏi...</p>
            )}
            {audioEnded && (
              <p className="text-sm text-green-600">✅ Đã phát xong. Đang chuyển sang phần tiếp theo...</p>
            )}
            {!isPlayingQuestion && !audioEnded && !manualPlayRequired && (
              <p className="text-sm text-blue-600">⏳ Đang chuẩn bị...</p>
            )}
            {manualPlayRequired && (
              <div className="mt-2">
                <p className="text-sm text-amber-600 mb-2">⚠️ Không thể tự động phát audio. Vui lòng nhấn nút phát:</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 bg-blue-100"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.play()
                        .then(() => {
                          setIsPlayingQuestion(true);
                          setManualPlayRequired(false);
                        })
                        .catch(err => {
                          console.error("Vẫn không thể phát audio:", err);
                          toast.error("Vẫn không thể phát audio. Vui lòng kiểm tra cài đặt trình duyệt của bạn.", {
                            duration: 5000
                          });
                        });
                    }
                  }}
                >
                  <Volume2 className="h-4 w-4" /> Phát audio
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Question Group Section */}
        <QuestionTestMode
          currentGroup={currentGroup}
          currentGroupIndex={currentGroupIndex}
          test={test}
          answers={answers}
          markedQuestions={markedQuestions}
          currentPhase={currentPhase}
          showSidebar={showSidebar}
          onAnswer={handleAnswer}
          onToggleMarkQuestion={toggleMarkQuestion}
          onSetShowSidebar={setShowSidebar}
          onJumpToQuestion={jumpToQuestion}
          onFinishTest={handleFinishTest}
          getAllQuestions={getAllQuestions}
          getQuestionStatus={getQuestionStatus}
        />

        {/* Navigation buttons - chỉ hiển thị cho phần đọc */}
        {currentPhase === 'reading' && (
          <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
              disabled={currentGroupIndex === 0 || test.questionGroups[currentGroupIndex - 1]?.part <= 4}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>

            <div className="flex gap-2">
              {!isLastGroup ? (
                <Button onClick={handleNext}>
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
        )}

        {/* Hiển thị trạng thái chờ cho phần nghe */}
        {currentPhase === 'listening' && (
          <div className="mt-6 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700 font-medium">
                🎧 Đang trong phần nghe - Hãy nghe audio và chọn đáp án
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Audio sẽ tự động chuyển sang part tiếp theo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
