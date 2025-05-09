"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Info, Play, Plus, RefreshCw, FileAudio, FileText, Pencil, Trash2, MoreHorizontal, Search, AlertCircle, CheckCircle, Eye, Edit, Headphones, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { QuestionGroupDTO, ToeicQuestionDTO, getQuestionGroups, getQuestionGroupById, deleteQuestionGroup } from "@/services/toeicQuestionService";
import ToeicQuestionService from "@/services/toeicQuestionService";
import { QuestionType } from "@/types/toeic";
import QuestionDetailView from "@/components/toeic/QuestionDetailView";
import QuestionGroupForm from "@/components/toeic/QuestionGroupForm";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import QuestionEditor from "@/components/toeic/QuestionEditor";

const ToeicQuestions: React.FC = () => {
  const [questionGroups, setQuestionGroups] = useState<QuestionGroupDTO[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<QuestionGroupDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [partFilter, setPartFilter] = useState<string>("ALL");
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showDetailDialog, setShowDetailDialog] = useState<boolean>(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadQuestionGroups();
  }, []);

  const loadQuestionGroups = async () => {
    try {
      // TODO: Tạm thời bỏ qua kiểm tra đăng nhập trong quá trình phát triển
      // Bình thường cần kiểm tra:
      // if (!isLoggedIn() || !isAdmin()) {
      //   navigate('/login');
      //   return;
      // }
      
      setLoading(true);
      const data = await getQuestionGroups();
      console.log("Dữ liệu nhóm câu hỏi:", data);
      
      if (!data || data.length === 0) {
        setQuestionGroups([]);
        console.log("Không có dữ liệu nhóm câu hỏi hoặc lỗi xác thực");
        return;
      }
      
      // Fetch details for each group to get questions
      const groupsWithDetails = await Promise.all(
        data.map(async (groupResponse) => {
          try {
            const groupDetails = await getQuestionGroupById(groupResponse.id);
            return groupDetails as QuestionGroupDTO;
          } catch (error) {
            console.error(`Lỗi khi tải chi tiết nhóm câu hỏi ID=${groupResponse.id}:`, error);
            // Return a minimal valid structure with correct type
            return {
              id: groupResponse.id,
              type: (groupResponse.type === 'LISTENING' ? QuestionType.LISTENING : QuestionType.READING),
              part: groupResponse.part,
              passage: groupResponse.passage,
              audioUrl: groupResponse.audioUrl,
              imageUrl: groupResponse.imageUrl,
              questions: [] // Empty questions array as fallback
            } as QuestionGroupDTO;
          }
        })
      );
      
      // Sắp xếp nhóm câu hỏi theo part tăng dần
      const sortedGroups = [...groupsWithDetails].sort((a, b) => a.part - b.part);
      setQuestionGroups(sortedGroups);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhóm câu hỏi:", error);
      toast.error("Không thể tải danh sách nhóm câu hỏi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (
    groupData: QuestionGroupDTO, 
    files: {audioFile?: File, imageFile?: File}
  ) => {
    try {
      await ToeicQuestionService.createQuestionGroup(groupData, files);
      toast.success("Tạo nhóm câu hỏi mới thành công!");
      setShowCreateDialog(false);
      loadQuestionGroups();
    } catch (error) {
      console.error("Lỗi khi tạo nhóm câu hỏi:", error);
      toast.error("Không thể tạo nhóm câu hỏi mới");
      throw error; // Ném lỗi để component form xử lý
    }
  };

  const handleUpdateGroup = async (
    groupData: QuestionGroupDTO, 
    files: {audioFile?: File, imageFile?: File}
  ) => {
    try {
      console.log("Đang cập nhật nhóm câu hỏi với data:", {
        id: groupData.id,
        part: groupData.part,
        questionsCount: groupData.questions?.length || 0,
        hasAudioFile: !!files?.audioFile,
        hasImageFile: !!files?.imageFile,
        passage: groupData.passage ? 'Có dữ liệu passage' : 'Không có passage'
      });
      
      if (!groupData.part) {
        console.error("Error: Part không được để trống khi cập nhật nhóm câu hỏi");
        toast.error("Lỗi: Part không được để trống");
        return;
      }
      
      // Thực hiện kiểm tra tồn tại audio/image trước khi gửi
      const hasNewAudioFile = files?.audioFile && files.audioFile.size > 0;
      const hasNewImageFile = files?.imageFile && files.imageFile.size > 0;

      // Kiểm tra part và yêu cầu audio cho part 1-4
      if ((groupData.part >= 1 && groupData.part <= 4) && 
          !hasNewAudioFile && !groupData.audioUrl) {
        toast.error("Part 1-4 (Listening) yêu cầu phải có file âm thanh");
        return;
      }
      
      // Kiểm tra yêu cầu passage cho part 6-7
      if ((groupData.part === 6 || groupData.part === 7) && 
          (!groupData.passage || groupData.passage.trim() === '')) {
        toast.error("Part 6-7 yêu cầu phải có đoạn văn");
        return;
      }
      
      await ToeicQuestionService.updateQuestionGroup(groupData, files);
      toast.success("Cập nhật nhóm câu hỏi thành công!");
      setShowEditDialog(false);
      loadQuestionGroups();
      setSelectedGroup(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật nhóm câu hỏi:", error);
      
      let errorMessage = "Không thể cập nhật nhóm câu hỏi";
      
      if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
        
        // Hiển thị thông báo lỗi chi tiết hơn
        if (error.response?.data?.message) {
          errorMessage = `Lỗi: ${error.response.data.message}`;
        } else if (error.response?.status === 400) {
          errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các thông tin bắt buộc.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error; // Ném lỗi để component form xử lý
    }
  };

  const handleDeleteGroup = async (id: number) => {
    try {
      setShowDeleteDialog(false);
      toast("Đang xóa nhóm câu hỏi...");
      
      await deleteQuestionGroup(id);
      
      // Xóa nhóm khỏi state local
      setQuestionGroups(prev => prev.filter(group => group.id !== id));
      
      toast("Thành công", {
        description: "Đã xóa nhóm câu hỏi",
        icon: <CheckCircle className="h-4 w-4" />,
      });
    } catch (error) {
      console.error(`Lỗi khi xóa nhóm câu hỏi ID=${id}:`, error);
      toast.error("Không thể xóa nhóm câu hỏi. Vui lòng thử lại sau.");
    }
  };

  const handleViewDetail = async (groupId: number) => {
    try {
      const detail = await ToeicQuestionService.getQuestionGroup(groupId);
      if (detail) {
        setSelectedGroup(detail);
        setShowDetailDialog(true);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết nhóm câu hỏi:", error);
      toast.error("Không thể tải chi tiết nhóm câu hỏi");
    }
  };
  
  const setupEditGroup = (group: QuestionGroupDTO) => {
    setSelectedGroup(group);
    setShowEditDialog(true);
  };
  
  const setupDeleteGroup = (group: QuestionGroupDTO) => {
    setSelectedGroup(group);
    setShowDeleteDialog(true);
  };

  // Lọc nhóm câu hỏi theo từ khóa tìm kiếm và bộ lọc
  const filteredGroups = questionGroups.filter(group => {
    const matchesSearch = 
      searchQuery === "" || 
      group.questions?.some(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (group.passage && group.passage.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const isListening = group.part <= 4;
    const isReading = group.part >= 5;
    
    const matchesType = 
      typeFilter === "ALL" || 
      (typeFilter === QuestionType.LISTENING && isListening) ||
      (typeFilter === QuestionType.READING && isReading);
    
    const matchesPart = partFilter === "ALL" || group.part.toString() === partFilter;
    
    return matchesSearch && matchesType && matchesPart;
  });

  const handleEdit = async (groupId: number) => {
    try {
      const detail = await ToeicQuestionService.getQuestionGroup(groupId);
      if (detail) {
        setSelectedGroup(detail);
        setShowEditDialog(true);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết nhóm câu hỏi:", error);
      toast.error("Không thể tải chi tiết nhóm câu hỏi");
    }
  };

  const handleDelete = (group: QuestionGroupDTO) => {
    setSelectedGroup(group);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedGroup || !selectedGroup.id) return;
    
    try {
      await deleteQuestionGroup(selectedGroup.id);
      toast.success("Xóa nhóm câu hỏi thành công!");
      loadQuestionGroups();
      setShowDeleteDialog(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error("Lỗi khi xóa nhóm câu hỏi:", error);
      toast.error("Không thể xóa nhóm câu hỏi");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý câu hỏi TOEIC</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo nhóm câu hỏi
        </Button>
      </div>
      
      <Separator className="my-6" />
      
      {/* Tìm kiếm và lọc */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm câu hỏi..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Loại câu hỏi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả loại</SelectItem>
            <SelectItem value={QuestionType.LISTENING}>Nghe (Listening)</SelectItem>
            <SelectItem value={QuestionType.READING}>Đọc (Reading)</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={partFilter} onValueChange={setPartFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Part" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả part</SelectItem>
            <SelectItem value="1">Part 1</SelectItem>
            <SelectItem value="2">Part 2</SelectItem>
            <SelectItem value="3">Part 3</SelectItem>
            <SelectItem value="4">Part 4</SelectItem>
            <SelectItem value="5">Part 5</SelectItem>
            <SelectItem value="6">Part 6</SelectItem>
            <SelectItem value="7">Part 7</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Danh sách nhóm câu hỏi */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse text-center">
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-10 border rounded-md">
            <p className="text-muted-foreground">
              {searchQuery || typeFilter !== "ALL" || partFilter !== "ALL"
                ? "Không tìm thấy nhóm câu hỏi phù hợp với điều kiện tìm kiếm."
                : "Chưa có nhóm câu hỏi nào. Hãy tạo nhóm câu hỏi mới."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => {
              const isListening = group.part <= 4;
              const hasQuestions = group.questions?.length > 0;
              const questionCount = hasQuestions ? group.questions.length : 0;
              const firstQuestion = hasQuestions ? group.questions[0] : null;
              
              return (
                <Card key={group.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          <div className="flex items-center">
                            {isListening ? (
                              <Headphones className="mr-2 h-4 w-4" />
                            ) : (
                              <BookOpen className="mr-2 h-4 w-4" />
                            )}
                            Part {group.part}
                          </div>
                        </CardTitle>
                        <CardDescription>
                          {isListening 
                            ? 'Listening'
                            : 'Reading'
                          }
                        </CardDescription>
                      </div>
                      <Badge>
                        {questionCount} câu hỏi
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="line-clamp-3 text-sm text-muted-foreground">
                      {group.passage ? (
                        `${group.passage.substring(0, 150)}${group.passage.length > 150 ? '...' : ''}`
                      ) : (
                        <span className="italic">
                          {isListening
                            ? 'Nhóm câu hỏi nghe' 
                            : 'Nhóm câu hỏi đọc'
                          }
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 pt-2">
                    <div className="flex justify-between w-full">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetail(group.id!)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Chi tiết
                      </Button>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(group.id!)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(group)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Dialog chỉnh sửa nhóm câu hỏi */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhóm câu hỏi</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho nhóm câu hỏi
            </DialogDescription>
          </DialogHeader>
          
          {selectedGroup && (
            <div className="flex-grow overflow-y-auto p-1">
              <QuestionGroupForm
                initialData={selectedGroup}
                onSubmit={handleUpdateGroup}
                onCancel={() => setShowEditDialog(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog tạo nhóm câu hỏi mới */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Tạo nhóm câu hỏi mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo nhóm câu hỏi TOEIC mới
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-grow overflow-y-auto p-1">
            <QuestionGroupForm
              onSubmit={handleCreateGroup}
              onCancel={() => setShowCreateDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog xem chi tiết nhóm câu hỏi */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? (
                <div className="flex items-center">
                  {selectedGroup.part <= 4 ? (
                    <Headphones className="mr-2 h-5 w-5" />
                  ) : (
                    <BookOpen className="mr-2 h-5 w-5" />
                  )}
                  {selectedGroup.part <= 4 ? 'Listening' : 'Reading'} - Part {selectedGroup.part}
                </div>
              ) : 'Chi tiết nhóm câu hỏi'}
            </DialogTitle>
            <DialogDescription>
              Xem chi tiết câu hỏi và thông tin nhóm
            </DialogDescription>
          </DialogHeader>
          
          {selectedGroup && (
            <div className="flex-grow overflow-y-auto py-2">
              <QuestionDetailView
                questions={selectedGroup.questions}
                groupInfo={{
                  part: selectedGroup.part.toString(),
                  type: selectedGroup.part <= 4 ? QuestionType.LISTENING : QuestionType.READING,
                  count: selectedGroup.questions.length,
                  audioUrl: selectedGroup.audioUrl,
                  imageUrl: selectedGroup.imageUrl,
                  passage: selectedGroup.passage
                }}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDetailDialog(false)}
            >
              Đóng
            </Button>
            {selectedGroup && (
              <Button 
                onClick={() => {
                  setShowDetailDialog(false);
                  handleEdit(selectedGroup.id!);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AlertDialog xóa nhóm câu hỏi */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhóm câu hỏi này?
              {selectedGroup && (
                <div className="mt-2">
                  <p className="font-medium">
                    {selectedGroup.part <= 4 ? 'Listening' : 'Reading'} - Part {selectedGroup.part}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nhóm này có {selectedGroup.questions.length} câu hỏi. Tất cả các câu hỏi trong nhóm sẽ bị xóa.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ToeicQuestions;
