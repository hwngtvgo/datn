// import React, { useState, useEffect } from 'react';
// import { toast } from 'sonner';

// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// // Icons
// import { Trash2, Plus, Search, Filter, Headphones, BookOpen } from 'lucide-react';

// // Types
// import { ToeicExam, QuestionGroupResponse, QuestionType } from '@/types/toeic';

// // Services
// import * as toeicExamService from '@/services/toeicExamService';
// import * as toeicQuestionService from '@/services/toeicQuestionService';
// import authService from '@/services/authService';

// interface ExamQuestionManagerProps {
//   examId: number;
//   initialExam?: ToeicExam;
//   onUpdated?: () => void;
// }

// const ExamQuestionManager: React.FC<ExamQuestionManagerProps> = ({
//   examId,
//   initialExam,
//   onUpdated
// }) => {
//   // State
//   const [exam, setExam] = useState<ToeicExam | null>(initialExam || null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [questionGroups, setQuestionGroups] = useState<QuestionGroupResponse[]>([]);
//   const [availableGroups, setAvailableGroups] = useState<QuestionGroupResponse[]>([]);
//   const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
//   const [activeTab, setActiveTab] = useState<string>("exam-questions");
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [filterPart, setFilterPart] = useState<string>("all");
//   const [filterType, setFilterType] = useState<string>("all");
//   const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
//   const [groupToDelete, setGroupToDelete] = useState<number | null>(null);
//   const [addingQuestions, setAddingQuestions] = useState<boolean>(false);
//   const [removingQuestion, setRemovingQuestion] = useState<boolean>(false);

//   // Load dữ liệu ban đầu
//   useEffect(() => {
//     loadExamDetails();
//     loadAvailableGroups();
//   }, [examId]);

//   // Tải chi tiết đề thi
//   const loadExamDetails = async () => {
//     try {
//       setLoading(true);
      
//       const token = authService.getCurrentUser()?.accessToken;
//       if (token) {
//         toeicExamService.setAuthHeader(token);
//       }
      
//       const examData = await toeicExamService.getExamById(examId);
//       setExam(examData);
      
//       // Nếu có nhóm câu hỏi, lưu vào state
//       if (examData.questionGroups && examData.questionGroups.length > 0) {
//         setQuestionGroups(examData.questionGroups);
//       } else {
//         setQuestionGroups([]);
//       }
//     } catch (error) {
//       console.error('Lỗi khi tải chi tiết đề thi:', error);
//       toast.error('Không thể tải chi tiết đề thi');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Tải danh sách nhóm câu hỏi có sẵn
//   const loadAvailableGroups = async () => {
//     try {
//       const token = authService.getCurrentUser()?.accessToken;
//       if (token) {
//         toeicQuestionService.setAuthHeader(token);
//       }
      
//       console.log("Đang tải danh sách nhóm câu hỏi có sẵn...");
//       const groups = await toeicQuestionService.getQuestionGroups();
//       console.log("Nhận được nhóm câu hỏi:", groups);
      
//       if (Array.isArray(groups)) {
//         setAvailableGroups(groups);
//       } else if (groups && groups.content && Array.isArray(groups.content)) {
//         setAvailableGroups(groups.content);
//       } else {
//         console.error("Dữ liệu nhóm câu hỏi không đúng định dạng:", groups);
//         setAvailableGroups([]);
//       }
//     } catch (error) {
//       console.error('Lỗi khi tải danh sách nhóm câu hỏi:', error);
//       toast.error('Không thể tải danh sách nhóm câu hỏi');
//     }
//   };

//   // Thêm nhóm câu hỏi vào đề thi
//   const handleAddQuestionGroups = async () => {
//     if (selectedGroups.length === 0) {
//       toast.warning('Vui lòng chọn ít nhất một nhóm câu hỏi');
//       return;
//     }

//     try {
//       setAddingQuestions(true);
      
//       const token = authService.getCurrentUser()?.accessToken;
//       if (token) {
//         toeicExamService.setAuthHeader(token);
//       }
      
//       // Thêm từng nhóm câu hỏi vào đề thi
//       for (const groupId of selectedGroups) {
//         await toeicExamService.addQuestionGroupToExam(examId, groupId);
//       }
      
//       toast.success('Đã thêm nhóm câu hỏi vào đề thi');
//       setSelectedGroups([]);
//       setShowAddDialog(false);
      
//       // Cập nhật lại danh sách
//       loadExamDetails();
      
//       // Gọi callback nếu có
//       if (onUpdated) {
//         onUpdated();
//       }
//     } catch (error) {
//       console.error('Lỗi khi thêm nhóm câu hỏi:', error);
//       toast.error('Không thể thêm nhóm câu hỏi vào đề thi');
//     } finally {
//       setAddingQuestions(false);
//     }
//   };

//   // Xóa nhóm câu hỏi khỏi đề thi
//   const handleRemoveQuestionGroup = async () => {
//     if (!groupToDelete) return;

//     try {
//       setRemovingQuestion(true);
      
