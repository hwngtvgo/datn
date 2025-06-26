import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import axios from 'axios';
import { API_URL } from '@/config/constants';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Headphones, BookOpen, Book, GraduationCap, X } from 'lucide-react';

// Types
import { ToeicExam, QuestionGroupResponse, ExamType, DifficultyLevel } from '@/types/toeic';

// Services
import * as toeicExamService from '@/services/toeicExamService';
import * as toeicQuestionService from '@/services/toeicQuestionService';
import authModule from '@/modules/auth';

// Thêm import QuestionDetailView
import QuestionDetailView from '@/components/toeic/QuestionDetailView';

interface ExamFormProps {
  initialData?: ToeicExam;
  onSuccess?: (examId: number) => void;
  onCancel?: () => void;
}

const ExamForm: React.FC<ExamFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const isEditing = !!initialData?.id;
  const [activeTab, setActiveTab] = useState<string>("basic");
  
  // Form states
  const [title, setTitle] = useState<string>(initialData?.title || '');
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [instructions, setInstructions] = useState<string>(initialData?.instructions || '');
  const [duration, setDuration] = useState<number>(initialData?.duration || 120);
  const [isActive, setIsActive] = useState<boolean>(initialData?.isActive || false);
  const [difficulty, setDifficulty] = useState<string>(initialData?.difficulty || 'MEDIUM');
  const [type, setType] = useState<string>(initialData?.type || 'FULL');
  
  // Question group states
  const [questionGroups, setQuestionGroups] = useState<toeicQuestionService.QuestionGroupResponse[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterPart, setFilterPart] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Phân trang dữ liệu
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8); // Đổi kích thước từ 20 xuống 10 để hiển thị 5 trang
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Form validation
  const [titleError, setTitleError] = useState<string>('');
  const [durationError, setDurationError] = useState<string>('');

  // Thêm state quản lý dialog xem chi tiết nhóm câu hỏi
  const [showGroupDetailDialog, setShowGroupDetailDialog] = useState<boolean>(false);
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<toeicQuestionService.QuestionGroupDTO | null>(null);
  const [loadingGroupDetail, setLoadingGroupDetail] = useState<boolean>(false);

  // Tải các nhóm câu hỏi đã được chọn cho đề thi
  const loadSelectedQuestionGroups = async () => {
    try {
      if (!initialData?.id) return;
      
      console.log("Đang tải nhóm câu hỏi đã chọn cho đề thi ID:", initialData.id);
      const response = await toeicExamService.getExamQuestions(initialData.id);
      
      if (response && Array.isArray(response)) {
        // Lấy danh sách id của các nhóm câu hỏi đã chọn
        const groupIds = response.map(group => group.id);
        setSelectedGroups(groupIds);
        console.log(`Đã tải ${groupIds.length} nhóm câu hỏi đã chọn:`, groupIds);
      }
    } catch (error) {
      console.error('Lỗi khi tải nhóm câu hỏi đã chọn:', error);
      toast.error('Không thể tải nhóm câu hỏi đã chọn');
    }
  };

  // Hàm helper để xử lý dữ liệu nhóm câu hỏi
  const processGroupData = (group: any) => {
          // Xác định loại từ nhiều trường có thể
          let finalType = "UNKNOWN";
          if (group.type && typeof group.type === 'string') {
            finalType = group.type.toUpperCase();
          } else if (group.questionType && typeof group.questionType === 'string') {
            finalType = group.questionType.toUpperCase();
          }
          
          return {
            ...group,
      type: finalType,
      count: group.questionCount || group.count || (group.questions ? group.questions.length : 0)
    };
  };

  // Tải danh sách nhóm câu hỏi có sẵn
  const loadQuestionGroups = async () => {
    try {
      setLoadingGroups(true);
      // Log thông tin tham số gửi đi
      console.log(`Gọi API với tham số: page=${currentPage - 1}, size=${itemsPerPage}, part=${filterPart}, type=${filterType}, search=${searchQuery}`);
      
      // Chuẩn bị các tham số cần thiết
      const pageParam = currentPage - 1; // API bắt đầu từ 0
      const sizeParam = itemsPerPage;
      const sortParam = "id,asc"; // Sắp xếp theo ID để tránh trùng lặp
      
      // Xử lý filter part
      let partParam = undefined;
      if (filterPart !== "all") {
        partParam = parseInt(filterPart);
      }
      
      // Xử lý filter type
      let typeParam = undefined;
      if (filterType !== "all") {
        typeParam = filterType.toUpperCase();
      }
      
      // Sử dụng axios trực tiếp thay vì gọi hàm getQuestionGroups
      const response = await axios.get(`${API_URL}/toeic-questions/question-groups`, {
        params: {
          page: pageParam,
          size: sizeParam,
          sort: sortParam,
          type: typeParam,
          part: partParam,
          search: searchQuery || undefined
        }
      });

      // Log response từ API để debug
      console.log("Response từ API:", response.data);

      // Xử lý dữ liệu phân trang từ response
      let processedGroups = [];
      let totalPagesCount = 1;
      let totalItemsCount = 0;
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Nếu là mảng, sử dụng trực tiếp
          processedGroups = response.data.map(processGroupData);
          totalItemsCount = processedGroups.length;
          totalPagesCount = Math.ceil(totalItemsCount / sizeParam) || 1;
          console.log("Dữ liệu dạng mảng: ", processedGroups.length, "phần tử, ước tính", totalPagesCount, "trang");
        } else if (response.data.content && Array.isArray(response.data.content)) {
          // Nếu là dạng paged response có thuộc tính content
          processedGroups = response.data.content.map(processGroupData);
          totalPagesCount = response.data.totalPages || 1;
          totalItemsCount = response.data.totalElements || processedGroups.length;
          console.log("Dữ liệu paged response:", processedGroups.length, "phần tử,", totalPagesCount, "trang,", totalItemsCount, "tổng phần tử");
      } else {
          console.error("Định dạng response không đúng:", response.data);
        }
      }
      
      // Đảm bảo totalPages ít nhất là 1
      totalPagesCount = Math.max(1, totalPagesCount);
      
      setQuestionGroups(processedGroups);
      setTotalItems(totalItemsCount);
      setTotalPages(totalPagesCount);
      console.log(`Đã tải ${processedGroups.length} nhóm câu hỏi, tổng cộng ${totalItemsCount} nhóm, ${totalPagesCount} trang`);
    } catch (error) {
      console.error("Lỗi khi tải nhóm câu hỏi:", error);
      setQuestionGroups([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Xử lý toggle selection của nhóm câu hỏi
  const toggleGroupSelection = (groupId: number) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  // Lọc các nhóm câu hỏi theo tìm kiếm và filter không còn cần thiết vì đã lọc từ API
  const filteredQuestionGroups = questionGroups;

  // Không cần tính toán các chỉ số phân trang nữa vì dữ liệu đã được phân trang từ API
  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = filteredQuestionGroups.slice(indexOfFirstItem, indexOfLastItem);
  const currentItems = questionGroups;

  // Xử lý chuyển trang
  const paginate = (pageNumber: number) => {
    console.log(`Chuyển đến trang ${pageNumber}`);
    setCurrentPage(pageNumber);
    // loadQuestionGroups sẽ được gọi tự động thông qua useEffect
  };

  // Chuyển trang trước
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      console.log(`Chuyển từ trang ${currentPage} đến trang ${currentPage - 1}`);
      setCurrentPage(currentPage - 1);
      // loadQuestionGroups sẽ được gọi tự động thông qua useEffect
    }
  };

  // Chuyển trang sau
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      console.log(`Chuyển từ trang ${currentPage} đến trang ${currentPage + 1}`);
      setCurrentPage(currentPage + 1);
      // loadQuestionGroups sẽ được gọi tự động thông qua useEffect
    }
  };

  // Lấy mô tả cho từng part
  const getPartDescription = (part: number): string => {
    switch (part) {
      case 1: return "Photographs";
      case 2: return "Question-Response";
      case 3: return "Conversations";
      case 4: return "Talks";
      case 5: return "Incomplete Sentences";
      case 6: return "Text Completion";
      case 7: return "Reading Comprehension";
      default: return "Unknown";
    }
  };
  
  // Xác thực form trước khi submit
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Kiểm tra tiêu đề
    if (!title.trim()) {
      setTitleError('Tiêu đề không được để trống');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    // Kiểm tra thời gian làm bài
    if (!duration || duration <= 0) {
      setDurationError('Thời gian làm bài phải lớn hơn 0');
      isValid = false;
    } else {
      setDurationError('');
    }
    
    return isValid;
  };

  // Submit handler
  const onSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      console.log("Nhóm câu hỏi được chọn:", selectedGroups);

      const examData: ToeicExam = {
        id: initialData?.id || 0,
        title,
        description,
        instructions,
        duration,
        isActive,
        difficulty: difficulty as DifficultyLevel,
        type: type as ExamType,
      };

      let examId: number;

      if (isEditing && initialData?.id) {
        const response = await toeicExamService.updateExam(
          initialData.id, 
          examData,
          selectedGroups.length > 0 ? selectedGroups : undefined
        );
        examId = response.id;
        toast.success('Đã cập nhật đề thi thành công');
      } else {
        // Khi tạo mới đề thi, luôn gửi selectedGroups
        const response = await toeicExamService.createExam(examData, selectedGroups);
        examId = response.id;
        toast.success('Đã tạo đề thi mới thành công');
      }

      if (onSuccess) {
        onSuccess(examId);
      }
    } catch (error) {
      console.error('Lỗi khi lưu đề thi:', error);
      toast.error('Không thể lưu đề thi');
    } finally {
      setLoading(false);
    }
  };
  
  // Chuyển sang tab tiếp theo
  const goToNextTab = () => {
    if (validateForm()) {
      setActiveTab("questions");
    }
  };

  // Hàm tải chi tiết nhóm câu hỏi
  const loadGroupDetail = async (groupId: number) => {
    try {
      setLoadingGroupDetail(true);
      const response = await toeicQuestionService.getQuestionGroupById(groupId);
      
      if (response) {
        setSelectedGroupDetail(response);
        setShowGroupDetailDialog(true);
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết nhóm câu hỏi:', error);
      toast.error('Không thể tải chi tiết nhóm câu hỏi');
    } finally {
      setLoadingGroupDetail(false);
    }
  };

  // Hàm xử lý khi click vào hàng trong bảng nhóm câu hỏi
  const handleRowClick = (group: toeicQuestionService.QuestionGroupResponse) => {
    loadGroupDetail(group.id);
  };

  // Tải danh sách nhóm câu hỏi
  useEffect(() => {
    if (activeTab === "questions") {
      console.log(`useEffect được gọi - currentPage: ${currentPage}`);
      loadQuestionGroups();
      
      // Nếu đang chỉnh sửa đề thi, tải các nhóm câu hỏi đã chọn (chỉ tải 1 lần)
      if (isEditing && initialData?.id) {
        loadSelectedQuestionGroups();
      }
    }
  }, [activeTab, currentPage, isEditing, initialData]);

  // Tải lại dữ liệu khi thay đổi bộ lọc
  useEffect(() => {
    if (activeTab === "questions" && (searchQuery || filterPart !== 'all' || filterType !== 'all')) {
      console.log(`useEffect được gọi do thay đổi bộ lọc`);
      // Khi thay đổi bộ lọc, reset về trang 1
      setCurrentPage(1);
      loadQuestionGroups();
    }
  }, [searchQuery, filterPart, filterType, activeTab]);

  // Hiển thị badge cho độ khó
  const renderDifficultyBadge = (difficulty: string) => {
    // Chuyển đổi về chữ hoa để đảm bảo so sánh chính xác
    const difficultyUpper = difficulty ? difficulty.toUpperCase() : '';
    
    switch (difficultyUpper) {
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

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="questions">Chọn câu hỏi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tiêu đề */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề đề thi</label>
              <Input 
                placeholder="Nhập tiêu đề đề thi" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {titleError && <p className="text-sm text-red-500">{titleError}</p>}
            </div>

            {/* Độ khó */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Độ khó</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Dễ</SelectItem>
                  <SelectItem value="MEDIUM">Trung bình</SelectItem>
                  <SelectItem value="HARD">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Thời gian làm bài */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Thời gian làm bài (phút)</label>
              <Input 
                type="number" 
                placeholder="Nhập thời gian làm bài" 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              />
              {durationError && <p className="text-sm text-red-500">{durationError}</p>}
            </div>

            {/* Trạng thái đề thi */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Kích hoạt đề thi</label>
                <p className="text-sm text-muted-foreground">
                  Đề thi sẽ hiển thị cho người học khi được kích hoạt
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            {/* Mô tả đề thi */}
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Mô tả đề thi</label>
              <Textarea
                placeholder="Mô tả chi tiết về đề thi"
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Hướng dẫn làm bài */}
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Hướng dẫn làm bài</label>
              <Textarea
                placeholder="Hướng dẫn cho người dùng khi làm bài thi"
                className="min-h-[100px]"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            {/* Loại đề thi */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại đề thi</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại đề thi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL">Đề thi đầy đủ</SelectItem>
                  <SelectItem value="MINI">Đề thi mini</SelectItem>
                  <SelectItem value="PRACTICE">Đề thi luyện tập</SelectItem>
                  <SelectItem value="LISTENING_ONLY">Chỉ phần nghe</SelectItem>
                  <SelectItem value="READING_ONLY">Chỉ phần đọc</SelectItem>
                  <SelectItem value="GRAMMAR_ONLY">Chỉ ngữ pháp</SelectItem>
                  <SelectItem value="VOCABULARY_ONLY">Chỉ từ vựng</SelectItem>
                  <SelectItem value="CUSTOM">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Hủy
              </Button>
            )}
            {!isEditing && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={goToNextTab}
                disabled={loading}
              >
                Tiếp theo
              </Button>
            )}
            {isEditing && (
              <Button onClick={onSubmit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cập nhật thông tin đề thi
              </Button>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="questions" className="space-y-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Chọn nhóm câu hỏi cho đề thi</h3>
            <div className="text-sm text-muted-foreground">
              Đã chọn: {selectedGroups.length} nhóm câu hỏi
            </div>
          </div>
          
          <div className="flex gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhóm câu hỏi..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              className="border rounded px-3 py-1"
              value={filterPart}
              onChange={(e) => setFilterPart(e.target.value)}
            >
              <option value="all">Tất cả part</option>
              <option value="1">Part 1</option>
              <option value="2">Part 2</option>
              <option value="3">Part 3</option>
              <option value="4">Part 4</option>
              <option value="5">Part 5</option>
              <option value="6">Part 6</option>
              <option value="7">Part 7</option>
            </select>
            
            <select
              className="border rounded px-3 py-1"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              <option value="listening">Listening</option>
              <option value="reading">Reading</option>
              <option value="vocabulary">Vocabulary</option>
              <option value="grammar">Grammar</option>
            </select>
          </div>
          
          {loadingGroups ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Đang tải danh sách nhóm câu hỏi...</span>
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                <ScrollArea className="max-h-[80vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Part</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead className="text-right">Số câu hỏi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Không tìm thấy nhóm câu hỏi phù hợp
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentItems.map((group) => (
                          <TableRow 
                            key={group.id} 
                            className={selectedGroups.includes(group.id) ? "bg-primary-50" : ""}
                            onClick={() => handleRowClick(group)}
                            style={{ cursor: 'pointer' }}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedGroups.includes(group.id)}
                                onCheckedChange={() => toggleGroupSelection(group.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {group.type === 'LISTENING' ? (
                                  <Headphones className="mr-1 h-4 w-4 text-blue-500" />
                                ) : group.type === 'READING' ? (
                                  <BookOpen className="mr-1 h-4 w-4 text-green-500" />
                                ) : group.type === 'VOCABULARY' ? (
                                  <Book className="mr-1 h-4 w-4 text-purple-500" />
                                ) : group.type === 'GRAMMAR' ? (
                                  <GraduationCap className="mr-1 h-4 w-4 text-orange-500" />
                                ) : null}
                                {group.type === 'VOCABULARY' || group.type === 'GRAMMAR' ? 
                                  (group.part > 0 ? `Part ${group.part}` : '------') : 
                                  `Part ${group.part}`}
                              </div>
                            </TableCell>
                            <TableCell>
                              {group.type === 'LISTENING' ? (
                                <Badge variant="outline" className="text-blue-600 border-blue-600">Listening</Badge>
                              ) : group.type === 'READING' ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">Reading</Badge>
                              ) : group.type === 'VOCABULARY' ? (
                                <Badge variant="outline" className="text-purple-600 border-purple-600">Vocabulary</Badge>
                              ) : group.type === 'GRAMMAR' ? (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">Grammar</Badge>
                              ) : (
                                <Badge variant="outline">Unknown ({group.type})</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {group.title ? (
                                <span className="font-medium">{group.title}</span>
                              ) : (
                                <span className="text-muted-foreground text-xs italic">Không có tiêu đề</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">{group.count || 0}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
                
                {/* Phân trang */}
                {questionGroups.length > 0 && (
                  <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                      Trang {currentPage} / {totalPages} (Tổng {totalItems} nhóm)
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>
                      
                      {/* Hiển thị trang phù hợp thay vì hiển thị tất cả */}
                      {(() => {
                        const pageButtons = [];
                        const maxVisiblePages = 5;
                        
                        // Tính toán dãy trang cần hiển thị
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                        
                        // Điều chỉnh nếu không đủ trang ở cuối
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }
                        
                        // Hiển thị trang đầu tiên nếu cần
                        if (startPage > 1) {
                          pageButtons.push(
                            <Button
                              key={1}
                              variant={currentPage === 1 ? "default" : "outline"}
                              size="sm"
                              onClick={() => paginate(1)}
                            >
                              1
                            </Button>
                          );
                          
                          // Hiển thị dấu chấm lửng nếu không kề trang đầu
                          if (startPage > 2) {
                            pageButtons.push(
                              <span key="ellipsis1" className="px-2">
                                ...
                              </span>
                            );
                          }
                        }
                        
                        // Hiển thị các trang giữa
                        for (let i = startPage; i <= endPage; i++) {
                          pageButtons.push(
                            <Button
                              key={i}
                              variant={currentPage === i ? "default" : "outline"}
                              size="sm"
                              onClick={() => paginate(i)}
                            >
                              {i}
                            </Button>
                          );
                        }
                        
                        // Hiển thị trang cuối cùng nếu cần
                        if (endPage < totalPages) {
                          // Hiển thị dấu chấm lửng nếu không kề trang cuối
                          if (endPage < totalPages - 1) {
                            pageButtons.push(
                              <span key="ellipsis2" className="px-2">
                                ...
                              </span>
                            );
                          }
                          
                          pageButtons.push(
                          <Button
                              key={totalPages}
                              variant={currentPage === totalPages ? "default" : "outline"}
                            size="sm"
                              onClick={() => paginate(totalPages)}
                          >
                              {totalPages}
                          </Button>
                        );
                        }
                        
                        return pageButtons;
                      })()}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setActiveTab("basic")}
              disabled={loading}
            >
              Quay lại
            </Button>
            
            <Button 
              onClick={onSubmit} 
              disabled={loading || selectedGroups.length === 0}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Cập nhật câu hỏi cho đề thi" : "Tạo đề thi"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog Xem chi tiết nhóm câu hỏi */}
      <Dialog open={showGroupDetailDialog} onOpenChange={setShowGroupDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          {/* <div className="sticky top-0 right-0 z-50 bg-white pt-2 pb-2">
            <button 
              className="absolute top-2 right-2 rounded-full p-2 hover:bg-gray-100"
              onClick={() => setShowGroupDetailDialog(false)}
            >
              <X className="h-4 w-4" />
            </button>
            
            <DialogHeader className="pb-2">
              <DialogTitle>
                Chi tiết nhóm câu hỏi
              </DialogTitle>
            </DialogHeader>
          </div> */}
          
          {loadingGroupDetail ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 px-1" style={{maxHeight: 'calc(80vh - 130px)'}}>
              <QuestionDetailView 
                questions={selectedGroupDetail?.questions || []} 
                groupInfo={{
                  part: selectedGroupDetail?.part?.toString() || "0",
                  type: selectedGroupDetail?.type || "",
                  count: selectedGroupDetail?.questions?.length || 0,
                  audioUrl: selectedGroupDetail?.audioUrl,
                  imageUrl: selectedGroupDetail?.imageUrl, 
                  passage: selectedGroupDetail?.passage
                }}
              />
            </div>
          )}
          
          <DialogFooter className="sticky bottom-0 bg-white pt-2 mt-2 border-t">
            <Button onClick={() => setShowGroupDetailDialog(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamForm; 