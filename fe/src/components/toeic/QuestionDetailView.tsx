import React from 'react';
import { ToeicQuestionDTO } from '@/services/toeicQuestionService';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_URL } from '@/config/constants';

interface QuestionDetailViewProps {
  questions: ToeicQuestionDTO[];
  groupInfo: {
    part: string, 
    type: string, 
    count: number,
    audioUrl?: string,
    imageUrl?: string,
    passage?: string
  } | null;
}

const QuestionDetailView: React.FC<QuestionDetailViewProps> = ({ questions, groupInfo }) => {
  if (!questions || questions.length === 0) {
    return <div className="py-4 text-center">Không có dữ liệu</div>;
  }
  
  // Lấy câu hỏi đầu tiên để xem thông tin chung
  const firstQuestion = questions[0];
  const questionType = groupInfo?.type || firstQuestion.type || '';
  const isListening = questionType === 'LISTENING';
  const isReading = questionType === 'READING';
  const isVocabulary = questionType === 'VOCABULARY';
  const isGrammar = questionType === 'GRAMMAR';
  
  // Lấy thông tin part
  const hasPart = firstQuestion.part !== undefined || (groupInfo && groupInfo.part !== undefined);
  const part = hasPart 
    ? (groupInfo ? parseInt(groupInfo.part) : firstQuestion.part) 
    : 0;
  
  // Lấy thông tin thời gian
  const createdAt = firstQuestion.createdAt 
    ? new Date(firstQuestion.createdAt).toLocaleString('vi-VN')
    : undefined;
  
  const updatedAt = firstQuestion.updatedAt 
    ? new Date(firstQuestion.updatedAt).toLocaleString('vi-VN')
    : undefined;
  
  // Hàm để xử lý URL audio và image
  const getFullUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Nếu url chỉ chứa tên file hoặc đường dẫn tương đối, thêm API_URL và endpoint xem file
    return `${API_URL}/files/view/${url}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {isListening && `Nhóm câu hỏi Nghe (Part ${part})`}
            {isReading && `Nhóm câu hỏi Đọc (Part ${part})`}
            {isVocabulary && "Nhóm câu hỏi Từ vựng"}
            {isGrammar && "Nhóm câu hỏi Ngữ pháp"}
          </h2>
          <p className="text-muted-foreground">
            {isListening && 'Phần nghe'}
            {isReading && 'Phần đọc'}
            {isVocabulary && 'Từ vựng'}
            {isGrammar && 'Ngữ pháp'}
            {' - '}{questions.length} câu hỏi
          </p>
          
          {(createdAt || updatedAt) && (
            <div className="mt-2 text-xs text-muted-foreground">
              {createdAt && <p>Tạo lúc: {createdAt}</p>}
              {updatedAt && <p>Cập nhật lúc: {updatedAt}</p>}
            </div>
          )}
        </div>
      </div>
      
      {/* Hiển thị tài nguyên chung của nhóm */}
      {/* Audio file */}
      {isListening && (groupInfo?.audioUrl || firstQuestion.audioUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <audio controls className="w-full">
              <source src={getFullUrl(groupInfo?.audioUrl || firstQuestion.audioUrl)} type="audio/mpeg" />
              Trình duyệt của bạn không hỗ trợ phát audio.
            </audio>
          </CardContent>
        </Card>
      )}

      {/* Image file */}
      {(groupInfo?.imageUrl || firstQuestion.imageUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Hình ảnh</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={getFullUrl(groupInfo?.imageUrl || firstQuestion.imageUrl)} 
              alt="Hình ảnh câu hỏi" 
              className="max-h-[300px] object-contain mx-auto"
            />
          </CardContent>
        </Card>
      )}
      
      {/* Passage */}
      {(isReading || (!isListening && (part && part >= 5))) && (groupInfo?.passage || firstQuestion.passage) && (
        <Card>
          <CardHeader>
            <CardTitle>Đoạn văn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap p-4 bg-muted rounded-md max-h-[300px] overflow-y-auto">
              {groupInfo?.passage || firstQuestion.passage}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Hiển thị danh sách câu hỏi */}
      <Tabs defaultValue="list" className="mt-4">
        <TabsList>
          <TabsTrigger value="list">Danh sách câu hỏi</TabsTrigger>
          <TabsTrigger value="details">Chi tiết</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
            {questions.map((q, index) => (
              <Card key={q.id || index} className="overflow-hidden">
                <CardHeader className="p-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Câu {index + 1}</CardTitle>
                    <Badge variant="outline">{q.difficultyLevel}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-sm mb-2">{q.question}</p>
                  <div className="text-xs text-muted-foreground">
                    Đáp án đúng: <Badge variant="secondary">{q.correctAnswer}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <div className="space-y-6">
            {questions.map((q, index) => (
              <Card key={q.id || index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Câu hỏi {index + 1}</CardTitle>
                    <Badge variant="outline">{q.difficultyLevel}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Nội dung câu hỏi:</h4>
                    <p className="p-2 bg-muted rounded">{q.question}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Các lựa chọn:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options?.map((option, optIdx) => (
                        <div 
                          key={optIdx} 
                          className={`p-2 rounded flex items-start gap-2 ${
                            option.optionKey === q.correctAnswer 
                              ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900' 
                              : 'bg-muted'
                          }`}
                        >
                          <span className="font-bold">{option.optionKey}.</span>
                          <span>{option.optionText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <span className="font-medium">Đáp án đúng:</span>
                    <Badge>{q.correctAnswer}</Badge>
                  </div>
                  
                  {q.explanation && (
                    <div>
                      <h4 className="font-medium mb-1">Giải thích:</h4>
                      <p className="p-2 bg-muted rounded">{q.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionDetailView; 