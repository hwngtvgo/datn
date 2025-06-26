import { useState, useEffect } from "react";
import { Award, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitTestResultWithGuestSupport } from "@/services/testResultService";
import authModule from "@/modules/auth/authModule";

interface TestFinishingScreenProps {
  test: any;
  answers: Record<string, string>;
  onComplete: (results: any) => void;
  timeLeft: number;
  readingStarted: boolean;
}

const TestFinishingScreen = ({
  test,
  answers,
  onComplete,
  timeLeft,
  readingStarted
}: TestFinishingScreenProps) => {
  const [countdown, setCountdown] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Đảm bảo rằng câu trả lời cuối cùng được lưu vào localStorage ngay khi component được render
  useEffect(() => {
    // Lưu câu trả lời vào localStorage ngay lập tức
    try {
      const storageKey = `test_answers_${test.id}`;
      localStorage.setItem(storageKey, JSON.stringify(answers));
      console.log("TestFinishingScreen: Đã lưu câu trả lời cuối cùng vào localStorage");
    } catch (error) {
      console.error("TestFinishingScreen: Không thể lưu câu trả lời vào localStorage:", error);
    }
  }, [test.id, answers]);

  // Bắt đầu đếm ngược và xử lý kết quả
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else {
      // Khi đếm ngược kết thúc, bắt đầu xử lý kết quả
      processTestResult();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);
  
  // Xử lý kết quả bài thi
  const processTestResult = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      console.log("TestFinishingScreen: Đang xử lý kết quả bài thi");
      
      // Thử lấy câu trả lời từ localStorage để đảm bảo có câu trả lời mới nhất
      let finalAnswers = {...answers};
      try {
        const storageKey = `test_answers_${test.id}`;
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          const savedAnswers = JSON.parse(savedData);
          // Nếu có nhiều câu trả lời hơn trong localStorage, sử dụng dữ liệu đó
          if (Object.keys(savedAnswers).length >= Object.keys(answers).length) {
            finalAnswers = savedAnswers;
            console.log("TestFinishingScreen: Sử dụng câu trả lời từ localStorage");
          }
        }
      } catch (error) {
        console.error("TestFinishingScreen: Lỗi khi đọc từ localStorage:", error);
      }
      
      // Tạo mảng chứa tất cả câu trả lời
      const userAnswers: any[] = [];
      let correct = 0;
      const detailedResults: any[] = [];
      let totalQuestionCount = 0;
      let answeredCount = 0;
      
      // Duyệt qua tất cả câu hỏi trong bài thi
      test.questionGroups.forEach((group: any) => {
        // Bỏ qua nhóm câu hỏi giả (id = -1)
        if (group.id === -1) return;
        
        if (group.questions && group.questions.length > 0) {
          group.questions.forEach((question: any) => {
            totalQuestionCount++;
            
            // Lấy đáp án người dùng đã chọn
            const selectedOptionId = finalAnswers[question.id];
            const selectedOption = question.options?.find((opt: any) => 
              opt.id.toString() === selectedOptionId
            );
            
            // Xác định đáp án người dùng chọn
            const selectedOptionKey = selectedOption?.optionKey || "";
            const isCorrect = selectedOptionKey === question.correctAnswer;
            
            // Nếu người dùng đã chọn đáp án cho câu hỏi này
            if (selectedOptionId) {
              answeredCount++;
              userAnswers.push({
                questionId: question.id,
                userAnswer: selectedOptionKey
              });
              
              if (isCorrect) {
                correct++;
              }
            } else {
              // Nếu người dùng chưa chọn đáp án, thêm một đáp án trống
              userAnswers.push({
                questionId: question.id,
                userAnswer: ""
              });
            }

            // Thêm vào kết quả chi tiết
            detailedResults.push({
              questionId: question.id,
              question: question.question,
              correctAnswer: question.correctAnswer,
              userAnswer: selectedOptionKey,
              selectedOptionId: selectedOption?.id || null,
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
      
      console.log("TestFinishingScreen: Tổng số câu hỏi:", totalQuestionCount);
      console.log("TestFinishingScreen: Số câu đã trả lời:", answeredCount);
      console.log("TestFinishingScreen: Số câu trả lời đúng:", correct);
      
      // Sử dụng function để hỗ trợ guest mode
      const result = await submitTestResultWithGuestSupport({
        testId: test.id,
        completionTimeInMinutes: readingStarted ? (test.duration * 60 - timeLeft) / 60 : 0,
        userAnswers: userAnswers
      }, test, detailedResults);
      
      console.log("TestFinishingScreen: Kết quả làm bài:", result);
      
      // Xóa dữ liệu từ localStorage sau khi đã nộp bài thành công
      try {
        const storageKey = `test_answers_${test.id}`;
        localStorage.removeItem(storageKey);
        console.log(`TestFinishingScreen: Đã xóa dữ liệu từ localStorage với key ${storageKey}`);
      } catch (error) {
        console.error("TestFinishingScreen: Không thể xóa dữ liệu từ localStorage:", error);
      }
      
      // Hiển thị thông báo khác nhau cho guest và user đã đăng nhập
      if ('isGuestResult' in result && result.isGuestResult) {
        toast.success("Đã hoàn thành bài thi! Kết quả đã được lưu tạm thời. Đăng nhập để lưu vĩnh viễn.");
      } else {
        toast.success("Đã hoàn thành bài thi và lưu kết quả!");
      }
      
      // Trả về kết quả cho component cha
      onComplete({
        detailedResults,
        totalQuestions: totalQuestionCount,
        answeredQuestions: answeredCount,
        correctAnswers: correct
      });
      
    } catch (error) {
      console.error("TestFinishingScreen: Lỗi khi xử lý kết quả bài thi:", error);
      toast.error("Không thể xử lý kết quả bài thi. Vui lòng thử lại.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <Award className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Bạn đã hoàn thành bài thi!</h1>
        
        {!isProcessing ? (
          <>
            <p className="text-xl">Kết quả sẽ hiển thị sau {countdown} giây</p>
            <div className="mt-4">
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin flex items-center justify-center">
                <span className="text-xl font-bold">{countdown}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-xl">Đang xử lý kết quả...</p>
            <div className="mt-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          </>
        )}
        
        <p className="text-sm text-muted-foreground mt-6 max-w-md">
          Hệ thống đang xử lý kết quả bài làm của bạn. Vui lòng đợi trong giây lát...
        </p>
      </div>
    </div>
  );
};

export default TestFinishingScreen; 