import React, { useState } from 'react';
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
import { Plus, Trash2 } from 'lucide-react';
import { DifficultyLevel } from '@/types/toeic';

export interface QuestionEditorProps {
  question: ToeicQuestionDTO;
  onSave: (question: ToeicQuestionDTO) => void;
  onCancel: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onSave, onCancel }) => {
  const [questionData, setQuestionData] = useState<ToeicQuestionDTO>({...question});
  
  // Xử lý khi thay đổi trường câu hỏi
  const handleFieldChange = (field: keyof ToeicQuestionDTO, value: any) => {
    setQuestionData({
      ...questionData,
      [field]: value
    });
  };
  
  // Xử lý khi thay đổi trường của option
  const handleOptionChange = (index: number, field: keyof ToeicOptionDTO, value: string) => {
    const updatedOptions = [...questionData.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value
    };
    
    setQuestionData({
      ...questionData,
      options: updatedOptions
    });
  };
  
  // Thêm option mới
  const addOption = () => {
    const newOptionKey = String.fromCharCode(65 + questionData.options.length); // A, B, C, D, ...
    
    const newOption: ToeicOptionDTO = {
      optionKey: newOptionKey,
      optionText: ""
    };
    
    setQuestionData({
      ...questionData,
      options: [...questionData.options, newOption]
    });
  };
  
  // Xóa option
  const removeOption = (index: number) => {
    if (questionData.options.length <= 2) {
      alert("Câu hỏi phải có ít nhất 2 lựa chọn");
      return;
    }
    
    const optionToRemove = questionData.options[index];
    
    // Nếu xóa đáp án đúng, cần cập nhật correctAnswer
    if (optionToRemove.optionKey === questionData.correctAnswer) {
      // Đặt đáp án đúng về lựa chọn đầu tiên còn lại
      const newCorrectAnswer = index === 0 ? 
        questionData.options[1].optionKey : 
        questionData.options[0].optionKey;
      
      setQuestionData({
        ...questionData,
        correctAnswer: newCorrectAnswer
      });
    }
    
    const updatedOptions = questionData.options.filter((_, i) => i !== index);
    setQuestionData({
      ...questionData,
      options: updatedOptions
    });
  };
  
  // Xử lý khi lưu
  const handleSave = () => {
    // Kiểm tra dữ liệu trước khi lưu
    if (!questionData.question?.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi");
      return;
    }
    
    if (!questionData.correctAnswer) {
      alert("Vui lòng chọn đáp án đúng");
      return;
    }
    
    const emptyOptions = questionData.options.filter(opt => !opt.optionText.trim());
    if (emptyOptions.length > 0) {
      alert("Vui lòng nhập nội dung cho tất cả các lựa chọn");
      return;
    }
    
    onSave(questionData);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="question">Nội dung câu hỏi</Label>
          <Textarea
            id="question"
            value={questionData.question}
            onChange={(e) => handleFieldChange('question', e.target.value)}
            placeholder="Nhập nội dung câu hỏi..."
            className="min-h-[100px]"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="difficultyLevel">Độ khó</Label>
            <Select
              value={questionData.difficultyLevel}
              onValueChange={(value) => handleFieldChange('difficultyLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DifficultyLevel.EASY}>Dễ</SelectItem>
                <SelectItem value={DifficultyLevel.MEDIUM}>Trung bình</SelectItem>
                <SelectItem value={DifficultyLevel.HARD}>Khó</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="explanation">Giải thích (không bắt buộc)</Label>
            <Input
              id="explanation"
              value={questionData.explanation || ""}
              onChange={(e) => handleFieldChange('explanation', e.target.value)}
              placeholder="Giải thích cho đáp án đúng"
            />
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center">
            <Label>Các lựa chọn</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={questionData.options.length >= 6}
            >
              <Plus className="mr-1 h-4 w-4" />
              Thêm lựa chọn
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <RadioGroup
                value={questionData.correctAnswer}
                onValueChange={(value) => handleFieldChange('correctAnswer', value)}
                className="space-y-4"
              >
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex items-start space-x-3 pt-3">
                    <RadioGroupItem 
                      value={option.optionKey} 
                      id={`option-${index}`} 
                      className="mt-1" 
                    />
                    
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={option.optionKey}
                          onChange={(e) => handleOptionChange(index, 'optionKey', e.target.value)}
                          className="w-16"
                          placeholder="A, B, C..."
                        />
                        
                        <Input
                          value={option.optionText}
                          onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                          className="flex-1"
                          placeholder={`Nội dung lựa chọn ${option.optionKey}`}
                        />
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          disabled={questionData.options.length <= 2}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      
                      <Label htmlFor={`option-${index}`} className="text-sm text-muted-foreground">
                        {option.optionKey === questionData.correctAnswer && 
                          "Đây là đáp án đúng"}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="button" onClick={handleSave}>
          Lưu câu hỏi
        </Button>
      </div>
    </div>
  );
};

export default QuestionEditor; 