import React, { useState, useEffect } from 'react';
import { ToeicQuestionDTO, ToeicOptionDTO } from '@/services/toeicQuestionService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Headphones, BookOpen, Book, GraduationCap } from 'lucide-react';
import { DifficultyLevel, QuestionCategory, QuestionType } from '@/types/toeic';

export interface QuestionEditorProps {
  question: ToeicQuestionDTO;
  onSave: (question: ToeicQuestionDTO) => void;
  onCancel: () => void;
  parentGroupType: QuestionType; // Thêm thuộc tính loại của nhóm chứa câu hỏi
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ 
  question, 
  onSave, 
  onCancel, 
  parentGroupType 
}) => {
  const [questionText, setQuestionText] = useState<string>(question.question || '');
  const [options, setOptions] = useState<ToeicOptionDTO[]>(question.options || []);
  const [correctAnswer, setCorrectAnswer] = useState<string>(question.correctAnswer || '');
  const [explanation, setExplanation] = useState<string>(question.explanation || '');
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>(
    question.difficultyLevel || DifficultyLevel.MEDIUM
  );
  
  // Thêm state cho loại câu hỏi dựa vào loại của nhóm
  const [questionType, setQuestionType] = useState<QuestionType>(() => {
    // Nếu câu hỏi đã có loại và nhóm là đọc, giữ nguyên loại
    if (question.type && parentGroupType === QuestionType.READING) {
      return question.type;
    }
    
    // Nếu nhóm là đọc nhưng câu hỏi chưa có loại, mặc định là từ vựng
    if (parentGroupType === QuestionType.READING) {
      return QuestionType.VOCABULARY;
    }
    
    // Các trường hợp khác, loại câu hỏi giống loại của nhóm
    return parentGroupType;
  });
  
  // Cập nhật loại câu hỏi khi loại của nhóm thay đổi
  useEffect(() => {
    if (parentGroupType !== QuestionType.READING) {
      setQuestionType(parentGroupType);
    }
  }, [parentGroupType]);
  
  // Thêm tùy chọn mới
  const addOption = () => {
    const optionKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const nextKey = optionKeys[options.length] || '';
    
    if (options.length < 8) {
      setOptions([...options, { optionKey: nextKey, optionText: '' }]);
    }
  };
  
  // Xóa tùy chọn
  const removeOption = (index: number) => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
    
    // Nếu xóa tùy chọn đang chọn làm đáp án đúng
    if (options[index].optionKey === correctAnswer) {
      setCorrectAnswer('');
    }
  };
  
  // Cập nhật tùy chọn
  const updateOption = (index: number, text: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], optionText: text };
    setOptions(updatedOptions);
  };
  
  // Hàm chuyển đổi từ QuestionType sang QuestionCategory tương ứng
  const getCategory = (type: QuestionType): QuestionCategory => {
    switch (type) {
      case QuestionType.VOCABULARY:
        return QuestionCategory.VOCABULARY;
      case QuestionType.GRAMMAR:
        return QuestionCategory.GRAMMAR;
      case QuestionType.LISTENING:
        return QuestionCategory.LISTENING;
      default:
        // Mặc định là GRAMMAR
        return QuestionCategory.GRAMMAR;
    }
  };
  
  // Lưu câu hỏi
  const handleSave = () => {
    // Kiểm tra dữ liệu trước khi lưu
    if (!questionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    
    if (!correctAnswer) {
      alert('Vui lòng chọn đáp án đúng');
      return;
    }
    
    // Đặt category dựa trên questionType
    const category = getCategory(questionType);
    
    const updatedQuestion: ToeicQuestionDTO = {
      ...question,
      question: questionText,
      options: options,
      correctAnswer: correctAnswer,
      explanation: explanation,
      difficultyLevel: difficultyLevel,
      type: questionType,
      category: category
    };
    
    console.log('Câu hỏi đã cập nhật trước khi lưu:', JSON.stringify(updatedQuestion, null, 2));
    onSave(updatedQuestion);
  };
  
  return (
    <div className="space-y-4">
      {/* Nội dung câu hỏi */}
      <div className="space-y-2">
        <Label htmlFor="question">Nội dung câu hỏi <span className="text-destructive">*</span></Label>
        <Textarea 
          id="question" 
          placeholder="Nhập nội dung câu hỏi" 
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={3}
        />
      </div>
      
      {/* Loại câu hỏi - Chỉ hiện khi nhóm là đọc */}
      {parentGroupType === QuestionType.READING && (
        <div className="space-y-2">
          <Label htmlFor="question-type">Loại câu hỏi <span className="text-destructive">*</span></Label>
          <Select 
            value={questionType} 
            onValueChange={(value) => setQuestionType(value as QuestionType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại câu hỏi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={QuestionType.VOCABULARY}>
                <div className="flex items-center">
                  <Book className="mr-2 h-4 w-4" />
                  Từ vựng (Vocabulary)
                </div>
              </SelectItem>
              <SelectItem value={QuestionType.GRAMMAR}>
                <div className="flex items-center">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Ngữ pháp (Grammar)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Nếu không phải nhóm đọc, hiển thị loại câu hỏi dưới dạng chỉ đọc */}
      {parentGroupType !== QuestionType.READING && (
        <div className="space-y-2">
          <Label htmlFor="question-type-info">Loại câu hỏi</Label>
          <div className="p-2 bg-muted rounded-md flex items-center">
            {parentGroupType === QuestionType.LISTENING && (
              <>
                <Headphones className="h-4 w-4 mr-2" />
                <span>Nghe (Listening)</span>
              </>
            )}
            {parentGroupType === QuestionType.VOCABULARY && (
              <>
                <Book className="h-4 w-4 mr-2" />
                <span>Từ vựng (Vocabulary)</span>
              </>
            )}
            {parentGroupType === QuestionType.GRAMMAR && (
              <>
                <GraduationCap className="h-4 w-4 mr-2" />
                <span>Ngữ pháp (Grammar)</span>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Mức độ khó */}
      <div className="space-y-2">
        <Label htmlFor="difficultyLevel">Mức độ khó <span className="text-destructive">*</span></Label>
        <Select 
          value={difficultyLevel} 
          onValueChange={(value) => setDifficultyLevel(value as DifficultyLevel)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn mức độ khó" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DifficultyLevel.EASY}>Dễ (Easy)</SelectItem>
            <SelectItem value={DifficultyLevel.MEDIUM}>Trung bình (Medium)</SelectItem>
            <SelectItem value={DifficultyLevel.HARD}>Khó (Hard)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Các tùy chọn */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Các lựa chọn <span className="text-destructive">*</span></Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addOption}
            disabled={options.length >= 8}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm lựa chọn
          </Button>
        </div>
        
        <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
          {options.map((option, index) => (
            <Card key={index} className="mb-2">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <RadioGroupItem value={option.optionKey} id={`option-${index}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 text-center font-medium">{option.optionKey}.</div>
                      <Input
                        value={option.optionText}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Nội dung lựa chọn ${option.optionKey}`}
                      />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>
      
      {/* Giải thích đáp án */}
      <div className="space-y-2">
        <Label htmlFor="explanation">Giải thích đáp án</Label>
        <Textarea 
          id="explanation" 
          placeholder="Nhập giải thích cho đáp án đúng" 
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={3}
        />
      </div>
      
      {/* Nút thao tác */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="button" onClick={handleSave}>
          Lưu
        </Button>
      </div>
    </div>
  );
};

export default QuestionEditor; 