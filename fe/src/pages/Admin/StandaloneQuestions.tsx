import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Plus, Search, Eye, Edit, Trash2, MoreHorizontal, Book, Bookmark, BookText
} from "lucide-react";
import { toast } from "sonner";
import ToeicQuestionService, { 
  ToeicQuestionDTO, ToeicOptionDTO, Page 
} from "@/services/toeicQuestionService";
import QuestionEditor from "@/components/toeic/QuestionEditor";
import { QuestionCategory, DifficultyLevel } from "@/types/toeic";
import { Separator } from "@/components/ui/separator";
import axios from "axios";

// Sử dụng ToeicQuestionService mà không tạo instance mới
const questionService = ToeicQuestionService;

const StandaloneQuestions: React.FC = () => {
  // Trạng thái chính
  const [questions, setQuestions] = useState<ToeicQuestionDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // Trạng thái lọc và tìm kiếm
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Trạng thái dialog
  const [selectedQuestion, setSelectedQuestion] = useState<ToeicQuestionDTO | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showViewDialog, setShowViewDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  
  // Lấy danh sách câu hỏi khi component được tải lần đầu
  useEffect(() => {
    fetchQuestions();
  }, [currentPage, pageSize, categoryFilter, difficultyFilter, activeTab]);
  
  // Xử lý tìm kiếm khi người dùng nhập và nhấn Enter
  const handleSearch = () => {
    setCurrentPage(0);
    fetchQuestions();
  };
  
  // Lấy danh sách câu hỏi từ API
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let response: Page<ToeicQuestionDTO>;
      
      const params = {
        page: currentPage,
        size: pageSize,
        sort: "id,desc"
      };
      
      // Lọc theo tab đang chọn
      if (activeTab === "all") {
        if (searchQuery) {
          response = await questionService.searchStandaloneQuestions(searchQuery, params);
        } else {
          response = await questionService.getStandaloneQuestions(params);
        }
      } else {
        const category = activeTab as QuestionCategory;
        response = await questionService.getStandaloneQuestionsByCategory(category, params);
      }
      
      // Lọc thêm nếu có chọn mức độ khó
      let filteredQuestions = response.content;
      if (difficultyFilter !== "ALL") {
        filteredQuestions = filteredQuestions.filter(
          q => q.difficultyLevel === difficultyFilter
        );
      }
      
      setQuestions(filteredQuestions);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách câu hỏi:", error);
      toast.error("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý tạo câu hỏi mới
  const handleCreateQuestion = async (question: ToeicQuestionDTO) => {
    try {
      await questionService.createQuestion(question);
      toast.success("Tạo câu hỏi mới thành công");
      setShowCreateDialog(false);
      fetchQuestions();
    } catch (error) {
      console.error("Lỗi khi tạo câu hỏi:", error);
      toast.error("Không thể tạo câu hỏi mới");
    }
  };
  
  // Xử lý cập nhật câu hỏi
  const handleUpdateQuestion = async (question: ToeicQuestionDTO) => {
    setLoading(true);
    try {
      console.log("Đang cập nhật câu hỏi:", JSON.stringify(question, null, 2));
      const updatedQuestion = await questionService.updateQuestion(question);
      console.log("Kết quả cập nhật câu hỏi:", JSON.stringify(updatedQuestion, null, 2));
      
      // Cập nhật danh sách câu hỏi
      setQuestions(prev => 
        prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
      );
      
      // Thông báo thành công
      toast.success("Cập nhật câu hỏi thành công");
      
      // Đóng editor
      setShowEditDialog(false);
      
      // Cập nhật lại dữ liệu
      fetchQuestions();
    } catch (error: any) {
      console.error("Lỗi khi cập nhật câu hỏi:", error);
      console.error("Chi tiết phản hồi lỗi:", error.response?.data);
      console.error("HTTP Status:", error.response?.status);
      console.error("Headers:", JSON.stringify(error.response?.headers, null, 2));
      
      // Thông báo lỗi
      toast.error(`Lỗi khi cập nhật câu hỏi: ${error.response?.data?.message || error.message || "Đã xảy ra lỗi không xác định"}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý xóa câu hỏi
  const handleDeleteQuestion = async () => {
    if (!selectedQuestion?.id) return;
    
    try {
      await questionService.deleteQuestion(selectedQuestion.id);
      toast.success("Xóa câu hỏi thành công");
      setShowDeleteDialog(false);
      fetchQuestions();
    } catch (error) {
      console.error("Lỗi khi xóa câu hỏi:", error);
      toast.error("Không thể xóa câu hỏi");
    }
  };
  
  // Tạo câu hỏi mới mẫu
  const createEmptyQuestion = (): ToeicQuestionDTO => {
    return {
      question: "",
      correctAnswer: "",
      difficultyLevel: DifficultyLevel.MEDIUM,
      category: activeTab !== "all" && activeTab !== "PRACTICE" && activeTab !== "OTHER" 
        ? activeTab as QuestionCategory 
        : QuestionCategory.GRAMMAR,
      options: [
        { optionKey: "A", optionText: "" },
        { optionKey: "B", optionText: "" },
        { optionKey: "C", optionText: "" },
        { optionKey: "D", optionText: "" }
      ],
      explanation: ""
    };
  };
  
  // Render trạng thái tải dữ liệu
  const renderLoading = () => (
    <div className="flex justify-center py-10">
      <div className="animate-pulse text-center">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
  
  // Render danh sách câu hỏi dạng bảng
  const renderQuestionsList = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Câu hỏi</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Độ khó</TableHead>
            <TableHead>Đáp án đúng</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                Không có câu hỏi nào
              </TableCell>
            </TableRow>
          ) : (
            questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium">{question.id}</TableCell>
                <TableCell>
                  <div className="max-w-[300px] truncate">{question.question}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {question.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  {question.difficultyLevel === DifficultyLevel.EASY ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      {question.difficultyLevel}
                    </Badge>
                  ) : question.difficultyLevel === DifficultyLevel.MEDIUM ? (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      {question.difficultyLevel}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      {question.difficultyLevel}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{question.correctAnswer}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onSelect={(event) => {
                          if (event && event.target instanceof HTMLElement) {
                            event.target.blur();
                            clearDropdownFocus(() => {
                              setSelectedQuestion(question);
                              setShowViewDialog(true);
                            });
                          }
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onSelect={(event) => {
                          if (event && event.target instanceof HTMLElement) {
                            event.target.blur();
                            clearDropdownFocus(() => {
                              setSelectedQuestion(question);
                              setShowEditDialog(true);
                            });
                          }
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={(event) => {
                          if (event && event.target instanceof HTMLElement) {
                            event.target.blur();
                            clearDropdownFocus(() => {
                              setSelectedQuestion(question);
                              setShowDeleteDialog(true);
                            });
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
  
  // Render phân trang
  const renderPagination = () => (
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
          const pageNumber = i;
          const isCurrentPage = currentPage === pageNumber;
          
          return (
            <PaginationItem key={i}>
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
        
        {totalPages > 5 && <PaginationEllipsis />}
        
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
  );
  
  // Xử lý đóng dialog và reset dữ liệu
  const handleDialogClose = () => {
    // Đảm bảo dọn dẹp sau khi đóng dialog và đặt focus về main content
    setTimeout(() => {
      setSelectedQuestion(null);
      // Đặt focus về main content
      const mainContent = document.querySelector('main');
      if (mainContent) {
        (mainContent as HTMLElement).focus();
      }
    }, 100);
  };
  
  // Thêm utility function để hủy focus của dropdown menu
  const clearDropdownFocus = (callback: () => void) => {
    // Đóng dropdown menu trước khi mở dialog để tránh lỗi focus
    document.body.click(); // Đóng tất cả các dropdown đang mở
    setTimeout(() => {
      callback();
    }, 50);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Wrap content trong một main element để có thể nhận focus */}
      <main 
        tabIndex={-1} 
        className="outline-none" 
        style={{ minHeight: "80vh" }}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản lý câu hỏi độc lập</h1>
          <Button onClick={() => {
            setSelectedQuestion(createEmptyQuestion());
            setShowCreateDialog(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo câu hỏi mới
          </Button>
        </div>
        
        <Separator className="my-4" />
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              Tất cả
            </TabsTrigger>
            <TabsTrigger value={QuestionCategory.GRAMMAR}>
              <BookText className="mr-2 h-4 w-4" />
              Ngữ pháp
            </TabsTrigger>
            <TabsTrigger value={QuestionCategory.VOCABULARY}>
              <Book className="mr-2 h-4 w-4" />
              Từ vựng
            </TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm câu hỏi..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Mức độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả mức độ</SelectItem>
                <SelectItem value={DifficultyLevel.EASY}>Dễ (Easy)</SelectItem>
                <SelectItem value={DifficultyLevel.MEDIUM}>Trung bình (Medium)</SelectItem>
                <SelectItem value={DifficultyLevel.HARD}>Khó (Hard)</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Tìm kiếm
              </Button>
              <Button variant="ghost" onClick={() => {
                setSearchQuery("");
                setCategoryFilter("ALL");
                setDifficultyFilter("ALL");
                setCurrentPage(0);
                fetchQuestions();
              }}>
                Đặt lại
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="space-y-4">
            {loading ? renderLoading() : (
              <>
                {renderQuestionsList()}
                <div className="flex justify-center mt-4">
                  {renderPagination()}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value={QuestionCategory.GRAMMAR} className="space-y-4">
            {loading ? renderLoading() : (
              <>
                {renderQuestionsList()}
                <div className="flex justify-center mt-4">
                  {renderPagination()}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value={QuestionCategory.VOCABULARY} className="space-y-4">
            {loading ? renderLoading() : (
              <>
                {renderQuestionsList()}
                <div className="flex justify-center mt-4">
                  {renderPagination()}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Dialog tạo câu hỏi mới */}
      <Dialog 
        open={showCreateDialog} 
        onOpenChange={(open) => {
          if (!open) {
            // Phải đóng dialog trước khi reset data
            setShowCreateDialog(false);
            handleDialogClose();
          } else {
            setShowCreateDialog(open);
          }
        }}
      >
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onInteractOutside={(e) => {
            // Ngăn tương tác bên ngoài khi dialog đang mở
            e.preventDefault();
          }}
          onEscapeKeyDown={() => {
            setShowCreateDialog(false);
            handleDialogClose();
          }}
        >
          <DialogHeader>
            <DialogTitle>Tạo câu hỏi mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo câu hỏi độc lập mới
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuestion && (
            <div className="flex-grow overflow-y-auto py-2">
              <QuestionEditor
                question={selectedQuestion}
                onSave={handleCreateQuestion}
                onCancel={() => {
                  setShowCreateDialog(false);
                  handleDialogClose();
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog chỉnh sửa câu hỏi */}
      <Dialog 
        open={showEditDialog} 
        onOpenChange={(open) => {
          if (!open) {
            // Phải đóng dialog trước khi reset data
            setShowEditDialog(false);
            handleDialogClose();
          } else {
            setShowEditDialog(open);
          }
        }}
      >
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onInteractOutside={(e) => {
            // Ngăn tương tác bên ngoài khi dialog đang mở
            e.preventDefault();
          }}
          onEscapeKeyDown={() => {
            setShowEditDialog(false);
            handleDialogClose();
          }}
        >
          <DialogHeader>
            <DialogTitle>Chỉnh sửa câu hỏi</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho câu hỏi
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuestion && (
            <div className="flex-grow overflow-y-auto py-2">
              <QuestionEditor
                question={selectedQuestion}
                onSave={handleUpdateQuestion}
                onCancel={() => setShowEditDialog(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog xem chi tiết câu hỏi */}
      <Dialog 
        open={showViewDialog} 
        onOpenChange={(open) => {
          if (!open) {
            // Phải đóng dialog trước khi reset data
            setShowViewDialog(false);
            handleDialogClose();
          } else {
            setShowViewDialog(open);
          }
        }}
      >
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onInteractOutside={(e) => {
            // Ngăn tương tác bên ngoài khi dialog đang mở
            e.preventDefault();
          }}
          onEscapeKeyDown={() => {
            setShowViewDialog(false);
            handleDialogClose();
          }}
        >
          <DialogHeader>
            <DialogTitle>Chi tiết câu hỏi</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết câu hỏi
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuestion && (
            <div className="flex-grow overflow-y-auto py-2">
              <Card>
                <CardHeader>
                  <CardTitle>Câu hỏi #{selectedQuestion.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Nội dung câu hỏi:</h3>
                    <p className="mt-1">{selectedQuestion.question}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Danh mục:</h3>
                    <Badge variant="outline" className="mt-1">{selectedQuestion.category}</Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Mức độ khó:</h3>
                    {selectedQuestion.difficultyLevel === DifficultyLevel.EASY ? (
                      <Badge variant="outline" className="mt-1 bg-green-100 text-green-800 border-green-300">
                        {selectedQuestion.difficultyLevel}
                      </Badge>
                    ) : selectedQuestion.difficultyLevel === DifficultyLevel.MEDIUM ? (
                      <Badge variant="outline" className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                        {selectedQuestion.difficultyLevel}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="mt-1">
                        {selectedQuestion.difficultyLevel}
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Các lựa chọn:</h3>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {selectedQuestion.options.map((option, index) => (
                        <div 
                          key={index} 
                          className={`p-2 border rounded-md ${option.optionKey === selectedQuestion.correctAnswer ? 'border-green-500 bg-green-50' : ''}`}
                        >
                          <span className="font-semibold">{option.optionKey}.</span> {option.optionText}
                          {option.optionKey === selectedQuestion.correctAnswer && (
                            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-300">Đáp án đúng</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedQuestion.explanation && (
                    <div>
                      <h3 className="font-semibold">Giải thích:</h3>
                      <p className="mt-1">{selectedQuestion.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog xác nhận xóa câu hỏi */}
      <AlertDialog 
        open={showDeleteDialog} 
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteDialog(false);
            handleDialogClose();
          } else {
            setShowDeleteDialog(open);
          }
        }}
      >
        <AlertDialogContent
          onEscapeKeyDown={() => {
            setShowDeleteDialog(false);
            handleDialogClose();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa câu hỏi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowDeleteDialog(false); 
                handleDialogClose();
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                handleDeleteQuestion().then(() => {
                  setTimeout(() => {
                    const mainContent = document.querySelector('main');
                    if (mainContent) {
                      (mainContent as HTMLElement).focus();
                    }
                  }, 100);
                });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StandaloneQuestions; 