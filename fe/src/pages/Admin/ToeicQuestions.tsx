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
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Info, Play, Plus, RefreshCw, FileAudio, FileText, Pencil, Trash2, MoreHorizontal, Search, AlertCircle, CheckCircle, Eye, Edit, Headphones, BookOpen, X, FileImage, Book, GraduationCap, Filter } from "lucide-react";
import { toast } from "sonner";
import { getAllQuestionGroups, getQuestionGroupById, deleteQuestionGroup } from "@/services/toeicQuestionService";
import ToeicQuestionService from "@/services/toeicQuestionService";
import { QuestionGroupDTO, ToeicQuestionDTO } from "@/services/toeicQuestionService";
import QuestionDetailView from "@/components/toeic/QuestionDetailView";
import QuestionGroupForm from "@/components/toeic/QuestionGroupForm";
import { QuestionType } from "@/types/toeic";
import { API_URL } from '@/config/constants';
// import { Separator } from "@/components/ui/separator";
import axios from "axios";
// import QuestionEditor from "@/components/toeic/QuestionEditor";

// Thêm interface QuestionGroupResponse
interface QuestionGroupResponse {
  id: number;
  title: string;
  questionType: string;
  part: number;
  passage?: string;
  audioUrl?: string;
  imageUrl?: string;
  questions?: any[];
  createdAt?: string;
  updatedAt?: string;
  questionCount?: number; // Thêm trường này để lấy số lượng câu hỏi từ backend
}

// Thêm hàm mapStringToQuestionType để thống nhất chuyển đổi
const mapStringToQuestionType = (type: string): QuestionType => {
  switch (type.toUpperCase()) {
    case 'LISTENING':
      return QuestionType.LISTENING;
    case 'READING':
      return QuestionType.READING;
    case 'VOCABULARY':
      return QuestionType.VOCABULARY;
    case 'GRAMMAR':
      return QuestionType.GRAMMAR;
    default:
      console.warn(`Không xác định được loại câu hỏi: ${type}, sử dụng VOCABULARY làm mặc định`);
      return QuestionType.VOCABULARY;
  }
};

