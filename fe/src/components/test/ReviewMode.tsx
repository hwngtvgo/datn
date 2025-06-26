import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Volume2, Bookmark, Award } from "lucide-react";
import { QuestionGroupResponse } from "@/types/toeic";

// Hàm sắp xếp các lựa chọn theo thứ tự chuẩn (A, B, C, D)
const sortOptions = (options: any[]) => {
  return [...options].sort((a, b) => {
    const keyA = a.optionKey.toUpperCase();
    const keyB = b.optionKey.toUpperCase();
    
    if (['A', 'B', 'C', 'D'].includes(keyA) && ['A', 'B', 'C', 'D'].includes(keyB)) {
      const order = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4};
      return order[keyA] - order[keyB];
    }
    
    if (!isNaN(Number(keyA)) && !isNaN(Number(keyB))) {
      return Number(keyA) - Number(keyB);
    }
    
    return keyA.localeCompare(keyB);
  });
};

interface ReviewModeProps {
  test: any;
  testResults: any[];
  reviewGroupIndex: number;
  correctAnswers: number;
  totalQuestions: number;
  showSidebar: boolean;
  onSetReviewGroupIndex: (index: number) => void;
  onSetShowSidebar: (show: boolean) => void;
  onJumpToQuestion: (questionId: number) => void;
  onExitReview: () => void;
  getAllQuestions: () => any[];
  getDifficultyBadge: (difficulty: string) => JSX.Element;
  getExamTypeBadge: (type: string | undefined) => JSX.Element;
}