//       const token = authService.getCurrentUser()?.accessToken;
//       if (token) {
//         toeicExamService.setAuthHeader(token);
//       }
      
//       await toeicExamService.removeQuestionGroupFromExam(examId, groupToDelete);
      
//       toast.success('Đã xóa nhóm câu hỏi khỏi đề thi');
//       setGroupToDelete(null);
//       setShowDeleteDialog(false);
      
//       // Cập nhật lại danh sách
//       loadExamDetails();
      
//       // Gọi callback nếu có
//       if (onUpdated) {
//         onUpdated();
//       }
//     } catch (error) {
//       console.error('Lỗi khi xóa nhóm câu hỏi:', error);
//       toast.error('Không thể xóa nhóm câu hỏi khỏi đề thi');
//     } finally {
//       setRemovingQuestion(false);
//     }
//   };

//   // Xác nhận xóa nhóm câu hỏi
//   const confirmDeleteGroup = (groupId: number) => {
//     setGroupToDelete(groupId);
//     setShowDeleteDialog(true);
//   };

//   // Lọc các nhóm câu hỏi có sẵn
//   const filteredAvailableGroups = availableGroups.filter(group => {
//     // Tìm kiếm theo từ khóa
//     const matchesSearch = searchQuery === '' || 
//       (group.passage && group.passage.toLowerCase().includes(searchQuery.toLowerCase()));
    
//     // Lọc theo part
//     const matchesPart = filterPart === 'all' || group.part.toString() === filterPart;
    
//     // Lọc theo loại (Listening/Reading)
//     const matchesType = filterType === 'all' || 
//       (filterType === 'listening' && group.part <= 4) ||
//       (filterType === 'reading' && group.part >= 5);
    
//     // Loại bỏ các nhóm đã có trong đề thi
//     const notInExam = !questionGroups.some(qg => qg.id === group.id);
    
//     return matchesSearch && matchesPart && matchesType && notInExam;
//   });

//   // Xử lý toggle selection của nhóm câu hỏi
//   const toggleGroupSelection = (groupId: number) => {
//     if (selectedGroups.includes(groupId)) {
//       setSelectedGroups(selectedGroups.filter(id => id !== groupId));
//     } else {
//       setSelectedGroups([...selectedGroups, groupId]);
//     }
//   };

//   // Lấy mô tả cho từng part
//   const getPartDescription = (part: number): string => {
//     switch (part) {
//       case 1: return "Photographs";
//       case 2: return "Question-Response";
//       case 3: return "Conversations";
//       case 4: return "Talks";
//       case 5: return "Incomplete Sentences";
//       case 6: return "Text Completion";
//       case 7: return "Reading Comprehension";
//       default: return "Unknown";
//     }
//   };

//   // Hiển thị loading
//   if (loading && !exam) {
//     return <div className="flex justify-center items-center h-64">Đang tải...</div>;
//   }

//   return (
//     <div className="space-y-6">
//         <p>examquestionmanager</p>
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold">Quản lý câu hỏi đề thi: {exam?.title}</h2>
//         <Button onClick={() => setShowAddDialog(true)}>
//           <Plus className="mr-2 h-4 w-4" />
//           Thêm nhóm câu hỏi
//         </Button>
//       </div>

//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList>
//           <TabsTrigger value="exam-questions">Câu hỏi trong đề thi</TabsTrigger>
//           <TabsTrigger value="question-structure">Cấu trúc đề thi</TabsTrigger>
//         </TabsList>
        
//         <TabsContent value="exam-questions" className="space-y-4">
//           {questionGroups.length === 0 ? (
//             <Card>
//               <CardContent className="flex flex-col items-center justify-center h-32">
//                 <p className="text-muted-foreground">Đề thi này chưa có câu hỏi</p>
//                 <Button 
//                   variant="outline" 
//                   className="mt-4"
//                   onClick={() => setShowAddDialog(true)}
//                 >
//                   <Plus className="mr-2 h-4 w-4" />
//                   Thêm nhóm câu hỏi
//                 </Button>
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="grid gap-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {questionGroups.map((group) => (
//                   <Card key={group.id} className="overflow-hidden">
//                     <CardHeader className="pb-2">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <CardTitle className="text-lg">
//                             <div className="flex items-center">
//                               {group.part <= 4 ? (
//                                 <Headphones className="mr-2 h-4 w-4" />
//                               ) : (
//                                 <BookOpen className="mr-2 h-4 w-4" />
//                               )}
//                               Part {group.part}
//                             </div>
//                           </CardTitle>
//                           <p className="text-sm text-muted-foreground">
//                             {getPartDescription(group.part)}
//                           </p>
//                         </div>
//                         <Badge>
//                           {group.questions?.length || 0} câu hỏi
//                         </Badge>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-sm mb-4">
//                         {group.passage ? (
//                           <div className="line-clamp-3 text-muted-foreground">
//                             {group.passage}
//                           </div>
//                         ) : (
//                           <div className="text-muted-foreground italic">
//                             Không có bài đọc/nghe
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex justify-end">
//                         <Button 
//                           variant="destructive" 
//                           size="sm"
//                           onClick={() => confirmDeleteGroup(group.id)}
//                         >
//                           <Trash2 className="mr-1 h-4 w-4" />
//                           Xóa
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </div>
//           )}
//         </TabsContent>
        