const ToeicQuestions: React.FC = () => {
  const [questionGroups, setQuestionGroups] = useState<QuestionGroupDTO[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<QuestionGroupDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [partFilter, setPartFilter] = useState<string>("ALL");
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(8); // Giảm số lượng item trên mỗi trang
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showDetailDialog, setShowDetailDialog] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Tải lại dữ liệu khi trang hoặc bộ lọc thay đổi
  useEffect(() => {
    loadQuestionGroups();
  }, [currentPage, pageSize, typeFilter, partFilter, searchQuery]);

  const loadQuestionGroups = async () => {
    try {
      setLoading(true);
      // Thêm tham số phân trang và bộ lọc vào request
      const params: {
        page: number;
        size: number;
        sort: string;
        type?: string;
        part?: string;
        search?: string;
      } = {
        page: currentPage,
        size: pageSize,
        sort: "id,asc" // Đảm bảo sắp xếp theo ID để tránh trùng lặp
      };
      
      // Thêm bộ lọc nếu không phải là "ALL"
      if (typeFilter !== "ALL") {
        params.type = typeFilter;
      }
      
      if (partFilter !== "ALL" && partFilter !== "0") {
        params.part = partFilter;
      }
      
      // Thêm từ khóa tìm kiếm nếu có
      if (searchQuery && searchQuery.trim() !== "") {
        params.search = searchQuery.trim();
      }
      
      console.log("Đang tải dữ liệu với tham số:", params);
      
      const response = await axios.get(`${API_URL}/toeic-questions/question-groups`, {
        params: params
      });
      
      console.log("Dữ liệu nhóm câu hỏi:", response.data);
      
      // Xử lý dữ liệu phân trang từ response
      let data: QuestionGroupResponse[] = [];
      let totalPagesCount = 1;
      let totalItemsCount = 0;
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Nếu là mảng, sử dụng trực tiếp
          data = response.data;
          totalItemsCount = data.length;
          totalPagesCount = Math.ceil(totalItemsCount / pageSize) || 1;
          console.log("Dữ liệu dạng mảng: ", data.length, "phần tử, ước tính", totalPagesCount, "trang");
        } else if (response.data.content && Array.isArray(response.data.content)) {
          // Nếu là dạng paged response có thuộc tính content
          data = response.data.content;
          totalPagesCount = response.data.totalPages || 1;
          totalItemsCount = response.data.totalElements || data.length;
          console.log("Dữ liệu paged response:", data.length, "phần tử,", totalPagesCount, "trang,", totalItemsCount, "tổng phần tử");
        } else {
          console.log("Dữ liệu không nhận dạng được:", response.data);
        }
      }
      
      // Đảm bảo totalPages ít nhất là 1
      totalPagesCount = Math.max(1, totalPagesCount);
      
      setTotalPages(totalPagesCount);
      setTotalElements(totalItemsCount);
      
      if (!data || data.length === 0) {
        setQuestionGroups([]);
        setLoading(false);
        console.log("Không có dữ liệu nhóm câu hỏi hoặc lỗi xác thực");
        return;
      }
      
      // Chuyển đổi dữ liệu từ API thành QuestionGroupDTO
      const mappedGroups = data.map(group => {
        // Chuyển đổi questionType thành enum QuestionType
        let mappedType = mapStringToQuestionType(group.questionType || "VOCABULARY");
        
        return {
          id: group.id,
          title: group.title,
          type: mappedType,
          part: group.part,
          passage: group.passage,
          audioUrl: group.audioUrl,
          imageUrl: group.imageUrl,
          questions: group.questions || [], // Sử dụng questions từ API hoặc mảng rỗng
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
          questionCount: group.questionCount
        } as QuestionGroupDTO;
      });
      
      // Sử dụng dữ liệu trực tiếp mà không sắp xếp lại (đã được sắp xếp từ API)
      setQuestionGroups(mappedGroups);
      toast.success(`Đã tải ${mappedGroups.length} nhóm câu hỏi thành công`);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhóm câu hỏi:", error);
      toast.error("Không thể tải danh sách nhóm câu hỏi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm render phân trang
  const renderPagination = () => (
    <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Hiển thị</span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(0);
          }}
          className="h-8 w-16 rounded-md border border-input px-2"
        >
          <option value={8}>8</option>
          <option value={16}>16</option>
          <option value={24}>24</option>
          <option value={32}>32</option>
          <option value={48}>48</option>
        </select>
        <span className="text-sm text-muted-foreground">mục mỗi trang</span>
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(prev => Math.max(0, prev - 1));
              }}
              className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Nếu có nhiều trang, hiển thị các trang xung quanh trang hiện tại
            let pageNumber;
            if (totalPages <= 5) {
              // Nếu ít hơn 5 trang, hiển thị tất cả các trang từ 0-4
              pageNumber = i;
            } else if (currentPage < 3) {
              // Nếu đang ở đầu, hiển thị 5 trang đầu tiên
              pageNumber = i;
            } else if (currentPage > totalPages - 3) {
              // Nếu đang ở cuối, hiển thị 5 trang cuối cùng
              pageNumber = totalPages - 5 + i;
            } else {
              // Nếu đang ở giữa, hiển thị 2 trang trước và 2 trang sau trang hiện tại
              pageNumber = currentPage - 2 + i;
            }
            
            const isCurrentPage = currentPage === pageNumber;
            
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  isActive={isCurrentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(pageNumber);
                  }}
                >
                  {pageNumber + 1}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          {totalPages > 5 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
              }}
              className={currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Đi đến trang</span>
        <div className="flex items-center">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage + 1}
            onChange={(e) => {
              const page = parseInt(e.target.value) - 1;
              if (page >= 0 && page < totalPages) {
                setCurrentPage(page);
              }
            }}
            className="h-8 w-16 rounded-md border border-input px-2"
          />
          <span className="ml-1 text-sm text-muted-foreground">/ {totalPages}</span>
        </div>
      </div>
    </div>
  );

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
  const filteredGroups = questionGroups;

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

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(0); // Reset về trang đầu tiên khi thay đổi bộ lọc
    // loadQuestionGroups sẽ được gọi trong useEffect khi currentPage thay đổi
  };

  const handlePartFilterChange = (value: string) => {
    setPartFilter(value);
    setCurrentPage(0); // Reset về trang đầu tiên khi thay đổi bộ lọc
    // loadQuestionGroups sẽ được gọi trong useEffect khi currentPage thay đổi
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
              onValueChange={handleTypeFilterChange}
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
              onValueChange={handlePartFilterChange}
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
              <TableBody className="max-h-[400px]"> {/* Giới hạn chiều cao của tbody */}
                {filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      {loading ? 'Đang tải...' : 'Không có nhóm câu hỏi nào'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map((group, index) => (
                    <TableRow key={`${group.id}-${index}`}> {/* Thêm index vào key để đảm bảo duy nhất */}
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
                      <TableCell className="text-right">
                        {group.questionCount !== undefined ? group.questionCount : (group.questions ? group.questions.length : 0)}
                      </TableCell>
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
          
          {/* Thêm phân trang ở dưới bảng */}
          <div className="mt-6">
            {renderPagination()}
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
