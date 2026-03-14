import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ChevronDown, ChevronUp, Filter } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Services
import * as toeicExamService from "@/services/toeicExamService"
import { ToeicExam, DifficultyLevel, ExamType, QuestionGroupResponse } from "@/types/toeic"

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

// Hiển thị badge cho loại câu hỏi
const getQuestionTypeBadge = (type: string | undefined) => {
  if (type === 'LISTENING') {
    return <Badge className="bg-blue-500">Nghe</Badge>;
  } else if (type === 'READING') {
    return <Badge className="bg-green-500">Đọc</Badge>;
  } else if (type === 'GRAMMAR') {
    return <Badge className="bg-yellow-500">Ngữ pháp</Badge>;
  } else if (type === 'VOCABULARY') {
    return <Badge className="bg-pink-500">Từ vựng</Badge>;
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
  const [filteredTests, setFilteredTests] = useState<EnhancedExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

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
          setFilteredTests(enhancedExams);
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

  // Áp dụng bộ lọc khi có thay đổi
  useEffect(() => {
    let result = [...practiceTests];
    
    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      result = result.filter(test => 
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Lọc theo độ khó
    if (difficultyFilter !== "ALL") {
      result = result.filter(test => test.difficulty === difficultyFilter);
    }
    
    // Lọc theo loại đề thi
    if (typeFilter !== "ALL") {
      result = result.filter(test => test.type === typeFilter);
    }
    
    // Chỉ hiển thị các loại đề thi FULL, MINI, LISTENING_ONLY, và READING_ONLY
    result = result.filter(test => 
      test.type === 'FULL' || 
      test.type === 'MINI' || 
      test.type === 'LISTENING_ONLY' || 
      test.type === 'READING_ONLY'
    );
    
    setFilteredTests(result);
  }, [searchQuery, difficultyFilter, typeFilter, practiceTests]);

  // Hàm để tải nhóm câu hỏi của bài thi
  const loadExamQuestions = async (examId: number, index: number) => {
    // Tìm vị trí của bài thi trong danh sách đã lọc
    const practiceIndex = practiceTests.findIndex(test => test.id === examId);
    if (practiceIndex === -1) return;
    
    // Nếu đã có dữ liệu, chỉ cần toggle hiển thị
    if (practiceTests[practiceIndex].questionGroups) {
      const updatedTests = [...practiceTests];
      updatedTests[practiceIndex].isExpanded = !updatedTests[practiceIndex].isExpanded;
      setPracticeTests(updatedTests);
      return;
    }

    // Nếu chưa có dữ liệu, tải từ API
    try {
      const updatedTests = [...practiceTests];
      updatedTests[practiceIndex].isLoading = true;
      setPracticeTests(updatedTests);

      // Thêm tham số phân trang để tránh lỗi khi có quá nhiều câu hỏi
      const questions = await toeicExamService.getExamQuestions(examId, 0, 100, 500);
      console.log(`Dữ liệu nhóm câu hỏi cho đề thi ${examId}:`, questions);
      
      // Cập nhật state
      const newTests = [...practiceTests];
      newTests[practiceIndex] = {
        ...newTests[practiceIndex],
        questionGroups: questions,
        isLoading: false,
        isExpanded: true
      };
      setPracticeTests(newTests);
    } catch (error) {
      console.error(`Lỗi khi tải nhóm câu hỏi cho đề thi ${examId}:`, error);
      toast.error("Không thể tải thông tin nhóm câu hỏi");
      
      const updatedTests = [...practiceTests];
      updatedTests[practiceIndex].isLoading = false;
      setPracticeTests(updatedTests);
    }
  };

  // Hàm reset bộ lọc
  const resetFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("ALL");
    setTypeFilter("ALL");
  };

  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Đề Thi TOEIC Chính Thức</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Luyện tập với các đề thi TOEIC hoàn chỉnh. Làm quen với cấu trúc đề thi chính thức để đạt điểm cao trong kỳ thi thực tế.
        </p>
      </div>

      {/* Thêm bộ lọc */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm đề thi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Độ khó" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả độ khó</SelectItem>
              <SelectItem value="EASY">Dễ</SelectItem>
              <SelectItem value="MEDIUM">Trung bình</SelectItem>
              <SelectItem value="HARD">Khó</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Loại đề thi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="FULL">Đề thi đầy đủ</SelectItem>
              <SelectItem value="MINI">Đề thi mini</SelectItem>
              <SelectItem value="LISTENING_ONLY">Chỉ phần Nghe</SelectItem>
              <SelectItem value="READING_ONLY">Chỉ phần Đọc</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={resetFilters} title="Xóa bộ lọc">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg">Đang tải danh sách đề thi...</p>
          </div>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg">Không tìm thấy đề thi nào phù hợp với bộ lọc.</p>
          <p className="text-muted-foreground">Vui lòng thử lại với bộ lọc khác.</p>
          <Button variant="outline" onClick={resetFilters} className="mt-4">
            Xóa bộ lọc
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test, index) => (
            <Card key={test.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{test.title}</CardTitle>
                  {getDifficultyBadge(test.difficulty || 'MEDIUM')}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getExamTypeBadge(test.type)}
                </div>
                <CardDescription className="mt-2">{test.description || 'Không có mô tả'}</CardDescription>
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
                          <div className="font-semibold">
                            {group.title ? group.title : `Part ${group.part}`}
                          </div>
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
