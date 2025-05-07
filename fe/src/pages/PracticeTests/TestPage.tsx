"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

// Services
import * as toeicExamService from "@/services/toeicExamService"
import { QuestionGroupResponse, QuestionResponse } from "@/types/toeic"
import { API_URL } from "@/config/constants"

// Định nghĩa các interface cần thiết
interface TestData {
  id: number;
  title: string;
  description?: string;
  instructions?: string;
  duration: number;
  type?: string;
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
        
        // Thiết lập dữ liệu bài thi
        setTest({
          id: examData.id,
          title: examData.title,
          description: examData.description,
          instructions: examData.instructions,
          duration: examData.duration,
          type: examData.type,
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (questionId: number, answerId: string) => {
    setAnswers({ ...answers, [questionId]: answerId })
  }

  const handleNext = () => {
    if (!test) return

    if (currentGroupIndex < test.questionGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1)
      window.scrollTo(0, 0) // Scroll lên đầu trang khi chuyển nhóm
    } else {
      handleFinishTest()
    }
  }

  const handlePrevious = () => {
    if (!test || currentGroupIndex === 0) return
    
    setCurrentGroupIndex(currentGroupIndex - 1)
    window.scrollTo(0, 0) // Scroll lên đầu trang khi chuyển nhóm
  }

  const calculateProgress = () => {
    if (!test) return 0

    // Đếm tổng số câu hỏi và số câu đã trả lời
    const totalQuestions = test.questionGroups.reduce((total, group) => total + group.questions.length, 0)
    const completedQuestions = Object.keys(answers).length
    
    return (completedQuestions / totalQuestions) * 100
  }

  // Kiểm tra xem tất cả câu hỏi trong nhóm hiện tại đã được trả lời chưa
  const areAllQuestionsInCurrentGroupAnswered = () => {
    if (!test) return false
    
    const currentGroup = test.questionGroups[currentGroupIndex]
    if (!currentGroup || !currentGroup.questions) return false
    
    // Kiểm tra từng câu hỏi trong nhóm
    for (const question of currentGroup.questions) {
      if (!answers[question.id]) {
        return false
      }
    }
    
    return true
  }

  // Xử lý hoàn thành bài thi
  const handleFinishTest = () => {
    // Có thể gửi kết quả lên server ở đây
    setIsCompleted(true)
    // navigate(`/test-results/${id}`)
  }

  // Kiểm tra có thể chuyển tiếp hay không
  const canProceedToNextGroup = () => {
    if (!test) return false;
    
    const currentGroup = test.questionGroups[currentGroupIndex];
    const isListeningPart = currentGroup.part <= 4;
    
    // Nếu là phần nghe và có audio, phải chờ audio phát xong
    if (isListeningPart && currentGroup.audioUrl && !audioEnded) {
      return false;
    }
    
    // Nếu là phần nghe đã phát hết audio hoặc phần đọc thì luôn cho phép next
    return true;
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

  if (isCompleted) {
    // Tính toán kết quả
    const totalQuestions = test.questionGroups.reduce((total, group) => total + group.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    
    // Đếm số câu trả lời đúng
    let correctAnswers = 0;
    test.questionGroups.forEach(group => {
      group.questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (userAnswer && userAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      });
    });
    
    const scorePercentage = (correctAnswers / totalQuestions) * 100;
    
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Bài Thi Hoàn Thành</h1>
            <p className="mb-4">Cảm ơn bạn đã hoàn thành bài thi TOEIC.</p>
            
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
              <h2 className="text-xl font-semibold mb-4">Chi Tiết Đáp Án</h2>
              <div className="space-y-6">
                {test.questionGroups.map((group, groupIndex) => (
                  <div key={group.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">
                      {group.part <= 4 ? "Phần Nghe" : "Phần Đọc"} - Part {group.part}
                    </h3>
                    <div className="space-y-4">
                      {group.questions.map((question, qIndex) => {
                        const userAnswer = answers[question.id] || "";
                        const isCorrect = userAnswer === question.correctAnswer;
                        
                        return (
                          <div 
                            key={question.id} 
                            className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                          >
                            <p className="font-medium mb-1">
                              Câu {qIndex + 1}: {question.question}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                              <p className="text-sm">
                                <span className="text-muted-foreground">Đáp án của bạn:</span>{" "}
                                <span className={isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                  {userAnswer || "(Chưa trả lời)"}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Đáp án đúng:</span>{" "}
                                <span className="text-green-600 font-medium">{question.correctAnswer}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Button className="w-full" onClick={() => navigate("/practice-tests")}>
              Quay lại danh sách bài thi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentGroup = test.questionGroups[currentGroupIndex]
  const isListeningPart = currentGroup.part <= 4
  const isFirstGroup = currentGroupIndex === 0
  const isLastGroup = currentGroupIndex === test.questionGroups.length - 1

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Phần tử preload cho audio tiếp theo - ẩn không hiển thị */}
        {test && currentGroupIndex < test.questionGroups.length - 1 && 
          test.questionGroups[currentGroupIndex + 1]?.audioUrl && (
          <audio 
            ref={nextAudioRef} 
            preload="auto" 
            className="hidden" 
            src={getFullUrl(test.questionGroups[currentGroupIndex + 1].audioUrl)}
          />
        )}
        
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <p className="text-muted-foreground">
              {isListeningPart ? "Phần Nghe" : "Phần Đọc"} - Part {currentGroup.part} - 
              Nhóm {currentGroupIndex + 1}/{test.questionGroups.length}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Hiển thị thông báo tải */}
        {!allGroupsPreloaded && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Đang tải dữ liệu các nhóm câu hỏi. Việc này chỉ xảy ra lần đầu.</span>
          </div>
        )}

        <Progress value={calculateProgress()} className="mb-6" />

        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Khu vực tài nguyên chung */}
            <div className="mb-6">
              {/* Audio file cho phần Listening */}
              {isListeningPart && currentGroup.audioUrl && (
              <div className="mb-4">
                <div className="bg-muted p-4 rounded-md flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                      Hãy nghe file âm thanh và trả lời tất cả các câu hỏi trong nhóm này.
                  </p>
                </div>
                  <audio
                    ref={audioRef}
                    controls
                    className="w-full mb-4"
                    src={getFullUrl(currentGroup.audioUrl)}
                  >
                    Trình duyệt của bạn không hỗ trợ phát audio.
                </audio>
              </div>
            )}

              {/* Hình ảnh nếu có */}
              {currentGroup.imageUrl && (
                <div className="mb-4">
                  <img
                    src={getFullUrl(currentGroup.imageUrl)}
                    alt="Question illustration"
                    className="max-h-[300px] object-contain mx-auto mb-4 rounded-md"
                  />
              </div>
            )}

              {/* Đoạn văn cho phần Reading */}
              {!isListeningPart && currentGroup.passage && (
                <div className="mb-6 p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Đoạn văn:</h3>
                  <p className="whitespace-pre-line">{currentGroup.passage}</p>
                </div>
              )}
            </div>

            {/* Danh sách câu hỏi trong nhóm */}
            <div className="space-y-8">
              {currentGroup.questions && currentGroup.questions.map((question, qIndex) => (
                <div key={question.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <h3 className="text-lg font-semibold mb-4">
                    Câu {qIndex + 1}: {question.question}
                  </h3>

            <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) => handleAnswer(question.id, value)}
              className="space-y-3"
            >
                    {question.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent"
                >
                        <RadioGroupItem value={option.optionKey} id={`${question.id}-${option.optionKey}`} />
                        <Label htmlFor={`${question.id}-${option.optionKey}`} className="flex-grow cursor-pointer">
                          {option.optionText}
                  </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={isFirstGroup}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Nhóm trước
          </Button>

          {/* Ẩn nút Next khi đang phát audio ở phần nghe */}
          {!(isListeningPart && currentGroup.audioUrl && !audioEnded) && (
            <Button
              onClick={handleNext}
              disabled={!canProceedToNextGroup()}
              className="gap-2"
            >
              {isLastGroup ? "Kết thúc bài thi" : (
                <>
                  Nhóm tiếp theo
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
          </Button>
          )}
        </div>

        {isListeningPart && currentGroup.audioUrl && !audioEnded && (
          <p className="text-center mt-4 text-amber-500 text-sm">
            Đang phát file âm thanh... Sẽ tự động chuyển sang nhóm tiếp theo khi kết thúc.
          </p>
        )}
        
        {!isListeningPart && !areAllQuestionsInCurrentGroupAnswered() && (
          <p className="text-center mt-4 text-red-500 text-sm">
            Vui lòng trả lời tất cả các câu hỏi trong nhóm này trước khi tiếp tục.
          </p>
        )}
      </div>
    </div>
  )
}
