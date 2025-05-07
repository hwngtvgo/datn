import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

// Services
import * as toeicExamService from "@/services/toeicExamService"
import { ToeicExam, DifficultyLevel, QuestionGroupResponse } from "@/types/toeic"

// Hiển thị badge cho độ khó
const getDifficultyBadge = (difficulty: string) => {
  switch(difficulty) {
    case 'EASY':
      return <Badge className="bg-green-500">Dễ</Badge>;
    case 'MEDIUM':
      return <Badge className="bg-yellow-500">Trung bình</Badge>;
    case 'HARD':
      return <Badge className="bg-red-500">Khó</Badge>;
    default:
      return <Badge>Không xác định</Badge>;
  }
};

// Hiển thị badge cho loại câu hỏi
const getQuestionTypeBadge = (type: string) => {
  if (type === 'LISTENING') {
    return <Badge className="bg-blue-500">Nghe</Badge>;
  } else if (type === 'READING') {
    return <Badge className="bg-green-500">Đọc</Badge>;
  }
  return <Badge>Không xác định</Badge>;
};

// Định nghĩa interface cho dữ liệu đã tổng hợp
interface EnhancedExam extends ToeicExam {
  questionGroups?: QuestionGroupResponse[];
  isExpanded?: boolean;
  isLoading?: boolean;
}

export default function PracticeTests() {
  const [practiceTests, setPracticeTests] = useState<EnhancedExam[]>([]);
  const [loading, setLoading] = useState(true);

  // Tải danh sách đề thi đang active
  useEffect(() => {
    const loadActiveExams = async () => {
      try {
        setLoading(true);
        const response = await toeicExamService.getActiveExams();
        console.log("Đề thi đang active:", response);
        
        if (Array.isArray(response)) {
          const enhancedExams: EnhancedExam[] = response.map(exam => ({
            ...exam,
            isExpanded: false,
            isLoading: false,
            questionGroups: undefined
          }));
          setPracticeTests(enhancedExams);
        } else {
          toast.error("Định dạng dữ liệu không hợp lệ từ API");
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách đề thi:", error);
        toast.error("Không thể tải danh sách đề thi. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    
    loadActiveExams();
  }, []);

  // Hàm để tải nhóm câu hỏi của bài thi
  const loadExamQuestions = async (examId: number, index: number) => {
    // Nếu đã có dữ liệu, chỉ cần toggle hiển thị
    if (practiceTests[index].questionGroups) {
      const updatedTests = [...practiceTests];
      updatedTests[index].isExpanded = !updatedTests[index].isExpanded;
      setPracticeTests(updatedTests);
      return;
    }

    // Nếu chưa có dữ liệu, tải từ API
    try {
      const updatedTests = [...practiceTests];
      updatedTests[index].isLoading = true;
      setPracticeTests(updatedTests);

      const questions = await toeicExamService.getExamQuestions(examId);
      console.log(`Dữ liệu nhóm câu hỏi cho đề thi ${examId}:`, questions);
      
      // Cập nhật state
      const newTests = [...practiceTests];
      newTests[index] = {
        ...newTests[index],
        questionGroups: questions,
        isLoading: false,
        isExpanded: true
      };
      setPracticeTests(newTests);
    } catch (error) {
      console.error(`Lỗi khi tải nhóm câu hỏi cho đề thi ${examId}:`, error);
      toast.error("Không thể tải thông tin nhóm câu hỏi");
      
      const updatedTests = [...practiceTests];
      updatedTests[index].isLoading = false;
      setPracticeTests(updatedTests);
    }
  };

  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Đề Thi TOEIC</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Luyện tập với các đề thi TOEIC đa dạng. Theo dõi quá trình học tập và cải thiện điểm số của bạn.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg">Đang tải danh sách đề thi...</p>
          </div>
        </div>
      ) : practiceTests.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg">Không có đề thi nào đang hoạt động.</p>
          <p className="text-muted-foreground">Vui lòng quay lại sau.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceTests.map((test, index) => (
            <Card key={test.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{test.title}</CardTitle>
                  {getDifficultyBadge(test.difficulty || 'MEDIUM')}
                </div>
                <CardDescription>{test.description || 'Không có mô tả'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-medium">{test.duration} phút</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Loại đề thi:</span>
                    <span className="font-medium">{test.type || 'FULL'}</span>
                  </div>
                  {test.createdAt && (
                    <div className="flex items-center gap-2 col-span-2">
                      <span className="text-muted-foreground">Ngày tạo:</span>
                      <span className="font-medium">
                        {new Date(test.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Toggle button để mở/ẩn danh sách nhóm câu hỏi */}
                <Button 
                  variant="outline" 
                  onClick={() => loadExamQuestions(test.id, index)}
                  className="w-full mt-2 gap-2"
                  disabled={test.isLoading}
                >
                  {test.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải nhóm câu hỏi...
                    </>
                  ) : (
                    <>
                      {test.isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      {test.isExpanded ? 'Ẩn' : 'Xem'} nhóm câu hỏi
                    </>
                  )}
                </Button>

                {/* Hiển thị danh sách nhóm câu hỏi */}
                {test.isExpanded && test.questionGroups && test.questionGroups.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-medium text-sm">Cấu trúc bài thi:</h4>
                    {test.questionGroups.map((group) => (
                      <div key={group.id} className="border rounded-md p-3 text-sm">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold">Part {group.part}</div>
                          <div className="flex gap-1">
                            {getQuestionTypeBadge(group.questionType)}
                            <Badge variant="outline">{group.questions?.length || 0} câu</Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {group.passage ? (
                            `${group.passage.substring(0, 100)}${group.passage.length > 100 ? '...' : ''}`
                          ) : (
                            `Nhóm câu hỏi Part ${group.part}`
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {test.isExpanded && (!test.questionGroups || test.questionGroups.length === 0) && (
                  <div className="mt-4 text-sm text-muted-foreground text-center py-2">
                    Không có dữ liệu nhóm câu hỏi
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/practice-tests/${test.id}`}>Làm Bài Thi</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
