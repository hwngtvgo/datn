"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  RefreshCw,
  Trash2,
  Pencil,
  Eye,
  Copy,
  ListFilter,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import toeicTestService, { ToeicTestDTO, TestStatus } from "../../services/toeicTestService"
import toeicQuestionService, { ToeicQuestionDTO } from "../../services/toeicQuestionService"

export default function AdminExams() {
  const [tests, setTests] = useState<ToeicTestDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { user: currentUser } = useAuth()
  const [availableQuestions, setAvailableQuestions] = useState<ToeicQuestionDTO[]>([])

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<ToeicTestDTO | null>(null)
  
  // Form states
  const [newTest, setNewTest] = useState<ToeicTestDTO>({
    name: "",
    description: "",
    durationMinutes: 120,
    status: TestStatus.DRAFT,
    questions: []
  })
  
  const [editTest, setEditTest] = useState<ToeicTestDTO>({
    name: "",
    description: "",
    durationMinutes: 120,
    status: TestStatus.DRAFT,
    questions: []
  })

  // Selected questions for test
  const [selectedQuestions, setSelectedQuestions] = useState<ToeicQuestionDTO[]>([])
  
  useEffect(() => {
    loadTests()
    loadQuestions()
  }, [])

  // Tải danh sách đề thi
  const loadTests = async () => {
    try {
      setLoading(true)
      const data = await toeicTestService.getAllTests()
      setTests(data)
    } catch (error) {
      console.error("Lỗi khi tải danh sách đề thi:", error)
      toast.error("Không thể tải danh sách đề thi")
    } finally {
      setLoading(false)
    }
  }

  // Tải danh sách câu hỏi
  const loadQuestions = async () => {
    try {
      const data = await toeicQuestionService.getAllQuestions()
      setAvailableQuestions(data)
    } catch (error) {
      console.error("Lỗi khi tải danh sách câu hỏi:", error)
    }
  }

  // Lọc đề thi theo từ khóa tìm kiếm
  const filteredTests = tests.filter(test => 
    test.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Xử lý chọn câu hỏi cho đề thi
  const toggleQuestionSelection = (question: ToeicQuestionDTO) => {
    const isSelected = selectedQuestions.some(q => q.id === question.id)
    
    if (isSelected) {
      setSelectedQuestions(selectedQuestions.filter(q => q.id !== question.id))
    } else {
      setSelectedQuestions([...selectedQuestions, question])
    }
  }

  // Xử lý tạo đề thi mới
  const handleCreateTest = async () => {
    try {
      // Thêm các câu hỏi đã chọn vào đề thi
      const testToCreate = {
        ...newTest,
        questions: selectedQuestions
      }
      
      const result = await toeicTestService.createTest(testToCreate)
      
      toast.success("Đã tạo đề thi thành công")
      setCreateDialogOpen(false)
      loadTests()
      
      // Reset form
      setNewTest({
        name: "",
        description: "",
        durationMinutes: 120,
        status: TestStatus.DRAFT,
        questions: []
      })
      setSelectedQuestions([])
    } catch (error: any) {
      console.error("Lỗi khi tạo đề thi:", error)
      toast.error(error.response?.data?.message || "Không thể tạo đề thi")
    }
  }

  // Xử lý cập nhật đề thi
  const handleUpdateTest = async () => {
    if (!selectedTest) return
    
    try {
      // Thêm các câu hỏi đã chọn vào đề thi
      const testToUpdate = {
        ...editTest,
        questions: selectedQuestions
      }
      
      await toeicTestService.updateTest(selectedTest.id!, testToUpdate)
      
      toast.success("Đã cập nhật đề thi thành công")
      setEditDialogOpen(false)
      loadTests()
    } catch (error: any) {
      console.error("Lỗi khi cập nhật đề thi:", error)
      toast.error(error.response?.data?.message || "Không thể cập nhật đề thi")
    }
  }

  // Xử lý cập nhật trạng thái đề thi
  const handleUpdateTestStatus = async (id: number, status: TestStatus) => {
    try {
      await toeicTestService.updateTestStatus(id, status)
      toast.success(`Đã cập nhật trạng thái đề thi thành ${status}`)
      loadTests()
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái đề thi:", error)
      toast.error("Không thể cập nhật trạng thái đề thi")
    }
  }

  // Xử lý xóa đề thi
  const handleDeleteTest = async () => {
    if (!selectedTest) return
    
    try {
      await toeicTestService.deleteTest(selectedTest.id!)
      toast.success("Đã xóa đề thi thành công")
      setDeleteDialogOpen(false)
      loadTests()
    } catch (error: any) {
      console.error("Lỗi khi xóa đề thi:", error)
      toast.error(error.response?.data?.message || "Không thể xóa đề thi")
    }
  }

  // Thiết lập đề thi để xem chi tiết
  const setupViewTest = async (test: ToeicTestDTO) => {
    try {
      const testDetail = await toeicTestService.getTestWithAnswers(test.id!)
      setSelectedTest(testDetail)
      setViewDialogOpen(true)
    } catch (error) {
      console.error("Lỗi khi tải thông tin đề thi:", error)
      toast.error("Không thể tải thông tin đề thi")
    }
  }

  // Thiết lập đề thi để chỉnh sửa
  const setupEditTest = async (test: ToeicTestDTO) => {
    try {
      const testDetail = await toeicTestService.getTestWithAnswers(test.id!)
      setSelectedTest(testDetail)
      setEditTest({
        name: testDetail.name,
        description: testDetail.description || "",
        durationMinutes: testDetail.durationMinutes,
        status: testDetail.status,
      })
      setSelectedQuestions(testDetail.questions || [])
      setEditDialogOpen(true)
    } catch (error) {
      console.error("Lỗi khi tải thông tin đề thi:", error)
      toast.error("Không thể tải thông tin đề thi")
    }
  }

  // Thiết lập đề thi để xóa
  const setupDeleteTest = (test: ToeicTestDTO) => {
    setSelectedTest(test)
    setDeleteDialogOpen(true)
  }
  
  // Xử lý sao chép đề thi
  const handleDuplicateTest = async (test: ToeicTestDTO) => {
    try {
      await toeicTestService.duplicateTest(test.id!)
      toast.success("Đã sao chép đề thi thành công")
      loadTests()
    } catch (error: any) {
      console.error("Lỗi khi sao chép đề thi:", error)
      toast.error(error.response?.data?.message || "Không thể sao chép đề thi")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý đề thi TOEIC</h2>
          <p className="text-muted-foreground">Quản lý đề thi TOEIC trong hệ thống</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadTests} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Thêm đề thi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm đề thi TOEIC mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin chi tiết để tạo đề thi TOEIC mới.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Tên đề thi</Label>
                    <Input
                      id="name"
                      value={newTest.name}
                      onChange={(e) => setNewTest({...newTest, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={newTest.description}
                      onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="durationMinutes">Thời gian làm bài (phút)</Label>
                      <Input
                        id="durationMinutes"
                        type="number"
                        value={newTest.durationMinutes}
                        onChange={(e) => setNewTest({...newTest, durationMinutes: parseInt(e.target.value)})}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="status">Trạng thái</Label>
                      <Select 
                        value={newTest.status} 
                        onValueChange={(value: TestStatus) => setNewTest({...newTest, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TestStatus.DRAFT}>Nháp</SelectItem>
                          <SelectItem value={TestStatus.PUBLISHED}>Công khai</SelectItem>
                          <SelectItem value={TestStatus.ARCHIVED}>Lưu trữ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Chọn câu hỏi cho đề thi</Label>
                    <div className="text-sm text-muted-foreground">
                      Đã chọn: {selectedQuestions.length} câu hỏi
                    </div>
                  </div>
                  
                  <div className="border rounded-md h-[300px] overflow-y-auto p-2">
                    {availableQuestions.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Không có câu hỏi nào</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableQuestions.map((question) => (
                          <div 
                            key={question.id} 
                            className={`p-2 border rounded-md cursor-pointer flex items-center gap-2 ${
                              selectedQuestions.some(q => q.id === question.id) ? 'bg-primary/10 border-primary' : ''
                            }`}
                            onClick={() => toggleQuestionSelection(question)}
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedQuestions.some(q => q.id === question.id)}
                              onChange={() => toggleQuestionSelection(question)}
                              className="h-4 w-4"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium truncate">
                                {question.question}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {question.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Part {question.part}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {question.difficultyLevel}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreateTest}>Tạo đề thi</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm đề thi..."
          className="pl-8 w-full md:w-[300px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên đề thi</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Số câu hỏi</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <RefreshCw className="animate-spin h-6 w-6" />
                  </div>
                  <div className="mt-2">Đang tải dữ liệu...</div>
                </TableCell>
              </TableRow>
            ) : filteredTests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Không tìm thấy đề thi nào
                </TableCell>
              </TableRow>
            ) : (
              filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{test.id}</TableCell>
                  <TableCell className="font-medium">{test.name}</TableCell>
                  <TableCell>{test.durationMinutes} phút</TableCell>
                  <TableCell>{test.questions?.length || 0}</TableCell>
                  <TableCell>
                    <Badge variant={
                      test.status === TestStatus.PUBLISHED ? "default" : 
                      test.status === TestStatus.DRAFT ? "secondary" : 
                      "outline"
                    }>
                      {test.status === TestStatus.PUBLISHED ? "Công khai" : 
                       test.status === TestStatus.DRAFT ? "Nháp" : 
                       "Lưu trữ"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setupViewTest(test)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setupEditTest(test)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTest(test)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Nhân bản
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {test.status !== TestStatus.PUBLISHED && (
                          <DropdownMenuItem onClick={() => handleUpdateTestStatus(test.id!, TestStatus.PUBLISHED)}>
                            <Badge className="mr-2 h-4 px-1">P</Badge>
                            Công khai
                          </DropdownMenuItem>
                        )}
                        {test.status !== TestStatus.DRAFT && (
                          <DropdownMenuItem onClick={() => handleUpdateTestStatus(test.id!, TestStatus.DRAFT)}>
                            <Badge variant="secondary" className="mr-2 h-4 px-1">D</Badge>
                            Đặt về nháp
                          </DropdownMenuItem>
                        )}
                        {test.status !== TestStatus.ARCHIVED && (
                          <DropdownMenuItem onClick={() => handleUpdateTestStatus(test.id!, TestStatus.ARCHIVED)}>
                            <Badge variant="outline" className="mr-2 h-4 px-1">A</Badge>
                            Lưu trữ
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setupDeleteTest(test)}
                          className="text-red-600"
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

      {/* Dialog xem chi tiết đề thi */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đề thi TOEIC</DialogTitle>
          </DialogHeader>
          
          {selectedTest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Tên đề thi</h4>
                  <p className="text-lg font-semibold">{selectedTest.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Thời gian làm bài</h4>
                  <p>{selectedTest.durationMinutes} phút</p>
                </div>
              </div>
              
              {selectedTest.description && (
                <div>
                  <h4 className="text-sm font-medium">Mô tả</h4>
                  <p className="mt-1">{selectedTest.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Trạng thái</h4>
                  <Badge variant={
                    selectedTest.status === TestStatus.PUBLISHED ? "default" : 
                    selectedTest.status === TestStatus.DRAFT ? "secondary" : 
                    "outline"
                  } className="mt-1">
                    {selectedTest.status === TestStatus.PUBLISHED ? "Công khai" : 
                     selectedTest.status === TestStatus.DRAFT ? "Nháp" : 
                     "Lưu trữ"}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Người tạo</h4>
                  <p>{selectedTest.createdByUsername || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Ngày tạo</h4>
                  <p>{selectedTest.createdAt ? new Date(selectedTest.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Danh sách câu hỏi</h4>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Câu hỏi</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Phần</TableHead>
                        <TableHead>Đáp án</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTest.questions && selectedTest.questions.length > 0 ? (
                        selectedTest.questions.map((question, index) => (
                          <TableRow key={question.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {question.question}
                            </TableCell>
                            <TableCell>{question.type}</TableCell>
                            <TableCell>Part {question.part}</TableCell>
                            <TableCell>
                              {question.correctAnswer || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Không có câu hỏi nào
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa đề thi */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đề thi TOEIC</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết cho đề thi.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Tên đề thi</Label>
                <Input
                  id="edit-name"
                  value={editTest.name}
                  onChange={(e) => setEditTest({...editTest, name: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={editTest.description}
                  onChange={(e) => setEditTest({...editTest, description: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-durationMinutes">Thời gian làm bài (phút)</Label>
                  <Input
                    id="edit-durationMinutes"
                    type="number"
                    value={editTest.durationMinutes}
                    onChange={(e) => setEditTest({...editTest, durationMinutes: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select 
                    value={editTest.status} 
                    onValueChange={(value: TestStatus) => setEditTest({...editTest, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TestStatus.DRAFT}>Nháp</SelectItem>
                      <SelectItem value={TestStatus.PUBLISHED}>Công khai</SelectItem>
                      <SelectItem value={TestStatus.ARCHIVED}>Lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Chọn câu hỏi cho đề thi</Label>
                <div className="text-sm text-muted-foreground">
                  Đã chọn: {selectedQuestions.length} câu hỏi
                </div>
              </div>
              
              <div className="border rounded-md h-[300px] overflow-y-auto p-2">
                {availableQuestions.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Không có câu hỏi nào</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableQuestions.map((question) => (
                      <div 
                        key={question.id} 
                        className={`p-2 border rounded-md cursor-pointer flex items-center gap-2 ${
                          selectedQuestions.some(q => q.id === question.id) ? 'bg-primary/10 border-primary' : ''
                        }`}
                        onClick={() => toggleQuestionSelection(question)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedQuestions.some(q => q.id === question.id)}
                          onChange={() => toggleQuestionSelection(question)}
                          className="h-4 w-4"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium truncate">
                            {question.question}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {question.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Part {question.part}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {question.difficultyLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateTest}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog xác nhận xóa đề thi */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa đề thi</DialogTitle>
            <DialogDescription>
              Hành động này không thể khôi phục. Bạn có chắc chắn muốn xóa đề thi này?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>
              Bạn đang xóa đề thi: <strong>{selectedTest?.name}</strong>
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteTest}>
              Xóa đề thi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
