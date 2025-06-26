import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
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

interface QuestionTestModeProps {
  currentGroup: QuestionGroupResponse;
  currentGroupIndex: number;
  test: any;
  answers: Record<string, string>;
  markedQuestions: Set<number>;
  currentPhase: 'listening' | 'reading';
  showSidebar: boolean;
  onAnswer: (questionId: number, answerId: string) => void;
  onToggleMarkQuestion: (questionId: number) => void;
  onSetShowSidebar: (show: boolean) => void;
  onJumpToQuestion: (questionId: number) => void;
  onFinishTest: () => void;
  getAllQuestions: () => any[];
  getQuestionStatus: (questionId: number) => string;
}

const QuestionTestMode: React.FC<QuestionTestModeProps> = ({
  currentGroup,
  currentGroupIndex,
  test,
  answers,
  markedQuestions,
  currentPhase,
  showSidebar,
  onAnswer,
  onToggleMarkQuestion,
  onSetShowSidebar,
  onJumpToQuestion,
  onFinishTest,
  getAllQuestions,
  getQuestionStatus
}) => {
  const getGroupTitle = (group: QuestionGroupResponse) => {
    if (group.title) {
      return group.title;
    }
    
    // Xử lý đặc biệt cho câu hỏi từ vựng và ngữ pháp
    if (group.questionType === 'VOCABULARY') {
      return 'Từ vựng';
    }
    if (group.questionType === 'GRAMMAR') {
      return 'Ngữ pháp';
    }
    
    if (group.part !== null && group.part !== undefined) {
      return `Part ${group.part} - ${group.part <= 4 ? 'Listening' : 'Reading'}`;
    }
    
    return group.questionType || 'Câu hỏi';
  };

  const getFullUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${process.env.REACT_APP_API_URL || 'YOUR_VPS_IP:8080' || 'http://localhost:8080'}/files/view/${url}`;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          {/* <CardTitle className="text-xl">
            {getGroupTitle(currentGroup)}
          </CardTitle> */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentGroup.questionType === 'VOCABULARY' ? 'Từ vựng' : 
               currentGroup.questionType === 'GRAMMAR' ? 'Ngữ pháp' : 
               currentGroup.part !== null && currentGroup.part !== undefined ? `Part ${currentGroup.part}` : 
               'Câu hỏi'}
            </span>
            {currentGroup.questionType === 'VOCABULARY' ? 
              <Badge className="bg-pink-500">Từ vựng</Badge> : 
              currentGroup.questionType === 'GRAMMAR' ? 
              <Badge className="bg-orange-500">Ngữ pháp</Badge> :
              currentGroup.part !== null && currentGroup.part !== undefined && currentGroup.part <= 4 ? 
              <Badge className="bg-blue-500">Nghe</Badge> : 
              <Badge className="bg-green-500">Đọc</Badge>
            }
            {currentPhase === 'reading' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetShowSidebar(!showSidebar)}
              >
                {showSidebar ? 'Ẩn' : 'Hiện'} danh sách câu hỏi
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Passage or image - chỉ hiển thị cho phần đọc */}
        {currentGroup.passage && currentPhase === 'reading' && (
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

        {/* Layout với sidebar chỉ cho phần đọc */}
        {currentPhase === 'reading' ? (
          <div className="flex gap-6">
            {/* Sidebar danh sách câu hỏi - chỉ hiển thị cho phần đọc */}
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
                      {getAllQuestions().filter(q => {
                        // Hiển thị tất cả câu hỏi cho phần đọc, bao gồm cả từ vựng và ngữ pháp
                        return q.part > 4 || 
                               q.part === 0 || 
                               q.part === null || 
                               q.questionType === 'VOCABULARY' || 
                               q.questionType === 'GRAMMAR' ||
                               q.questionType === 'READING';
                      }).map((q) => {
                        const status = getQuestionStatus(q.id);
                        return (
                          <button
                            key={q.id}
                            onClick={() => onJumpToQuestion(q.id)}
                            className={`
                              relative w-8 h-8 text-xs rounded border-2 font-medium transition-all
                              ${status === 'answered' 
                                ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200' 
                                : status === 'marked'
                                ? 'bg-yellow-100 border-yellow-500 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                              }
                            `}
                            title={`Câu ${q.questionIndex} - ${status === 'answered' ? 'Đã trả lời' : status === 'marked' ? 'Đánh dấu' : 'Chưa trả lời'}`}
                          >
                            {q.questionIndex}
                            {markedQuestions.has(q.id) && (
                              <Bookmark className="absolute -top-1 -right-1 h-3 w-3 text-yellow-600 fill-current" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Legend */}
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
                        <span>Đã trả lời</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded relative">
                          <Bookmark className="absolute -top-1 -right-1 h-2 w-2 text-yellow-600 fill-current" />
                        </div>
                        <span>Đánh dấu</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-50 border-2 border-gray-300 rounded"></div>
                        <span>Chưa trả lời</span>
                      </div>
                    </div>
                    
                    {/* Nút nộp bài trong sidebar */}
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        onClick={onFinishTest}
                        variant="destructive"
                        size="sm"
                        className="w-full"
                      >
                        Nộp bài ngay
                      </Button>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Có thể nộp bài bất cứ lúc nào
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main content cho phần đọc */}
            <div className="flex-1">
              {/* Questions list */}
              <div className="space-y-8">
                {currentGroup.questions && currentGroup.questions.length > 0 ? (
                  currentGroup.questions.map((question, index) => {
                    // Tính toán số thứ tự câu hỏi dựa trên vị trí trong tất cả các nhóm
                    let questionNumber = index + 1;
                    
                    // Cộng thêm tổng số câu hỏi từ các nhóm trước đó
                    for (let i = 0; i < currentGroupIndex; i++) {
                      questionNumber += test.questionGroups[i].questions?.length || 0;
                    }

                    // Kiểm tra xem có hiển thị câu hỏi không
                    // Part 1, 2 không hiển thị, Part 3, 4 và câu hỏi từ vựng/ngữ pháp thì hiển thị
                    const shouldShowQuestion = currentGroup.part > 2 || 
                                               currentGroup.questionType === 'VOCABULARY' || 
                                               currentGroup.questionType === 'GRAMMAR' ||
                                               question.type === 'VOCABULARY' ||
                                               question.type === 'GRAMMAR' ||
                                               question.category === 'VOCABULARY' ||
                                               question.category === 'GRAMMAR';
                    
                    return (
                      <div key={question.id} id={`question-${question.id}`} className="border-b pb-6 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-lg">Câu {questionNumber}</h3>
                          <div className="flex items-center gap-2">
                            {answers[question.id] && (
                              <Badge variant="outline" className="text-primary">Đã trả lời</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onToggleMarkQuestion(question.id)}
                              className={`p-1 h-8 w-8 ${markedQuestions.has(question.id) ? 'text-yellow-600' : 'text-gray-400'}`}
                              title={markedQuestions.has(question.id) ? 'Bỏ đánh dấu' : 'Đánh dấu cần xem lại'}
                            >
                              <Bookmark className={`h-4 w-4 ${markedQuestions.has(question.id) ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                        </div>

                        {/* Chỉ hiển thị câu hỏi cho Part 3, 4 */}
                        {shouldShowQuestion && (
                          <p className="mb-4">{question.question}</p>
                        )}

                        {/* Hiển thị ghi chú cho Part 1, 2 */}
                        {!shouldShowQuestion && (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-700">
                              <strong>Lưu ý:</strong> Nghe audio và chọn đáp án phù hợp.
                            </p>
                          </div>
                        )}

                        <RadioGroup
                          value={answers[question.id] || ""}
                          onValueChange={(value) => onAnswer(question.id, value)}
                        >
                          <div className="space-y-3">
                            {question.options && sortOptions(question.options).map((option: any) => (
                              <div
                                key={option.id}
                                className={`
                                  flex items-start space-x-2 rounded-md border p-3 cursor-pointer hover:bg-gray-50
                                  ${option.id.toString() === answers[question.id] ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'}
                                `}
                              >
                                <RadioGroupItem value={option.id.toString()} className="mt-1" />
                                <Label htmlFor={option.id.toString()} className="flex-grow cursor-pointer">
                                  <span className="font-medium">{option.optionKey}. </span>
                                  {/* Hiển thị nội dung đáp án cho Part 3, 4 và câu hỏi từ vựng/ngữ pháp */}
                                  {shouldShowQuestion && option.optionText}
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
            </div>
          </div>
        ) : (
          /* Layout đơn giản cho phần nghe - KHÔNG có sidebar */
          <div className="space-y-8">
            {currentGroup.questions && currentGroup.questions.length > 0 ? (
              currentGroup.questions.map((question, index) => {
                // Tính toán số thứ tự câu hỏi dựa trên vị trí trong tất cả các nhóm
                let questionNumber = index + 1;
                
                // Cộng thêm tổng số câu hỏi từ các nhóm trước đó
                for (let i = 0; i < currentGroupIndex; i++) {
                  questionNumber += test.questionGroups[i].questions?.length || 0;
                }

                // Kiểm tra xem có hiển thị câu hỏi không
                // Part 1, 2 không hiển thị, Part 3, 4 và câu hỏi từ vựng/ngữ pháp thì hiển thị
                const shouldShowQuestion = currentGroup.part > 2 || 
                                           currentGroup.questionType === 'VOCABULARY' || 
                                           currentGroup.questionType === 'GRAMMAR' ||
                                           question.type === 'VOCABULARY' ||
                                           question.type === 'GRAMMAR' ||
                                           question.category === 'VOCABULARY' ||
                                           question.category === 'GRAMMAR';
                
                return (
                  <div key={question.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-lg">Câu {questionNumber}</h3>
                      {answers[question.id] && (
                        <Badge variant="outline" className="text-primary">Đã trả lời</Badge>
                      )}
                    </div>

                    {/* Chỉ hiển thị câu hỏi cho Part 3, 4 trong phần nghe */}
                    {shouldShowQuestion && (
                      <p className="mb-4">{question.question}</p>
                    )}

                    {/* Hiển thị ghi chú cho Part 1, 2 trong phần nghe */}
                    {!shouldShowQuestion && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Lưu ý:</strong> Nghe audio và chọn đáp án phù hợp.
                        </p>
                      </div>
                    )}

                    <RadioGroup
                      value={answers[question.id] || ""}
                      onValueChange={(value) => onAnswer(question.id, value)}
                    >
                      <div className="space-y-3">
                        {question.options && sortOptions(question.options).map((option: any) => (
                          <div
                            key={option.id}
                            className={`
                              flex items-start space-x-2 rounded-md border p-3 cursor-pointer hover:bg-gray-50
                              ${option.id.toString() === answers[question.id] ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'}
                            `}
                          >
                            <RadioGroupItem value={option.id.toString()} className="mt-1" />
                            <Label htmlFor={option.id.toString()} className="flex-grow cursor-pointer">
                              <span className="font-medium">{option.optionKey}. </span>
                              {/* Hiển thị nội dung đáp án cho Part 3, 4 và câu hỏi từ vựng/ngữ pháp */}
                              {shouldShowQuestion && option.optionText}
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
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionTestMode; 