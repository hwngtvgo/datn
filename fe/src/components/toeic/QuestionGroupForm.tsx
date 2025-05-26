import React, { useState, useEffect, useCallback } from 'react';
import { ToeicQuestionDTO, QuestionGroupDTO } from '@/services/toeicQuestionService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Plus, Copy, Trash2, Headphones, BookOpen, FileAudio, FileImage } from 'lucide-react';
import { QuestionType, DifficultyLevel } from '@/types/toeic';
import QuestionEditor from './QuestionEditor';
import { toast } from 'sonner';
import { API_URL } from '@/config/constants';

export interface QuestionGroupFormProps {
  initialData?: QuestionGroupDTO;
  onSubmit: (data: QuestionGroupDTO, files: {audioFile?: File, imageFile?: File}) => Promise<void>;
  onCancel: () => void;
}

const QuestionGroupForm: React.FC<QuestionGroupFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  // Trạng thái cho nhóm câu hỏi
  const [groupPart, setGroupPart] = useState<number>(
    initialData?.part || 1
  );
  const [passageText, setPassageText] = useState<string>(
    initialData?.passage || ''
  );
  const [titleText, setTitleText] = useState<string>(
    initialData?.title || ''
  );
  
  // Tự động xác định questionType dựa trên part
  const questionType = groupPart <= 4 ? QuestionType.LISTENING : QuestionType.READING;
  
  // Trạng thái cho câu hỏi
  const [questions, setQuestions] = useState<ToeicQuestionDTO[]>(
    initialData?.questions || []
  );
  
  // Trạng thái cho file
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>(
    initialData?.audioUrl || ''
  );
  const [imageUrl, setImageUrl] = useState<string>(
    initialData?.imageUrl || ''
  );
  
  // Trạng thái UI
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hàm để xử lý URL audio và image
  const getFullUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Nếu url chỉ chứa tên file hoặc đường dẫn tương đối, thêm API_URL và endpoint xem file
    return `${API_URL}/files/view/${url}`;
  };
  
  // Cập nhật URL ban đầu nếu có
  useEffect(() => {
    if (initialData?.audioUrl) {
      setAudioUrl(getFullUrl(initialData.audioUrl));
    }
    if (initialData?.imageUrl) {
      setImageUrl(getFullUrl(initialData.imageUrl));
    }
  }, [initialData]);
  
  // Xử lý khi thay đổi file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'audio' | 'image') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (fileType === 'audio') {
      // Kiểm tra phần mở rộng của tệp
      if (!file.type.startsWith('audio/')) {
        toast.error('Vui lòng chọn file âm thanh hợp lệ');
        return;
      }
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
    } else {
      // Kiểm tra phần mở rộng của tệp
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh hợp lệ');
        return;
      }
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };
  
  // Thêm câu hỏi mới
  const addQuestion = () => {
    try {
      console.log("Đang thêm câu hỏi mới với:", {
        questionType,
        groupPart,
        questionsLength: questions.length
      });
      
      // Tạo câu hỏi mới với tất cả thuộc tính cần thiết
      const newQuestion: ToeicQuestionDTO = {
        id: undefined,
        type: questionType,
        part: groupPart,
        question: '',
        correctAnswer: 'A',
        explanation: '',
        difficultyLevel: DifficultyLevel.EASY,
        questionOrder: questions.length + 1,
        options: [
          { optionKey: 'A', optionText: '' },
          { optionKey: 'B', optionText: '' },
          { optionKey: 'C', optionText: '' },
          { optionKey: 'D', optionText: '' }
        ],
      };
      
      console.log("Câu hỏi mới tạo:", newQuestion);
      
      // Cập nhật state
      setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
      
      // Di chuyển đến cuối danh sách câu hỏi sau khi thêm
      setTimeout(() => {
        const questionsContainer = document.querySelector('.questions-container');
        if (questionsContainer) {
          questionsContainer.scrollTop = questionsContainer.scrollHeight;
        }
      }, 100);
      
      toast.success("Đã thêm câu hỏi mới");
    } catch (error) {
      console.error("Lỗi khi thêm câu hỏi mới:", error);
      toast.error("Không thể thêm câu hỏi mới");
    }
  };
  
  // Sửa câu hỏi
  const editQuestion = (index: number) => {
    setEditingQuestionIndex(index);
  };
  
  // Lưu câu hỏi đang sửa
  const saveQuestion = (updatedQuestion: ToeicQuestionDTO) => {
    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = updatedQuestion;
      setQuestions(updatedQuestions);
      setEditingQuestionIndex(null);
    }
  };
  
  // Hủy sửa câu hỏi
  const cancelEditQuestion = () => {
    setEditingQuestionIndex(null);
  };
  
  // Xóa câu hỏi
  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    
    // Cập nhật lại questionOrder
    const reorderedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      questionOrder: i + 1
    }));
    
    setQuestions(reorderedQuestions);
  };
  
  // Di chuyển câu hỏi lên trên
  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    
    const updatedQuestions = [...questions];
    const temp = updatedQuestions[index - 1];
    updatedQuestions[index - 1] = {
      ...updatedQuestions[index],
      questionOrder: index
    };
    updatedQuestions[index] = {
      ...temp,
      questionOrder: index + 1
    };
    setQuestions(updatedQuestions);
  };
  
  // Di chuyển câu hỏi xuống dưới
  const moveQuestionDown = (index: number) => {
    if (index === questions.length - 1) return;
    
    const updatedQuestions = [...questions];
    const temp = updatedQuestions[index + 1];
    updatedQuestions[index + 1] = {
      ...updatedQuestions[index],
      questionOrder: index + 2
    };
    updatedQuestions[index] = {
      ...temp,
      questionOrder: index + 1
    };
    setQuestions(updatedQuestions);
  };
  
  // Nhân bản câu hỏi
  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = {...questions[index]};
    // Xóa ID để tạo mới khi lưu
    delete questionToDuplicate.id;
    
    const newQuestions = [...questions];
    // Chèn vào sau vị trí hiện tại
    newQuestions.splice(index + 1, 0, {
      ...questionToDuplicate,
      questionOrder: index + 2,
      question: `${questionToDuplicate.question} (sao chép)`
    });
    
    // Cập nhật lại questionOrder cho tất cả câu hỏi
    const reorderedQuestions = newQuestions.map((q, i) => ({
      ...q,
      questionOrder: i + 1
    }));
    
    setQuestions(reorderedQuestions);
  };
  
  // Cập nhật type và part cho tất cả câu hỏi
  useEffect(() => {
    if (questions.length > 0) {
      const updatedQuestions = questions.map(q => ({
        ...q,
        type: questionType,
        part: groupPart
      }));
      setQuestions(updatedQuestions);
    }
  }, [questionType, groupPart]);
  
  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Kiểm tra các điều kiện bắt buộc
      if (!groupPart) {
        toast.error("Vui lòng chọn Part cho nhóm câu hỏi");
        return;
      }
      
      // Kiểm tra yêu cầu audio cho part 1-4
      if ((groupPart >= 1 && groupPart <= 4) && !audioFile && !audioUrl) {
        toast.error("Part 1-4 (Listening) yêu cầu phải có file âm thanh");
        return;
      }
      
      // Kiểm tra yêu cầu passage cho part 6-7
      if ((groupPart === 6 || groupPart === 7) && (!passageText || passageText.trim() === '')) {
        toast.error("Part 6-7 yêu cầu phải có đoạn văn");
        return;
      }
      
      // Tạo đối tượng dữ liệu để gửi
      const groupData: QuestionGroupDTO = {
        id: initialData?.id,
        title: titleText,
        type: questionType,
        part: groupPart,
        passage: passageText || undefined,
        audioUrl: initialData?.audioUrl,
        imageUrl: initialData?.imageUrl,
        questions: questions.map(q => ({
          ...q,
          type: questionType as QuestionType,
          part: groupPart
        }))
      };
      
      const files: {audioFile?: File, imageFile?: File} = {};
      
      // Chỉ thêm file nếu thực sự có nội dung
      if (audioFile && audioFile.size > 0) {
        files.audioFile = audioFile;
      }
      
      if (imageFile && imageFile.size > 0) {
        files.imageFile = imageFile;
      }
      
      console.log('Đang gửi dữ liệu nhóm câu hỏi:', {
        isUpdate: !!initialData?.id,
        id: initialData?.id,
        part: groupPart,
        type: questionType,
        hasNewAudioFile: !!audioFile,
        audioFileSize: audioFile?.size || 0,
        hasNewImageFile: !!imageFile,
        imageFileSize: imageFile?.size || 0,
        hasExistingAudio: !!initialData?.audioUrl,
        existingAudioUrl: initialData?.audioUrl,
        existingImageUrl: initialData?.imageUrl ? 'Có' : 'Không',
        passageLength: passageText?.length || 0,
        questionsCount: questions.length,
        questionsWithIds: questions.filter(q => q.id).length
      });
      
      await onSubmit(groupData, files);
      toast.success('Lưu nhóm câu hỏi thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu nhóm câu hỏi:', error);
      toast.error('Đã xảy ra lỗi khi lưu nhóm câu hỏi');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="bg-muted/40">
            <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
            <CardDescription>
              Thiết lập thông tin cho nhóm câu hỏi
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-5">
              {/* Thông tin cơ bản */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-title" className="text-base font-medium">Tiêu đề nhóm câu hỏi</Label>
                  <Input
                    id="group-title"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    placeholder="Nhập tiêu đề cho nhóm câu hỏi"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group-part" className="text-base font-medium">Part</Label>
                  <Select 
                    value={groupPart.toString()} 
                    onValueChange={(value) => setGroupPart(parseInt(value))}
                  >
                    <SelectTrigger id="group-part" className="h-10">
                      <SelectValue placeholder="Chọn part" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        <div className="flex items-center">
                          <Headphones className="mr-2 h-4 w-4" />
                          Part 1 - Listening
                        </div>
                      </SelectItem>
                      <SelectItem value="2">
                        <div className="flex items-center">
                          <Headphones className="mr-2 h-4 w-4" />
                          Part 2 - Listening
                        </div>
                      </SelectItem>
                      <SelectItem value="3">
                        <div className="flex items-center">
                          <Headphones className="mr-2 h-4 w-4" />
                          Part 3 - Listening
                        </div>
                      </SelectItem>
                      <SelectItem value="4">
                        <div className="flex items-center">
                          <Headphones className="mr-2 h-4 w-4" />
                          Part 4 - Listening
                        </div>
                      </SelectItem>
                      <SelectItem value="5">
                        <div className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Part 5 - Reading
                        </div>
                      </SelectItem>
                      <SelectItem value="6">
                        <div className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Part 6 - Reading
                        </div>
                      </SelectItem>
                      <SelectItem value="7">
                        <div className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Part 7 - Reading
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {(groupPart === 3 || groupPart === 4 || groupPart === 6 || groupPart === 7) && (
                <div className="space-y-2">
                  <Label htmlFor="passage" className="text-base font-medium">Đoạn văn</Label>
                  <Textarea
                    id="passage"
                    value={passageText}
                    onChange={(e) => setPassageText(e.target.value)}
                    placeholder="Nhập đoạn văn (nếu có)..."
                    className="min-h-[200px] resize-y"
                  />
                </div>
              )}

              {/* Audio file */}
              <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                <Label htmlFor="audio" className="text-base font-medium">File âm thanh</Label>
                <div className="grid gap-3">
                  <div className="flex items-center justify-center border-2 border-dashed rounded-md p-4 bg-background">
                    <label htmlFor="audio" className="cursor-pointer flex flex-col items-center">
                      <FileAudio className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">Chọn file âm thanh</span>
                      <span className="text-xs text-muted-foreground mt-1">MP3, WAV, hoặc OGG</span>
                      <Input
                        id="audio"
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileChange(e, 'audio')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {audioFile && (
                    <div className="text-sm font-medium text-center text-green-600">
                      Đã chọn: {audioFile.name}
                    </div>
                  )}
                  
                  {audioUrl && (
                    <div className="p-2 border rounded-md bg-background">
                      <audio controls src={audioUrl} className="w-full">
                        <source src={audioUrl} type="audio/mpeg" />
                        Trình duyệt của bạn không hỗ trợ phát audio.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Upload image */}
              <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                <Label htmlFor="image" className="text-base font-medium">Hình ảnh</Label>
                <div className="grid gap-3">
                  <div className="flex items-center justify-center border-2 border-dashed rounded-md p-4 bg-background">
                    <label htmlFor="image" className="cursor-pointer flex flex-col items-center">
                      <FileImage className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">Chọn hình ảnh</span>
                      <span className="text-xs text-muted-foreground mt-1">PNG, JPG hoặc GIF</span>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'image')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {imageFile && (
                    <div className="text-sm font-medium text-center text-green-600">
                      Đã chọn: {imageFile.name}
                    </div>
                  )}
                  
                  {imageUrl && (
                    <div className="p-2 border rounded-md bg-background">
                      <img 
                        src={imageUrl} 
                        alt="Preview" 
                        className="max-h-60 mx-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="bg-muted/40 flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-lg">Danh sách câu hỏi</CardTitle>
              <CardDescription>
                {questions.length > 0 
                  ? `Đã có ${questions.length} câu hỏi trong nhóm này.`
                  : 'Chưa có câu hỏi nào. Hãy thêm câu hỏi mới.'}
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={addQuestion}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Thêm câu hỏi
            </Button>
          </CardHeader>
          <CardContent className="p-6 questions-container">
            {editingQuestionIndex !== null ? (
              <div className="border rounded-md p-4 bg-muted/30">
                <h3 className="text-lg font-medium mb-4">Sửa câu hỏi #{editingQuestionIndex + 1}</h3>
                <QuestionEditor
                  question={questions[editingQuestionIndex]}
                  onSave={saveQuestion}
                  onCancel={cancelEditQuestion}
                />
              </div>
            ) : (
              questions.length > 0 ? (
                <div className="grid gap-4">
                  {questions.map((question, index) => (
                    <Card key={index} className="shadow-sm border-muted">
                      <CardHeader className="p-4 pb-2 bg-muted/20">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm">
                              {index + 1}
                            </span>
                            Câu hỏi #{index + 1}
                          </CardTitle>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQuestionUp(index)}
                              disabled={index === 0}
                              className="h-8 w-8"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQuestionDown(index)}
                              disabled={index === questions.length - 1}
                              className="h-8 w-8"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => duplicateQuestion(index)}
                              className="h-8 w-8"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeQuestion(index)}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-3">
                        <p className="line-clamp-2 text-sm">
                          {question.question || "(Chưa có nội dung)"}
                        </p>
                        <div className="mt-2 text-xs flex gap-2 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Đáp án:</span> {question.correctAnswer}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Độ khó:</span> 
                            {question.difficultyLevel === "EASY" ? "Dễ" : 
                            question.difficultyLevel === "MEDIUM" ? "Trung bình" : "Khó"}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 bg-muted/10 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editQuestion(index)}
                          className="w-full"
                        >
                          Chỉnh sửa
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed rounded-md bg-muted/20">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-4 rounded-full bg-muted/50">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">Chưa có câu hỏi nào</p>
                    <Button
                      type="button"
                      onClick={addQuestion}
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Thêm câu hỏi đầu tiên
                    </Button>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          Hủy
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang lưu...
            </>
          ) : initialData ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
};

export default QuestionGroupForm; 