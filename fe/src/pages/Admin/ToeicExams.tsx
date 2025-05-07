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
import { Pencil, Trash2, Clock, ListChecks, Eye, EyeOff } from 'lucide-react';

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
  
  // Load exams on component mount
  useEffect(() => {
    loadExams();
  }, []);

  // Tải danh sách đề thi
  const loadExams = async () => {
    try {
      setLoading(true);
      
      const response = await toeicExamService.getAllExams();
      if (response && Array.isArray(response.content)) {
        setExams(response.content);
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

  // Lọc danh sách đề thi theo từ khóa tìm kiếm và tab
  const filteredExams = exams.filter(exam => {
    const matchesSearch = (
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && exam.isActive;
    if (activeTab === 'inactive') return matchesSearch && !exam.isActive;
    
    return matchesSearch;
  });

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
    } catch (error) {
      console.error("Lỗi khi xóa đề thi:", error);
      toast.error("Không thể xóa đề thi");
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị mức độ khó dễ
  const renderDifficultyBadge = (difficultyLevel: string) => {
    switch (difficultyLevel) {
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
                <TableHead>ID</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Độ khó</TableHead>
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
                    <TableCell>
                      {exam.description && exam.description.length > 50
                        ? `${exam.description.substring(0, 50)}...`
                        : exam.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {exam.duration} phút
                      </div>
                    </TableCell>
                    <TableCell>{renderDifficultyBadge(exam.difficulty || 'MEDIUM')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={exam.isActive}
                          onCheckedChange={checked => handlePublishStatusChange(exam.id, checked)}
                        />
                        {exam.isActive ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Eye className="h-3 w-3 mr-1" />
                            Đang hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 border-gray-500">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Đã vô hiệu
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>

                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
              Hành động này không thể hoàn tác và sẽ xóa tất cả câu hỏi liên quan.
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