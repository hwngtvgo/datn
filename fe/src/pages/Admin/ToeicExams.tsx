import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ExamForm from '@/components/toeic/ExamForm';

// Icons 
import { Pencil, Trash2, Clock, ListChecks, Eye, EyeOff, ArrowUpDown } from 'lucide-react';

// Services
import * as toeicExamService from '@/services/toeicExamService';
import authModule from '@/modules/auth';

// Types
import { ToeicExam, DifficultyLevel } from '@/types/toeic';

const AdminToeicExams: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [exams, setExams] = useState<ToeicExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ToeicExam | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // States for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // States for sorting
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("desc");

  // Load exams on component mount or when pagination/sorting changes
  useEffect(() => {
    loadExams();
  }, [currentPage, pageSize, sortBy, sortDir, activeTab]);

  // Tải danh sách đề thi
  const loadExams = async () => {
    try {
      setLoading(true);
      
      // Filter based on active tab
      let params: any = {
        page: currentPage,
        size: pageSize,
        sort: `${sortBy},${sortDir}`
      };
      
      if (activeTab === 'active') {
        params.isActive = true;
      } else if (activeTab === 'inactive') {
        params.isActive = false;
      }
      
      const response = await toeicExamService.getAllExams(currentPage, pageSize, `${sortBy},${sortDir}`);
      if (response && response.content) {
        setExams(response.content);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalElements || 0);
        console.log("Dữ liệu đề thi:", response);
      } else {
        toast.error("Định dạng dữ liệu không hợp lệ từ server");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đề thi:", error);
      toast.error("Không thể tải danh sách đề thi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lọc danh sách đề thi theo từ khóa tìm kiếm
  const filteredExams = exams.filter(exam => {
    return (
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Xử lý chuyển đổi trang
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Xử lý thay đổi sắp xếp
  const handleSort = (column: string) => {
    const isAsc = sortBy === column && sortDir === "asc";
    setSortDir(isAsc ? "desc" : "asc");
    setSortBy(column);
  };

  // Xử lý thay đổi trạng thái công bố
  const handlePublishStatusChange = async (examId: number, newStatus: boolean) => {
    try {
      setLoading(true);
      await toeicExamService.updateExamPublishStatus(examId, newStatus);
      
      // Cập nhật lại danh sách đề thi
      const updatedExams = exams.map(exam => {
        if (exam.id === examId) {
          return { 
            ...exam, 
            isActive: newStatus,
          };
        }
        return exam;
      });
      
      setExams(updatedExams);
      toast.success(`Đề thi đã được ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đề thi:", error);
      toast.error("Không thể cập nhật trạng thái đề thi");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tạo đề thi mới
  const handleExamCreated = (examId: number) => {
    setIsCreateDialogOpen(false);
    loadExams();
    toast.success("Đã tạo đề thi mới thành công");
  };

  // Xử lý cập nhật đề thi
  const handleExamUpdated = (examId: number) => {
    setIsEditDialogOpen(false);
    setSelectedExam(null);
    loadExams();
    toast.success("Đã cập nhật đề thi thành công");
  };

  // Xử lý xóa đề thi
  const handleDeleteExam = async () => {
    if (!selectedExam) return;
    
    try {
      setLoading(true);
      await toeicExamService.deleteExam(selectedExam.id);
      
      // Xóa đề thi khỏi danh sách
      const updatedExams = exams.filter(exam => exam.id !== selectedExam.id);
      setExams(updatedExams);
      
      // Đóng dialog và reset state
      setIsDeleteDialogOpen(false);
      setSelectedExam(null);
      
      toast.success("Đề thi đã được xóa thành công");
    } catch (error: any) {
      console.error("Lỗi khi xóa đề thi:", error);
      // Hiển thị thông báo lỗi chi tiết nếu có
      const errorMessage = error.response?.data?.message || 
                          "Không thể xóa đề thi. Đề thi này có thể đang được sử dụng bởi người dùng.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị mức độ khó dễ
  const renderDifficultyBadge = (difficultyLevel: string) => {
    // Chuyển đổi về chữ hoa để đảm bảo so sánh chính xác
    const difficultyUpper = difficultyLevel ? difficultyLevel.toUpperCase() : '';
    
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý đề thi TOEIC</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Tạo đề thi mới</Button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <Input
          placeholder="Tìm kiếm đề thi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
            <TabsTrigger value="inactive">Vô hiệu hóa</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption>Danh sách đề thi TOEIC ({filteredExams.length})</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-1">
                    ID
                    {sortBy === "id" && (
                      <ArrowUpDown className={`h-4 w-4 ${sortDir === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-1">
                    Tiêu đề
                    {sortBy === "title" && (
                      <ArrowUpDown className={`h-4 w-4 ${sortDir === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("duration")}
                >
                  <div className="flex items-center gap-1">
                    Thời gian
                    {sortBy === "duration" && (
                      <ArrowUpDown className={`h-4 w-4 ${sortDir === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("difficulty")}
                >
                  <div className="flex items-center gap-1">
                    Độ khó
                    {sortBy === "difficulty" && (
                      <ArrowUpDown className={`h-4 w-4 ${sortDir === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : filteredExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Không tìm thấy đề thi nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredExams.map(exam => (
                  <TableRow key={exam.id}>
                    <TableCell>{exam.id}</TableCell>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{exam.description || "--"}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {exam.duration} phút
                      </div>
                    </TableCell>
                    <TableCell>{renderDifficultyBadge(exam.difficulty || 'MEDIUM')}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Switch
                          checked={exam.isActive}
                          onCheckedChange={(checked) => handlePublishStatusChange(exam.id, checked)}
                          disabled={loading}
                        />
                        <span className="ml-2">{exam.isActive ? "Hoạt động" : "Vô hiệu"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Chỉnh sửa</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Xóa</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredExams.length} / {totalItems} đề thi
            </div>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
              >
                Đầu
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Trước
              </Button>
              <div className="flex items-center gap-1 mx-2">
                <span className="text-sm">Trang</span>
                <select 
                  value={currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className="h-8 w-16 rounded-md border border-input px-2"
                >
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <option key={idx} value={idx}>{idx + 1}</option>
                  ))}
                </select>
                <span className="text-sm">/ {totalPages}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Tiếp
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Cuối
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog tạo đề thi mới */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Tạo đề thi TOEIC mới</DialogTitle>
            <DialogDescription>
              Chọn các nhóm câu hỏi cho đề thi mới
            </DialogDescription>
          </DialogHeader>
          <ExamForm 
            onSuccess={handleExamCreated}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa đề thi */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin đề thi</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cơ bản của đề thi
            </DialogDescription>
          </DialogHeader>
          {selectedExam && (
            <ExamForm 
              initialData={selectedExam}
              onSuccess={handleExamUpdated}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedExam(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa đề thi */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đề thi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đề thi "{selectedExam?.title}"? 
              Hành động này không thể hoàn tác và sẽ xóa tất cả kết quả bài thi và dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExam} className="bg-red-500 text-white hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminToeicExams; 