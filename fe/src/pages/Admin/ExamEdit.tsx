// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';

// // Components
// import { Button } from '@/components/ui/button';
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// // import ExamForm from '@/components/toeic/ExamForm';
// import ExamQuestionManager from '@/components/toeic/ExamQuestionManager';

// // Services
// import * as toeicExamService from '@/services/toeicExamService';
// import authService from '@/services/authService';

// // Types
// import { ToeicExam } from '@/types/toeic';

// // Icons
// import { ArrowLeft, Settings, ListChecks } from 'lucide-react';

// const ExamEdit: React.FC = () => {

//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const examId = id ? parseInt(id) : 0;

//   // State
//   const [exam, setExam] = useState<ToeicExam | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [activeTab, setActiveTab] = useState<string>('questions');

//   // Load exam on mount
//   useEffect(() => {
//     if (examId) {
//       loadExam();
//     }
//   }, [examId]);

//   // Tải thông tin đề thi
//   const loadExam = async () => {
//     try {
//       setLoading(true);
      
//       const token = authService.getCurrentUser()?.accessToken;
//       if (token) {
//         toeicExamService.setAuthHeader(token);
//       }
      
//       const examData = await toeicExamService.getExamById(examId);
//       setExam(examData);
//     } catch (error) {
//       console.error('Lỗi khi tải thông tin đề thi:', error);
//       toast.error('Không thể tải thông tin đề thi');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Xử lý cập nhật đề thi
//   const handleExamUpdated = (examId: number) => {
//     loadExam();
//     toast.success('Đã cập nhật đề thi thành công');
//   };

//   // Quay lại trang danh sách đề thi
//   const navigateBack = () => {
//     navigate('/admin/exams');
//   };

//   if (loading && !exam) {
//     return (
//       <div className="container mx-auto py-8">
//         <div className="flex justify-center items-center h-64">
//           <div className="text-center">
//             <p className="text-lg">Đang tải thông tin đề thi...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-8">
//         <p>test</p>
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-2">
//           <Button variant="outline" size="sm" onClick={navigateBack}>
//             <ArrowLeft className="h-4 w-4 mr-1" />
//             Quay lại
//           </Button>
//           <h1 className="text-3xl font-bold">{exam?.title || 'Chỉnh sửa đề thi'}</h1>
//         </div>
//       </div>

//       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//         <TabsList>
//           {/* <TabsTrigger value="settings" className="flex items-center gap-1">
//             <Settings className="h-4 w-4" />
//             Cài đặt đề thi
//           </TabsTrigger> */}
//           <TabsTrigger value="questions" className="flex items-center gap-1">
//             <ListChecks className="h-4 w-4" />
//             Quản lý câu hỏi
//           </TabsTrigger>
//         </TabsList>
        
//         {/* <TabsContent value="settings" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Thông tin đề thi</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {exam && (
//                 <ExamForm 
//                   initialData={exam}
//                   onSuccess={handleExamUpdated}
//                   onCancel={navigateBack}
//                 />
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent> */}
        
//         <TabsContent value="questions" className="space-y-4">
//           {exam && examId > 0 && (
//             <ExamQuestionManager 
//               examId={examId} 
//               initialExam={exam}
//               onUpdated={loadExam}
//             />
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default ExamEdit; 