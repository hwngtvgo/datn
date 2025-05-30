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
import { Loader2, Search, Headphones, BookOpen, Book, GraduationCap } from 'lucide-react';

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
  
  // Form validation
  const [titleError, setTitleError] = useState<string>('');
  const [durationError, setDurationError] = useState<string>('');

  // Thêm state quản lý dialog xem chi tiết nhóm câu hỏi
  const [showGroupDetailDialog, setShowGroupDetailDialog] = useState<boolean>(false);
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<toeicQuestionService.QuestionGroupDTO | null>(null);
  const [loadingGroupDetail, setLoadingGroupDetail] = useState<boolean>(false);

  // Tải danh sách nhóm câu hỏi
  useEffect(() => {
    if (activeTab === "questions") {
      loadQuestionGroups();
      
      // Nếu đang chỉnh sửa đề thi, tải các nhóm câu hỏi đã chọn
      if (isEditing && initialData?.id) {
        loadSelectedQuestionGroups();
      }
    }
  }, [activeTab]);

  // Tải danh sách các nhóm câu hỏi đã được chọn cho đề thi
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

  // Tải danh sách nhóm câu hỏi có sẵn
  const loadQuestionGroups = async () => {
    try {
      setLoadingGroups(true);
      
      console.log("Bắt đầu tải danh sách nhóm câu hỏi...");
      const response = await toeicQuestionService.getQuestionGroups();
      console.log("Kết quả nhận được:", response);
      
      if (response && Array.isArray(response)) {
        // Kiểm tra và ghi log dữ liệu đầu tiên để debug
        if (response.length > 0) {
          console.log("Dữ liệu nhóm câu hỏi đầu tiên:", response[0]);
          console.log("Type của nhóm đầu tiên:", response[0].type);
          // Sử dụng type assertion để tránh lỗi TypeScript
          console.log("QuestionType của nhóm đầu tiên:", (response[0] as any).questionType);
        }
        
        // Xử lý kiểu cho service - map để đảm bảo trường type luôn có giá trị
        const processedData = response.map(group => ({
          ...group,
          // Ưu tiên sử dụng type, nếu không có thì dùng questionType
          type: group.type || (group as any).questionType
        }));
        
        setQuestionGroups(processedData);
        console.log(`Đã tải ${processedData.length} nhóm câu hỏi`);
      } else {
        console.warn("Dữ liệu nhóm câu hỏi không phải là mảng:", response);
        setQuestionGroups([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhóm câu hỏi:', error);
      toast.error('Không thể tải danh sách nhóm câu hỏi');
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

  // Lọc các nhóm câu hỏi theo tìm kiếm và filter
  const filteredQuestionGroups = questionGroups.filter(group => {
    // Tìm kiếm theo từ khóa
    const matchesSearch = searchQuery === '' || 
      (group.title && group.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (group.passage && group.passage.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Lọc theo part
    const matchesPart = filterPart === 'all' || group.part.toString() === filterPart;
    
    // Lọc theo loại (Listening/Reading/Vocabulary/Grammar)
    const matchesType = filterType === 'all' || 
      (filterType === 'listening' && group.type === 'LISTENING') ||
      (filterType === 'reading' && group.type === 'READING') ||
      (filterType === 'vocabulary' && group.type === 'VOCABULARY') ||
      (filterType === 'grammar' && group.type === 'GRAMMAR');
    
    return matchesSearch && matchesPart && matchesType;
  });

  // Phân trang dữ liệu
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Tính toán chỉ số bắt đầu và kết thúc cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuestionGroups.slice(indexOfFirstItem, indexOfLastItem);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredQuestionGroups.length / itemsPerPage);

  // Xử lý chuyển trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Chuyển trang trước
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Chuyển trang sau
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
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
                                (group.part > 0 ? `Part ${group.part}` : 'Không có part') : 
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
                              <Badge variant="outline">Unknown</Badge>
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
                
                {/* Phân trang */}
                {filteredQuestionGroups.length > 0 && (
                  <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                      Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredQuestionGroups.length)} của {filteredQuestionGroups.length} nhóm câu hỏi
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
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        // Hiển thị 5 trang xung quanh trang hiện tại
                        let pageNum = currentPage - 2 + i;
                        if (currentPage < 3) {
                          pageNum = i + 1;
                        } else if (currentPage > totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        }
                        
                        // Đảm bảo số trang hợp lệ
                        if (pageNum > 0 && pageNum <= totalPages) {
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => paginate(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                        return null;
                      })}
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Chi tiết nhóm câu hỏi
            </DialogTitle>
          </DialogHeader>
          
          {loadingGroupDetail ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : (
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
          )}
          
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowGroupDetailDialog(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamForm; 