import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface TestResultsProps {
  test: any;
  correctAnswers: number;
  totalQuestions: number;
  answeredQuestions: number;
  timeLeft: number;
  isGuestMode?: boolean;
  formatTime: (seconds: number) => (string);
  getDifficultyBadge: (difficulty: string) => JSX.Element;
  getExamTypeBadge: (type: string | undefined) => JSX.Element;
  onStartReview: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({
  test,
  correctAnswers,
  totalQuestions,
  answeredQuestions,
  timeLeft,
  isGuestMode = false,
  formatTime,
  getDifficultyBadge,
  getExamTypeBadge,
  onStartReview
}) => {
  const navigate = useNavigate();
  
  const scorePercentage = totalQuestions > 0 
    ? (correctAnswers / totalQuestions) * 100 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Kết quả bài thi {test?.title}</CardTitle>
            <div className="flex gap-2">
              {test?.difficulty && getDifficultyBadge(test.difficulty)}
              {getExamTypeBadge(test?.type)}
              {isGuestMode && (
                <Badge variant="secondary">Khách</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Thông báo cho guest mode */}
          {isGuestMode && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">📝 Kết quả tạm thời</h3>
              <p className="text-blue-700 text-sm">
                Bạn đã hoàn thành bài thi với tư cách khách. Kết quả được lưu tạm thời trong trình duyệt. 
                <strong> Đăng nhập để lưu kết quả vĩnh viễn và theo dõi tiến độ học tập!</strong>
              </p>
            </div>
          )}
          
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
          
          <div className="flex gap-4 mt-6">
            <Button 
              className="w-full" 
              onClick={onStartReview}
              variant="outline"
            >
              Xem chi tiết từng câu
            </Button>
            <Button 
              className="w-full" 
              onClick={() => navigate("/practice-tests")}
            >
              Quay lại danh sách bài thi
            </Button>
            {isGuestMode ? (
              <Button 
                className="w-full" 
                onClick={() => navigate("/login")}
                variant="default"
              >
                Đăng nhập ngay
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={() => navigate("/test-history")}
              >
                Xem lịch sử bài làm
              </Button>
            )}
          </div>
          
          {/* Gợi ý đăng ký cho guest */}
          {isGuestMode && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border rounded-lg">
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 mb-2">💡 Bạn chưa có tài khoản?</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Tạo tài khoản miễn phí để lưu kết quả, theo dõi tiến độ và nhận gợi ý học tập cá nhân hóa!
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/register")}
                  className="text-sm"
                >
                  Đăng ký miễn phí
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResults; 