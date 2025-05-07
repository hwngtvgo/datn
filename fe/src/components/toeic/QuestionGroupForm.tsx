import React, { useState, useEffect, useCallback } from 'react';
import { ToeicQuestionDTO, QuestionGroupDTO } from '@/services/toeicQuestionService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Plus, Copy, Trash2, Headphones, BookOpen } from 'lucide-react';
import { QuestionType, DifficultyLevel } from '@/types/toeic';
import QuestionEditor from './QuestionEditor';
import { toast } from 'sonner';
import { API_URL } from '@/config/constants';

export interface QuestionGroupFormProps {
  initialData?: QuestionGroupDTO;
  onSubmit: (data: QuestionGroupDTO, files: {audioFile?: File, imageFile?: File}) => Promise<void>;
  onCancel: () => void;
}

const defaultOption = [
  { optionKey: 'A', optionText: '' },
  { optionKey: 'B', optionText: '' },
  { optionKey: 'C', optionText: '' },
  { optionKey: 'D', optionText: '' }
];

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
  const [activeTab, setActiveTab] = useState("basic-info");
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
  
  // Khởi tạo câu hỏi mới
  const initNewQuestion = useCallback((): ToeicQuestionDTO => {
    return {
      id: undefined,
      type: questionType as QuestionType,
      part: groupPart,
      question: '',
      audioUrl: undefined,
      imageUrl: undefined,
      passage: undefined,
      questionOrder: questions.length + 1,
      correctAnswer: 'A',
      explanation: '',
      difficultyLevel: DifficultyLevel.EASY,
      options: JSON.parse(JSON.stringify(defaultOption)),
    };
  }, [questionType, groupPart, questions.length]);
  
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
    const newQuestion = initNewQuestion();
    setQuestions([...questions, newQuestion]);
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
      console.log("Bắt đầu kiểm tra và gửi form...");
      
      // Kiểm tra tính hợp lệ của dữ liệu
      if (!groupPart) {
        toast.error('Vui lòng chọn phần của nhóm câu hỏi');
        return;
      }
      
      if (questions.length === 0) {
        toast.error('Nhóm câu hỏi phải có ít nhất 1 câu hỏi');
        return;
      }
      
      // Kiểm tra từng câu hỏi
      for (const q of questions) {
        if (!q.question?.trim()) {
          toast.error('Các câu hỏi phải có nội dung');
          return;
        }
        
        if (!q.correctAnswer) {
          toast.error('Các câu hỏi phải có đáp án đúng');
          return;
        }
        
        const emptyOptions = q.options.filter(opt => !opt.optionText.trim());
        if (emptyOptions.length > 0) {
          toast.error('Các lựa chọn trong câu hỏi không được để trống');
          return;
        }
      }
      
      // Kiểm tra xem có file âm thanh hiện tại không (nếu đang cập nhật)
      const hasExistingAudioFile = initialData?.audioUrl ? true : false;
      console.log('hasExistingAudioFile:', hasExistingAudioFile, 'audioUrl:', initialData?.audioUrl);
      
      // Kiểm tra điều kiện đặc biệt theo part
      if ((groupPart === 1 || groupPart === 2) && !audioFile && !hasExistingAudioFile) {
        toast.error('Part 1 và 2 yêu cầu phải có file âm thanh');
        return;
      }
      
      if ((groupPart === 3 || groupPart === 4) && !audioFile && !hasExistingAudioFile) {
        toast.error('Part 3 và 4 yêu cầu phải có file âm thanh');
        return;
      }
      
      if ((groupPart === 3 || groupPart === 4) && questions.length < 3) {
        toast.error('Part 3 và 4 yêu cầu phải có ít nhất 3 câu hỏi');
        return;
      }
      
      if ((groupPart === 6 || groupPart === 7) && (!passageText || !passageText.trim())) {
        toast.error('Part 6 và 7 yêu cầu phải có đoạn văn');
        return;
      }
      
      if ((groupPart === 6 || groupPart === 7) && questions.length < 2) {
        toast.error('Part 6 và 7 yêu cầu phải có ít nhất 2 câu hỏi');
        return;
      }
      
      setIsSubmitting(true);
      
      // Gán loại câu hỏi dựa trên part
      const questionType = groupPart <= 4 ? QuestionType.LISTENING : QuestionType.READING;
      
      // Đảm bảo đúng định dạng dữ liệu
      // Với Part 1-4, luôn cung cấp passage rỗng
      // Với Part 5-7, nếu không có passageText, cung cấp chuỗi rỗng
      let finalPassage = passageText || "";
      
      const groupData: QuestionGroupDTO = {
        id: initialData?.id,
        type: questionType,
        part: groupPart,
        passage: finalPassage, // Luôn gửi passage, kể cả rỗng
        audioUrl: initialData?.audioUrl,
        imageUrl: initialData?.imageUrl,
        questions: questions
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
        hasExistingAudio: hasExistingAudioFile,
        existingAudioUrl: initialData?.audioUrl,
        existingImageUrl: initialData?.imageUrl ? 'Có' : 'Không',
        passageLength: finalPassage.length,
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
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>
              Thiết lập thông tin cho nhóm câu hỏi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="part">Phần</Label>
              <Select 
                value={groupPart.toString()} 
                onValueChange={(value) => setGroupPart(parseInt(value))}
              >
                <SelectTrigger id="part">
                  <SelectValue placeholder="Chọn phần" />
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
            
            {(groupPart === 3 || groupPart === 4 || groupPart === 6 || groupPart === 7) && (
              <div className="space-y-2">
                <Label htmlFor="passage">Đoạn văn</Label>
                <Textarea
                  id="passage"
                  value={passageText}
                  onChange={(e) => setPassageText(e.target.value)}
                  placeholder="Nhập đoạn văn (nếu có)..."
                  className="min-h-[200px]"
                />
              </div>
            )}

            {/* Audio file */}
            <div className="space-y-2">
              <Label htmlFor="audio">File âm thanh</Label>
              <div className="grid gap-2">
                <Input
                  id="audio"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange(e, 'audio')}
                />
                {audioUrl && (
                  <div className="p-2 border rounded-md">
                    <audio controls src={audioUrl} className="w-full">
                      <source src={audioUrl} type="audio/mpeg" />
                      Trình duyệt của bạn không hỗ trợ phát audio.
                    </audio>
                  </div>
                )}
              </div>
            </div>
            
            {/* Upload image */}
            <div className="space-y-2">
              <Label htmlFor="image">Hình ảnh</Label>
              <div className="grid gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                />
                {imageUrl && (
                  <div className="p-2 border rounded-md">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="max-h-60 mx-auto object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Danh sách câu hỏi</CardTitle>
              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                Thêm câu hỏi
              </Button>
            </div>
            <CardDescription>
              {questions.length > 0 
                ? `Đã có ${questions.length} câu hỏi trong nhóm này.`
                : 'Chưa có câu hỏi nào. Hãy thêm câu hỏi mới.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editingQuestionIndex !== null ? (
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-4">Sửa câu hỏi #{editingQuestionIndex + 1}</h3>
                <QuestionEditor
                  question={questions[editingQuestionIndex]}
                  onSave={saveQuestion}
                  onCancel={cancelEditQuestion}
                />
              </div>
            ) : (
              questions.length > 0 ? (
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">
                            Câu hỏi #{index + 1}
                          </CardTitle>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQuestionUp(index)}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQuestionDown(index)}
                              disabled={index === questions.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => duplicateQuestion(index)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeQuestion(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {question.question || "(Chưa có nội dung)"}
                        </p>
                      </CardContent>
                      <CardFooter>
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
                <div className="text-center py-8 border border-dashed rounded-md">
                  <p className="text-muted-foreground mb-4">Chưa có câu hỏi nào</p>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm câu hỏi đầu tiên
                  </Button>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
};

export default QuestionGroupForm; 