const ReviewMode: React.FC<ReviewModeProps> = ({
  test,
  testResults,
  reviewGroupIndex,
  correctAnswers,
  totalQuestions,
  showSidebar,
  onSetReviewGroupIndex,
  onSetShowSidebar,
  onJumpToQuestion,
  onExitReview,
  getAllQuestions,
  getDifficultyBadge,
  getExamTypeBadge
}) => {
  const getFullUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/files/view/${url}`;
  };

  const getGroupTitle = (group: QuestionGroupResponse) => {
    if (group.title) {
      return group.title;
    }
    return `Part ${group.part} - ${group.part <= 4 ? 'Listening' : 'Reading'}`;
  };

  const scorePercentage = totalQuestions > 0 
    ? (correctAnswers / totalQuestions) * 100 
    : 0;

  const currentReviewGroup = test?.questionGroups[reviewGroupIndex];
  const currentGroupResults = testResults.filter((result: any) => result.part === currentReviewGroup?.part);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header giống như lúc làm bài */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold">Xem lại: {test?.title}</h1>
          <div className="flex items-center gap-2">
            {test?.difficulty && getDifficultyBadge(test.difficulty)}
            {getExamTypeBadge(test?.type)}
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-muted p-3 rounded-lg mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-600">Xem lại kết quả</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Điểm: {correctAnswers}/{totalQuestions} ({scorePercentage.toFixed(1)}%)</span>
            </div>
            <Button variant="outline" onClick={onExitReview}>
              Quay lại tổng quan
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Question Group Section giống như lúc làm bài */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                {getGroupTitle(currentReviewGroup!)}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetShowSidebar(!showSidebar)}
                >
                  {showSidebar ? 'Ẩn' : 'Hiện'} danh sách câu hỏi
                </Button>
                <span className="text-sm text-muted-foreground">Part {currentReviewGroup?.part}</span>
                <Badge className="bg-blue-500">
                  {currentGroupResults.filter((r: any) => r.isCorrect).length}/{currentGroupResults.length} đúng
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Layout với sidebar cho TẤT CẢ các part */}
            <div className="flex gap-6">
              {/* Sidebar danh sách câu hỏi - có thể ẩn/hiện */}
              {showSidebar && (
                <div className="w-64 flex-shrink-0">
                  <Card className="sticky top-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Danh sách câu hỏi</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSetShowSidebar(false)}
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="grid grid-cols-5 gap-2">
                        {getAllQuestions().map((q) => {
                          const questionResult = testResults.find((r: any) => r.questionId === q.id);
                          const status = questionResult?.isCorrect ? 'correct' : questionResult?.userAnswer ? 'incorrect' : 'unanswered';
                          
                          return (
                            <button
                              key={q.id}
                              onClick={() => onJumpToQuestion(q.id)}
                              className={`
                                relative w-8 h-8 text-xs rounded border-2 font-medium transition-all
                                ${status === 'correct' 
                                  ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200' 
                                  : status === 'incorrect'
                                  ? 'bg-red-100 border-red-500 text-red-700 hover:bg-red-200'
                                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                                }
                              `}
                              title={`Câu ${q.questionIndex} - ${status === 'correct' ? 'Đúng' : status === 'incorrect' ? 'Sai' : 'Chưa trả lời'}`}
                            >
                              {q.questionIndex}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Legend cho review mode */}
                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
                          <span>Đúng</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                          <span>Sai</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-50 border-2 border-gray-300 rounded"></div>
                          <span>Chưa trả lời</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Main content */}
              <div className="flex-1">
                {/* Audio player cho listening parts */}
                {currentReviewGroup?.part <= 4 && currentReviewGroup?.audioUrl && (
                  <Card className="mb-6">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {/* <Volume2 className="h-5 w-5 text-blue-600" /> */}
                        <div className="flex-1">
                          <p className="font-medium text-blue-700 mb-2">Audio Part {currentReviewGroup.part}</p>
                          <audio 
                            controls 
                            className="w-full"
                            src={getFullUrl(currentReviewGroup.audioUrl)}
                          >
                            Trình duyệt của bạn không hỗ trợ audio.
                          </audio>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Passage hoặc image - hiển thị cho tất cả parts */}
                {currentReviewGroup?.passage && (
                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-line">{currentReviewGroup.passage}</p>
                  </div>
                )}

                {currentReviewGroup?.imageUrl && (
                  <div className="mb-6 flex justify-center">
                    <img
                      src={getFullUrl(currentReviewGroup.imageUrl)}
                      alt="Question material" 
                      className="max-w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                )}

                {/* Questions list - hiển thị theo đúng cấu trúc nhóm */}
                <div className="space-y-8">
                  {currentReviewGroup?.questions?.map((question, index) => {
                    // Tính toán số thứ tự câu hỏi trong toàn bộ bài thi
                    let questionNumber = index + 1;
                    for (let i = 0; i < reviewGroupIndex; i++) {
                      questionNumber += test!.questionGroups[i].questions?.length || 0;
                    }

                    // Tìm kết quả của câu hỏi này
                    const result = testResults.find((r: any) => r.questionId === question.id);
                    if (!result) return null;

                    // Kiểm tra xem có hiển thị câu hỏi không (Part 3, 4 và câu hỏi từ vựng/ngữ pháp)
                    const shouldShowQuestion = currentReviewGroup.part > 2 || 
                                               currentReviewGroup.questionType === 'VOCABULARY' || 
                                               currentReviewGroup.questionType === 'GRAMMAR' ||
                                               question.type === 'VOCABULARY' ||
                                               question.type === 'GRAMMAR' ||
                                               question.category === 'VOCABULARY' ||
                                               question.category === 'GRAMMAR';

                    return (
                      <div key={question.id} id={`question-${question.id}`} className="border-b pb-6 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-lg">Câu {questionNumber}</h3>
                          <div className="flex items-center gap-2">
                            {result.isCorrect ? 
                              <Badge className="bg-green-500">Đúng</Badge> : 
                              <Badge className="bg-red-500">Sai</Badge>
                            }
                          </div>
                        </div>

                        {/* Hiển thị câu hỏi - hiển thị cho Part 3, 4, 5, 6, 7 và câu hỏi từ vựng/ngữ pháp */}
                        {shouldShowQuestion && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p><strong>Câu hỏi:</strong> {question.question}</p>
                          </div>
                        )}

                        {/* Ghi chú cho Part 1, 2 */}
                        {currentReviewGroup.part <= 2 && 
                         currentReviewGroup.questionType !== 'VOCABULARY' && 
                         currentReviewGroup.questionType !== 'GRAMMAR' && (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-700">
                              <strong>Lưu ý:</strong> Đây là câu hỏi nghe - nghe audio và chọn đáp án phù hợp.
                            </p>
                          </div>
                        )}

                        {/* Hiển thị đáp án với trạng thái */}
                        <div className="space-y-3">
                          {question.options && sortOptions(question.options).map((option: any) => {
                            const isCorrect = option.optionKey === result.correctAnswer;
                            const isSelected = option.id === result.selectedOptionId;
                            
                            return (
                              <div
                                key={option.id}
                                className={`
                                  flex items-start space-x-2 rounded-md border p-3
                                  ${isCorrect ? 'border-green-500 bg-green-50' : 
                                    isSelected && !isCorrect ? 'border-red-500 bg-red-50' : 
                                    'border-gray-200 bg-white'}
                                `}
                              >
                                <div className="flex items-center space-x-2">
                                  {isSelected && (
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                  )}
                                  {isCorrect && !isSelected && (
                                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                  )}
                                  {!isCorrect && !isSelected && (
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                                  )}
                                </div>
                                <div className="flex-grow">
                                  <Label htmlFor={option.id.toString()} className="flex-grow cursor-pointer">
                                    <span className="font-medium">{option.optionKey}. </span>
                                    {/* Luôn hiển thị nội dung đáp án trong chế độ review */}
                                    {option.optionText}
                                  </Label>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Giải thích */}
                        {result.explanation && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                            <p><strong>Giải thích:</strong> {result.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={() => onSetReviewGroupIndex(Math.max(0, reviewGroupIndex - 1))}
            disabled={reviewGroupIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Trước
          </Button>

          <Button 
            onClick={() => onSetReviewGroupIndex(Math.min((test?.questionGroups.length || 1) - 1, reviewGroupIndex + 1))}
            disabled={reviewGroupIndex === (test?.questionGroups.length || 1) - 1}
          >
            Tiếp theo
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewMode; 