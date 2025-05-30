"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Info, Play, Plus, RefreshCw, FileAudio, FileText, Pencil, Trash2, MoreHorizontal, Search, AlertCircle, CheckCircle, Eye, Edit, Headphones, BookOpen, X, FileImage, Book, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { QuestionGroupDTO, ToeicQuestionDTO, getQuestionGroups, getQuestionGroupById, deleteQuestionGroup } from "@/services/toeicQuestionService";
import ToeicQuestionService from "@/services/toeicQuestionService";
import { QuestionType } from "@/types/toeic";
import QuestionDetailView from "@/components/toeic/QuestionDetailView";
import QuestionGroupForm from "@/components/toeic/QuestionGroupForm";
// import { Separator } from "@/components/ui/separator";
import axios from "axios";
// import QuestionEditor from "@/components/toeic/QuestionEditor";

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

  // Hàm chuyển đổi từ string sang QuestionType enum
  const mapStringToQuestionType = (typeString: string): QuestionType => {
    if (typeString === 'LISTENING') return QuestionType.LISTENING;
    if (typeString === 'READING') return QuestionType.READING;
    if (typeString === 'VOCABULARY') return QuestionType.VOCABULARY;
    if (typeString === 'GRAMMAR') return QuestionType.GRAMMAR;
    return QuestionType.VOCABULARY; // Mặc định
  };

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
      
      // Tạo mapping từ ID -> questionType từ danh sách ban đầu
      const questionTypeMap = new Map();
      data.forEach(group => {
        if (group.id && group.questionType) {
          questionTypeMap.set(group.id, group.questionType);
        }
      });
      
      console.log("Mapping ID -> questionType:", Object.fromEntries(questionTypeMap));
      
      // Fetch details for each group to get questions
      const groupsWithDetails = await Promise.all(
        data.map(async (groupResponse) => {
          try {
            const groupDetails = await getQuestionGroupById(groupResponse.id);
            
            // Lấy questionType từ data ban đầu
            const originalQuestionType = groupResponse.questionType || "VOCABULARY";
            console.log(`Chi tiết nhóm câu hỏi ID=${groupResponse.id}:`, {
              id: groupDetails.id,
              type: groupDetails.type,
              originalQuestionType: originalQuestionType,
              part: groupDetails.part
            });
            
            // Chuyển đổi questionType thành enum QuestionType
            let mappedType;
            if (originalQuestionType === 'LISTENING') {
              mappedType = QuestionType.LISTENING;
            } else if (originalQuestionType === 'READING') {
              mappedType = QuestionType.READING;
            } else if (originalQuestionType === 'VOCABULARY') {
              mappedType = QuestionType.VOCABULARY;
            } else if (originalQuestionType === 'GRAMMAR') {
              mappedType = QuestionType.GRAMMAR;
            } else {
              // Fallback nếu không xác định được loại
              mappedType = QuestionType.VOCABULARY;
            }
            
            return {
              ...groupDetails,
              type: mappedType
            } as QuestionGroupDTO;
          } catch (error) {
            console.error(`Lỗi khi tải chi tiết nhóm câu hỏi ID=${groupResponse.id}:`, error);
            // Return a minimal valid structure with correct type
            // Sử dụng questionType từ data ban đầu
            const originalQuestionType = groupResponse.questionType || "VOCABULARY";
            let mappedType;
            if (originalQuestionType === 'LISTENING') {
              mappedType = QuestionType.LISTENING;
            } else if (originalQuestionType === 'READING') {
              mappedType = QuestionType.READING;
            } else if (originalQuestionType === 'VOCABULARY') {
              mappedType = QuestionType.VOCABULARY;
            } else if (originalQuestionType === 'GRAMMAR') {
              mappedType = QuestionType.GRAMMAR;
            } else {
              // Fallback nếu không xác định được loại
              mappedType = QuestionType.VOCABULARY;
            }
            
            return {
              id: groupResponse.id,
              type: mappedType,
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
        type: groupData.type,
        part: groupData.part,
        questionsCount: groupData.questions?.length || 0,
        hasAudioFile: !!files?.audioFile,
        hasImageFile: !!files?.imageFile,
        passage: groupData.passage ? 'Có dữ liệu passage' : 'Không có passage'
      });
      
      // Đảm bảo part luôn là số
      if (groupData.part === null || groupData.part === undefined) {
        if (groupData.type === QuestionType.LISTENING) {
          groupData.part = 1;
        } else if (groupData.type === QuestionType.READING) {
          groupData.part = 5;
        } else {
          groupData.part = 0;
        }
      }
      
      // Đảm bảo mỗi câu hỏi trong nhóm có type, part và category đúng
      if (groupData.questions && groupData.questions.length > 0) {
        groupData.questions = groupData.questions.map(q => {
          // Nếu là nhóm câu hỏi từ vựng hoặc ngữ pháp, thì câu hỏi phải cùng loại
          // Nếu là nhóm câu hỏi nghe, thì câu hỏi phải là nghe
          // Nếu là nhóm câu hỏi đọc, thì câu hỏi có thể là đọc, từ vựng hoặc ngữ pháp
          let updatedType = q.type;
          
          if (groupData.type === QuestionType.VOCABULARY || groupData.type === QuestionType.GRAMMAR) {
            updatedType = groupData.type;
          } else if (groupData.type === QuestionType.LISTENING) {
            updatedType = QuestionType.LISTENING;
          }
          
          console.log(`Câu hỏi "${q.question?.substring(0, 20) || 'Chưa có nội dung'}..." - type: ${q.type} -> ${updatedType}, part: ${q.part} -> ${groupData.part}`);
          
          // Thiết lập category dựa vào type
          let updatedCategory: any;
          if (updatedType === QuestionType.VOCABULARY) {
            updatedCategory = "VOCABULARY";
          } else if (updatedType === QuestionType.GRAMMAR) {
            updatedCategory = "GRAMMAR"; 
          } else if (updatedType === QuestionType.LISTENING) {
            updatedCategory = "LISTENING";
          } else {
            updatedCategory = "VOCABULARY"; // Mặc định nếu là Reading
          }
          
          return {
            ...q,
            type: updatedType,
            part: groupData.part,
            category: updatedCategory
          };
        });
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
        console.log("Chi tiết nhóm câu hỏi:", {
          id: detail.id,
          type: detail.type,
          questionType: detail.type, // Log questionType
          part: detail.part,
          title: detail.title
        });
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
      (group.passage && group.passage.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (group.title && group.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Cập nhật logic lọc theo loại câu hỏi mới
    const matchesType = 
      typeFilter === "ALL" || 
      typeFilter === group.type;
    
    // Cập nhật logic lọc theo part
    const matchesPart = 
      partFilter === "ALL" || 
      (group.part && group.part.toString() === partFilter);
    
    return matchesSearch && matchesType && matchesPart;
  });

  const handleEdit = async (groupId: number) => {
    try {
      setLoading(true);
      const detail = await ToeicQuestionService.getQuestionGroup(groupId);
      if (detail) {
        console.log("Dữ liệu nhóm câu hỏi nhận được:", {
          id: detail.id,
          type: detail.type,
          part: detail.part,
          title: detail.title,
          passageLength: detail.passage?.length || 0,
          questionCount: detail.questions?.length || 0,
          audioUrl: detail.audioUrl ? 'Có' : 'Không',
          imageUrl: detail.imageUrl ? 'Có' : 'Không'
        });
        
        // Đảm bảo part luôn là số
        if (detail.part === null || detail.part === undefined) {
          if (detail.type === QuestionType.LISTENING) {
            detail.part = 1;
          } else if (detail.type === QuestionType.READING) {
            detail.part = 5;
          } else {
            detail.part = 0;
          }
        }
        
        // Đảm bảo mỗi câu hỏi trong nhóm có type, part và category đúng
        if (detail.questions && detail.questions.length > 0) {
          detail.questions = detail.questions.map(q => {
            // Nếu là nhóm câu hỏi từ vựng hoặc ngữ pháp, thì câu hỏi phải cùng loại
            // Nếu là nhóm câu hỏi nghe, thì câu hỏi phải là nghe
            // Nếu là nhóm câu hỏi đọc, thì câu hỏi có thể là đọc, từ vựng hoặc ngữ pháp
            let updatedType = q.type;
            
            if (detail.type === QuestionType.VOCABULARY || detail.type === QuestionType.GRAMMAR) {
              updatedType = detail.type;
            } else if (detail.type === QuestionType.LISTENING) {
              updatedType = QuestionType.LISTENING;
            }
            
            // Thiết lập category dựa vào type
            let updatedCategory: any;
            if (updatedType === QuestionType.VOCABULARY) {
              updatedCategory = "VOCABULARY";
            } else if (updatedType === QuestionType.GRAMMAR) {
              updatedCategory = "GRAMMAR"; 
            } else if (updatedType === QuestionType.LISTENING) {
              updatedCategory = "LISTENING";
            } else {
              updatedCategory = "VOCABULARY"; // Mặc định nếu là Reading
            }
            
            return {
              ...q,
              type: updatedType,
              part: detail.part,
              category: updatedCategory
            };
          });
        }
        
        setSelectedGroup(detail);
        setShowEditDialog(true);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết nhóm câu hỏi:", error);
      toast.error("Không thể tải chi tiết nhóm câu hỏi");
    } finally {
      setLoading(false);
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
    <div className="container p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý câu hỏi TOEIC</h1>
      
      <Tabs defaultValue="all-groups">
        <TabsList className="grid w-full max-w-md grid-cols-1">
          <TabsTrigger value="all-groups">Tất cả nhóm câu hỏi</TabsTrigger>
        </TabsList>
        
        <div className="my-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Select 
              value={typeFilter} 
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Loại câu hỏi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="LISTENING">Nghe</SelectItem>
                <SelectItem value="READING">Đọc</SelectItem>
                <SelectItem value="VOCABULARY">Từ vựng</SelectItem>
                <SelectItem value="GRAMMAR">Ngữ pháp</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={partFilter} 
              onValueChange={setPartFilter}
              disabled={typeFilter === "VOCABULARY" || typeFilter === "GRAMMAR"}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Part" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả Part</SelectItem>
                {(typeFilter === "LISTENING" || typeFilter === "ALL") && (
                  <>
                    <SelectItem value="1">Part 1</SelectItem>
                    <SelectItem value="2">Part 2</SelectItem>
                    <SelectItem value="3">Part 3</SelectItem>
                    <SelectItem value="4">Part 4</SelectItem>
                  </>
                )}
                {(typeFilter === "READING" || typeFilter === "ALL") && (
                  <>
                    <SelectItem value="5">Part 5</SelectItem>
                    <SelectItem value="6">Part 6</SelectItem>
                    <SelectItem value="7">Part 7</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm câu hỏi hoặc nhóm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              {searchQuery && (
                <X
                  className="absolute right-2 top-2.5 h-4 w-4 cursor-pointer text-muted-foreground"
                  onClick={() => setSearchQuery("")}
                />
              )}
            </div>
            
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo mới
            </Button>
          </div>
        </div>
        
        <TabsContent value="all-groups" className="py-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[130px]">Loại</TableHead>
                  <TableHead className="w-[100px]">Part</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="w-[120px]">Tài liệu</TableHead>
                  <TableHead className="w-[100px] text-right">Câu hỏi</TableHead>
                  <TableHead className="w-[100px]">Ngày tạo</TableHead>
                  <TableHead className="w-[130px] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      {loading ? 'Đang tải...' : 'Không có nhóm câu hỏi nào'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        {group.type === QuestionType.LISTENING && (
                          <Badge className="bg-blue-500">Nghe</Badge>
                        )}
                        {group.type === QuestionType.READING && (
                          <Badge className="bg-green-500">Đọc</Badge>
                        )}
                        {group.type === QuestionType.VOCABULARY && (
                          <Badge className="bg-purple-500">Từ vựng</Badge>
                        )}
                        {group.type === QuestionType.GRAMMAR && (
                          <Badge className="bg-amber-500">Ngữ pháp</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {group.type === QuestionType.VOCABULARY || group.type === QuestionType.GRAMMAR 
                          ? '-'
                          : `Part ${group.part}`
                        }
                      </TableCell>
                      <TableCell>
                        {group.title || <span className="text-muted-foreground italic">Không có tiêu đề</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {group.audioUrl && <FileAudio className="h-4 w-4 text-blue-500" />}
                          {group.imageUrl && <FileImage className="h-4 w-4 text-green-500" />}
                          {group.passage && <FileText className="h-4 w-4 text-amber-500" />}
                          {!group.audioUrl && !group.imageUrl && !group.passage && 
                            <span className="text-muted-foreground text-xs italic">Không có</span>
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{group.questions?.length || 0}</TableCell>
                      <TableCell>{group.createdAt ? new Date(group.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(group.id!)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(group.id!)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(group)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
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
                  {selectedGroup.type === QuestionType.LISTENING && (
                    <Headphones className="mr-2 h-5 w-5" />
                  )}
                  {selectedGroup.type === QuestionType.READING && (
                    <BookOpen className="mr-2 h-5 w-5" />
                  )}
                  {selectedGroup.type === QuestionType.VOCABULARY && (
                    <Book className="mr-2 h-5 w-5" />
                  )}
                  {selectedGroup.type === QuestionType.GRAMMAR && (
                    <GraduationCap className="mr-2 h-5 w-5" />
                  )}
                  {selectedGroup.title ? selectedGroup.title : (
                    selectedGroup.type === QuestionType.LISTENING ? 
                      `Nghe - Part ${selectedGroup.part}` : 
                    selectedGroup.type === QuestionType.READING ? 
                      `Đọc - Part ${selectedGroup.part}` :
                    selectedGroup.type === QuestionType.VOCABULARY ? 
                      "Từ vựng" : "Ngữ pháp"
                  )}
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
                  type: selectedGroup.type,
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
                    {selectedGroup.type === QuestionType.LISTENING && `Nghe - Part ${selectedGroup.part}`}
                    {selectedGroup.type === QuestionType.READING && `Đọc - Part ${selectedGroup.part}`}
                    {selectedGroup.type === QuestionType.VOCABULARY && "Từ vựng"}
                    {selectedGroup.type === QuestionType.GRAMMAR && "Ngữ pháp"}
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