//         <TabsContent value="question-structure" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Cấu trúc đề thi TOEIC</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Phần thi</TableHead>
//                     <TableHead>Mô tả</TableHead>
//                     <TableHead className="text-right">Số câu hỏi</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {/* Listening */}
//                   <TableRow>
//                     <TableCell className="font-medium">Listening</TableCell>
//                     <TableCell>Phần nghe (Part 1-4)</TableCell>
//                     <TableCell className="text-right">
//                       {questionGroups.filter(g => g.part <= 4).reduce((total, group) => total + (group.questions?.length || 0), 0)}
//                     </TableCell>
//                   </TableRow>
//                   {/* Reading */}
//                   <TableRow>
//                     <TableCell className="font-medium">Reading</TableCell>
//                     <TableCell>Phần đọc (Part 5-7)</TableCell>
//                     <TableCell className="text-right">
//                       {questionGroups.filter(g => g.part >= 5).reduce((total, group) => total + (group.questions?.length || 0), 0)}
//                     </TableCell>
//                   </TableRow>
//                   {/* Tổng */}
//                   <TableRow>
//                     <TableCell className="font-medium">Tổng cộng</TableCell>
//                     <TableCell></TableCell>
//                     <TableCell className="text-right font-medium">
//                       {questionGroups.reduce((total, group) => total + (group.questions?.length || 0), 0)}
//                     </TableCell>
//                   </TableRow>
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
      
//       {/* Dialog thêm nhóm câu hỏi */}
//       <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
//         <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
//           <DialogHeader>
//             <DialogTitle>Thêm nhóm câu hỏi vào đề thi</DialogTitle>
//             <DialogDescription>
//               Chọn các nhóm câu hỏi bạn muốn thêm vào đề thi
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="flex gap-4 py-4">
//             <div className="relative flex-grow">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Tìm kiếm nhóm câu hỏi..."
//                 className="pl-8"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
            
//             <select
//               className="border rounded px-3 py-1"
//               value={filterPart}
//               onChange={(e) => setFilterPart(e.target.value)}
//             >
//               <option value="all">Tất cả part</option>
//               <option value="1">Part 1</option>
//               <option value="2">Part 2</option>
//               <option value="3">Part 3</option>
//               <option value="4">Part 4</option>
//               <option value="5">Part 5</option>
//               <option value="6">Part 6</option>
//               <option value="7">Part 7</option>
//             </select>
            
//             <select
//               className="border rounded px-3 py-1"
//               value={filterType}
//               onChange={(e) => setFilterType(e.target.value)}
//             >
//               <option value="all">Tất cả loại</option>
//               <option value="listening">Listening</option>
//               <option value="reading">Reading</option>
//             </select>
//           </div>
          
//           <div className="flex-grow overflow-y-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[50px]"></TableHead>
//                   <TableHead>Part</TableHead>
//                   <TableHead>Loại</TableHead>
//                   <TableHead>Mô tả</TableHead>
//                   <TableHead className="text-right">Số câu hỏi</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredAvailableGroups.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={5} className="text-center">
//                       Không tìm thấy nhóm câu hỏi phù hợp
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredAvailableGroups.map((group) => (
//                     <TableRow key={group.id}>
//                       <TableCell>
//                         <Checkbox
//                           checked={selectedGroups.includes(group.id)}
//                           onCheckedChange={() => toggleGroupSelection(group.id)}
//                         />
//                       </TableCell>
//                       <TableCell>Part {group.part}</TableCell>
//                       <TableCell>
//                         {group.part <= 4 ? 'Listening' : 'Reading'}
//                       </TableCell>
//                       <TableCell>
//                         {group.passage 
//                           ? group.passage.substring(0, 50) + (group.passage.length > 50 ? '...' : '')
//                           : getPartDescription(group.part)
//                         }
//                       </TableCell>
//                       <TableCell className="text-right">{group.questions?.length || group.count || 0}</TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
          
//           <DialogFooter className="mt-4">
//             <Button variant="outline" onClick={() => setShowAddDialog(false)}>
//               Hủy
//             </Button>
//             <Button onClick={handleAddQuestionGroups} disabled={addingQuestions || selectedGroups.length === 0}>
//               {addingQuestions ? 'Đang thêm...' : 'Thêm vào đề thi'}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Dialog xác nhận xóa */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Xác nhận xóa nhóm câu hỏi</AlertDialogTitle>
//             <AlertDialogDescription>
//               Bạn có chắc chắn muốn xóa nhóm câu hỏi này khỏi đề thi?
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Hủy</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleRemoveQuestionGroup}
//               disabled={removingQuestion}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               {removingQuestion ? 'Đang xóa...' : 'Xóa'}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ExamQuestionManager; 